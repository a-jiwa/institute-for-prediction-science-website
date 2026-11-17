import { useEffect, useRef } from 'react'
import { Lottie, LottieSubscription, type LottieHandle } from 'lottie-react'

type AssetLottieProps = {
  src: string
  className?: string
  /** When false, plays once through when the middle viewport band is met. */
  loop?: boolean
  /** Keep the first frame; never autoplay or respond to viewport. */
  paused?: boolean
}

/** Middle band of the viewport — play only while intersecting this strip. */
const MIDDLE_ROOT_MARGIN = '-28% 0px -28% 0px'
const RAMP_MS = 480

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2
}

function overlapsMiddleBand(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || 1
  const midTop = vh * 0.28
  const midBottom = vh * 0.72
  return rect.bottom > midTop && rect.top < midBottom
}

/**
 * Viewport Lottie: loops in the middle band, or plays once start→end per visit.
 * Hero constellation stays on its own always-on player.
 */
export function AssetLottie({ src, className = '', loop = false, paused = false }: AssetLottieProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const lottieRef = useRef<LottieHandle>(null)
  const speedRef = useRef(0)
  const rafRef = useRef(0)
  const wantPlayRef = useRef(false)
  const readyRef = useRef(false)
  const inMiddleRef = useRef(false)
  const playedInMiddleRef = useRef(false)
  const startPlayRef = useRef<() => void>(() => {})
  const stopPlayRef = useRef<() => void>(() => {})
  const startOnceRef = useRef<() => void>(() => {})
  const resetOnceRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (paused) return
    const rampTo = (target: number, onDone?: () => void) => {
      cancelAnimationFrame(rafRef.current)
      const player = lottieRef.current
      if (!player) return

      const start = speedRef.current
      const delta = target - start
      if (Math.abs(delta) < 0.001) {
        speedRef.current = target
        if (target > 0) player.setSpeed(target)
        onDone?.()
        return
      }

      const t0 = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / RAMP_MS)
        const speed = start + delta * easeInOut(t)
        speedRef.current = speed
        player.setSpeed(Math.max(0.001, speed))
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
          return
        }
        speedRef.current = target
        if (target > 0) player.setSpeed(target)
        else player.setSpeed(0.001)
        onDone?.()
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    startPlayRef.current = () => {
      const player = lottieRef.current
      if (!player || prefersReducedMotion()) return
      wantPlayRef.current = true
      player.setSpeed(Math.max(0.001, speedRef.current || 0.001))
      player.play()
      rampTo(1)
    }

    stopPlayRef.current = () => {
      wantPlayRef.current = false
      rampTo(0, () => {
        if (wantPlayRef.current) return
        lottieRef.current?.pause()
      })
    }

    startOnceRef.current = () => {
      const player = lottieRef.current
      if (!player || prefersReducedMotion() || playedInMiddleRef.current) return
      wantPlayRef.current = true
      player.setLoop(false)
      player.stop()
      speedRef.current = 1
      player.setSpeed(1)
      player.play()
    }

    resetOnceRef.current = () => {
      wantPlayRef.current = false
      playedInMiddleRef.current = false
      cancelAnimationFrame(rafRef.current)
      const player = lottieRef.current
      if (!player) return
      speedRef.current = 0
      player.setSpeed(1)
      player.stop()
      player.pause()
    }

    const onEnterMiddle = () => {
      inMiddleRef.current = true
      if (!readyRef.current) return
      if (loop) startPlayRef.current()
      else startOnceRef.current()
    }

    const onLeaveMiddle = () => {
      inMiddleRef.current = false
      if (!readyRef.current) return
      if (loop) stopPlayRef.current()
      else resetOnceRef.current()
    }

    const el = wrapRef.current
    if (!el) return

    if (prefersReducedMotion()) {
      lottieRef.current?.pause()
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!readyRef.current) return
        if (entry.isIntersecting) onEnterMiddle()
        else onLeaveMiddle()
      },
      { root: null, rootMargin: MIDDLE_ROOT_MARGIN, threshold: 0 },
    )
    io.observe(el)

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => {
      if (!mq.matches) return
      wantPlayRef.current = false
      inMiddleRef.current = false
      playedInMiddleRef.current = false
      cancelAnimationFrame(rafRef.current)
      speedRef.current = 0
      lottieRef.current?.setSpeed(1)
      lottieRef.current?.pause()
    }
    mq.addEventListener('change', onMotion)

    return () => {
      io.disconnect()
      mq.removeEventListener('change', onMotion)
      cancelAnimationFrame(rafRef.current)
    }
  }, [loop, paused])

  return (
    <div ref={wrapRef} className={className}>
      <Lottie
        lottieRef={lottieRef}
        src={src}
        className="ps-asset-lottie__player"
        loop={paused ? false : loop}
        autoplay={false}
        subscriptions={{
          [LottieSubscription.ready]: () => {
            readyRef.current = true
            const player = lottieRef.current
            const el = wrapRef.current
            if (!player) return
            player.setLoop(paused ? false : loop)
            player.setSpeed(0.001)
            speedRef.current = 0
            player.pause()
            if (paused || !el || prefersReducedMotion()) return
            if (overlapsMiddleBand(el)) {
              if (loop) startPlayRef.current()
              else startOnceRef.current()
            }
          },
          [LottieSubscription.complete]: () => {
            if (paused || loop) return
            playedInMiddleRef.current = true
            wantPlayRef.current = false
            speedRef.current = 0
            lottieRef.current?.pause()
          },
        }}
      />
    </div>
  )
}