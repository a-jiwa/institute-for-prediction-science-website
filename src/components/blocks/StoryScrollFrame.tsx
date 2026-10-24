import { useEffect, useRef } from 'react'
import { assetUrl } from '../../utils/assetUrl'

const SVG_SRC = assetUrl('/assets/img/frame-white-3.svg')
/** SMIL cycle length in the source SVG. */
const SMIL_DUR = 4.5
/**
 * Calm hold once travelers arrive (hex / lightbulb / j7 at keyTime 0.38).
 * Clamping at 0.22 left those ornaments mid-arc.
 */
const T_END = 0.38 * SMIL_DUR
/** Viewport Y fraction where scrub begins (higher = earlier, while plate is still lower). */
const ANCHOR = 0.75
/** Scroll distance after the anchor that maps to the full morph (~¼ viewport). */
const SCRUB_VH = 0.25
const SETTLE_FOLLOW = 5.5
/**
 * Once committed, keep easing to calm so it never parks mid-morph.
 * Lower = slower finish after you stop scrolling (~2–3s to complete).
 */
const COMMIT_FOLLOW = 1.6
/** Scroll progress that locks the morph to finish (won’t freeze mid-way). */
const COMMIT_AT = 0.12
/** Only unlock / reverse once scrolled back nearly to the anxious start. */
const RESET_BELOW = 0.03
const FLOAT_FOLLOW = 4.2
/**
 * Face square spins 0 → −45° — all satellites orbit + self-spin this way only.
 */
const FACE_SPIN_DIR = -1
/** Base self-spin (deg/sec); farther bodies spin a bit slower. */
const SELF_SPIN_DEG_PER_SEC = 6 * FACE_SPIN_DIR
/** Reference orbit radius (px) — ω scaled from here via Kepler. */
const ORBIT_R_REF = 400
/** Angular speed at R_REF for unit mass (deg/sec) — very slow drift. */
const ORBIT_OMEGA_REF = 1.2
/** Face centre after scene-group translate(0 57) — satellites orbit here. */
const FACE = { x: 545, y: 397 }

/**
 * Planet-like circular orbit: ω ∝ 1 / (r^1.5 · m^0.35).
 * Farther and heavier → slower around the centre; one direction only.
 */
function orbitOmegaDegPerSec(radius: number, mass: number) {
  const r = Math.max(0.4, radius / ORBIT_R_REF)
  const m = Math.max(0.45, mass)
  return (ORBIT_OMEGA_REF / (r ** 1.5 * m ** 0.35)) * FACE_SPIN_DIR
}
/** Self-spin pivots (viewBox). Satellites use their home centres. */
const SPIN_PIVOTS: Record<string, { x: number; y: number }> = {
  'j4-swirl': { x: 725.534, y: 219.68 },
  'sat-swirl-b': { x: 290, y: 619 },
}
const SVG_NS = 'http://www.w3.org/2000/svg'

/** Soft plate behind the face — floats like Labs eye/balance/hex backs. */
const BACK_ID = 'plate-back' as const

type DriftSpec = {
  phase: number
  fx: number
  fy: number
  ax: number
  ay: number
}

type FloatItem = {
  id: string
  drift: DriftSpec
  idle: DriftSpec
  /** Orbit the face like a planet (speed from radius + mass). */
  orbit?: boolean
  /** Relative mass — larger shapes orbit a bit slower. */
  mass?: number
  /** Home centre in viewBox — required for orbit. */
  home?: { x: number; y: number }
  /** Self-spin while floaty — always FACE_SPIN_DIR. */
  selfSpin?: boolean
}

/** Soft plate: very light float — mostly grounded under the face. */
const BACK_DRIFT: DriftSpec = {
  phase: 1.5,
  fx: 0.22,
  fy: 0.28,
  ax: 5,
  ay: 3.5,
}
const BACK_IDLE: DriftSpec = {
  phase: 1.1,
  fx: 0.16,
  fy: 0.2,
  ax: 1.4,
  ay: 1.2,
}

function d(phase: number, fx: number, fy: number, ax: number, ay: number): DriftSpec {
  return { phase, fx, fy, ax, ay }
}

/** Core ornaments + satellites spread past the background plate. */
const FLOAT_ITEMS: FloatItem[] = [
  { id: BACK_ID, drift: BACK_DRIFT, idle: BACK_IDLE },
  {
    id: 'j4-swirl',
    drift: d(0.4, 0.31, 0.47, 14, 16),
    idle: d(0.7, 0.21, 0.29, 3.2, 3.8),
    selfSpin: true,
    // Pivot in SPIN_PIVOTS; spins with FACE_SPIN_DIR via SELF_SPIN_DEG_PER_SEC.
  },
  { id: 'e7-star', drift: d(2.1, 0.39, 0.27, 16, 12), idle: d(2.4, 0.26, 0.19, 3.6, 3.0) },
  { id: 'd5-square', drift: d(4.2, 0.53, 0.41, 12, 15), idle: d(1.3, 0.18, 0.24, 2.8, 3.4) },
  { id: 'j7-square', drift: d(1.6, 0.28, 0.36, 15, 11), idle: d(3.8, 0.23, 0.31, 3.4, 2.6) },
  { id: 'lightbulb', drift: d(3.3, 0.44, 0.33, 13, 14), idle: d(4.6, 0.2, 0.27, 3.0, 3.6) },
  { id: 'g3-x', drift: d(5.1, 0.36, 0.52, 11, 13), idle: d(0.5, 0.25, 0.22, 3.5, 2.9) },
  { id: 'h3-tick', drift: d(0.9, 0.48, 0.29, 14, 10), idle: d(5.5, 0.19, 0.28, 2.7, 3.3) },
  { id: 'j6-hex', drift: d(2.7, 0.33, 0.45, 12, 16), idle: d(1.9, 0.22, 0.26, 3.3, 3.1) },
  // Satellites — evenly spaced on the plate rim (~36° apart), no overlap.
  {
    id: 'sat-sq-a',
    home: { x: 226, y: 425 },
    orbit: true,
    mass: 1,
    selfSpin: true,
    drift: d(0.6, 0.35, 0.42, 8, 9),
    idle: d(0.8, 0.2, 0.25, 2.0, 2.2),
  },
  {
    id: 'sat-sq-b',
    home: { x: 864, y: 120 },
    orbit: true,
    mass: 1.02,
    selfSpin: true,
    drift: d(1.8, 0.4, 0.3, 8, 8),
    idle: d(2.2, 0.22, 0.2, 2.0, 2.1),
  },
  {
    id: 'sat-sq-c',
    home: { x: 402, y: 61 },
    orbit: true,
    mass: 1.06,
    selfSpin: true,
    drift: d(3.1, 0.28, 0.38, 7, 9),
    idle: d(3.4, 0.19, 0.23, 1.9, 2.2),
  },
  {
    id: 'sat-sq-d',
    home: { x: 494, y: 619 },
    orbit: true,
    mass: 1.35,
    selfSpin: true,
    drift: d(4.5, 0.45, 0.32, 8, 8),
    idle: d(4.1, 0.21, 0.24, 2.1, 2.0),
  },
  {
    id: 'sat-sq-e',
    home: { x: 864, y: 589 },
    orbit: true,
    mass: 1.13,
    selfSpin: true,
    drift: d(5.2, 0.32, 0.4, 9, 7),
    idle: d(5.0, 0.18, 0.26, 1.9, 2.2),
  },
  {
    id: 'sat-hex-a',
    home: { x: 226, y: 205 },
    orbit: true,
    mass: 0.85,
    selfSpin: true,
    drift: d(0.3, 0.37, 0.29, 8, 9),
    idle: d(1.0, 0.2, 0.22, 2.0, 2.1),
  },
  {
    id: 'sat-hex-b',
    home: { x: 864, y: 369 },
    orbit: true,
    mass: 0.8,
    selfSpin: true,
    drift: d(2.0, 0.29, 0.44, 8, 8),
    idle: d(2.6, 0.23, 0.21, 1.9, 2.0),
  },
  {
    id: 'sat-hex-c',
    home: { x: 623, y: 61 },
    orbit: true,
    mass: 0.95,
    selfSpin: true,
    drift: d(3.7, 0.41, 0.27, 7, 9),
    idle: d(3.2, 0.17, 0.25, 1.8, 2.1),
  },
  {
    id: 'sat-hex-d',
    home: { x: 639, y: 619 },
    orbit: true,
    mass: 0.92,
    selfSpin: true,
    drift: d(4.8, 0.26, 0.39, 8, 8),
    idle: d(4.4, 0.21, 0.23, 2.0, 2.0),
  },
  {
    id: 'sat-swirl-b',
    home: { x: 290, y: 619 },
    orbit: true,
    mass: 1.1,
    drift: d(1.4, 0.34, 0.36, 9, 10),
    idle: d(1.6, 0.19, 0.27, 2.2, 2.4),
    selfSpin: true,
  },
]

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function smoothstep(t: number) {
  const p = clamp01(t)
  return p * p * (3 - 2 * p)
}

function driftOffset(spec: DriftSpec, time: number, loose: number) {
  if (loose < 0.001) return { x: 0, y: 0 }
  const x =
    Math.sin(time * spec.fx + spec.phase) * spec.ax +
    Math.sin(time * spec.fx * 0.37 + spec.phase * 1.7) * spec.ax * 0.4
  const y =
    Math.cos(time * spec.fy + spec.phase * 1.3) * spec.ay +
    Math.sin(time * spec.fy * 0.53 + spec.phase * 0.6) * spec.ay * 0.35
  return { x: x * loose, y: y * loose }
}

/**
 * Scroll progress for the tense-to-calm frame:
 * 0 while the plate centre is below 75% of the viewport;
 * 0→1 over the next 0.25×vh of upward travel; then 1.
 */
function measureScrubProgress(root: HTMLElement): number {
  const rect = root.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) return 0

  const vh = window.innerHeight
  const elCenter = rect.top + rect.height / 2
  const viewMid = vh * ANCHOR
  const range = Math.max(100, vh * SCRUB_VH)

  return smoothstep((viewMid - elCenter) / range)
}

function wrapForFloat(el: SVGGElement): SVGGElement {
  const parent = el.parentNode
  if (!parent) return el
  const wrap = document.createElementNS(SVG_NS, 'g')
  wrap.setAttribute('class', 'story-scroll-float')
  parent.insertBefore(wrap, el)
  wrap.appendChild(el)
  return wrap
}

type StoryScrollFrameProps = {
  className?: string
}

export function StoryScrollFrame({ className }: StoryScrollFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    let svg: SVGSVGElement | null = null
    let raf = 0
    let visible = true
    let last = performance.now()
    const t0 = last
    let settleCurrent = 0
    /** After a little scrub, keep finishing to calm — don’t park mid-morph. */
    let committed = false

    type Floater = {
      item: FloatItem
      wrap: SVGGElement
      x: number
      y: number
      spin: number
      /** Fixed polar home relative to face (for orbit). */
      orbitR: number
      orbitA0: number
      /** Accumulated orbit angle (rad). */
      orbitAngle: number
      /** Kepler angular speed (deg/sec), signed. */
      omegaDeg: number
    }
    let floaters: Floater[] = []

    const applyTime = (t: number) => {
      if (!svg) return
      try {
        svg.pauseAnimations()
        svg.setCurrentTime(t)
      } catch {
        /* SMIL control unavailable */
      }
    }

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      if (!visible || !svg) {
        last = now
        return
      }

      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const time = (now - t0) / 1000

      if (reduce) {
        const near =
          measureScrubProgress(host) > 0 ||
          host.getBoundingClientRect().top < window.innerHeight
        settleCurrent = near ? 1 : 0
        applyTime(settleCurrent * T_END)
        return
      }

      const settleTarget = measureScrubProgress(host)
      if (settleTarget >= COMMIT_AT) committed = true
      if (settleTarget <= RESET_BELOW) committed = false

      // Committed → ease the rest of the way to 1 (no mid-morph freeze, no snap).
      const goal = committed ? 1 : settleTarget
      const settleK = 1 - Math.exp(-(committed ? COMMIT_FOLLOW : SETTLE_FOLLOW) * dt)
      settleCurrent += (goal - settleCurrent) * settleK
      applyTime(settleCurrent * T_END)

      const loose = 1 - settleCurrent
      const followK = 1 - Math.exp(-FLOAT_FOLLOW * dt)
      for (const f of floaters) {
        const { item } = f
        const drift = driftOffset(item.drift, time, loose)
        const idle = driftOffset(item.idle, time, item.orbit ? loose : 1)

        let tx = drift.x + idle.x
        let ty = drift.y + idle.y

        if (item.orbit && loose > 0.001) {
          f.orbitAngle += ((f.omegaDeg * Math.PI) / 180) * loose * dt
          const a = f.orbitA0 + f.orbitAngle
          const ox = FACE.x + f.orbitR * Math.cos(a) - (item.home?.x ?? FACE.x)
          const oy = FACE.y + f.orbitR * Math.sin(a) - (item.home?.y ?? FACE.y)
          tx += ox
          ty += oy
        }

        f.x += (tx - f.x) * followK
        f.y += (ty - f.y) * followK

        let transform = `translate(${f.x.toFixed(2)} ${f.y.toFixed(2)})`
        if (item.selfSpin && loose > 0.001) {
          // Farther planets also spin slower on their axis.
          const spinScale = Math.sqrt(ORBIT_R_REF / Math.max(f.orbitR, 120))
          f.spin += SELF_SPIN_DEG_PER_SEC * spinScale * loose * dt
          const pivot = SPIN_PIVOTS[item.id] ?? item.home
          if (pivot) {
            transform += ` translate(${pivot.x} ${pivot.y}) rotate(${f.spin.toFixed(2)}) translate(${-pivot.x} ${-pivot.y})`
          }
        }
        f.wrap.setAttribute('transform', transform)
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting)
        last = performance.now()
      },
      { rootMargin: '10% 0px' },
    )
    io.observe(host)

    const boot = async () => {
      try {
        const res = await fetch(SVG_SRC)
        if (!res.ok || cancelled) return
        const markup = await res.text()
        if (cancelled) return

        host.innerHTML = markup
        svg = host.querySelector('svg')
        if (!svg) return

        svg.setAttribute('role', 'img')
        svg.setAttribute(
          'aria-label',
          'An anxious square face calming into a yellow circle as you scroll.',
        )

        floaters = []
        for (const item of FLOAT_ITEMS) {
          const el = svg.querySelector(`#${item.id}`)
          if (!(el instanceof SVGGElement)) continue
          const home = item.home
          const dx = (home?.x ?? FACE.x) - FACE.x
          const dy = (home?.y ?? FACE.y) - FACE.y
          const orbitR = Math.hypot(dx, dy)
          floaters.push({
            item,
            wrap: wrapForFloat(el),
            x: 0,
            y: 0,
            spin: 0,
            orbitR,
            orbitA0: Math.atan2(dy, dx),
            orbitAngle: 0,
            omegaDeg: item.orbit
              ? orbitOmegaDegPerSec(orbitR, item.mass ?? 1)
              : 0,
          })
        }

        settleCurrent = measureScrubProgress(host)
        applyTime(settleCurrent * T_END)
        last = performance.now()
        raf = requestAnimationFrame(step)
      } catch {
        /* leave host empty on fetch failure */
      }
    }

    void boot()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      io.disconnect()
      host.innerHTML = ''
    }
  }, [])

  return (
    <div
      className={['story-scroll-frame', className].filter(Boolean).join(' ')}
      ref={hostRef}
    />
  )
}
