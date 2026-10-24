import { useId, useLayoutEffect, useRef } from 'react'
import { useLenis } from '../layout/CookieBanner'
import { assetUrl } from '../../utils/assetUrl'
import {
  LABS_SHAPE_COLORS,
  resolveLabsShapeFills,
  type LabsShapeColorSpec,
  type LabsShapeName,
} from './labsBlend'

/**
 * A few Labs floaters placed at styled homes before motion starts.
 * Idle motion is the Labs sway: independent horizontal and vertical
 * cycles (periods ×1 and ×1.83) so the path eases through the middle
 * and rests at the ends. Spin follows distance traveled, so a shape
 * turns faster through the middle of the drift and eases off when it
 * slows. Pointer, obstacles, and scroll sit on top of that sway.
 * Shapes never respawn while scrolling.
 */

const DEBUG_SHAPES = false
const DEBUG_INTERVAL_MS = 1000

const TAU = Math.PI * 2
/** Labs background slots sit around 8–10.5s. speed 1 matches that. */
const FLOAT_PERIOD = 9.2
/** Same ratio as Labs `gl-float-y`. */
const FLOAT_Y_RATIO = 1.83
/**
 * Share of a true roll (turn = distance / radius).
 * Bigger travel turns further; a slow shape barely rotates.
 */
const ROLL = 0.85
const MAX_SCROLL_OMEGA = 4
/** Degrees of shape spin per pixel scrolled. Small, so the sway stays the motion. */
const SCROLL_DEG_PER_PX = 0.04
/** Extra angular velocity from a scroll burst (keeps spinning briefly after). */
const SCROLL_OMEGA_GAIN = 0.12
const CURSOR_RADIUS = 140
/** How far a mouse eases a shape off its sway (px). Touch never pushes. */
const CURSOR_PUSH = 36
/** Orbit size around home (px). The sway stays inside this. */
const HOME_LEASH = 160
const AVOID_PAD = 48
const AVOID_SKIRT = 72
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
/** Ease rate for pointer / avoid offsets (1/s). Slow, so the sway stays smooth. */
const PUSH_FOLLOW = 2.1
/**
 * Fixed sim step — keeps motion identical on 60Hz monitors and ProMotion.
 * Display interpolates between steps so refresh rate doesn’t change the path.
 */
const FIXED_DT = 1 / 60
const MAX_SIM_STEPS = 3

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
  /** Resting tilt (deg). Travel spin is added on top. */
  baseAngle: number
  /** Accumulated roll from distance traveled (deg). */
  travelAngle: number
  /** +1 or −1. Each shape keeps one tumble direction. */
  spinSign: number
  /** Scroll spin, separate from the sway so a scroll doesn’t reset the float. */
  scrollAngle: number
  scrollOmega: number
  phaseX: number
  phaseY: number
  freqX: number
  freqY: number
  ampX: number
  ampY: number
  /** Signed fraction of the leash, kept so resize can refit the sway. */
  swingX: number
  swingY: number
  /** Smoothed pointer + obstacle offset, added on top of the sway. */
  pushX: number
  pushY: number
  angle: number
  radius: number
  sizePx: number
}

/** Centre sits outside the shape; a large radius so only a soft slice of the ramp shows. */
const SHAPE_SHADE: Record<LabsShapeName, { cx: string; cy: string; r: string }> = {
  hexagon: { cx: '-48%', cy: '-40%', r: '320%' },
  circle: { cx: '148%', cy: '-32%', r: '310%' },
  square: { cx: '-36%', cy: '150%', r: '330%' },
  clover: { cx: '146%', cy: '140%', r: '320%' },
}

/** Hue travel for each shape, so the radial runs from one colour into another. */
const HUE_SHIFT: Record<LabsShapeName, { from: number; to: number }> = {
  hexagon: { from: 58, to: -50 },
  circle: { from: -64, to: 46 },
  square: { from: 60, to: -54 },
  clover: { from: -56, to: 50 },
}

/** Shape SVG viewBox. Grain tiles are sized in these units, then mapped to pixels. */
const SHAPE_VIEWBOX = 360
/**
 * One grain tile in CSS pixels, on every shape.
 * Smaller = finer speck. 102 matched a medium shape; 64 is a finer trial.
 */
const GRAIN_TILE_PX = 64

/** How far the gradient centre wanders from its home, in percent of the shape. */
const SHADE_DRIFT = 12
/** Extra hue swing on top of the two end colours, in degrees. */
const SHADE_HUE_SWING = 32
/** Seconds for one slow wander of the gradient. */
const SHADE_DRIFT_PERIOD = 16

function parseHex(hex: string): [number, number, number] | null {
  const raw = hex.trim().replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0)
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  return [h * 60, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = l - c / 2
  let rn = 0
  let gn = 0
  let bn = 0
  if (hue < 60) [rn, gn, bn] = [c, x, 0]
  else if (hue < 120) [rn, gn, bn] = [x, c, 0]
  else if (hue < 180) [rn, gn, bn] = [0, c, x]
  else if (hue < 240) [rn, gn, bn] = [0, x, c]
  else if (hue < 300) [rn, gn, bn] = [x, 0, c]
  else [rn, gn, bn] = [c, 0, x]
  const channels = [rn, gn, bn].map((channel) => Math.round((channel + m) * 255))
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

/** Same family, shifted hue, kept vivid so the end doesn’t wash out toward white. */
function shiftHue(hex: string, degrees: number, lightnessDelta: number): string {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  const [h, s, l] = rgbToHsl(...rgb)
  const lightness = Math.min(0.62, Math.max(0.42, l + lightnessDelta))
  const saturation = Math.min(1, Math.max(0.78, s))
  return hslToHex(h + degrees, saturation, lightness)
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

/**
 * Period at this speed. speed 1 ≈ 9s (Labs). Slower props stay in a
 * visible band instead of crawling: 0.5 ≈ 13s, 0.35 ≈ 15s.
 */
function floatPeriod(speed: number) {
  const s = Math.max(0.2, speed)
  return FLOAT_PERIOD / Math.pow(s, 0.45)
}

function clampScrollOmega(omega: number) {
  return Math.max(-MAX_SCROLL_OMEGA, Math.min(MAX_SCROLL_OMEGA, omega))
}

function capVector(x: number, y: number, max: number) {
  const len = Math.hypot(x, y)
  if (len <= max || len < 0.0001) return { x, y }
  const scale = max / len
  return { x: x * scale, y: y * scale }
}

/** How far past the field edge a centre may sit (0 = fully inside, 0.5 = half off). */
function edgeInset(radius: number, edgeBleed: number) {
  const bleed = Math.min(1, Math.max(0, edgeBleed))
  if (bleed <= 0) return radius * 0.35
  return radius * (1 - 2 * bleed)
}

/**
 * Labs-sized sway. It may cross the field edge — clipping there is what
 * makes the drift look continuous, instead of sliding along a wall.
 */
function swayAmps(leash: number, swingX: number, swingY: number, width: number, height: number) {
  const roomX = Math.min(leash, Math.max(48, width * 0.12))
  const roomY = Math.min(leash, Math.max(48, height * 0.14))
  return { ampX: roomX * swingX, ampY: roomY * swingY }
}

/** Same shape as Labs’ ease-in-out float keyframes: rest, peak, rest, opposite peak. */
function labsWave(phase: number) {
  const t = (((phase % TAU) + TAU) % TAU) / TAU
  const ease = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)))
  if (t < 0.25) return ease(t / 0.25)
  if (t < 0.75) return 1 - 2 * ease((t - 0.25) / 0.5)
  return ease((t - 0.75) / 0.25) - 1
}

/** Degrees turned by traveling `dist` px. Scales with 1/radius, like a roll. */
function rollDegrees(dist: number, radius: number, sign: number) {
  const r = Math.max(28, radius)
  return (dist / r) * (180 / Math.PI) * sign * ROLL
}

/** Pose = home + Labs sway + smoothed push. Spin is travel plus scroll. */
function poseOf(body: Body) {
  return {
    x: body.homeX + labsWave(body.phaseX) * body.ampX + body.pushX,
    y: body.homeY + labsWave(body.phaseY) * body.ampY + body.pushY,
    angle: body.baseAngle + body.travelAngle + body.scrollAngle,
  }
}

/** Keep a shape inside its leash so a corner placement can’t be walked inward. */
function holdToLeash(body: Body, leash: number) {
  const pose = poseOf(body)
  const held = capVector(pose.x - body.homeX, pose.y - body.homeY, leash)
  return { x: body.homeX + held.x, y: body.homeY + held.y, angle: pose.angle }
}

/** Global size boost on every Labs floater. */
const SHAPE_SIZE_BOOST = 1.2

function sizeForShape(
  shape: (typeof SHAPES)[number],
  width: number,
  height: number,
  scale = 1,
) {
  const maxSize = Math.min(width, height)
  const sizePx =
    Math.min(maxSize * shape.size * scale, width * 0.55 * scale, 288 * scale) * SHAPE_SIZE_BOOST
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

/** Desired offset that eases a shape off copy and card art. Zero when clear. */
function avoidOffset(body: Body, obstacles: AvoidRect[]) {
  let x = 0
  let y = 0
  if (!obstacles.length) return { x, y }

  for (const obs of obstacles) {
    const strength = obs.strength
    const inside =
      body.x >= obs.left &&
      body.x <= obs.right &&
      body.y >= obs.top &&
      body.y <= obs.bottom

    let awayX: number
    let awayY: number
    let mag: number

    if (inside) {
      awayX = body.x - obs.cx
      awayY = body.y - obs.cy
      let dist = Math.hypot(awayX, awayY)
      if (dist < 1) {
        awayX = body.homeX - body.x || 1
        awayY = body.homeY - body.y
        dist = Math.hypot(awayX, awayY) || 1
      }
      awayX /= dist
      awayY /= dist
      mag = (body.radius * 0.65 + 36) * strength
    } else {
      const qx = Math.min(obs.right, Math.max(obs.left, body.x))
      const qy = Math.min(obs.bottom, Math.max(obs.top, body.y))
      awayX = body.x - qx
      awayY = body.y - qy
      const dist = Math.hypot(awayX, awayY) || 0.0001
      const reach = body.radius + obs.skirt
      if (dist >= reach) continue
      awayX /= dist
      awayY /= dist
      mag = (1 - dist / reach) * Math.min(obs.skirt, body.radius * 0.85) * strength
    }

    if (mag < 0.5) continue
    x += awayX * mag
    y += awayY * mag
  }

  return { x, y }
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
  /** Sway speed multiplier (1 ≈ a 9s Labs cycle, 0.4 ≈ slower). */
  speed?: number
  /** How far the sway travels from home (px). */
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
  const uid = useId().replace(/:/g, '')
  const grainUrl = assetUrl('/assets/img/shape-grain.svg?v=7')
  const lenis = useLenis()
  const fills = resolveLabsShapeFills(colors)
  const fillsKey = (Object.keys(fills) as LabsShapeName[]).map((name) => `${name}:${fills[name]}`).join('|')
  const excludeKey = exclude?.length ? [...exclude].sort().join(',') : ''
  const onlyKey = only?.length ? [...only].sort().join(',') : ''
  const homesKey = homes?.map((h) => `${h.x},${h.y}`).join('|') ?? ''
  const shapes = pickShapes(exclude, only)
  const period = floatPeriod(speed)
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

    const shadeMotions = nodes.flatMap((el, index) => {
      const shape = activeShapes[index]
      const grad = el.querySelector('radialGradient')
      const stops = el.querySelectorAll('stop')
      if (!shape || !grad || stops.length < 2) return []
      const home = SHAPE_SHADE[shape.name]
      return [
        {
          grad,
          fromStop: stops[0],
          toStop: stops[1],
          fill: fills[shape.name],
          fromDeg: HUE_SHIFT[shape.name].from,
          toDeg: HUE_SHIFT[shape.name].to,
          homeX: Number.parseFloat(home.cx),
          homeY: Number.parseFloat(home.cy),
          phase: index * 1.7,
        },
      ]
    })

    const driftShades = (now: number) => {
      const t = now / 1000
      for (const shade of shadeMotions) {
        const drift = (t / SHADE_DRIFT_PERIOD) * TAU + shade.phase
        const cx = shade.homeX + Math.sin(drift) * SHADE_DRIFT
        const cy = shade.homeY + Math.cos(drift * 0.77) * (SHADE_DRIFT - 3)
        shade.grad.setAttribute('cx', `${cx}%`)
        shade.grad.setAttribute('cy', `${cy}%`)
        const hue = Math.sin(drift * 0.63) * SHADE_HUE_SWING
        shade.fromStop.setAttribute('stop-color', shiftHue(shade.fill, shade.fromDeg + hue, -0.04))
        shade.toStop.setAttribute('stop-color', shiftHue(shade.fill, shade.toDeg - hue * 0.65, -0.08))
      }
    }

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
      // Pattern units follow the viewBox, so a fixed user-unit tile would grow
      // with the shape. Scale the tile so it stays GRAIN_TILE_PX on screen.
      const tile = (GRAIN_TILE_PX * SHAPE_VIEWBOX) / Math.max(sizePx, 1)
      const pattern = el.querySelector('pattern')
      const image = pattern?.querySelector('image')
      if (!pattern) return
      const value = tile.toFixed(2)
      pattern.setAttribute('width', value)
      pattern.setAttribute('height', value)
      image?.setAttribute('width', value)
      image?.setAttribute('height', value)
    }

    const resetBodies = (width: number, height: number) => {
      bodies.length = 0
      const obstacles = collectAvoidRects(root)

      activeShapes.forEach((shape, index) => {
        const { sizePx, radius } = sizeForShape(shape, width, height, scale)
        let home = homeForIndex(index, width, height, radius, homes, edgeBleed)
        // An authored home (the orange circle on the left edge) stays put.
        // Only default spots get nudged if they would start inside an obstacle.
        if (!homes?.[index]) {
          for (let attempt = 0; attempt < 10; attempt++) {
            if (!obstacles.some((obs) => overlapsAvoid(home.x, home.y, radius, obs))) break
            home = {
              x: rand(radius, Math.max(radius, width - radius)),
              y: rand(radius, Math.max(radius, height - radius)),
            }
          }
        }
        const sign = () => (Math.random() < 0.5 ? -1 : 1)
        const cycle = period * rand(0.88, 1.12)
        const baseAngle = rand(-24, 24)
        const swingX = rand(0.72, 1) * sign()
        const swingY = rand(0.82, 1) * sign()
        const amps = swayAmps(homeLeash, swingX, swingY, width, height)
        const body: Body = {
          name: shape.name,
          x: home.x,
          y: home.y,
          px: home.x,
          py: home.y,
          pAngle: baseAngle,
          homeX: home.x,
          homeY: home.y,
          baseAngle,
          travelAngle: 0,
          spinSign: sign(),
          scrollAngle: 0,
          scrollOmega: 0,
          phaseX: rand(0, TAU),
          phaseY: rand(0, TAU),
          freqX: TAU / cycle,
          freqY: TAU / (cycle * FLOAT_Y_RATIO),
          ampX: amps.ampX,
          ampY: amps.ampY,
          swingX,
          swingY,
          pushX: 0,
          pushY: 0,
          angle: baseAngle,
          radius,
          sizePx,
        }
        const pose = holdToLeash(body, homeLeash)
        body.x = pose.x
        body.y = pose.y
        body.px = pose.x
        body.py = pose.y
        body.angle = pose.angle
        body.pAngle = pose.angle
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
        body.pushX *= scaleX
        body.pushY *= scaleY
        body.homeX = home.x
        body.homeY = home.y
        body.radius = radius
        body.sizePx = sizePx
        const amps = swayAmps(homeLeash, body.swingX, body.swingY, width, height)
        body.ampX = amps.ampX
        body.ampY = amps.ampY
        const pose = holdToLeash(body, homeLeash)
        body.x = pose.x
        body.y = pose.y
        body.px = pose.x
        body.py = pose.y
        body.angle = pose.angle
        body.pAngle = pose.angle
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
    // Stay idle until the observer confirms the field is on screen, so a
    // jump from further up the page doesn’t arrive as one huge spin.
    let visible = false
    let scrollY = lenis?.scroll ?? window.scrollY
    let pendingScrollPx = 0
    let pointerX = 0
    let pointerY = 0
    let pointerInField = false
    let lastPointerMoveAt = 0
    let touchActive = 0
    // Phones: a finger is for scrolling. Google’s shapes don’t dodge or tumble.
    const coarsePointer = window.matchMedia('(pointer: coarse), (hover: none)').matches
    let lastAvoidT = 0
    let avoidFrom: AvoidRect[] = collectAvoidRects(root)
    let avoidTo: AvoidRect[] = avoidFrom.map((box) => ({ ...box }))
    let avoidBlend = 1
    let debugAccum = 0
    let frameCount = 0

    const readScrollY = () => lenis?.scroll ?? window.scrollY

    const onScroll = () => {
      const y = readScrollY()
      const dy = y - scrollY
      scrollY = y
      // Only the scroll that happens while the field is on screen spins them.
      // A backlog from further up the page would tumble them as they enter.
      if (reduce || !visible || coarsePointer || touchActive > 0 || dy === 0) return
      pendingScrollPx += dy
    }

    /** Apply queued scroll as immediate rotation + a bit of leftover spin. */
    const applyScrollSpin = () => {
      if (!pendingScrollPx || !bodies.length) return
      const scrollDeg = pendingScrollPx * SCROLL_DEG_PER_PX
      pendingScrollPx = 0
      for (const body of bodies) {
        body.scrollAngle += scrollDeg
        body.scrollOmega = clampScrollOmega(body.scrollOmega + scrollDeg * SCROLL_OMEGA_GAIN)
        body.angle += scrollDeg
        body.pAngle += scrollDeg
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return
      touchActive += 1
      pointerInField = false
    }

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return
      touchActive = Math.max(0, touchActive - 1)
      pointerInField = false
    }

    const onPointerMove = (event: PointerEvent) => {
      // Touch drags are scrolls. Pushing shapes off the finger fights that.
      if (reduce || coarsePointer || event.pointerType !== 'mouse') {
        pointerInField = false
        return
      }
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

    const integrate = (dt: number, now: number) => {
      const pointerLive =
        !coarsePointer &&
        touchActive === 0 &&
        pointerInField &&
        now - lastPointerMoveAt < POINTER_ACTIVE_MS

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

        body.phaseX += body.freqX * dt
        body.phaseY += body.freqY * dt

        let desiredX = 0
        let desiredY = 0
        if (pointerLive) {
          const dx = body.x - pointerX
          const dy = body.y - pointerY
          const dist = Math.hypot(dx, dy) || 0.0001
          const reach = CURSOR_RADIUS + body.radius * 0.35
          if (dist < reach) {
            const falloff = 1 - dist / reach
            const push = falloff * falloff * CURSOR_PUSH
            desiredX += (dx / dist) * push
            desiredY += (dy / dist) * push
          }
        }

        const avoid = avoidOffset(body, obstacles)
        desiredX += avoid.x
        desiredY += avoid.y
        const capped = capVector(desiredX, desiredY, Math.max(96, homeLeash))
        const follow = 1 - Math.exp(-PUSH_FOLLOW * dt)
        body.pushX += (capped.x - body.pushX) * follow
        body.pushY += (capped.y - body.pushY) * follow

        body.scrollOmega *= Math.exp(-0.85 * dt)
        body.scrollAngle += body.scrollOmega * dt

        const pose = holdToLeash(body, homeLeash)
        const traveled = Math.hypot(pose.x - body.px, pose.y - body.py)
        if (!reduce) body.travelAngle += rollDegrees(traveled, body.radius, body.spinSign)
        body.x = pose.x
        body.y = pose.y
        body.angle = body.baseAngle + body.travelAngle + body.scrollAngle
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
        integrate(FIXED_DT, now)
        simAccum -= FIXED_DT
        steps += 1
      }
      // Don’t spiral if a tab was backgrounded — drop leftover time.
      if (steps === MAX_SIM_STEPS) simAccum = 0

      // Grow from last pose → current between fixed steps (smooth on 120Hz too).
      displayAlpha = Math.min(1, simAccum / FIXED_DT)
      driftShades(now)
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerUp, { passive: true })
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
        scrollY = readScrollY()
        pendingScrollPx = 0
      },
      { threshold: 0 },
    )
    io.observe(root)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
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
    fillsKey,
    homes,
    scale,
    edgeBleed,
    period,
    homeLeash,
  ])

  return (
    <div aria-hidden="true" className={className} ref={rootRef}>
      {shapes.map((shape) => {
        const shadeId = `${uid}-${shape.name}-shade`
        const grainId = `${uid}-${shape.name}-grain`
        const shade = SHAPE_SHADE[shape.name]
        const fill = fills[shape.name]
        const shift = HUE_SHIFT[shape.name]
        const from = shiftHue(fill, shift.from, -0.04)
        const to = shiftHue(fill, shift.to, -0.08)
        return (
          <svg
            className={`ka-labs-shape ka-labs-shape--${shape.name}`}
            fill="none"
            key={shape.name}
            style={{ color: fill }}
            viewBox={`0 0 ${SHAPE_VIEWBOX} ${SHAPE_VIEWBOX}`}
          >
            <defs>
              <radialGradient cx={shade.cx} cy={shade.cy} id={shadeId} r={shade.r}>
                <stop offset="0%" stopColor={from} />
                <stop offset="100%" stopColor={to} />
              </radialGradient>
              <pattern height="170" id={grainId} patternUnits="userSpaceOnUse" width="170">
                <image height="170" href={grainUrl} preserveAspectRatio="none" width="170" />
              </pattern>
            </defs>
            {/*
              Gradient and grain are painted inside the shape. A CSS filter on the
              svg itself would flatten mix-blend-mode: difference.
            */}
            <path d={shape.d} fill={`url(#${shadeId})`} transform={shape.transform} />
            <path
              className="ka-labs-shape__grain"
              d={shape.d}
              fill={`url(#${grainId})`}
              transform={shape.transform}
            />
          </svg>
        )
      })}
    </div>
  )
}

export { LABS_SHAPE_COLORS }
export type { LabsShapeColorSpec, LabsShapeName }
