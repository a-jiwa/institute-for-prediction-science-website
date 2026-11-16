import { useEffect, useRef } from 'react'
import { Lottie, LottieSubscription, type LottieHandle } from 'lottie-react'
import { assetUrl } from '../../utils/assetUrl'

type HeroConstellationProps = {
  className?: string
}

const HERO_LOTTIE_SRC = assetUrl('/assets/lottie/hero-constellation.json')

/** Intro once, then the looping hold. Last range is what `loop` repeats. */
const INTRO_SEGMENT = [0, 24] as const
const LOOP_SEGMENT = [25, 113] as const
const PLAYBACK_SEGMENTS = [INTRO_SEGMENT, LOOP_SEGMENT] as const

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function playIntroThenLoop(player: LottieHandle) {
  player.setLoop(true)
  player.playSegments(PLAYBACK_SEGMENTS)
}

/**
 * Landing hero Lottie — intro 0–24 once, then loops 25–113.
 * Respects reduced motion.
 */
export function HeroConstellation({ className = '' }: HeroConstellationProps) {
  const lottieRef = useRef<LottieHandle>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      const player = lottieRef.current
      if (!player) return
      if (mq.matches) {
        player.stop()
      } else {
        playIntroThenLoop(player)
      }
    }
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <Lottie
      lottieRef={lottieRef}
      src={HERO_LOTTIE_SRC}
      className={className}
      loop
      autoplay={false}
      subscriptions={{
        [LottieSubscription.ready]: () => {
          const player = lottieRef.current
          if (!player) return
          if (prefersReducedMotion()) {
            player.stop()
            return
          }
          playIntroThenLoop(player)
        },
      }}
    />
  )
}
