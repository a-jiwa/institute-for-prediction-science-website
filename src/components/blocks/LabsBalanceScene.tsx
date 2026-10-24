import { useLayoutEffect, useRef } from 'react'
import { measureCardArtSettle } from './labsSettle'

/**
 * Live physics scene from frame-yellow.svg (no yellow plate).
 * Shapes float into place as the plate centre hits mid-viewport, then the
 * ball rolls on a tipping semicircle — catch, pause, tip again.
 */

type LabsBalanceSceneProps = {
  className?: string
}

const VIEW_W = 1090
const VIEW_H = 680
const CX = 545
/** Shifted up so the bottom triangle stays inside the rounded card. */
const CY = 285
const R_SEMI = 255
const R_BALL = 72
const D_MAX = 145
const TRIANGLE_D =
  'M130.878 89.018C152.710 51.204 207.290 51.204 229.122 89.018L283.353 182.950C305.185 220.764 277.895 268.031 234.232 268.031L125.768 268.031C82.105 268.031 54.815 220.764 76.647 182.950Z'
/** Labs hexagon — sized to the old inner disc so roll reads clearly. */
const HEX_D =
  'M132.896 7.43243C149.932 -2.47747 170.922 -2.47748 187.958 7.43242L293.323 68.7223C310.359 78.6322 320.854 96.9465 320.854 116.766L320.854 239.346C320.854 259.166 310.359 277.48 293.323 287.39L187.958 348.68C170.922 358.59 149.932 358.59 132.896 348.68L27.5311 287.39C10.4948 277.48 0 259.166 0 239.346L0 116.766C0 96.9465 10.4948 78.6322 27.5311 68.7223L132.896 7.43243Z'
const HEX_TRANSFORM = 'scale(0.224) translate(-180 -176)'
/** Tip of triangle sits on the bottom of the semicircle. */
const TRI_SCALE = 0.5
const TRI_TX = 455
const TRI_TY = CY + R_SEMI - 0.5 * 51.204
const TRIANGLE_TRANSFORM = `translate(${TRI_TX} ${TRI_TY.toFixed(2)}) scale(${TRI_SCALE})`
/** Geometric centre of the green triangle in viewBox space (settled). */
const TRIANGLE_CENTRE = {
  x: TRI_TX + 180 * TRI_SCALE,
  y: TRI_TY + 159.6 * TRI_SCALE,
} as const

/** Labs rounded square — soft plate behind the scene (same language as eye card). */
const FRAME_SQUARE_D =
  'M0 59.7623C0 26.7519 26.7519 0 59.7623 0H261.092C294.102 0 320.854 26.7519 320.854 59.7623V261.092C320.854 294.102 294.102 320.854 261.092 320.854H59.7623C26.7519 320.854 0 294.102 0 261.092V59.7623Z'
const FRAME_SQUARE_TRANSFORM = 'translate(19.5 19.5)'
const FRAME_ANCHOR = { cx: 180, cy: 180 }
/**
 * Same size as the eye-card plate (LabsFrameShapes EYE_BACK_*).
 * Bottom edge still through the green triangle’s centre.
 */
const EYE_LARGE_R = (VIEW_H * 1.14) / 3
const BACK_H = EYE_LARGE_R * 2.72
const BACK_W = EYE_LARGE_R * 3.45
const BACK_SCALE_X = BACK_W / 321
const BACK_SCALE_Y = BACK_H / 321
const BACK_SETTLED = {
  x: CX,
  y: TRIANGLE_CENTRE.y - BACK_H / 2,
} as const
const BACK_FILL = '#f6e09a'
/** Triangle eases in slower than the semi / ball. */
const TRI_FOLLOW = 2.35

const HOME = {
  semi: { x: -R_SEMI * 1.05, y: -R_SEMI * 0.55 },
  ball: { x: R_SEMI * 0.95, y: -R_SEMI * 0.75 },
  triangle: { x: R_SEMI * 0.25, y: R_SEMI * 0.85 },
  back: { x: -R_SEMI * 0.55, y: R_SEMI * 0.35 },
} as const

const DRIFT = {
  semi: { phase: 0.5, fx: 0.33, fy: 0.41, ax: R_SEMI * 0.22, ay: R_SEMI * 0.18 },
  ball: { phase: 2.2, fx: 0.47, fy: 0.29, ax: R_SEMI * 0.28, ay: R_SEMI * 0.24 },
  triangle: { phase: 3.8, fx: 0.38, fy: 0.52, ax: R_SEMI * 0.2, ay: R_SEMI * 0.26 },
  back: { phase: 1.5, fx: 0.27, fy: 0.34, ax: R_SEMI * 0.18, ay: R_SEMI * 0.16 },
} as const

const IDLE_BACK = {
  phase: 1.2,
  fx: 0.17,
  fy: 0.22,
  ax: R_SEMI * 0.032,
  ay: R_SEMI * 0.036,
} as const

/** Triangle uses slower follow (TRI_FOLLOW), not a low bias — bias <~0.85 leaves a lasting home offset. */
const SETTLE_BIAS = { semi: 1.08, ball: 0.92, triangle: 0.95, back: 1.04 } as const
/** Start balance physics once shapes are mostly home. */
const PHYSICS_SETTLE = 0.88

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function smoothstep(t: number) {
  const p = clamp01(t)
  return p * p * (3 - 2 * p)
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

export function LabsBalanceScene({ className = 'ps-labs-balance' }: LabsBalanceSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<SVGGElement>(null)
  const semiWrapRef = useRef<SVGGElement>(null)
  const ballWrapRef = useRef<SVGGElement>(null)
  const triangleWrapRef = useRef<SVGGElement>(null)
  const semiRef = useRef<SVGPathElement>(null)
  const ballRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const semi = semiRef.current
    const ball = ballRef.current
    const root = rootRef.current
    const back = backRef.current
    const semiWrap = semiWrapRef.current
    const ballWrap = ballWrapRef.current
    const triangleWrap = triangleWrapRef.current
    if (!semi || !ball || !root || !back || !semiWrap || !ballWrap || !triangleWrap) return

    const g = 1800
    const friction = 2.1
    const rimStiffness = 90
    const rimDamping = 8
    const bounce = 0.28
    const maxTheta = (22 * Math.PI) / 180
    const maxOmega = (65 * Math.PI) / 180
    const motorAccel = 3.2
    const Kp = 0.018
    const Kd = 0.007
    const pauseFor = 1.8
    const tipFor = 0.75
    const tipAngle = (17 * Math.PI) / 180
    const balanceHold = 0.7

    let theta = 0
    let omega = 0
    let d = 0
    let v = 0
    let tipSign = 1
    let phase: 'balance' | 'pause' | 'tip' = 'tip'
    let phaseT = 0
    let balancedTime = 0
    let visible = true
    let physicsStarted = false
    let raf = 0
    let last = performance.now()
    const t0 = performance.now()

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))

    const paintPhysics = () => {
      const deg = (theta * 180) / Math.PI
      semi.setAttribute('transform', `rotate(${deg} ${CX} ${CY})`)
      const c = Math.cos(theta)
      const s = Math.sin(theta)
      const px = CX + d * c + R_BALL * s
      const py = CY + d * s + R_BALL * -c
      const rollDeg = (d / R_BALL) * (180 / Math.PI)
      ball.setAttribute(
        'transform',
        `translate(${px} ${py}) rotate(${deg + rollDeg})`,
      )
    }

    const paintRest = () => {
      theta = 0
      omega = 0
      d = 0
      v = 0
      semi.setAttribute('transform', `rotate(0 ${CX} ${CY})`)
      ball.setAttribute('transform', `translate(${CX} ${CY - R_BALL}) rotate(0)`)
    }

    const placeBack = (x: number, y: number) => {
      back.setAttribute(
        'transform',
        `translate(${x} ${y}) scale(${BACK_SCALE_X} ${BACK_SCALE_Y}) translate(${-FRAME_ANCHOR.cx} ${-FRAME_ANCHOR.cy})`,
      )
    }

    const placeWraps = (
      semiPos: { x: number; y: number },
      ballPos: { x: number; y: number },
      triPos: { x: number; y: number },
    ) => {
      semiWrap.setAttribute('transform', `translate(${semiPos.x} ${semiPos.y})`)
      ballWrap.setAttribute('transform', `translate(${ballPos.x} ${ballPos.y})`)
      triangleWrap.setAttribute('transform', `translate(${triPos.x} ${triPos.y})`)
    }

    const settleScore = () => {
      const dN = clamp(1 - Math.abs(d) / 40, 0, 1)
      const vN = clamp(1 - Math.abs(v) / 80, 0, 1)
      return dN * vN
    }

    const targetTheta = () => {
      if (phase === 'pause') return 0
      if (phase === 'tip') return tipSign * tipAngle
      const catchCmd = clamp(-Kp * d - Kd * v, -maxTheta, maxTheta)
      const flatBlend = settleScore()
      return catchCmd * (1 - flatBlend * 0.92)
    }

    const isPhysicsSettled = () =>
      Math.abs(d) < 5 &&
      Math.abs(v) < 14 &&
      Math.abs(theta) < 0.025 &&
      Math.abs(omega) < 0.08

    const stepPhysics = (dt: number) => {
      phaseT += dt

      if (phase === 'tip' && phaseT >= tipFor) {
        phase = 'balance'
        phaseT = 0
        balancedTime = 0
      } else if (phase === 'balance') {
        if (isPhysicsSettled()) {
          balancedTime += dt
          if (balancedTime >= balanceHold) {
            phase = 'pause'
            phaseT = 0
            tipSign *= -1
            theta = 0
            omega = 0
            d = 0
            v = 0
          }
        } else {
          balancedTime = 0
        }
      } else if (phase === 'pause' && phaseT >= pauseFor) {
        phase = 'tip'
        phaseT = 0
      }

      if (phase === 'pause') {
        theta = 0
        omega = 0
        d = 0
        v = 0
        paintPhysics()
        return
      }

      const desired = targetTheta()
      const wantOmega = clamp((desired - theta) * 5.2, -maxOmega, maxOmega)
      omega += clamp(
        (wantOmega - omega) * 7 * dt,
        -motorAccel * 20 * dt,
        motorAccel * 20 * dt,
      )
      omega = clamp(omega, -maxOmega, maxOmega)
      theta += omega * dt
      theta = clamp(theta, -maxTheta, maxTheta)

      let a = g * Math.sin(theta) - friction * v

      if (Math.abs(theta) < 0.08) {
        a += -9.5 * d - 5.5 * v
      }

      if (d > D_MAX - 18) {
        const over = d - (D_MAX - 18)
        a -= rimStiffness * over + rimDamping * Math.max(0, v)
      }
      if (d < -D_MAX + 18) {
        const overL = -D_MAX + 18 - d
        a += rimStiffness * overL + rimDamping * Math.max(0, -v)
      }

      v += a * dt
      d += v * dt

      if (d > D_MAX) {
        d = D_MAX
        if (v > 0) v = -v * bounce
      } else if (d < -D_MAX) {
        d = -D_MAX
        if (v < 0) v = -v * bounce
      }

      paintPhysics()
    }

    const measureSettle = () => measureCardArtSettle(root)

    if (reduce) {
      placeBack(BACK_SETTLED.x, BACK_SETTLED.y)
      placeWraps({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 })
      paintRest()
      root.style.setProperty('--balance-settle', '1')
      return
    }

    const pos = {
      semi: { x: HOME.semi.x, y: HOME.semi.y },
      ball: { x: HOME.ball.x, y: HOME.ball.y },
      triangle: { x: HOME.triangle.x, y: HOME.triangle.y },
      back: {
        x: BACK_SETTLED.x + HOME.back.x,
        y: BACK_SETTLED.y + HOME.back.y,
      },
    }

    let settleCurrent = measureSettle()
    paintRest()
    placeBack(pos.back.x, pos.back.y)
    placeWraps(pos.semi, pos.ball, pos.triangle)

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
      root.style.setProperty('--balance-settle', settleCurrent.toFixed(4))

      const followK = 1 - Math.exp(-4.2 * dt)
      const triFollowK = 1 - Math.exp(-TRI_FOLLOW * dt)
      const localSettle = (bias: number) => smoothstep(clamp01(settleCurrent * bias))

      const semiLoose = 1 - localSettle(SETTLE_BIAS.semi)
      const ballLoose = 1 - localSettle(SETTLE_BIAS.ball)
      const triLoose = 1 - localSettle(SETTLE_BIAS.triangle)
      const backLoose = 1 - localSettle(SETTLE_BIAS.back)

      const semiDrift = driftOffset(DRIFT.semi, time, semiLoose)
      const ballDrift = driftOffset(DRIFT.ball, time, ballLoose)
      const triDrift = driftOffset(DRIFT.triangle, time, triLoose)
      const backDrift = driftOffset(DRIFT.back, time, backLoose)
      const backIdle = driftOffset(IDLE_BACK, time, 1)

      const semiTx = HOME.semi.x * semiLoose + semiDrift.x
      const semiTy = HOME.semi.y * semiLoose + semiDrift.y
      const ballTx = HOME.ball.x * ballLoose + ballDrift.x
      const ballTy = HOME.ball.y * ballLoose + ballDrift.y
      const triTx = HOME.triangle.x * triLoose + triDrift.x
      const triTy = HOME.triangle.y * triLoose + triDrift.y
      const backTx =
        BACK_SETTLED.x + HOME.back.x * backLoose + backDrift.x + backIdle.x
      const backTy =
        BACK_SETTLED.y + HOME.back.y * backLoose + backDrift.y + backIdle.y

      pos.semi.x += (semiTx - pos.semi.x) * followK
      pos.semi.y += (semiTy - pos.semi.y) * followK
      pos.ball.x += (ballTx - pos.ball.x) * followK
      pos.ball.y += (ballTy - pos.ball.y) * followK
      pos.triangle.x += (triTx - pos.triangle.x) * triFollowK
      pos.triangle.y += (triTy - pos.triangle.y) * triFollowK
      pos.back.x += (backTx - pos.back.x) * followK
      pos.back.y += (backTy - pos.back.y) * followK

      placeBack(pos.back.x, pos.back.y)
      placeWraps(pos.semi, pos.ball, pos.triangle)

      if (settleCurrent >= PHYSICS_SETTLE) {
        if (!physicsStarted) {
          physicsStarted = true
          phase = 'tip'
          phaseT = 0
          tipSign = 1
          paintRest()
        }
        const h = Math.min(0.033, dt) / 2
        stepPhysics(h)
        stepPhysics(h)
      } else {
        physicsStarted = false
        paintRest()
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

  return (
    <div aria-hidden="true" className={className} ref={rootRef}>
      {/*
        Separate SVG roots so multiply composites against the page / floaters,
        same contract as LabsFrameShapes (no yellow plate). Soft back plate
        uses normal blend so it reads on the wash; bottom through triangle centre.
      */}
      <svg
        className="ps-labs-balance__svg ps-labs-balance__svg--back"
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
        className="ps-labs-balance__svg ps-labs-balance__svg--blend"
        fill="none"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      >
        <g ref={semiWrapRef}>
          <path
            d={`M${CX - R_SEMI} ${CY} A${R_SEMI} ${R_SEMI} 0 0 0 ${CX + R_SEMI} ${CY} Z`}
            fill="#5e9bff"
            ref={semiRef}
          />
        </g>
      </svg>
      <svg
        className="ps-labs-balance__svg ps-labs-balance__svg--blend"
        fill="none"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      >
        <g ref={ballWrapRef}>
          <g ref={ballRef}>
            <circle cx="0" cy="0" fill="#ffbdf9" r={R_BALL} />
            <g transform={HEX_TRANSFORM}>
              <path d={HEX_D} fill="#e96b26" transform="translate(19.5 1.5)" />
            </g>
          </g>
        </g>
      </svg>
      <svg
        className="ps-labs-balance__svg ps-labs-balance__svg--blend"
        fill="none"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      >
        <g ref={triangleWrapRef}>
          <path d={TRIANGLE_D} fill="#48f08b" transform={TRIANGLE_TRANSFORM} />
        </g>
      </svg>
    </div>
  )
}
