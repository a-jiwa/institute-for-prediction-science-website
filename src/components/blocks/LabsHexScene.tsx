import { useLayoutEffect, useRef } from 'react'
import { measureCardArtSettle } from './labsSettle'

/**
 * Composition from frame-hex.svg (no yellow plate).
 * Green hex, three blue corner discs, and a pink triangle each float in
 * as the plate centre hits mid-viewport. Once settled, the triangle’s sharp
 * tip stays locked to the hexagon centre; discs then step one-by-one to the
 * next clockwise corner, then the triangle rotates +60° about the tip.
 * Soft back plate matches the eye card.
 */

type LabsHexSceneProps = {
  className?: string
}

const VIEW_W = 1090
const VIEW_H = 680
const CX = 545
const CY = 340

/** Same plate metrics as LabsFrameShapes / LabsBalanceScene. */
const EYE_LARGE_R = (VIEW_H * 1.14) / 3
const BACK_H = EYE_LARGE_R * 2.72
const BACK_W = EYE_LARGE_R * 3.45
const BACK_SCALE_X = BACK_W / 321
const BACK_SCALE_Y = BACK_H / 321
const BACK_FILL = '#f6e09a'

const FRAME_SQUARE_D =
  'M0 59.7623C0 26.7519 26.7519 0 59.7623 0H261.092C294.102 0 320.854 26.7519 320.854 59.7623V261.092C320.854 294.102 294.102 320.854 261.092 320.854H59.7623C26.7519 320.854 0 294.102 0 261.092V59.7623Z'
const FRAME_SQUARE_TRANSFORM = 'translate(19.5 19.5)'
const FRAME_ANCHOR = { cx: 180, cy: 180 }

/** Glyph local origin used in the source SVG. */
const GLYPH_OX = 180
const GLYPH_OY = 176
const HEX_SCALE = 1.1968
const TRI_SCALE = 1.496

const HEX_D =
  'M70.991 23.810A36.619 36.619 0 0 1 102.704 5.500L257.296 5.500A36.619 36.619 0 0 1 289.009 23.810L366.305 157.691A36.619 36.619 0 0 1 366.305 194.309L289.009 328.190A36.619 36.619 0 0 1 257.296 346.500L102.704 346.500A36.619 36.619 0 0 1 70.991 328.190L-6.305 194.309A36.619 36.619 0 0 1 -6.305 157.691Z'
const TRI_D =
  'M200.460 140.562A23.625 23.625 0 0 1 159.540 140.562L102.022 40.938A23.625 23.625 0 0 1 122.482 5.500L237.518 5.500A23.625 23.625 0 0 1 257.978 40.938Z'

/** Plate centred on the original SVG mid — hex sits in the middle of it. */
const BACK_SETTLED = {
  x: CX,
  y: CY,
} as const

/**
 * Sharp corners of HEX_D (side lines extended past tip arcs), clockwise
 * from top-left: NW → NE → E → SE → SW → W.
 */
const HEX_CORNERS = [
  { x: 81.562, y: 5.5 },
  { x: 278.438, y: 5.5 },
  { x: 376.876, y: 176 },
  { x: 278.438, y: 346.5 },
  { x: 81.562, y: 346.5 },
  { x: -16.876, y: 176 },
] as const

/** Starting corner indices for the three discs (W, SW, SE). */
const CIRCLE_START_CORNER = [5, 4, 3] as const

/** Blue corner discs — glyph centres come from HEX_CORNERS[start]. */
const CIRCLES = [
  { key: 'circle-w' },
  { key: 'circle-sw' },
  { key: 'circle-se' },
] as const

/** Authored rest rotation of the pink triangle about the tip. */
const TRI_BASE_DEG = 30
/** Extra clockwise step after each disc triad. */
const TRI_STEP_DEG = 60

/** Post-settle choreography: disc → disc → disc → triangle, then loop. */
const MOVE_BURST = 0.55
const MOVE_PAUSE = 0.4
const TRI_BURST = 0.5
const TRI_PAUSE = 0.55
const DISC_SLOT = MOVE_BURST + MOVE_PAUSE
const TRI_SLOT = TRI_BURST + TRI_PAUSE
const CHOREO_CYCLE = DISC_SLOT * CIRCLES.length + TRI_SLOT
/** Start marching once settle is mostly in. */
const CHOREO_SETTLE = 0.92

type DriftSpec = {
  phase: number
  fx: number
  fy: number
  ax: number
  ay: number
}

const HOME = {
  hex: { x: -EYE_LARGE_R * 0.9, y: -EYE_LARGE_R * 0.55 },
  triangle: { x: EYE_LARGE_R * 0.85, y: EYE_LARGE_R * 0.7 },
  back: { x: -EYE_LARGE_R * 0.5, y: EYE_LARGE_R * 0.32 },
  circles: [
    { x: -EYE_LARGE_R * 1.15, y: -EYE_LARGE_R * 0.15 },
    { x: -EYE_LARGE_R * 0.55, y: EYE_LARGE_R * 0.95 },
    { x: EYE_LARGE_R * 0.7, y: EYE_LARGE_R * 0.85 },
  ],
} as const

const DRIFT: {
  hex: DriftSpec
  triangle: DriftSpec
  back: DriftSpec
  circles: DriftSpec[]
} = {
  hex: { phase: 0.6, fx: 0.34, fy: 0.42, ax: EYE_LARGE_R * 0.24, ay: EYE_LARGE_R * 0.2 },
  triangle: { phase: 2.8, fx: 0.45, fy: 0.33, ax: EYE_LARGE_R * 0.28, ay: EYE_LARGE_R * 0.26 },
  back: { phase: 1.4, fx: 0.26, fy: 0.35, ax: EYE_LARGE_R * 0.18, ay: EYE_LARGE_R * 0.15 },
  circles: [
    { phase: 1.9, fx: 0.38, fy: 0.29, ax: EYE_LARGE_R * 0.22, ay: EYE_LARGE_R * 0.2 },
    { phase: 3.4, fx: 0.31, fy: 0.41, ax: EYE_LARGE_R * 0.2, ay: EYE_LARGE_R * 0.24 },
    { phase: 4.7, fx: 0.42, fy: 0.36, ax: EYE_LARGE_R * 0.26, ay: EYE_LARGE_R * 0.18 },
  ],
}

const IDLE: {
  hex: DriftSpec
  back: DriftSpec
} = {
  hex: { phase: 0.9, fx: 0.2, fy: 0.27, ax: EYE_LARGE_R * 0.04, ay: EYE_LARGE_R * 0.045 },
  back: { phase: 1.3, fx: 0.17, fy: 0.22, ax: EYE_LARGE_R * 0.032, ay: EYE_LARGE_R * 0.036 },
}

const SETTLE_BIAS = {
  hex: 1.06,
  triangle: 0.88,
  back: 1.02,
  circles: [0.98, 0.9, 0.94],
} as const

/** Triangle eases in a touch slower than the hex. */
const TRI_FOLLOW = 2.5
/** Circles stagger slightly so they don't land as a pack. */
const CIRCLE_FOLLOW = [3.6, 2.8, 3.1] as const

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function smoothstep(t: number) {
  const p = clamp01(t)
  return p * p * (3 - 2 * p)
}

function easeOutCubic(t: number) {
  const p = clamp01(t)
  return 1 - (1 - p) ** 3
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
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

function cornerAt(index: number) {
  const c = HEX_CORNERS[((index % 6) + 6) % 6]
  return { x: c.x, y: c.y }
}

/**
 * Disc glyph centres + triangle extra rotation for choreography time `t`
 * (seconds since settle unlocked the march).
 */
function choreographyAt(t: number) {
  if (t <= 0) {
    return {
      discs: CIRCLE_START_CORNER.map((start) => cornerAt(start)),
      triExtraDeg: 0,
    }
  }

  const rounds = Math.floor(t / CHOREO_CYCLE)
  const cycleT = t - rounds * CHOREO_CYCLE
  const discs = CIRCLE_START_CORNER.map((start, i) => {
    const slotStart = i * DISC_SLOT
    const from = cornerAt(start + rounds)
    const to = cornerAt(start + rounds + 1)
    if (cycleT < slotStart) return from
    if (cycleT >= slotStart + MOVE_BURST) return to
    const p = easeOutCubic((cycleT - slotStart) / MOVE_BURST)
    return { x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p) }
  })

  const triSlotStart = CIRCLES.length * DISC_SLOT
  let triExtraDeg = rounds * TRI_STEP_DEG
  if (cycleT >= triSlotStart) {
    const local = cycleT - triSlotStart
    triExtraDeg +=
      local < TRI_BURST
        ? easeOutCubic(local / TRI_BURST) * TRI_STEP_DEG
        : TRI_STEP_DEG
  }

  return { discs, triExtraDeg }
}

export function LabsHexScene({ className = 'ps-labs-hex' }: LabsHexSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<SVGGElement>(null)
  const hexWrapRef = useRef<SVGGElement>(null)
  const triWrapRef = useRef<SVGGElement>(null)
  const triSpinRef = useRef<SVGGElement>(null)
  const circleWrapRefs = useRef<(SVGGElement | null)[]>([null, null, null])
  const circleElRefs = useRef<(SVGCircleElement | null)[]>([null, null, null])

  useLayoutEffect(() => {
    const root = rootRef.current
    const back = backRef.current
    const hexWrap = hexWrapRef.current
    const triWrap = triWrapRef.current
    const triSpin = triSpinRef.current
    const circleWraps = circleWrapRefs.current
    const circleEls = circleElRefs.current
    if (!root || !back || !hexWrap || !triWrap || !triSpin) return
    if (circleWraps.some((node) => !node) || circleEls.some((node) => !node)) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const placeBack = (x: number, y: number) => {
      back.setAttribute(
        'transform',
        `translate(${x} ${y}) scale(${BACK_SCALE_X} ${BACK_SCALE_Y}) translate(${-FRAME_ANCHOR.cx} ${-FRAME_ANCHOR.cy})`,
      )
    }

    const placeHex = (x: number, y: number) => {
      hexWrap.setAttribute('transform', `translate(${x} ${y})`)
    }

    const placeTri = (x: number, y: number) => {
      triWrap.setAttribute('transform', `translate(${x} ${y})`)
    }

    const placeTriSpin = (extraDeg: number) => {
      triSpin.setAttribute(
        'transform',
        `rotate(${TRI_BASE_DEG + extraDeg} ${GLYPH_OX} ${GLYPH_OY})`,
      )
    }

    const placeCircleWrap = (i: number, x: number, y: number) => {
      circleWraps[i]?.setAttribute('transform', `translate(${x} ${y})`)
    }

    const placeCircleGlyph = (i: number, cx: number, cy: number) => {
      const el = circleEls[i]
      if (!el) return
      el.setAttribute('cx', String(cx))
      el.setAttribute('cy', String(cy))
    }

    const measureSettle = () => measureCardArtSettle(root)

    const startCorners = CIRCLE_START_CORNER.map((i) => cornerAt(i))

    if (reduce) {
      placeBack(BACK_SETTLED.x, BACK_SETTLED.y)
      placeHex(0, 0)
      placeTri(0, 0)
      placeTriSpin(0)
      for (let i = 0; i < CIRCLES.length; i++) {
        placeCircleWrap(i, 0, 0)
        placeCircleGlyph(i, startCorners[i].x, startCorners[i].y)
      }
      root.style.setProperty('--hex-settle', '1')
      return
    }

    const pos = {
      hex: { x: HOME.hex.x, y: HOME.hex.y },
      triangle: { x: HOME.triangle.x, y: HOME.triangle.y },
      back: {
        x: BACK_SETTLED.x + HOME.back.x,
        y: BACK_SETTLED.y + HOME.back.y,
      },
      circles: HOME.circles.map((home) => ({ x: home.x, y: home.y })),
    }

    let settleCurrent = measureSettle()
    let choreoTime = 0
    let raf = 0
    let last = performance.now()
    let visible = true
    const t0 = performance.now()

    placeBack(pos.back.x, pos.back.y)
    placeHex(pos.hex.x, pos.hex.y)
    placeTri(pos.triangle.x, pos.triangle.y)
    placeTriSpin(0)
    for (let i = 0; i < CIRCLES.length; i++) {
      placeCircleWrap(i, pos.circles[i].x, pos.circles[i].y)
      placeCircleGlyph(i, startCorners[i].x, startCorners[i].y)
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
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
      root.style.setProperty('--hex-settle', settleCurrent.toFixed(4))

      if (settleCurrent >= CHOREO_SETTLE) choreoTime += dt
      else choreoTime = 0

      const followK = 1 - Math.exp(-4.2 * dt)
      const triFollowK = 1 - Math.exp(-TRI_FOLLOW * dt)
      const localSettle = (bias: number) => smoothstep(clamp01(settleCurrent * bias))

      const hexSettle = localSettle(SETTLE_BIAS.hex)
      const triSettle = localSettle(SETTLE_BIAS.triangle)
      const hexLoose = 1 - hexSettle
      const triLoose = 1 - triSettle
      const backLoose = 1 - localSettle(SETTLE_BIAS.back)

      const hexDrift = driftOffset(DRIFT.hex, time, hexLoose)
      const triDrift = driftOffset(DRIFT.triangle, time, triLoose)
      const backDrift = driftOffset(DRIFT.back, time, backLoose)
      const hexIdle = driftOffset(IDLE.hex, time, 1)
      const backIdle = driftOffset(IDLE.back, time, 1)

      const hexTx = HOME.hex.x * hexLoose + hexDrift.x + hexIdle.x
      const hexTy = HOME.hex.y * hexLoose + hexDrift.y + hexIdle.y
      const backTx =
        BACK_SETTLED.x + HOME.back.x * backLoose + backDrift.x + backIdle.x
      const backTy =
        BACK_SETTLED.y + HOME.back.y * backLoose + backDrift.y + backIdle.y

      pos.hex.x += (hexTx - pos.hex.x) * followK
      pos.hex.y += (hexTy - pos.hex.y) * followK
      pos.back.x += (backTx - pos.back.x) * followK
      pos.back.y += (backTy - pos.back.y) * followK

      /*
        Sharp tip of TRI_D is at glyph (180, 176) — same as the hex centre.
        Matching wrap translation pins tip → hex centre after float-in.
      */
      const triTx =
        HOME.triangle.x * triLoose + triDrift.x + pos.hex.x * triSettle
      const triTy =
        HOME.triangle.y * triLoose + triDrift.y + pos.hex.y * triSettle
      pos.triangle.x += (triTx - pos.triangle.x) * triFollowK
      pos.triangle.y += (triTy - pos.triangle.y) * triFollowK

      const choreo = choreographyAt(choreoTime)

      placeBack(pos.back.x, pos.back.y)
      placeHex(pos.hex.x, pos.hex.y)
      placeTri(pos.triangle.x, pos.triangle.y)
      placeTriSpin(choreo.triExtraDeg)

      for (let i = 0; i < CIRCLES.length; i++) {
        const circleSettle = localSettle(SETTLE_BIAS.circles[i])
        const circleLoose = 1 - circleSettle
        const circleDrift = driftOffset(DRIFT.circles[i], time, circleLoose)
        const circleFollowK = 1 - Math.exp(-CIRCLE_FOLLOW[i] * dt)
        const tx =
          HOME.circles[i].x * circleLoose +
          circleDrift.x +
          pos.hex.x * circleSettle
        const ty =
          HOME.circles[i].y * circleLoose +
          circleDrift.y +
          pos.hex.y * circleSettle
        pos.circles[i].x += (tx - pos.circles[i].x) * circleFollowK
        pos.circles[i].y += (ty - pos.circles[i].y) * circleFollowK
        placeCircleWrap(i, pos.circles[i].x, pos.circles[i].y)
        placeCircleGlyph(i, choreo.discs[i].x, choreo.discs[i].y)
      }
    }

    raf = requestAnimationFrame(frame)

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
      io.disconnect()
    }
  }, [])

  const hexInner = `translate(${CX} ${CY}) scale(${HEX_SCALE}) translate(${-GLYPH_OX} ${-GLYPH_OY})`
  const triInner = `translate(${CX} ${CY}) scale(${TRI_SCALE}) translate(${-GLYPH_OX} ${-GLYPH_OY})`
  const startCorners = CIRCLE_START_CORNER.map((i) => cornerAt(i))

  return (
    <div aria-hidden="true" className={className} ref={rootRef}>
      <svg
        className="ps-labs-hex__svg ps-labs-hex__svg--back"
        fill="none"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      >
        <g
          ref={backRef}
          transform={`translate(${BACK_SETTLED.x + HOME.back.x} ${BACK_SETTLED.y + HOME.back.y}) scale(${BACK_SCALE_X} ${BACK_SCALE_Y}) translate(${-FRAME_ANCHOR.cx} ${-FRAME_ANCHOR.cy})`}
        >
          <path
            d={FRAME_SQUARE_D}
            fill={BACK_FILL}
            transform={FRAME_SQUARE_TRANSFORM}
          />
        </g>
      </svg>
      <svg
        className="ps-labs-hex__svg ps-labs-hex__svg--blend"
        fill="none"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      >
        <g ref={hexWrapRef} transform={`translate(${HOME.hex.x} ${HOME.hex.y})`}>
          <g transform={hexInner}>
            <path d={HEX_D} fill="#48f08b" />
          </g>
        </g>
      </svg>
      {CIRCLES.map((circle, i) => (
        <svg
          key={circle.key}
          className="ps-labs-hex__svg ps-labs-hex__svg--blend"
          fill="none"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        >
          <g
            ref={(node) => {
              circleWrapRefs.current[i] = node
            }}
            transform={`translate(${HOME.circles[i].x} ${HOME.circles[i].y})`}
          >
            <g transform={hexInner}>
              <circle
                ref={(node) => {
                  circleElRefs.current[i] = node
                }}
                cx={startCorners[i].x}
                cy={startCorners[i].y}
                fill="#5e9bff"
                r={30}
              />
            </g>
          </g>
        </svg>
      ))}
      <svg
        className="ps-labs-hex__svg ps-labs-hex__svg--blend"
        fill="none"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      >
        <g ref={triWrapRef} transform={`translate(${HOME.triangle.x} ${HOME.triangle.y})`}>
          <g transform={triInner}>
            <g
              ref={triSpinRef}
              transform={`rotate(${TRI_BASE_DEG} ${GLYPH_OX} ${GLYPH_OY})`}
            >
              <path d={TRI_D} fill="#ffbdf9" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
