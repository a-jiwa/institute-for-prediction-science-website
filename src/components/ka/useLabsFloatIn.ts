import { animate, eases, type JSAnimation } from 'animejs'
import { useLayoutEffect, type RefObject } from 'react'
import { measureCardArtSettle } from './labsSettle'

type DriftSpec = {
  phase: number
  fx: number
  fy: number
  ax: number
  ay: number
  /** Degrees of tumble while loose. */
  fa: number
  aa: number
}

type FloatPiece = {
  home: { x: number; y: number; angle: number }
  drift: DriftSpec
  /** Staggers motion only — text uses shared settle so every tile can reach full opacity. */
  settleBias: number
}

/**
 * Messier scatter + tumble; corrects as settle rises.
 * Home/drift Y stays ≥ 0 so tiles never float up over the hero text.
 */
const STAT_FLOAT: readonly FloatPiece[] = [
  {
    home: { x: -130, y: 110, angle: -18 },
    drift: { phase: 0.4, fx: 0.48, fy: 0.61, ax: 42, ay: 36, fa: 0.55, aa: 10 },
    settleBias: 1.08,
  },
  {
    home: { x: 48, y: 128, angle: 14 },
    drift: { phase: 2.3, fx: 0.57, fy: 0.39, ax: 38, ay: 40, fa: 0.41, aa: 12 },
    settleBias: 0.94,
  },
  {
    home: { x: 142, y: 96, angle: 22 },
    drift: { phase: 4.1, fx: 0.44, fy: 0.68, ax: 46, ay: 32, fa: 0.62, aa: 14 },
    settleBias: 0.86,
  },
]

/**
 * Labs rounded-square corner ratio (path radius 59.76 / side ~321).
 * Used while floating so tiles match the background shape language.
 */
const FLOAT_RADIUS_RATIO = 59.7623 / 321
/** Final home-page tile radius (matches `.ka-reach__card`). */
const SETTLED_RADIUS_REM = 0.85
/** How quickly each tile’s copy fades in once it’s their turn (lower = slower). */
const TEXT_FOLLOW = 1.45
/** Next tile may start fading once the previous reaches this opacity. */
const TEXT_CASCADE = 0.4
/** Local settle level at which fade + count may begin (during float-in). */
const TEXT_START_SETTLE = 0.28
/** Below this, reveal resets so a later float-in can play again. */
const TEXT_RESET_SETTLE = 0.12
/** anime.js count-up duration (ms) — long ease-out into the final value. */
const COUNT_DURATION = 1750
/** Soft settle catch-up — keeps fast scrolls from slamming tiles home. */
const SETTLE_FOLLOW = 2.8
/** Max settle increase per second (full 0→1 needs at least ~0.85s). */
const SETTLE_RISE_PER_SEC = 1.2
/** Position/rotation follow toward the settle target. */
const MOTION_FOLLOW = 3.1
/** Mobile settle completes lower in the viewport (~25% earlier than mid). */
const MOBILE_SETTLE_ANCHOR = 0.75
const MOBILE_SETTLE_MQ = '(max-width: 767px)'

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function measureStatSettle(root: HTMLElement) {
  const early =
    typeof window !== 'undefined' && window.matchMedia(MOBILE_SETTLE_MQ).matches
  return measureCardArtSettle(root, early ? { anchor: MOBILE_SETTLE_ANCHOR } : undefined)
}

function smoothstep(t: number) {
  const p = clamp01(t)
  return p * p * (3 - 2 * p)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function driftOffset(spec: DriftSpec, time: number, loose: number) {
  if (loose < 0.001) return { x: 0, y: 0, angle: 0 }
  const x =
    Math.sin(time * spec.fx + spec.phase) * spec.ax +
    Math.sin(time * spec.fx * 0.37 + spec.phase * 1.7) * spec.ax * 0.45
  // Keep vertical drift downward-biased so cards stay under the hero copy.
  const y =
    Math.abs(Math.cos(time * spec.fy + spec.phase * 1.3)) * spec.ay +
    Math.abs(Math.sin(time * spec.fy * 0.53 + spec.phase * 0.6)) * spec.ay * 0.35
  const angle =
    Math.sin(time * spec.fa + spec.phase * 0.9) * spec.aa +
    Math.sin(time * spec.fa * 0.6 + spec.phase * 1.4) * spec.aa * 0.35
  return { x: x * loose, y: y * loose, angle: angle * loose }
}

/**
 * Float child cards into place as the grid centre hits mid-viewport —
 * same settle + home + drift model as LabsFrameShapes / Balance / Hex.
 */
export function useLabsFloatIn(
  rootRef: RefObject<HTMLElement | null>,
  cardSelector = '.ka-reach__card',
) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const cards = [...root.querySelectorAll<HTMLElement>(cardSelector)]
    if (!cards.length) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      cards.forEach((el) => {
        el.style.transform = ''
        el.style.opacity = ''
        el.style.borderRadius = ''
        const valueEl = el.querySelector<HTMLElement>('.ka-reach__value')
        const target = valueEl?.dataset.statTarget
        if (valueEl && target) valueEl.textContent = target
        const body = el.querySelector<HTMLElement>('.ka-reach__card-body')
        if (body) body.style.opacity = ''
      })
      return
    }

    const pieces = cards.map((_, i) => STAT_FLOAT[i % STAT_FLOAT.length])
    const pos = pieces.map((piece) => ({
      x: piece.home.x,
      y: piece.home.y,
      angle: piece.home.angle,
    }))
    const bodies = cards.map(
      (el) => el.querySelector<HTMLElement>('.ka-reach__card-body') ?? el,
    )

    const settledRadiusPx = () => {
      const rootPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      return SETTLED_RADIUS_REM * rootPx
    }

    const floatRadiusPx = (el: HTMLElement) => {
      const size = Math.min(
        el.offsetWidth || el.getBoundingClientRect().width,
        el.offsetHeight || el.getBoundingClientRect().height,
      )
      return Math.max(12, size * FLOAT_RADIUS_RATIO)
    }

    const paint = (textT: number[], countT: number[], locked: boolean) => {
      const settledR = settledRadiusPx()
      cards.forEach((el, i) => {
        if (locked) {
          el.style.transform = 'none'
        } else {
          const p = pos[i]
          el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) rotate(${p.angle.toFixed(2)}deg)`
        }
        // Roundness follows the count-up — finishes only when the number lands.
        const radiusT = clamp01(countT[i] ?? 0)
        if (radiusT >= 0.999) {
          el.style.borderRadius = `${SETTLED_RADIUS_REM}rem`
        } else {
          el.style.borderRadius = `${lerp(floatRadiusPx(el), settledR, radiusT).toFixed(2)}px`
        }
        // Opacity can fade in while the count is still running.
        bodies[i].style.opacity = smoothstep(textT[i] ?? 0).toFixed(3)
      })
    }

    /**
     * Bias only delays the start of settling — when band settle hits 1,
     * every tile’s local settle is also 1 (no leftover offset/rotation).
     */
    const localSettleFor = (settle: number, bias: number) => {
      const delay = (1 - Math.min(1, bias)) * 0.22
      return smoothstep(clamp01((settle - delay) / Math.max(0.001, 1 - delay)))
    }

    const atHome = pieces.map(() => false)
    const textT = pieces.map(() => 0)
    const countT = pieces.map(() => 0)
    const countStarted = pieces.map(() => false)
    const countAnims: (JSAnimation | null)[] = pieces.map(() => null)
    const valueEls = cards.map(
      (el) => el.querySelector<HTMLElement>('.ka-reach__value'),
    )

    const resetTileReveal = (index: number) => {
      countAnims[index]?.revert()
      countAnims[index] = null
      countStarted[index] = false
      countT[index] = 0
      textT[index] = 0
      atHome[index] = false
      const valueEl = valueEls[index]
      if (valueEl) valueEl.textContent = '0'
    }

    const playCountUp = (index: number) => {
      if (countStarted[index]) return
      const valueEl = valueEls[index]
      if (!valueEl) return
      const target = Number.parseFloat(valueEl.dataset.statTarget ?? '')
      if (!Number.isFinite(target) || target <= 0) return

      countStarted[index] = true
      countT[index] = 0
      valueEl.textContent = '0'
      const state = { n: 0 }
      countAnims[index] = animate(state, {
        n: target,
        duration: COUNT_DURATION,
        // Strong ease-out — runs quicker early, then settles softly onto the final.
        ease: eases.outExpo,
        onUpdate: () => {
          valueEl.textContent = String(Math.round(state.n))
          countT[index] = clamp01(state.n / target)
        },
        onComplete: () => {
          valueEl.textContent = String(Math.round(target))
          countT[index] = 1
        },
      })
    }

    paint(textT, countT, false)

    let raf = 0
    let last = performance.now()
    const t0 = last
    let visible = true
    let settleCurrent = measureStatSettle(root)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) {
        last = now
        return
      }

      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const time = (now - t0) / 1000

      const settleTarget = measureStatSettle(root)
      const settleK = 1 - Math.exp(-SETTLE_FOLLOW * dt)
      let nextSettle = settleCurrent + (settleTarget - settleCurrent) * settleK
      // Rate-limit rising settle so a fast scroll can’t teleport tiles into place.
      if (nextSettle > settleCurrent) {
        nextSettle = Math.min(nextSettle, settleCurrent + SETTLE_RISE_PER_SEC * dt)
      }
      settleCurrent = nextSettle

      const followK = 1 - Math.exp(-MOTION_FOLLOW * dt)
      const textK = 1 - Math.exp(-TEXT_FOLLOW * dt)

      pieces.forEach((piece, i) => {
        const localSettle = localSettleFor(settleCurrent, piece.settleBias)

        // Floated back out — clear reveal so the next float-in can replay.
        if (localSettle < TEXT_RESET_SETTLE) {
          if (countStarted[i] || textT[i] > 0.001 || atHome[i]) resetTileReveal(i)
        }

        if (atHome[i]) {
          // Fully still in the layout slot — no residual drift or tilt.
          pos[i].x = 0
          pos[i].y = 0
          pos[i].angle = 0
        } else {
          const loose = 1 - localSettle
          const drift = driftOffset(piece.drift, time, loose)
          const tx = piece.home.x * loose + drift.x
          const ty = Math.max(0, piece.home.y * loose + drift.y)
          const ta = piece.home.angle * loose + drift.angle
          pos[i].x += (tx - pos[i].x) * followK
          pos[i].y += (ty - pos[i].y) * followK
          pos[i].y = Math.max(0, pos[i].y)
          pos[i].angle += (ta - pos[i].angle) * followK

          // Lock once nearly home — stays locked until float-out reset.
          const dist = Math.hypot(pos[i].x, pos[i].y)
          if (
            localSettle >= 0.9 &&
            dist < 3 &&
            Math.abs(pos[i].angle) < 2
          ) {
            atHome[i] = true
            pos[i].x = 0
            pos[i].y = 0
            pos[i].angle = 0
          }
        }

        // Fade + count start mid float-in, cascading left → right.
        // Roundness still follows the count curve to completion.
        const prevReady = i === 0 || textT[i - 1] >= TEXT_CASCADE
        const textTarget = localSettle >= TEXT_START_SETTLE && prevReady ? 1 : 0
        if (textTarget > 0) playCountUp(i)
        textT[i] += (textTarget - textT[i]) * textK
      })

      const resting = atHome.every(Boolean)
      paint(textT, countT, resting)
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
      countAnims.forEach((anim) => anim?.revert())
      cards.forEach((el, i) => {
        el.style.transform = ''
        el.style.borderRadius = ''
        bodies[i].style.opacity = ''
      })
    }
  }, [rootRef, cardSelector])
}
