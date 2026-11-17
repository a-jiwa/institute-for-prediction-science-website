import { useEffect, useRef } from 'react'
import { Lottie, LottieSubscription, type LottieHandle } from 'lottie-react'
import { AssetLottie } from '../components/blocks/AssetLottie'
import { assetUrl } from '../utils/assetUrl'

const LAB_HERO_SRC = assetUrl('/assets/lottie/lab-hero.json')
const SUPPORT_BACKING_SRC = assetUrl('/assets/lottie/support-backing.json')

const RESEARCH_EMAIL = 'research@predictionscience.org'
const CONTACT_HREF = `mailto:${RESEARCH_EMAIL}?subject=${encodeURIComponent('Research enquiry')}`

const FIELDS = [
  {
    title: 'Computational Social Science',
    body: 'The formation of collective expectations and how information shapes what groups believe about the future, including the conditions that make collective judgement more accurate and the social structures that influence it.',
    lottieSrc: assetUrl('/assets/lottie/field-social-science.json'),
  },
  {
    title: 'Decision Science',
    body: 'The psychology of anticipating future events, including how people perceive uncertainty, form expectations and use their beliefs to navigate an unpredictable world.',
    lottieSrc: assetUrl('/assets/lottie/field-decision-science.json'),
  },
  {
    title: 'Statistical Modelling',
    body: 'The mathematical foundations of prediction and the interpretation of uncertainty, including how probabilistic approaches improve our understanding of complex systems and the evaluation of what we believe will happen.',
    lottieSrc: assetUrl('/assets/lottie/field-statistical-modelling.json'),
  },
] as const

/** Intro once, then the looping hold — same ranges as the original life-sciences hero. */
const HERO_PLAYBACK = [
  [0, 48],
  [49, 120],
] as const

/** Support Lottie: intro once, then hold loop (not the full clip). */
const SUPPORT_PLAYBACK = [
  [0, 48],
  [49, 84],
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

function LabHeroLottie({ className }: { className?: string }) {
  return <SegmentedLottie className={className} src={LAB_HERO_SRC} segments={HERO_PLAYBACK} />
}

/** Research page. Homepage hero and close; disciplines, external support, publications. */
export function LabPage() {
  return (
    <div className="ps ps-about-page ps-lab-page">
      <section className="ps-about-hero ps-about-hero--with-lead" id="labs">
        <div className="ps-about-hero__layout">
          <div className="ps-about-hero__copy">
            <h1>
              Pioneering research into
              <br />
              prediction science
            </h1>
            <p className="ps-about-hero__lead">
              Exploring new applications of
              <br className="ps-lab-hero__break ps-lab-hero__break--sm" />
              {' '}
              predictive science
              <br className="ps-lab-hero__break ps-lab-hero__break--lg" />
              {' '}
              across disciplines and areas of human knowledge.
            </p>
          </div>
          <div aria-hidden="true" className="ps-about-hero__media">
            <LabHeroLottie className="ps-about-hero__lottie" />
          </div>
        </div>
      </section>

      <section className="ps-lab-intro" aria-label="Introduction">
        <div className="ps-contain">
          <p className="ps-kicker">Research</p>
          <p>
            We study how people and institutions reason about the future and make decisions in the face of uncertainty.
            Our work brings prediction science into different areas of academic enquiry, connecting formal approaches to
            forecasting with the wider study of human thought, collective behaviour and institutional decision-making.
          </p>
        </div>
      </section>

      <section className="ps-lab-works" aria-label="Fields">
        <div className="ps-contain">
          <ul>
            {FIELDS.map((field) => (
              <li key={field.title}>
                <div className="ps-lab-works__thumb" aria-hidden="true">
                  <AssetLottie className="ps-lab-works__lottie" src={field.lottieSrc} paused />
                </div>
                <div className="ps-lab-works__text">
                  <h3>{field.title}</h3>
                  <p>{field.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="ps-lab-works__follow">
            <p>
              Our research spans established academic disciplines while remaining open to questions that fall between
              them. We are interested in how predictive thinking can deepen existing fields of study, reveal new
              connections and offer different ways of approaching longstanding problems.
            </p>
            <p>
              Our interests also extend into political science, economics, public policy and the psychology of future
              thinking. The boundaries between disciplines are not fixed, and the scope of our work develops as new
              questions and opportunities emerge.
            </p>
          </div>
        </div>
      </section>

      <section className="ps-lab-work" aria-labelledby="lab-support-title">
        <div className="ps-contain">
          <div className="ps-lab-split">
            <div className="ps-lab-work__copy">
              <p className="ps-kicker">Support</p>
              <h2 id="lab-support-title">Independent backing</h2>
              <p>
                We support a select number of external researchers and independent projects each year. Recognising that
                important questions often extend beyond short funding cycles and established disciplinary boundaries, our
                multi-year support gives researchers the independence and resources to pursue difficult problems without
                pressure for premature conclusions. Projects are considered on their individual merits rather than their
                fit within a predefined programme. Researchers working in related areas are welcome to contact the
                Institute directly to discuss their work.
              </p>
            </div>
            <div aria-hidden="true" className="ps-lab-split__frame">
              <SegmentedLottie
                className="ps-lab-split__lottie"
                src={SUPPORT_BACKING_SRC}
                segments={SUPPORT_PLAYBACK}
                whenMiddle
              />
            </div>
          </div>
        </div>
      </section>

      {/* Publications section hidden for now */}

      <section className="ps-close" id="contact-us">
        <div className="ps-close__copy">
          <p className="ps-kicker">Contact us</p>
          <h2>Have a research idea in mind?</h2>
          <p>
            Whether you have an idea for a research project, are curious about how prediction science could be applied in
            a new context, or simply want to explore a potential collaboration, we would be glad to hear from you.
          </p>
          <a className="ps-btn" href={CONTACT_HREF}>
            Get in touch
          </a>
        </div>
      </section>
    </div>
  )
}