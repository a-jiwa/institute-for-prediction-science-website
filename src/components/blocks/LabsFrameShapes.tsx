import { useId, useLayoutEffect, useRef } from 'react'
import { useLenis } from '../layout/CookieBanner'
import {
  LABS_SHAPE_COLORS,
  resolveLabsShapeFill,
  type LabsShapeColorSpec,
} from './labsBlend'
import { measureCardArtSettle } from './labsSettle'

/**
 * Labs composition from frame-white-2.svg.
 *
 * White vesica = eye white (intersection of two circles). Blue centre circle =
 * pupil; it looks toward the cursor slightly inside the white. A near-yellow
 * square floats behind the eye (shorter than the circle stack) as a backdrop.
 * Discs drift in then settle at mid-viewport. Bottom ornaments sit on the lower rim.
 */

type LabsFrameShapesProps = {
  className?: string
  centre?: LabsShapeColorSpec
  lens?: string
  /** Top large disc fill (default: soft dark yellow — reads on white and wash). */
  discTop?: string
  /** Bottom large disc fill (default: Labs square pink). */
  discBottom?: string
}

/** Soft shade of clover `#fcc934` — just dark enough to read on the wash. */
const DISC_TOP = '#f5c42e'
const DISC_BOTTOM = resolveLabsShapeFill(LABS_SHAPE_COLORS.square)
/** Shared near-yellow matte under all three ornaments (sibling of Labs clover). */
const SQUARE_YELLOW = '#f8d45a'

const VIEW_W = 1090
const VIEW_H = 680
/** How much of the view height the circle stack fills — bump to enlarge the card art. */
const STACK_FILL = 1.14
const LARGE_R = (VIEW_H * STACK_FILL) / 3
const CENTRE_R = LARGE_R / 4
/** How far the pupil may wander inside the white (keeps a white rim). */
const PUPIL_TRAVEL = LARGE_R - CENTRE_R * 1.15
/** Fraction of pointer offset applied — “slightly” look, not full chase. */
const PUPIL_LOOK_GAIN = 0.2
const PUPIL_LOOK_MAX = CENTRE_R * 1.35
const MID_X = VIEW_W / 2
const MID_Y = VIEW_H / 2

const SETTLED = {
  top: { x: MID_X, y: MID_Y - LARGE_R / 2 },
  bottom: { x: MID_X, y: MID_Y + LARGE_R / 2 },
  centre: { x: MID_X, y: MID_Y },
} as const

const HOME = {
  top: { x: -LARGE_R * 0.95, y: -LARGE_R * 1.15 },
  bottom: { x: LARGE_R * 1.05, y: LARGE_R * 0.72 },
  centre: { x: LARGE_R * 0.55, y: -LARGE_R * 0.4 },
  /** Backdrop square — drifts in behind the eye. */
  eyeBack: { x: -LARGE_R * 0.65, y: LARGE_R * 0.4 },
} as const

const DRIFT = {
  top: { phase: 0.4, fx: 0.31, fy: 0.47, ax: LARGE_R * 0.28, ay: LARGE_R * 0.34 },
  bottom: { phase: 2.1, fx: 0.39, fy: 0.27, ax: LARGE_R * 0.32, ay: LARGE_R * 0.26 },
  centre: { phase: 4.2, fx: 0.53, fy: 0.41, ax: LARGE_R * 0.38, ay: LARGE_R * 0.3 },
  eyeBack: { phase: 1.6, fx: 0.28, fy: 0.36, ax: LARGE_R * 0.24, ay: LARGE_R * 0.2 },
} as const

/** Always-on micro-wobble so settled discs stay slightly alive. */
const IDLE = {
  top: { phase: 0.7, fx: 0.21, fy: 0.29, ax: LARGE_R * 0.048, ay: LARGE_R * 0.056 },
  bottom: { phase: 2.4, fx: 0.26, fy: 0.19, ax: LARGE_R * 0.052, ay: LARGE_R * 0.044 },
  eyeBack: { phase: 1.3, fx: 0.18, fy: 0.24, ax: LARGE_R * 0.038, ay: LARGE_R * 0.042 },
} as const

const SETTLE_BIAS = { top: 1.12, bottom: 0.88, centre: 1.02, eyeBack: 1.05 } as const

/**
 * Wide rounded plate behind the eye — shorter than the circle stack (≈3R);
 * wider than the stack. Bottom ornaments sit above this plate’s lower edge.
 */
const EYE_BACK_H = LARGE_R * 2.72
const EYE_BACK_W = LARGE_R * 3.45
const EYE_BACK_SCALE_X = EYE_BACK_W / 321
const EYE_BACK_SCALE_Y = EYE_BACK_H / 321
/** Soft plate fill — normal blend, so keep it light for subtlety on the wash. */
const EYE_BACK_FILL = '#f6e09a'

/** Glyph art box (Labs shape viewBoxes). */
const GLYPH_BOX = 360
/** Closer to LabsHeroShapes scale on the page. */
const ORNAMENT_SIZE = LARGE_R * 0.58
const ORNAMENT_SCALE = ORNAMENT_SIZE / GLYPH_BOX
/** Full square behind each glyph — slightly larger; multiply so colour shifts. */
const FRAME_SCALE = ORNAMENT_SCALE * 1.22
/** Spread along the bottom disc rim. */
const ORNAMENT_GAP = LARGE_R * 1.18
/**
 * Centres sit on the lower disc, raised so the yellow frames stay above the
 * eye-plate bottom (plate bottom ≈ mid + 1.36R; frames sit ~mid + 0.5R + y).
 */
const ORNAMENT_CENTRE_Y = LARGE_R * 0.48

/** Labs rounded square path (glyph space) — solid matte under each ornament. */
const FRAME_SQUARE_D =
  'M0 59.7623C0 26.7519 26.7519 0 59.7623 0H261.092C294.102 0 320.854 26.7519 320.854 59.7623V261.092C320.854 294.102 294.102 320.854 261.092 320.854H59.7623C26.7519 320.854 0 294.102 0 261.092V59.7623Z'
const FRAME_SQUARE_TRANSFORM = 'translate(19.5 19.5)'
const FRAME_ANCHOR = { cx: 180, cy: 180 }

/**
 * Equilateral triangle, centroid at (180, 180), side 220.
 * Circular corner fillets — same soft Labs language as square/hexagon.
 */
const TRIANGLE_SIDE = 220
const TRIANGLE_D = (() => {
  const cx = 180
  const cy = 180
  const s = TRIANGLE_SIDE
  const h = (s * Math.sqrt(3)) / 2
  // Corner radius; tangency distance for 60° interior = R / tan(30°) = R√3.
  const R = s * 0.2
  const d = R * Math.sqrt(3)
  const ax = cx
  const ay = cy - (2 / 3) * h
  const bx = cx + s / 2
  const by = cy + (1 / 3) * h
  const lx = cx - s / 2
  const ly = cy + (1 / 3) * h
  const uAB = [0.5, Math.sqrt(3) / 2] as const
  const uAC = [-0.5, Math.sqrt(3) / 2] as const
  const uBA = [-0.5, -Math.sqrt(3) / 2] as const
  const uBC = [-1, 0] as const
  const uCB = [1, 0] as const
  const uCA = [0.5, -Math.sqrt(3) / 2] as const
  const aOut = [ax + uAB[0] * d, ay + uAB[1] * d]
  const bIn = [bx + uBA[0] * d, by + uBA[1] * d]
  const bOut = [bx + uBC[0] * d, by + uBC[1] * d]
  const cIn = [lx + uCB[0] * d, ly + uCB[1] * d]
  const cOut = [lx + uCA[0] * d, ly + uCA[1] * d]
  const aIn = [ax + uAC[0] * d, ay + uAC[1] * d]
  const f = (n: number) => n.toFixed(3)
  const arc = (to: number[]) =>
    `A${f(R)} ${f(R)} 0 0 1 ${f(to[0])} ${f(to[1])}`
  // Clockwise: A → B → C; sweep=1 arcs put a true round on each tip.
  return [
    `M${f(aOut[0])} ${f(aOut[1])}`,
    `L${f(bIn[0])} ${f(bIn[1])}`,
    arc(bOut),
    `L${f(cIn[0])} ${f(cIn[1])}`,
    arc(cOut),
    `L${f(aIn[0])} ${f(aIn[1])}`,
    arc(aOut),
    'Z',
  ].join('')
})()

const ORNAMENTS = [
  {
    key: 'triangle',
    fill: resolveLabsShapeFill(LABS_SHAPE_COLORS.hexagon),
    d: TRIANGLE_D,
    pathTransform: undefined as string | undefined,
    // Centroid of the equilateral — matches yellow square centre.
    anchor: { cx: 180, cy: 180 },
    /** Visual reference (~220px side). */
    size: 1,
    squareFill: SQUARE_YELLOW,
    offsetX: -ORNAMENT_GAP,
    offsetY: ORNAMENT_CENTRE_Y,
    /** Mild scatter — calmer than the large discs. */
    home: { x: -LARGE_R * 0.28, y: LARGE_R * 0.22 },
    drift: {
      phase: 1.1,
      fx: 0.35,
      fy: 0.42,
      ax: LARGE_R * 0.1,
      ay: LARGE_R * 0.08,
    },
    settleBias: 1.0,
  },
  {
    key: 'hexagon',
    fill: resolveLabsShapeFill(LABS_SHAPE_COLORS.circle),
    d: 'M132.896 7.43243C149.932 -2.47747 170.922 -2.47748 187.958 7.43242L293.323 68.7223C310.359 78.6322 320.854 96.9465 320.854 116.766L320.854 239.346C320.854 259.166 310.359 277.48 293.323 287.39L187.958 348.68C170.922 358.59 149.932 358.59 132.896 348.68L27.5311 287.39C10.4948 277.48 0 259.166 0 239.346L0 116.766C0 96.9465 10.4948 78.6322 27.5311 68.7223L132.896 7.43243Z',
    pathTransform: 'translate(19.5 1.5)',
    // After translate(19.5 1.5): geometric centre ≈ (180, 180).
    anchor: { cx: 180, cy: 180 },
    // Hex spans ~341 vs triangle side ~220 → shrink to match.
    size: TRIANGLE_SIDE / 341,
    squareFill: SQUARE_YELLOW,
    offsetX: 0,
    offsetY: ORNAMENT_CENTRE_Y,
    home: { x: LARGE_R * 0.08, y: LARGE_R * 0.32 },
    drift: {
      phase: 3.6,
      fx: 0.4,
      fy: 0.3,
      ax: LARGE_R * 0.11,
      ay: LARGE_R * 0.09,
    },
    settleBias: 0.96,
  },
  {
    key: 'square',
    fill: resolveLabsShapeFill(LABS_SHAPE_COLORS.square),
    d: FRAME_SQUARE_D,
    pathTransform: FRAME_SQUARE_TRANSFORM,
    // After translate(19.5 19.5): geometric centre ≈ (180, 180).
    anchor: { cx: 180, cy: 180 },
    // Square spans ~321 vs triangle side ~220 → shrink to match.
    size: TRIANGLE_SIDE / 321,
    squareFill: SQUARE_YELLOW,
    offsetX: ORNAMENT_GAP,
    offsetY: ORNAMENT_CENTRE_Y,
    home: { x: LARGE_R * 0.3, y: LARGE_R * 0.18 },
    drift: {
      phase: 5.4,
      fx: 0.32,
      fy: 0.38,
      ax: LARGE_R * 0.09,
      ay: LARGE_R * 0.1,
    },
    settleBias: 0.92,
  },
] as const

/** Ornaments ease nearly with the discs — less lag / float. */
const ORN_FOLLOW = 3.6

/** Glyph spin: quick burst, then pause — sequenced one ornament at a time. */
const SPIN_BURST = 0.4
const SPIN_PAUSE = 1.1
const SPIN_TURNS = 2.75
const SPIN_SLOT = SPIN_BURST + SPIN_PAUSE
const SPIN_CYCLE = SPIN_SLOT * ORNAMENTS.length

function easeOutCubic(t: number) {
  const p = clamp01(t)
  return 1 - (1 - p) ** 3
}

/** Degrees for ornament `index` at `time` (one-by-one spin → pause loop). */
function ornamentSpinDeg(time: number, index: number) {
  if (time <= 0) return 0
  const rounds = Math.floor(time / SPIN_CYCLE)
  const cycleT = time - rounds * SPIN_CYCLE
  const active = Math.min(ORNAMENTS.length - 1, Math.floor(cycleT / SPIN_SLOT))
  const local = cycleT - active * SPIN_SLOT

  let turns = rounds * SPIN_TURNS
  if (index < active) turns += SPIN_TURNS
  else if (index === active) {
    turns +=
      local < SPIN_BURST
        ? easeOutCubic(local / SPIN_BURST) * SPIN_TURNS
        : SPIN_TURNS
  }
  return turns * 360
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function smoothstep(t: number) {
  const p = clamp01(t)
  return p * p * (3 - 2 * p)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function driftOffset(
  spec: { phase: number; fx: number; fy: number; ax: number; ay: number },
  time: number,
  loose: number,
) {
  if (loose < 0.001) return { x: 0, y: 0 }
  const x =
    Math.sin(time * spec.fx + spec.phase) * spec.ax +
    Math.sin(time * spec.fx * 0.37 + spec.phase * 1.7) * spec.ax * 0.4
  const y =
    Math.cos(time * spec.fy + spec.phase * 1.3) * spec.ay +
    Math.sin(time * spec.fy * 0.53 + spec.phase * 0.6) * spec.ay * 0.35
  return { x: x * loose, y: y * loose }
}

/** Keep a point inside both discs (the white vesica), inset for pupil radius. */
function clampIntoVesica(
  x: number,
  y: number,
  top: { x: number; y: number },
  bottom: { x: number; y: number },
  maxR: number,
) {
  let px = x
  let py = y
  for (let pass = 0; pass < 5; pass++) {
    for (const c of [top, bottom]) {
      const dx = px - c.x
      const dy = py - c.y
      const d = Math.hypot(dx, dy)
      if (d > maxR && d > 1e-4) {
        const s = maxR / d
        px = c.x + dx * s
        py = c.y + dy * s
      }
    }
  }
  return { x: px, y: py }
}

/** Slight look offset from eye centre toward a pointer in viewBox space. */
function pupilLookOffset(
  eyeX: number,
  eyeY: number,
  pointerX: number,
  pointerY: number,
) {
  const dx = pointerX - eyeX
  const dy = pointerY - eyeY
  const dist = Math.hypot(dx, dy)
  if (dist < 1) return { x: 0, y: 0 }
  const mag = Math.min(PUPIL_LOOK_MAX, dist * PUPIL_LOOK_GAIN)
  return { x: (dx / dist) * mag, y: (dy / dist) * mag }
}

export function LabsFrameShapes({
  className = 'ps-labs-frame',
  centre = LABS_SHAPE_COLORS.circle,
  lens = '#ffffff',
  discTop = DISC_TOP,
  discBottom = DISC_BOTTOM,
}: LabsFrameShapesProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const topDiscRef = useRef<SVGCircleElement>(null)
  const bottomDiscRef = useRef<SVGCircleElement>(null)
  const topClipRef = useRef<SVGCircleElement>(null)
  const bottomLensRef = useRef<SVGCircleElement>(null)
  const centreRef = useRef<SVGCircleElement>(null)
  const eyeBackRef = useRef<SVGGElement>(null)
  const ornamentRefs = useRef<(SVGGElement | null)[]>([])
  const frameRefs = useRef<(SVGGElement | null)[]>([])
  const spinRefs = useRef<(SVGGElement | null)[]>([])
  const clipId = useId().replace(/:/g, '')
  const lenis = useLenis()
  const centreFill = resolveLabsShapeFill(centre)

  useLayoutEffect(() => {
    const root = rootRef.current
    const topDisc = topDiscRef.current
    const bottomDisc = bottomDiscRef.current
    const topClip = topClipRef.current
    const bottomLens = bottomLensRef.current
    const pupil = centreRef.current
    const eyeBack = eyeBackRef.current
    if (!root || !topDisc || !bottomDisc || !topClip || !bottomLens || !pupil || !eyeBack)
      return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ornamentEls = ornamentRefs.current
    const frameEls = frameRefs.current
    const spinEls = spinRefs.current

    const setPair = (a: SVGCircleElement, b: SVGCircleElement, x: number, y: number) => {
      a.setAttribute('cx', String(x))
      a.setAttribute('cy', String(y))
      b.setAttribute('cx', String(x))
      b.setAttribute('cy', String(y))
    }

    const placeEyeBack = (x: number, y: number) => {
      eyeBack.setAttribute(
        'transform',
        `translate(${x} ${y}) scale(${EYE_BACK_SCALE_X} ${EYE_BACK_SCALE_Y}) translate(${-FRAME_ANCHOR.cx} ${-FRAME_ANCHOR.cy})`,
      )
    }

    /** Full square + glyph share the same centre; glyph spins on top. */
    const placeOrnament = (i: number, x: number, y: number, spinDeg = 0) => {
      const t = `translate(${x} ${y})`
      const frameEl = frameEls[i]
      const ornEl = ornamentEls[i]
      const spinEl = spinEls[i]
      if (frameEl) frameEl.setAttribute('transform', t)
      if (ornEl) ornEl.setAttribute('transform', t)
      if (spinEl) spinEl.setAttribute('transform', `rotate(${spinDeg})`)
    }

    const placeSettled = () => {
      placeEyeBack(SETTLED.centre.x, SETTLED.centre.y)
      setPair(topDisc, topClip, SETTLED.top.x, SETTLED.top.y)
      setPair(bottomDisc, bottomLens, SETTLED.bottom.x, SETTLED.bottom.y)
      pupil.setAttribute('cx', String(SETTLED.centre.x))
      pupil.setAttribute('cy', String(SETTLED.centre.y))
      ORNAMENTS.forEach((orn, i) => {
        placeOrnament(
          i,
          SETTLED.bottom.x + orn.offsetX,
          SETTLED.bottom.y + orn.offsetY,
        )
      })
      root.style.setProperty('--frame-settle', '1')
    }

    if (reduce) {
      placeSettled()
      return
    }

    const measureSettle = () => measureCardArtSettle(root)

    const pos = {
      top: { x: SETTLED.top.x + HOME.top.x, y: SETTLED.top.y + HOME.top.y },
      bottom: { x: SETTLED.bottom.x + HOME.bottom.x, y: SETTLED.bottom.y + HOME.bottom.y },
      centre: { x: SETTLED.centre.x + HOME.centre.x, y: SETTLED.centre.y + HOME.centre.y },
      eyeBack: {
        x: SETTLED.centre.x + HOME.eyeBack.x,
        y: SETTLED.centre.y + HOME.eyeBack.y,
      },
      ornaments: ORNAMENTS.map((orn) => ({
        x: SETTLED.bottom.x + orn.offsetX + orn.home.x,
        y: SETTLED.bottom.y + orn.offsetY + orn.home.y,
      })),
    }

    let settleCurrent = measureSettle()
    let raf = 0
    let last = performance.now()
    let visible = true
    const t0 = performance.now()
    const pointer = {
      x: SETTLED.centre.x,
      y: SETTLED.centre.y,
      active: false,
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      if (rect.width < 8 || rect.height < 8) return
      pointer.x = ((e.clientX - rect.left) / rect.width) * VIEW_W
      pointer.y = ((e.clientY - rect.top) / rect.height) * VIEW_H
      pointer.active = true
    }

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      if (!visible) {
        last = now
        return
      }

      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const time = (now - t0) / 1000

      const settleTarget = measureSettle()
      const settleK = 1 - Math.exp(-5.5 * dt)
      settleCurrent += (settleTarget - settleCurrent) * settleK
      root.style.setProperty('--frame-settle', settleCurrent.toFixed(4))

      const followK = 1 - Math.exp(-4.2 * dt)
      const pupilFollowK = 1 - Math.exp(-7.2 * dt)
      const ornFollowK = 1 - Math.exp(-ORN_FOLLOW * dt)
      const localSettle = (bias: number) => smoothstep(clamp01(settleCurrent * bias))

      const topLoose = 1 - localSettle(SETTLE_BIAS.top)
      const bottomLoose = 1 - localSettle(SETTLE_BIAS.bottom)
      const centreLoose = 1 - localSettle(SETTLE_BIAS.centre)
      const eyeBackLoose = 1 - localSettle(SETTLE_BIAS.eyeBack)
      const settleC = localSettle(SETTLE_BIAS.centre)

      const topDrift = driftOffset(DRIFT.top, time, topLoose)
      const bottomDrift = driftOffset(DRIFT.bottom, time, bottomLoose)
      const centreDrift = driftOffset(DRIFT.centre, time, centreLoose)
      const eyeBackDrift = driftOffset(DRIFT.eyeBack, time, eyeBackLoose)
      const topIdle = driftOffset(IDLE.top, time, 1)
      const bottomIdle = driftOffset(IDLE.bottom, time, 1)
      const eyeBackIdle = driftOffset(IDLE.eyeBack, time, 1)

      const topTx = SETTLED.top.x + HOME.top.x * topLoose + topDrift.x + topIdle.x
      const topTy = SETTLED.top.y + HOME.top.y * topLoose + topDrift.y + topIdle.y
      const bottomTx =
        SETTLED.bottom.x + HOME.bottom.x * bottomLoose + bottomDrift.x + bottomIdle.x
      const bottomTy =
        SETTLED.bottom.y + HOME.bottom.y * bottomLoose + bottomDrift.y + bottomIdle.y

      pos.top.x += (topTx - pos.top.x) * followK
      pos.top.y += (topTy - pos.top.y) * followK
      pos.bottom.x += (bottomTx - pos.bottom.x) * followK
      pos.bottom.y += (bottomTy - pos.bottom.y) * followK

      setPair(topDisc, topClip, pos.top.x, pos.top.y)
      setPair(bottomDisc, bottomLens, pos.bottom.x, pos.bottom.y)

      // Eye centre = mid of the two discs (white vesica). Pupil looks at cursor.
      const eyeX = lerp(pos.top.x, pos.bottom.x, 0.5)
      const eyeY = lerp(pos.top.y, pos.bottom.y, 0.5)

      // Backdrop square rides behind the eye — shorter than the circle stack.
      const eyeBackTx =
        eyeX + HOME.eyeBack.x * eyeBackLoose + eyeBackDrift.x + eyeBackIdle.x
      const eyeBackTy =
        eyeY + HOME.eyeBack.y * eyeBackLoose + eyeBackDrift.y + eyeBackIdle.y
      pos.eyeBack.x += (eyeBackTx - pos.eyeBack.x) * followK
      pos.eyeBack.y += (eyeBackTy - pos.eyeBack.y) * followK
      placeEyeBack(pos.eyeBack.x, pos.eyeBack.y)
      const look = pointer.active
        ? pupilLookOffset(eyeX, eyeY, pointer.x, pointer.y)
        : { x: 0, y: 0 }
      const lookAmt = 0.35 + 0.65 * settleC
      let centreTx =
        eyeX +
        HOME.centre.x * centreLoose * 0.55 +
        centreDrift.x +
        look.x * lookAmt
      let centreTy =
        eyeY +
        HOME.centre.y * centreLoose * 0.55 +
        centreDrift.y +
        look.y * lookAmt
      if (settleC > 0.15) {
        const clamped = clampIntoVesica(
          centreTx,
          centreTy,
          pos.top,
          pos.bottom,
          PUPIL_TRAVEL,
        )
        centreTx = lerp(centreTx, clamped.x, settleC)
        centreTy = lerp(centreTy, clamped.y, settleC)
      }

      pos.centre.x += (centreTx - pos.centre.x) * pupilFollowK
      pos.centre.y += (centreTy - pos.centre.y) * pupilFollowK
      pupil.setAttribute('cx', String(pos.centre.x))
      pupil.setAttribute('cy', String(pos.centre.y))

      ORNAMENTS.forEach((orn, i) => {
        const loose = 1 - localSettle(orn.settleBias)
        const drift = driftOffset(orn.drift, time, loose)
        const slotX = pos.bottom.x + orn.offsetX
        const slotY = pos.bottom.y + orn.offsetY
        const tx = slotX + orn.home.x * loose + drift.x
        const ty = slotY + orn.home.y * loose + drift.y
        const cur = pos.ornaments[i]
        cur.x += (tx - cur.x) * ornFollowK
        cur.y += (ty - cur.y) * ornFollowK
        placeOrnament(i, cur.x, cur.y, ornamentSpinDeg(time, i))
      })
    }

    raf = requestAnimationFrame(step)
    window.addEventListener('pointermove', onPointerMove, { passive: true })

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
      window.removeEventListener('pointermove', onPointerMove)
      io.disconnect()
    }
  }, [lenis])

  return (
    <div aria-hidden="true" className={className} ref={rootRef}>
      {/*
        Separate SVG roots (like LabsHeroShapes) so mix-blend multiply composites
        against the page — including other floating shapes — not only inside one SVG.
      */}
      {/*
        Eye plate uses normal blend (not multiply) so a soft fill still reads on
        the wash yellow. Other shapes keep multiply.
      */}
      <svg className="ps-labs-frame__svg ps-labs-frame__svg--eye-back" fill="none" viewBox="0 0 1090 680">
        <g
          ref={eyeBackRef}
          transform={`translate(${SETTLED.centre.x + HOME.eyeBack.x} ${SETTLED.centre.y + HOME.eyeBack.y}) scale(${EYE_BACK_SCALE_X} ${EYE_BACK_SCALE_Y}) translate(${-FRAME_ANCHOR.cx} ${-FRAME_ANCHOR.cy})`}
        >
          <path
            d={FRAME_SQUARE_D}
            fill={EYE_BACK_FILL}
            transform={FRAME_SQUARE_TRANSFORM}
          />
        </g>
      </svg>
      <svg className="ps-labs-frame__svg ps-labs-frame__svg--blend" fill="none" viewBox="0 0 1090 680">
        <circle
          cx={SETTLED.top.x}
          cy={SETTLED.top.y}
          fill={discTop}
          r={LARGE_R}
          ref={topDiscRef}
        />
      </svg>
      <svg className="ps-labs-frame__svg ps-labs-frame__svg--blend" fill="none" viewBox="0 0 1090 680">
        <circle
          cx={SETTLED.bottom.x}
          cy={SETTLED.bottom.y}
          fill={discBottom}
          r={LARGE_R}
          ref={bottomDiscRef}
        />
      </svg>
      {/* Opaque white vesica — not multiply, or white×backdrop would vanish. */}
      <svg className="ps-labs-frame__svg" fill="none" viewBox="0 0 1090 680">
        <defs>
          <clipPath id={clipId}>
            <circle cx={SETTLED.top.x} cy={SETTLED.top.y} r={LARGE_R} ref={topClipRef} />
          </clipPath>
        </defs>
        <circle
          clipPath={`url(#${clipId})`}
          cx={SETTLED.bottom.x}
          cy={SETTLED.bottom.y}
          fill={lens}
          r={LARGE_R}
          ref={bottomLensRef}
        />
      </svg>
      <svg className="ps-labs-frame__svg ps-labs-frame__svg--blend" fill="none" viewBox="0 0 1090 680">
        <circle
          cx={SETTLED.centre.x}
          cy={SETTLED.centre.y}
          fill={centreFill}
          r={CENTRE_R}
          ref={centreRef}
        />
      </svg>
      {ORNAMENTS.map((orn, i) => {
        const x = SETTLED.bottom.x + orn.offsetX + orn.home.x
        const y = SETTLED.bottom.y + orn.offsetY + orn.home.y
        const glyphScale = ORNAMENT_SCALE * orn.size
        const origin = `translate(${x} ${y})`
        return (
          <div className="ps-labs-frame__ornament" key={orn.key}>
            {/*
              Near-yellow square under the glyph — both multiply like
              .ps-labs-shape so overlaps with floaters / wash / discs retint.
            */}
            <svg
              className="ps-labs-frame__svg ps-labs-frame__svg--blend"
              fill="none"
              viewBox="0 0 1090 680"
            >
              <g
                ref={(node) => {
                  frameRefs.current[i] = node
                }}
                transform={origin}
              >
                <g
                  transform={`scale(${FRAME_SCALE}) translate(${-FRAME_ANCHOR.cx} ${-FRAME_ANCHOR.cy})`}
                >
                  <path
                    d={FRAME_SQUARE_D}
                    fill={orn.squareFill}
                    transform={FRAME_SQUARE_TRANSFORM}
                  />
                </g>
              </g>
            </svg>
            <svg
              className="ps-labs-frame__svg ps-labs-frame__svg--blend"
              fill="none"
              viewBox="0 0 1090 680"
            >
              <g
                ref={(node) => {
                  ornamentRefs.current[i] = node
                }}
                transform={origin}
              >
                <g
                  ref={(node) => {
                    spinRefs.current[i] = node
                  }}
                  transform="rotate(0)"
                >
                  <g
                    transform={`scale(${glyphScale}) translate(${-orn.anchor.cx} ${-orn.anchor.cy})`}
                  >
                    <path d={orn.d} fill={orn.fill} transform={orn.pathTransform} />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        )
      })}
    </div>
  )
}
