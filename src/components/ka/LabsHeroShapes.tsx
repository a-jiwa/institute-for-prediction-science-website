import { useLayoutEffect, useRef } from 'react'
import { useLenis } from '../layout/CookieBanner'
import {
  LABS_SHAPE_COLORS,
  resolveLabsShapeFills,
  type LabsShapeColorSpec,
  type LabsShapeName,
} from './labsBlend'

/**
 * A few Labs floaters placed at styled homes before motion starts.
 * They wander gently on a leash — never respawn or pop in while scrolling.
 */

const DEBUG_SHAPES = false
const DEBUG_INTERVAL_MS = 1000

/** Slow drift (px/s) — floaty, not busy. */
const CRUISE_SPEED = 9
/** How quickly velocity eases toward the cruise heading (higher = snappier). */
const CRUISE_FOLLOW = 2.4
const MAX_OMEGA = 8
/** Scroll → spin; near-zero so Lenis deltas don’t chatter paths. */
const SCROLL_DEG_PER_PX = 0.08
const CURSOR_STEER = 1.1
const CURSOR_RADIUS = 200
/** Pull back toward home when farther than this (px). */
const HOME_LEASH = 150
const HOME_STEER = 1.15
const AVOID_STEER = 1.8
const AVOID_PAD = 48
const AVOID_SKIRT = 72
/** Soft velocity shove away from obstacles (px/s² scale), not a hard teleport. */
const AVOID_PUSH = 22
const AVOID_ART_SELECTOR =
  '.ka-step__media--frame, .ka-step__media--balance, .ka-step__media--hex'
const AVOID_COPY_SELECTOR = '.ka-step__copy'
const AVOID_COPY_PAD = 28
const AVOID_COPY_SKIRT = 96
const AVOID_COPY_STRENGTH = 0.42
const RESIZE_EPS = 4
const POINTER_ACTIVE_MS = 280
/** Refresh obstacle boxes on this cadence — per-frame layout reads jitter. */
const AVOID_REFRESH_MS = 140
/** Visual follow of sim position (higher = tighter, lower = butter). */
const RENDER_FOLLOW = 5.5
/** Soft wall band outside the hard pad (px factor of radius). */
const WALL_SOFT = 1.25
/** Low-frequency heading wander (rad/s peak). */
const WANDER_RATE = 0.55
const WANDER_FREQ = 0.55
/** Max turn rate for steering (rad/s) — caps twitchy corrections. */
const MAX_TURN_RATE = 1.35

/** Styled resting spots as fractions of the field (x, y). */
const DEFAULT_HOMES: readonly { x: number; y: number }[] = [
  { x: 0.12, y: 0.58 },
  { x: 0.88, y: 0.26 },
  { x: 0.82, y: 0.72 },
  { x: 0.18, y: 0.22 },
]

type AvoidRect = {
  left: number
  top: number
  right: number
  bottom: number
  cx: number
  cy: number
  strength: number
  skirt: number
}

type Body = {
  name: LabsShapeName
  x: number
  y: number
  /** Painted position — eases toward sim for less frame-to-frame chatter. */
  rx: number
  ry: number
  rAngle: number
  homeX: number
  homeY: number
  vx: number
  vy: number
  /** Desired travel heading (rad); wander + steers ease this, velocity follows. */
  heading: number
  wanderPhase: number
  wanderFreq: number
  angle: number
  omega: number
  radius: number
  sizePx: number
}

const SHAPES = [
  {
    name: 'hexagon' as const,
    transform: 'translate(19.5 1.5)',
    d: 'M132.896 7.43243C149.932 -2.47747 170.922 -2.47748 187.958 7.43242L293.323 68.7223C310.359 78.6322 320.854 96.9465 320.854 116.766L320.854 239.346C320.854 259.166 310.359 277.48 293.323 287.39L187.958 348.68C170.922 358.59 149.932 358.59 132.896 348.68L27.5311 287.39C10.4948 277.48 0 259.166 0 239.346L0 116.766C0 96.9465 10.4948 78.6322 27.5311 68.7223L132.896 7.43243Z',
    size: 0.28,
  },
  {
    name: 'circle' as const,
    transform: 'translate(19 19)',
    d: 'M160.545 0C249.211 0 321.09 71.879 321.09 160.545C321.09 249.211 249.211 321.09 160.545 321.09C71.879 321.09 0 249.211 0 160.545C0 71.879 71.879 0 160.545 0Z',
    size: 0.26,
  },
  {
    name: 'square' as const,
    transform: 'translate(19.5 19.5)',
    d: 'M0 59.7623C0 26.7519 26.7519 0 59.7623 0H261.092C294.102 0 320.854 26.7519 320.854 59.7623V261.092C320.854 294.102 294.102 320.854 261.092 320.854H59.7623C26.7519 320.854 0 294.102 0 261.092V59.7623Z',
    size: 0.34,
  },
  {
    name: 'clover' as const,
    transform: 'translate(17 17)',
    d: 'M89.8477 0C119.388 1.12081e-05 145.597 14.1722 161.972 36.0494C162.482 36.7304 163.51 36.7304 164.02 36.0495C180.396 14.1731 206.605 0.00203366 236.145 0.00195312C285.764 0.00195312 325.989 39.988 325.989 89.3135C325.989 119.25 311.171 145.745 288.429 161.95C287.716 162.459 287.716 163.528 288.429 164.036C311.172 180.241 325.992 206.737 325.992 236.675C325.992 286 285.767 325.986 236.147 325.986C206.606 325.986 180.395 311.813 164.019 289.933C163.509 289.252 162.481 289.252 161.971 289.933C145.596 311.813 119.386 325.987 89.8447 325.987C40.2252 325.987 0 286.001 0 236.676C3.7764e-05 206.737 14.8197 180.24 37.5637 164.035C38.2774 163.527 38.2775 162.458 37.5638 161.949C14.8217 145.744 0.0039728 119.249 0.00390625 89.3115C0.00390625 39.986 40.2281 0 89.8477 0Z',
    size: 0.24,
  },
]

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function shortestDelta(from: number, to: number) {
  let delta = to - from
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  return delta
}

/** Ease velocity toward cruise along the body’s smoothed heading. */
function easeCruise(body: Body, dt: number, follow = CRUISE_FOLLOW) {
  const tx = Math.cos(body.heading) * CRUISE_SPEED
  const ty = Math.sin(body.heading) * CRUISE_SPEED
  const a = 1 - Math.exp(-follow * dt)
  body.vx += (tx - body.vx) * a
  body.vy += (ty - body.vy) * a
}

/** Ease the desired heading toward a target (rad/s rate, hard-capped). */
function turnToward(body: Body, targetHeading: number, rate: number, dt: number) {
  const delta = shortestDelta(body.heading, targetHeading)
  const maxTurn = Math.min(MAX_TURN_RATE, Math.max(0, rate)) * dt
  const turn = Math.max(-maxTurn, Math.min(maxTurn, delta))
  body.heading += turn
  return delta
}

function clampOmega(body: Body) {
  if (body.omega > MAX_OMEGA) body.omega = MAX_OMEGA
  if (body.omega < -MAX_OMEGA) body.omega = -MAX_OMEGA
}

/** Soft walls: ease heading + velocity away before the hard pad. */
function softContain(body: Body, width: number, height: number, dt: number) {
  const pad = body.radius * 0.35
  const band = Math.max(36, body.radius * WALL_SOFT)
  const minX = pad
  const maxX = width - pad
  const minY = pad
  const maxY = height - pad
  const push = 14 + CRUISE_SPEED

  if (body.x < minX + band) {
    const t = Math.max(0, 1 - (body.x - minX) / band)
    if (t > 0) {
      if (body.vx < 0) body.vx *= 1 - Math.min(0.55, t * 0.7)
      body.vx += push * t * t * dt
      turnToward(body, 0, 1.8 * t, dt)
    }
  } else if (body.x > maxX - band) {
    const t = Math.max(0, 1 - (maxX - body.x) / band)
    if (t > 0) {
      if (body.vx > 0) body.vx *= 1 - Math.min(0.55, t * 0.7)
      body.vx -= push * t * t * dt
      turnToward(body, Math.PI, 1.8 * t, dt)
    }
  }

  if (body.y < minY + band) {
    const t = Math.max(0, 1 - (body.y - minY) / band)
    if (t > 0) {
      if (body.vy < 0) body.vy *= 1 - Math.min(0.55, t * 0.7)
      body.vy += push * t * t * dt
      turnToward(body, Math.PI / 2, 1.8 * t, dt)
    }
  } else if (body.y > maxY - band) {
    const t = Math.max(0, 1 - (maxY - body.y) / band)
    if (t > 0) {
      if (body.vy > 0) body.vy *= 1 - Math.min(0.55, t * 0.7)
      body.vy -= push * t * t * dt
      turnToward(body, -Math.PI / 2, 1.8 * t, dt)
    }
  }

  body.x = Math.min(maxX, Math.max(minX, body.x))
  body.y = Math.min(maxY, Math.max(minY, body.y))
}

function sizeForShape(shape: (typeof SHAPES)[number], width: number, height: number) {
  const maxSize = Math.min(width, height)
  const sizePx = Math.min(maxSize * shape.size, width * 0.42, 288)
  const radius = sizePx * 0.46
  return { sizePx, radius }
}

function homeForIndex(
  index: number,
  width: number,
  height: number,
  radius: number,
  homes?: readonly { x: number; y: number }[],
) {
  const spot = homes?.[index] ?? DEFAULT_HOMES[index % DEFAULT_HOMES.length]
  return {
    x: Math.min(width - radius, Math.max(radius, width * spot.x)),
    y: Math.min(height - radius, Math.max(radius, height * spot.y)),
  }
}

function rectToAvoid(
  rootRect: DOMRect,
  el: Element,
  pad = AVOID_PAD,
  strength = 1,
  skirt = AVOID_SKIRT,
): AvoidRect | null {
  const r = (el as HTMLElement).getBoundingClientRect()
  if (r.width < 8 || r.height < 8) return null
  const left = r.left - rootRect.left - pad
  const top = r.top - rootRect.top - pad
  const right = r.right - rootRect.left + pad
  const bottom = r.bottom - rootRect.top + pad
  return {
    left,
    top,
    right,
    bottom,
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
    strength,
    skirt,
  }
}

function bandAvoidRect(root: HTMLElement, rootRect: DOMRect): AvoidRect | null {
  const page = root.closest('.ka-about-page') ?? document
  const from = page.querySelector('[data-labs-avoid-from]')
  const to = page.querySelector('[data-labs-avoid-to]')
  if (!from || !to) return null
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  if (a.width < 8 || b.width < 8) return null
  const pad = AVOID_PAD + 16
  const left = Math.min(a.left, b.left) - rootRect.left - pad
  const right = Math.max(a.right, b.right) - rootRect.left + pad
  const top = a.top - rootRect.top - pad
  const bottom = b.bottom - rootRect.top + pad
  return {
    left,
    top,
    right,
    bottom,
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
    strength: 0.85,
    skirt: AVOID_SKIRT + 24,
  }
}

function collectAvoidRects(root: HTMLElement): AvoidRect[] {
  const rootRect = root.getBoundingClientRect()
  const out: AvoidRect[] = []
  const stepsScope = root.closest('.ka-steps')
  const washScope = root.closest('.ka-wash-region')

  if (stepsScope) {
    stepsScope.querySelectorAll(AVOID_ART_SELECTOR).forEach((node) => {
      const box = rectToAvoid(rootRect, node)
      if (box) out.push(box)
    })
    stepsScope.querySelectorAll(AVOID_COPY_SELECTOR).forEach((node) => {
      const box = rectToAvoid(
        rootRect,
        node,
        AVOID_COPY_PAD,
        AVOID_COPY_STRENGTH,
        AVOID_COPY_SKIRT,
      )
      if (box) out.push(box)
    })
    return out
  }

  const band = bandAvoidRect(root, rootRect)
  if (band) out.push(band)

  if (washScope) {
    const steps = washScope.querySelector('.ka-steps')
    if (steps) {
      const box = rectToAvoid(rootRect, steps, AVOID_PAD + 24)
      if (box) out.push(box)
    }
    return out
  }

  const page = root.closest('.ka-about-page') ?? document
  const wash = page.querySelector('.ka-wash-region')
  if (wash) {
    const box = rectToAvoid(rootRect, wash, AVOID_PAD + 32, 1, AVOID_SKIRT + 40)
    if (box) out.push(box)
  }
  return out
}

function overlapsAvoid(x: number, y: number, radius: number, obs: AvoidRect) {
  const qx = Math.min(obs.right, Math.max(obs.left, x))
  const qy = Math.min(obs.bottom, Math.max(obs.top, y))
  return Math.hypot(x - qx, y - qy) < radius
}

function steerFromAvoid(body: Body, obstacles: AvoidRect[], dt: number): boolean {
  if (!obstacles.length) return false
  let steered = false
  let pushX = 0
  let pushY = 0
  let pushAmp = 0

  for (const obs of obstacles) {
    const strength = obs.strength
    const inside =
      body.x >= obs.left &&
      body.x <= obs.right &&
      body.y >= obs.top &&
      body.y <= obs.bottom

    let awayX: number
    let awayY: number
    let dist: number
    let reach: number

    if (inside) {
      awayX = body.x - obs.cx
      awayY = body.y - obs.cy
      dist = Math.hypot(awayX, awayY) || 0.0001
      awayX /= dist
      awayY /= dist
      dist = 0.001
      reach = 1
    } else {
      const qx = Math.min(obs.right, Math.max(obs.left, body.x))
      const qy = Math.min(obs.bottom, Math.max(obs.top, body.y))
      awayX = body.x - qx
      awayY = body.y - qy
      dist = Math.hypot(awayX, awayY) || 0.0001
      awayX /= dist
      awayY /= dist
      reach = body.radius + obs.skirt
      if (dist >= reach) continue
    }

    const falloff = (inside ? 1 : 1 - dist / reach) * strength
    if (falloff < 0.02) continue
    const target = Math.atan2(awayY, awayX)
    const delta = turnToward(body, target, AVOID_STEER * falloff * falloff * 3, dt)
    body.omega += delta * falloff * 2.5 * dt
    pushX += awayX * falloff
    pushY += awayY * falloff
    pushAmp = Math.max(pushAmp, falloff)
    steered = true
  }

  if (steered) {
    const pushLen = Math.hypot(pushX, pushY) || 1
    // Gentle accelerate away — don’t teleport the sim position.
    body.vx += (pushX / pushLen) * AVOID_PUSH * pushAmp * dt
    body.vy += (pushY / pushLen) * AVOID_PUSH * pushAmp * dt
  }

  return steered
}

function pickShapes(
  exclude?: readonly LabsShapeName[],
  only?: readonly LabsShapeName[],
) {
  let list = [...SHAPES]
  if (exclude?.length) list = list.filter((s) => !exclude.includes(s.name))
  if (only?.length) list = list.filter((s) => only.includes(s.name))
  return list
}

type LabsHeroShapesProps = {
  className?: string
  colors?: Partial<Record<LabsShapeName, LabsShapeColorSpec>>
  exclude?: readonly LabsShapeName[]
  only?: readonly LabsShapeName[]
  /** Optional home spots as 0–1 fractions of the field. */
  homes?: readonly { x: number; y: number }[]
}

export function LabsHeroShapes({
  className = 'ka-about-hero__shapes',
  colors,
  exclude,
  only,
  homes,
}: LabsHeroShapesProps = {}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const fills = resolveLabsShapeFills(colors)
  const excludeKey = exclude?.length ? [...exclude].sort().join(',') : ''
  const onlyKey = only?.length ? [...only].sort().join(',') : ''
  const homesKey = homes?.map((h) => `${h.x},${h.y}`).join('|') ?? ''
  const shapes = pickShapes(exclude, only)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = [...root.querySelectorAll<SVGSVGElement>('.ka-labs-shape')]
    if (!nodes.length) return
    const activeShapes = pickShapes(
      excludeKey ? (excludeKey.split(',') as LabsShapeName[]) : undefined,
      onlyKey ? (onlyKey.split(',') as LabsShapeName[]) : undefined,
    )

    const bodies: Body[] = []
    let fieldW = 0
    let fieldH = 0

    const paint = () => {
      bodies.forEach((body, index) => {
        const el = nodes[index]
        if (!el) return
        // left/top (not translate3d) — Safari drops mix-blend on 3D layers.
        el.style.left = `${body.rx - body.sizePx / 2}px`
        el.style.top = `${body.ry - body.sizePx / 2}px`
        el.style.transform = `rotate(${body.rAngle}deg)`
        el.style.opacity = '1'
      })
    }

    const applyNodeSize = (index: number, sizePx: number) => {
      const el = nodes[index]
      if (!el) return
      el.style.width = `${sizePx}px`
      el.style.height = `${sizePx}px`
      el.style.opacity = '1'
    }

    const resetBodies = (width: number, height: number) => {
      bodies.length = 0
      const obstacles = collectAvoidRects(root)

      activeShapes.forEach((shape, index) => {
        const { sizePx, radius } = sizeForShape(shape, width, height)
        let home = homeForIndex(index, width, height, radius, homes)
        // Nudge home off avoid boxes so we never start hidden.
        for (let attempt = 0; attempt < 10; attempt++) {
          if (!obstacles.some((obs) => overlapsAvoid(home.x, home.y, radius, obs))) break
          home = {
            x: rand(radius, Math.max(radius, width - radius)),
            y: rand(radius, Math.max(radius, height - radius)),
          }
        }
        const angle = rand(0, 360)
        const heading = rand(0, Math.PI * 2)
        const body: Body = {
          name: shape.name,
          x: home.x,
          y: home.y,
          rx: home.x,
          ry: home.y,
          rAngle: angle,
          homeX: home.x,
          homeY: home.y,
          vx: Math.cos(heading) * CRUISE_SPEED,
          vy: Math.sin(heading) * CRUISE_SPEED,
          heading,
          wanderPhase: rand(0, Math.PI * 2),
          wanderFreq: WANDER_FREQ * rand(0.75, 1.35),
          angle,
          omega: reduce ? 0 : rand(-2, 2),
          radius,
          sizePx,
        }
        bodies.push(body)
        applyNodeSize(index, sizePx)
      })
      paint()
    }

    const rescaleBodies = (width: number, height: number) => {
      const scaleX = fieldW > 0 ? width / fieldW : 1
      const scaleY = fieldH > 0 ? height / fieldH : 1

      activeShapes.forEach((shape, index) => {
        const body = bodies[index]
        if (!body) return
        const { sizePx, radius } = sizeForShape(shape, width, height)
        const home = homeForIndex(index, width, height, radius, homes)
        body.x *= scaleX
        body.y *= scaleY
        body.rx = body.x
        body.ry = body.y
        body.homeX = home.x
        body.homeY = home.y
        body.radius = radius
        body.sizePx = sizePx
        body.x = Math.min(width - radius, Math.max(radius, body.x))
        body.y = Math.min(height - radius, Math.max(radius, body.y))
        body.rx = body.x
        body.ry = body.y
        if (!reduce) easeCruise(body, 1, 20)
        applyNodeSize(index, sizePx)
      })
      paint()
    }

    const syncField = (forceReset = false) => {
      const { width, height } = root.getBoundingClientRect()
      if (width < 32 || height < 32) return false

      const grew = !fieldW || !fieldH
      const changed =
        Math.abs(width - fieldW) > RESIZE_EPS || Math.abs(height - fieldH) > RESIZE_EPS

      if (!forceReset && !grew && !changed) return true

      if (forceReset || grew || !bodies.length) resetBodies(width, height)
      else rescaleBodies(width, height)

      fieldW = width
      fieldH = height
      return true
    }

    syncField(true)

    let raf = 0
    let last = performance.now()
    let visible = true
    let scrollY = lenis?.scroll ?? window.scrollY
    let scrollVel = 0
    let lastScrollT = performance.now()
    let pointerX = 0
    let pointerY = 0
    let pointerInField = false
    let lastPointerMoveAt = 0
    let lastAvoidT = 0
    let obstacles: AvoidRect[] = collectAvoidRects(root)
    let debugAccum = 0
    let frameCount = 0

    const readScrollY = () => lenis?.scroll ?? window.scrollY

    const onScroll = () => {
      if (reduce) return
      const now = performance.now()
      const y = readScrollY()
      const dt = Math.max(0.001, (now - lastScrollT) / 1000)
      const dy = y - scrollY
      scrollY = y
      lastScrollT = now
      const instant = Math.max(-600, Math.min(600, dy / dt))
      // Heavy EMA — prefer calm spin over reactive chatter.
      scrollVel = scrollVel * 0.9 + instant * 0.1
    }

    const onPointerMove = (event: PointerEvent) => {
      if (reduce) return
      const rect = root.getBoundingClientRect()
      pointerX = event.clientX - rect.left
      pointerY = event.clientY - rect.top
      pointerInField =
        pointerX >= -CURSOR_RADIUS &&
        pointerX <= rect.width + CURSOR_RADIUS &&
        pointerY >= -CURSOR_RADIUS &&
        pointerY <= rect.height + CURSOR_RADIUS
      lastPointerMoveAt = performance.now()
    }

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      frameCount += 1
      if (!bodies.length) {
        syncField(true)
        last = now
        return
      }
      if (reduce || !visible) {
        paint()
        last = now
        return
      }

      const width = fieldW
      const height = fieldH
      if (width < 32 || height < 32) return

      const dt = Math.min(0.033, (now - last) / 1000)
      last = now

      scrollVel *= Math.pow(0.01, dt)
      if (Math.abs(scrollVel) < 0.25) scrollVel = 0
      const scrollSpin = scrollVel * SCROLL_DEG_PER_PX * dt

      const pointerLive =
        pointerInField && now - lastPointerMoveAt < POINTER_ACTIVE_MS

      if (now - lastAvoidT >= AVOID_REFRESH_MS) {
        lastAvoidT = now
        obstacles = collectAvoidRects(root)
      }

      const renderBlend = 1 - Math.exp(-RENDER_FOLLOW * dt)

      for (const body of bodies) {
        // Slow organic heading wander — the main floaty path.
        body.wanderPhase += body.wanderFreq * dt
        body.heading += Math.sin(body.wanderPhase) * WANDER_RATE * dt

        if (pointerLive) {
          const dx = body.x - pointerX
          const dy = body.y - pointerY
          const dist = Math.hypot(dx, dy) || 0.0001
          const reach = CURSOR_RADIUS + body.radius
          if (dist < reach) {
            const falloff = 1 - dist / reach
            const target = Math.atan2(dy / dist, dx / dist)
            const delta = turnToward(
              body,
              target,
              CURSOR_STEER * falloff * falloff * 3,
              dt,
            )
            body.omega += delta * falloff * 2 * dt
          }
        }

        steerFromAvoid(body, obstacles, dt)

        // Soft leash — wander, but ease back toward the styled home.
        const toHomeX = body.homeX - body.x
        const toHomeY = body.homeY - body.y
        const homeDist = Math.hypot(toHomeX, toHomeY)
        if (homeDist > HOME_LEASH) {
          const target = Math.atan2(toHomeY, toHomeX)
          const pull = Math.min(1, (homeDist - HOME_LEASH) / HOME_LEASH)
          turnToward(body, target, HOME_STEER * pull * 2.5, dt)
        }

        easeCruise(body, dt)
        clampOmega(body)

        body.x += body.vx * dt
        body.y += body.vy * dt
        body.angle += body.omega * dt + scrollSpin
        body.omega *= Math.exp(-1.1 * dt)

        softContain(body, width, height, dt)

        body.rx += (body.x - body.rx) * renderBlend
        body.ry += (body.y - body.ry) * renderBlend
        body.rAngle += (body.angle - body.rAngle) * renderBlend
      }

      paint()

      if (DEBUG_SHAPES) {
        debugAccum += dt * 1000
        if (debugAccum >= DEBUG_INTERVAL_MS) {
          debugAccum = 0
          if (DEBUG_SHAPES) {
            console.log(`[labs-shapes] fps≈${Math.round(frameCount / (DEBUG_INTERVAL_MS / 1000))}`)
          }
          frameCount = 0
        }
      }
    }

    raf = requestAnimationFrame(step)

    const onResize = () => syncField(false)
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    // Prefer Lenis alone when present — dual listeners double-count scroll deltas.
    if (lenis) lenis.on('scroll', onScroll)
    else window.addEventListener('scroll', onScroll, { passive: true })

    const ro = new ResizeObserver(() => syncField(false))
    ro.observe(root)

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true
        last = performance.now()
      },
      { threshold: 0 },
    )
    io.observe(root)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      if (lenis) lenis.off('scroll', onScroll)
      else window.removeEventListener('scroll', onScroll)
      ro.disconnect()
      io.disconnect()
    }
  }, [lenis, className, excludeKey, onlyKey, homesKey, homes])

  return (
    <div aria-hidden="true" className={className} ref={rootRef}>
      {shapes.map((shape) => (
        <svg
          className={`ka-labs-shape ka-labs-shape--${shape.name}`}
          fill="none"
          key={shape.name}
          style={{ color: fills[shape.name] }}
          viewBox="0 0 360 360"
        >
          <path d={shape.d} fill="currentColor" transform={shape.transform} />
        </svg>
      ))}
    </div>
  )
}

export { LABS_SHAPE_COLORS }
export type { LabsShapeColorSpec, LabsShapeName }
