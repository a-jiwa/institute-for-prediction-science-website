import { useEffect, useRef } from 'react'
import { Lottie, LottieSubscription, type LottieHandle } from 'lottie-react'
import { assetUrl } from '../utils/assetUrl'

const ABOUT_HERO_SRC = assetUrl('/assets/lottie/about-hero.json')
const PARTNERSHIPS_LOTTIE_SRC = assetUrl('/assets/lottie/about-partnerships.json')

const RESEARCH_EMAIL = 'research@predictionscience.org'
const CONTACT_HREF = `mailto:${RESEARCH_EMAIL}?subject=${encodeURIComponent('Research enquiry')}`

/** Intro once, then loop from the file's "loop start" marker (frame 275). */
const ABOUT_LOTTIE_PLAYBACK = [
  [0, 274],
  [275, 489],
] as const

/** Partnerships Lottie: intro once, then hold loop. */
const PARTNERSHIPS_LOTTIE_PLAYBACK = [
  [0, 47],
  [48, 117],
] as const

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const MIDDLE_ROOT_MARGIN = '-28% 0px -28% 0px'

function playIntroThenLoop(player: LottieHandle, segments: readonly (readonly [number, number])[]) {
  player.setLoop(true)
  player.playSegments(segments)
}

function SegmentedLottie({
  src,
  className,
  segments,
  whenMiddle = false,
}: {
  src: string
  className?: string
  segments: readonly (readonly [number, number])[]
  /** When true, wait until the middle viewport band before starting the intro. */
  whenMiddle?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const lottieRef = useRef<LottieHandle>(null)
  const readyRef = useRef(false)
  const startedRef = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (!whenMiddle) {
      const sync = () => {
        const player = lottieRef.current
        if (!player) return
        if (mq.matches) {
          player.stop()
        } else if (readyRef.current) {
          playIntroThenLoop(player, segments)
        }
      }
      mq.addEventListener('change', sync)
      return () => mq.removeEventListener('change', sync)
    }

    const el = wrapRef.current
    if (!el) return

    const onEnterMiddle = () => {
      const player = lottieRef.current
      if (!player || !readyRef.current || prefersReducedMotion()) return
      if (!startedRef.current) {
        startedRef.current = true
        playIntroThenLoop(player, segments)
        return
      }
      player.play()
    }

    const onLeaveMiddle = () => {
      lottieRef.current?.pause()
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

    const onMotion = () => {
      if (!mq.matches) return
      startedRef.current = false
      lottieRef.current?.pause()
    }
    mq.addEventListener('change', onMotion)

    return () => {
      io.disconnect()
      mq.removeEventListener('change', onMotion)
    }
  }, [segments, whenMiddle])

  const player = (
    <Lottie
      lottieRef={lottieRef}
      src={src}
      className={whenMiddle ? 'ps-lab-segmented__player' : className}
      loop
      autoplay={false}
      subscriptions={{
        [LottieSubscription.ready]: () => {
          const playerHandle = lottieRef.current
          if (!playerHandle) return
          readyRef.current = true
          if (prefersReducedMotion()) {
            playerHandle.stop()
            return
          }
          if (whenMiddle) {
            playerHandle.pause()
            const wrap = wrapRef.current
            if (!wrap) return
            const rect = wrap.getBoundingClientRect()
            const vh = window.innerHeight || 1
            const inMiddle = rect.bottom > vh * 0.28 && rect.top < vh * 0.72
            if (inMiddle && !startedRef.current) {
              startedRef.current = true
              playIntroThenLoop(playerHandle, segments)
            }
            return
          }
          playIntroThenLoop(playerHandle, segments)
        },
      }}
    />
  )

  if (!whenMiddle) return player

  return (
    <div ref={wrapRef} className={className}>
      {player}
    </div>
  )
}

function AboutHeroLottie({ className }: { className?: string }) {
  return <SegmentedLottie className={className} src={ABOUT_HERO_SRC} segments={ABOUT_LOTTIE_PLAYBACK} />
}

/** About page — Research replica for now; edit independently next. */
export function AboutInstitutePage() {
  return (
    <div className="ps ps-about-page ps-lab-page">
      <section className="ps-about-hero ps-about-hero--with-lead" id="about">
        <div className="ps-about-hero__layout">
          <div className="ps-about-hero__copy">
            <h1>
              Shaping the
              <br className="ps-lab-hero__break ps-lab-hero__break--xs" />
              {' '}
              future of
              <br />
              forecasting
            </h1>
            <p className="ps-about-hero__lead">
              Bringing forecasting research into real&#8209;world practice.
            </p>
          </div>
          <div aria-hidden="true" className="ps-about-hero__media">
            <AboutHeroLottie className="ps-about-hero__lottie" />
          </div>
        </div>
      </section>

      <section className="ps-lab-intro" aria-label="Introduction">
        <div className="ps-contain">
          <p className="ps-kicker">About</p>
          <p>
            The Institute of Prediction Science is dedicated to advancing the science and practice of forecasting. We
            bring together research, education and practical application to develop better ways of understanding
            uncertainty, anticipating future events and making informed decisions.
          </p>
        </div>
      </section>

      <section className="ps-lab-works ps-lab-works--mission" aria-labelledby="about-mission-title">
        <div className="ps-contain">
          <div className="ps-lab-works__follow">
            <p className="ps-kicker" id="about-mission-title">
              Our mission
            </p>
            <p>
              We are an institute with a mission to advance prediction science and improve how individuals and
              organisations navigate an uncertain future. We believe that a world better equipped to anticipate what
              comes next is a world better prepared to make informed decisions, recognise emerging opportunities and
              respond to complex challenges.
            </p>
            <p>
              We recognise that the ability to make accurate predictions is essential to effective decision-making, yet
              remains an underdeveloped skill in many areas of society. Too often, judgements about the future go
              unrecorded, assumptions go unchallenged and opportunities to learn from experience are lost. We aim to
              make forecasting a practical, measurable and continuously improving discipline.
            </p>
            <p>
              Through research, education and practice, we work to bridge the gap between academic advances in
              prediction science and their real-world application. We develop forecasting competitions, deliver
              practical training programmes and build tools that help people evaluate evidence, reason about uncertainty
              and improve their predictive judgement.
            </p>
            <p>
              Our focus is not simply on predicting what will happen, but on developing the knowledge, methods and
              capabilities that enable individuals and institutions to make better decisions about what comes next.
            </p>
          </div>
        </div>
      </section>

      <section className="ps-lab-work" aria-labelledby="lab-partnerships-title">
        <div className="ps-contain">
          <div className="ps-lab-split">
            <div className="ps-lab-work__copy">
              <p className="ps-kicker">Partnerships</p>
              <h2 id="lab-partnerships-title">Building a stronger foundation for better predictions</h2>
              <p>
                Alongside pursuing our own research agenda, much of the Institute of Prediction Science’s work is shaped
                through collaboration with other organisations. We believe partnerships are essential to advancing the
                field, bringing together complementary expertise, broadening perspectives and translating research into
                practical applications. We work with universities, research institutions, businesses, policymakers and
                civil society to develop new approaches to forecasting, strengthen predictive capabilities and expand the
                real-world impact of prediction science.
              </p>
            </div>
            <div aria-hidden="true" className="ps-lab-split__frame">
              <SegmentedLottie
                className="ps-lab-split__lottie"
                src={PARTNERSHIPS_LOTTIE_SRC}
                segments={PARTNERSHIPS_LOTTIE_PLAYBACK}
                whenMiddle
              />
            </div>
          </div>
        </div>
      </section>

      {/* Publications section hidden for now */}

      <section className="ps-close" id="contact-us">
        <div className="ps-close__copy">
          <p className="ps-kicker">Connect</p>
          <h2>Interested in working with us?</h2>
          <p>
            Whether you are interested in our work, would like to explore a potential partnership, have an idea to share
            or simply want to learn more about the Institute, we would be glad to hear from you.
          </p>
          <a className="ps-btn" href={CONTACT_HREF}>
            Get in touch
          </a>
        </div>
      </section>
    </div>
  )
}