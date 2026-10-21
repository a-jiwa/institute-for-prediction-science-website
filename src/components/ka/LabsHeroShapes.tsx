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
const CRUISE_SPEED = 8
/** How quickly velocity eases toward the cruise heading (higher = snappier). */
const CRUISE_FOLLOW = 1.8
const MAX_OMEGA = 10
/** Degrees of shape spin per pixel scrolled. */
const SCROLL_DEG_PER_PX = 0.14
/** Extra angular velocity from a scroll burst (keeps spinning briefly after). */
const SCROLL_OMEGA_GAIN = 0.45
const CURSOR_STEER = 0.85
const CURSOR_RADIUS = 200
/** Pull back toward home when farther than this (px). */
const HOME_LEASH = 160
const HOME_STEER = 0.9
const AVOID_STEER = 1.2
const AVOID_PAD = 48
const AVOID_SKIRT = 72
/** Soft velocity shove away from obstacles (px/s² scale), not a hard teleport. */
const AVOID_PUSH = 14
const AVOID_ART_SELECTOR =
  '.ka-step__media--frame, .ka-step__media--balance, .ka-step__media--hex'
const AVOID_COPY_SELECTOR = '.ka-step__copy'
const AVOID_COPY_PAD = 28
const AVOID_COPY_SKIRT = 96
const AVOID_COPY_STRENGTH = 0.38
const RESIZE_EPS = 4
const POINTER_ACTIVE_MS = 280
/** Refresh obstacle boxes on this cadence — per-frame layout reads jitter. */
const AVOID_REFRESH_MS = 180
/** Seconds to ease toward a new obstacle set (avoids hard steer snaps). */
const AVOID_BLEND_S = 0.28
/**
 * Fixed sim step — keeps motion identical on 60Hz monitors and ProMotion.
 * Display interpolates between steps so refresh rate doesn’t change the path.
 */
const FIXED_DT = 1 / 60
const MAX_SIM_STEPS = 3
/** Soft wall band outside the hard pad (px factor of radius). */
const WALL_SOFT = 1.35
/** Low-frequency heading wander (rad/s peak). */
const WANDER_RATE = 0.35
const WANDER_FREQ = 0.4
/** Max turn rate for steering (rad/s) — caps twitchy corrections. */
const MAX_TURN_RATE = 0.95

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
  /** Previous sim pose — display lerps from these to current. */
  px: number
  py: number
  pAngle: number
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

function shortestAngleDeg(from: number, to: number) {
  let delta = to - from
  while (delta > 180) delta -= 360
  while (delta < -180) delta += 360
  return delta
}

/** Snap to the display’s physical pixels — stops shimmer on 1x external monitors. */
function snapPx(value: number) {
  const dpr = window.devicePixelRatio || 1
  return Math.round(value * dpr) / dpr
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpAvoid(a: AvoidRect, b: AvoidRect, t: number): AvoidRect {
  return {
    left: lerp(a.left, b.left, t),
    top: lerp(a.top, b.top, t),
    right: lerp(a.right, b.right, t),
    bottom: lerp(a.bottom, b.bottom, t),
    cx: lerp(a.cx, b.cx, t),
    cy: lerp(a.cy, b.cy, t),
    strength: lerp(a.strength, b.strength, t),
    skirt: lerp(a.skirt, b.skirt, t),
  }
}

function blendAvoidSets(from: AvoidRect[], to: AvoidRect[], t: number): AvoidRect[] {
  if (!from.length) return to.map((box) => ({ ...box }))
  if (!to.length) return from.map((box) => ({ ...box }))
  const n = Math.max(from.length, to.length)
  const out: AvoidRect[] = []
  for (let i = 0; i < n; i++) {
    const a = from[Math.min(i, from.length - 1)]
    const b = to[Math.min(i, to.length - 1)]
    out.push(lerpAvoid(a, b, t))
  }
  return out
}

/** Ease velocity toward cruise along the body’s smoothed heading. */
function easeCruise(
  body: Body,
  dt: number,
  cruiseSpeed = CRUISE_SPEED,
  follow = CRUISE_FOLLOW,
) {
  const tx = Math.cos(body.heading) * cruiseSpeed
  const ty = Math.sin(body.heading) * cruiseSpeed
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

/** How far past the field edge a centre may sit (0 = fully inside, 0.5 = half off). */
function edgeInset(radius: number, edgeBleed: number) {
  const bleed = Math.min(1, Math.max(0, edgeBleed))
  if (bleed <= 0) return radius * 0.35
  return radius * (1 - 2 * bleed)
}

/** Soft walls: ease heading + velocity away before the hard pad. */
function softContain(
  body: Body,
  width: number,
  height: number,
  dt: number,
  edgeBleed = 0,
  cruiseSpeed = CRUISE_SPEED,
) {
  const padX = edgeInset(body.radius, edgeBleed)
  const padY = body.radius * 0.35
  const band = Math.max(40, body.radius * WALL_SOFT)
  const minX = padX
  const maxX = width - padX
  const minY = padY
  const maxY = height - padY
  const push = 10 + cruiseSpeed

  if (body.x < minX + band) {
    const t = Math.max(0, 1 - (body.x - minX) / band)
    if (t > 0) {
      if (body.vx < 0) body.vx *= 1 - Math.min(0.45, t * 0.55)
      body.vx += push * t * t * dt
      turnToward(body, 0, 1.2 * t, dt)
    }
  } else if (body.x > maxX - band) {
    const t = Math.max(0, 1 - (maxX - body.x) / band)
    if (t > 0) {
      if (body.vx > 0) body.vx *= 1 - Math.min(0.45, t * 0.55)
      body.vx -= push * t * t * dt
      turnToward(body, Math.PI, 1.2 * t, dt)
    }
  }

  if (body.y < minY + band) {
    const t = Math.max(0, 1 - (body.y - minY) / band)
    if (t > 0) {
      if (body.vy < 0) body.vy *= 1 - Math.min(0.45, t * 0.55)
      body.vy += push * t * t * dt
      turnToward(body, Math.PI / 2, 1.2 * t, dt)
    }
  } else if (body.y > maxY - band) {
    const t = Math.max(0, 1 - (maxY - body.y) / band)
    if (t > 0) {
      if (body.vy > 0) body.vy *= 1 - Math.min(0.45, t * 0.55)
      body.vy -= push * t * t * dt
      turnToward(body, -Math.PI / 2, 1.2 * t, dt)
    }
  }

  body.x = Math.min(maxX, Math.max(minX, body.x))
  body.y = Math.min(maxY, Math.max(minY, body.y))
}

function sizeForShape(
  shape: (typeof SHAPES)[number],
  width: number,
  height: number,
  scale = 1,
) {
  const maxSize = Math.min(width, height)
  const sizePx = Math.min(maxSize * shape.size * scale, width * 0.55 * scale, 288 * scale)
  const radius = sizePx * 0.46
  return { sizePx, radius }
}

function homeForIndex(
  index: number,
  width: number,
  height: number,
  radius: number,
  homes?: readonly { x: number; y: number }[],
  edgeBleed = 0,
) {
  const spot = homes?.[index] ?? DEFAULT_HOMES[index % DEFAULT_HOMES.length]
  // Honour authored fractions exactly — don’t shift home when scale/radius changes.
  const x = width * spot.x
  const y = height * spot.y
  if (edgeBleed > 0) {
    const insetX = edgeInset(radius, edgeBleed)
    return {
      x: Math.min(width - insetX, Math.max(insetX, x)),
      y,
    }
  }
  return {
    x: Math.min(width - radius, Math.max(radius, x)),
    y: Math.min(height - radius, Math.max(radius, y)),
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
    const delta = turnToward(body, target, AVOID_STEER * falloff * falloff * 2, dt)
    body.omega += delta * falloff * 1.2 * dt
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
  /** Multiplier on default shape size (1 = normal). */
  scale?: number
  /** How far shapes may hang past left/right edges (0.5 = half off-screen). */
  edgeBleed?: number
  /** Drift speed multiplier (1 = default cruise, 0.4 ≈ slow float). */
  speed?: number
  /** Max wander distance from home before the leash pulls back (px). */
  leash?: number
}

export function LabsHeroShapes({
  className = 'ka-about-hero__shapes',
  colors,
  exclude,
  only,
  homes,
  scale = 1,
  edgeBleed = 0,
  speed = 1,
  leash = HOME_LEASH,
}: LabsHeroShapesProps = {}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const fills = resolveLabsShapeFills(colors)
  const excludeKey = exclude?.length ? [...exclude].sort().join(',') : ''
  const onlyKey = only?.length ? [...only].sort().join(',') : ''
  const homesKey = homes?.map((h) => `${h.x},${h.y}`).join('|') ?? ''
  const shapes = pickShapes(exclude, only)
  const cruiseSpeed = CRUISE_SPEED * Math.max(0, speed)
  const homeLeash = Math.max(24, leash)

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
    let displayAlpha = 1

    const paint = () => {
      const t = displayAlpha
      bodies.forEach((body, index) => {
        const el = nodes[index]
        if (!el) return
        const x = snapPx(lerp(body.px, body.x, t) - body.sizePx / 2)
        const y = snapPx(lerp(body.py, body.y, t) - body.sizePx / 2)
        const angle = body.pAngle + shortestAngleDeg(body.pAngle, body.angle) * t
        // 2D translate only — translate3d / will-change can drop mix-blend in Safari.
        el.style.left = '0'
        el.style.top = '0'
        el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`
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
        const { sizePx, radius } = sizeForShape(shape, width, height, scale)
        let home = homeForIndex(index, width, height, radius, homes, edgeBleed)
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
          px: home.x,
          py: home.y,
          pAngle: angle,
          homeX: home.x,
          homeY: home.y,
          vx: Math.cos(heading) * cruiseSpeed,
          vy: Math.sin(heading) * cruiseSpeed,
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
      displayAlpha = 1
      paint()
    }

    const rescaleBodies = (width: number, height: number) => {
      const scaleX = fieldW > 0 ? width / fieldW : 1
      const scaleY = fieldH > 0 ? height / fieldH : 1

      activeShapes.forEach((shape, index) => {
        const body = bodies[index]
        if (!body) return
        const { sizePx, radius } = sizeForShape(shape, width, height, scale)
        const home = homeForIndex(index, width, height, radius, homes, edgeBleed)
        body.x *= scaleX
        body.y *= scaleY
        body.px = body.x
        body.py = body.y
        body.pAngle = body.angle
        body.homeX = home.x
        body.homeY = home.y
        body.radius = radius
        body.sizePx = sizePx
        body.x = Math.min(width - radius, Math.max(radius, body.x))
        body.y = Math.min(height - radius, Math.max(radius, body.y))
        body.px = body.x
        body.py = body.y
        if (!reduce) easeCruise(body, 1, cruiseSpeed, 20)
        applyNodeSize(index, sizePx)
      })
      displayAlpha = 1
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
    let simAccum = 0
    let visible = true
    let scrollY = lenis?.scroll ?? window.scrollY
    let pendingScrollPx = 0
    let pointerX = 0
    let pointerY = 0
    let pointerInField = false
    let lastPointerMoveAt = 0
    let lastAvoidT = 0
    let avoidFrom: AvoidRect[] = collectAvoidRects(root)
    let avoidTo: AvoidRect[] = avoidFrom.map((box) => ({ ...box }))
    let avoidBlend = 1
    let debugAccum = 0
    let frameCount = 0

    const readScrollY = () => lenis?.scroll ?? window.scrollY

    const onScroll = () => {
      if (reduce) return
      const y = readScrollY()
      const dy = y - scrollY
      scrollY = y
      if (dy !== 0) pendingScrollPx += dy
    }

    /** Apply queued scroll as immediate rotation + a bit of leftover spin. */
    const applyScrollSpin = () => {
      if (!pendingScrollPx || !bodies.length) return
      const scrollDeg = pendingScrollPx * SCROLL_DEG_PER_PX
      pendingScrollPx = 0
      for (const body of bodies) {
        body.angle += scrollDeg
        body.pAngle += scrollDeg
        body.omega += scrollDeg * SCROLL_OMEGA_GAIN
        clampOmega(body)
      }
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

    const integrate = (dt: number, now: number, width: number, height: number) => {
      const pointerLive =
        pointerInField && now - lastPointerMoveAt < POINTER_ACTIVE_MS

      if (now - lastAvoidT >= AVOID_REFRESH_MS) {
        lastAvoidT = now
        avoidFrom = blendAvoidSets(avoidFrom, avoidTo, avoidBlend)
        avoidTo = collectAvoidRects(root)
        avoidBlend = 0
      }

      avoidBlend = Math.min(1, avoidBlend + dt / AVOID_BLEND_S)
      const obstacles = blendAvoidSets(avoidFrom, avoidTo, avoidBlend)

      for (const body of bodies) {
        body.px = body.x
        body.py = body.y
        body.pAngle = body.angle

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
              CURSOR_STEER * falloff * falloff * 2,
              dt,
            )
            body.omega += delta * falloff * 1.1 * dt
          }
        }

        steerFromAvoid(body, obstacles, dt)

        // Soft leash — wander nearby, then spring back toward home.
        const toHomeX = body.homeX - body.x
        const toHomeY = body.homeY - body.y
        const homeDist = Math.hypot(toHomeX, toHomeY)
        if (homeDist > homeLeash) {
          const target = Math.atan2(toHomeY, toHomeX)
          const pull = Math.min(1, (homeDist - homeLeash) / homeLeash)
          turnToward(body, target, HOME_STEER * pull * 2.4, dt)
          const nx = toHomeX / homeDist
          const ny = toHomeY / homeDist
          const spring = (homeDist - homeLeash) * (2.8 + pull * 3.2)
          body.vx += nx * spring * dt
          body.vy += ny * spring * dt
        }

        easeCruise(body, dt, cruiseSpeed)
        clampOmega(body)

        body.x += body.vx * dt
        body.y += body.vy * dt
        body.angle += body.omega * dt
        body.omega *= Math.exp(-0.85 * dt)

        softContain(body, width, height, dt, edgeBleed, cruiseSpeed)
      }
    }

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      frameCount += 1
      if (!bodies.length) {
        syncField(true)
        last = now
        simAccum = 0
        return
      }
      if (reduce || !visible) {
        displayAlpha = 1
        paint()
        last = now
        simAccum = 0
        return
      }

      const width = fieldW
      const height = fieldH
      if (width < 32 || height < 32) return

      const frameDt = Math.min(0.05, (now - last) / 1000)
      last = now
      simAccum += frameDt

      // Scroll rotation is applied once per frame so Lenis deltas stay visible.
      applyScrollSpin()

      let steps = 0
      while (simAccum >= FIXED_DT && steps < MAX_SIM_STEPS) {
        integrate(FIXED_DT, now, width, height)
        simAccum -= FIXED_DT
        steps += 1
      }
      // Don’t spiral if a tab was backgrounded — drop leftover time.
      if (steps === MAX_SIM_STEPS) simAccum = 0

      // Grow from last pose → current between fixed steps (smooth on 120Hz too).
      displayAlpha = Math.min(1, simAccum / FIXED_DT)
      paint()

      if (DEBUG_SHAPES) {
        debugAccum += frameDt * 1000
        if (debugAccum >= DEBUG_INTERVAL_MS) {
          debugAccum = 0
          console.log(`[labs-shapes] fps≈${Math.round(frameCount / (DEBUG_INTERVAL_MS / 1000))}`)
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
  }, [
    lenis,
    className,
    excludeKey,
    onlyKey,
    homesKey,
    homes,
    scale,
    edgeBleed,
    cruiseSpeed,
    homeLeash,
  ])

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
