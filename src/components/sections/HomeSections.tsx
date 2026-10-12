import { useEffect, useRef } from 'react'
import { splitText } from 'animejs'
import { SmartLink } from '../ui/SmartLink'
import { Btn } from '../ui/Btn'
import { HeroGrid } from '../hero/HeroGrid'
import { assetUrl } from '../../utils/assetUrl'
import { useLenis } from '../layout/CookieBanner'

/** How far the whole title rises compared with the scroll. */
const TEXT_PARALLAX = 0.36
/** How far a letter would rise if it stayed visible, as a fraction of the hero height. */
const LETTER_LIFT = 0.45
/** Higher follows the scroll more tightly. Low enough to hide 1px steps. */
const PARALLAX_FOLLOW = 16
/** Scroll progress where the first letter starts to rise. */
const WAVE_START = 0.08
/** How much of the scroll the wave takes to reach the last letter. */
const WAVE_SPREAD = 0.18
/** Scroll progress one letter takes to finish rising. Longer is slower. */
const LETTER_RISE_SPAN = 1
/** Scroll progress one letter takes to fade. Much shorter than the rise. */
const LETTER_FADE_SPAN = 0.1
/** A whisper of randomness so neighbours do not move in lockstep. */
const WAVE_JITTER = 0.012

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

/** Opacity is mostly gone early in the letter's fade. */
function fadeOut(t: number) {
  return 1 - (1 - t) ** 4
}

export function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    const headline = headlineRef.current
    const section = headline?.closest('section')
    const copy = section?.querySelector<HTMLElement>('.statement-hero__copy')
    if (!headline || !section || !copy) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const phoneCopy = window.matchMedia('(max-width: 767px)')

    const split = splitText(headline, {
      chars: { class: 'hero-char' },
    })

    let height = section.offsetHeight
    let target = 0
    let current = 0
    let raf = 0
    let last = 0
    let charNodes: HTMLElement[] = []
    let offsets: number[] = []

    const syncChars = () => {
      const next = [...headline.querySelectorAll<HTMLElement>('.hero-char')]
      if (next.length === charNodes.length && next.every((el, index) => el === charNodes[index])) return
      charNodes = next
      const last = Math.max(1, next.length - 1)
      offsets = next.map((_, index) => {
        const along = index / last
        const jitter = (Math.random() - 0.5) * 2 * WAVE_JITTER
        return clamp01(WAVE_START + along * WAVE_SPREAD + jitter)
      })
    }

    const apply = (progress: number) => {
      syncChars()
      const driftProgress = 1 - (1 - progress) ** 1.35
      const drift = (-driftProgress * height * TEXT_PARALLAX).toFixed(2)
      copy.style.transform = phoneCopy.matches
        ? `translate3d(0, ${drift}px, 0)`
        : `translate3d(-50%, ${drift}px, 0)`
      const travel = height * LETTER_LIFT
      charNodes.forEach((el, index) => {
        const offset = offsets[index] ?? 0
        const risen = clamp01((progress - offset) / LETTER_RISE_SPAN)
        const faded = clamp01((progress - offset) / LETTER_FADE_SPAN)
        el.style.transform = `translate3d(0, ${(-risen * travel).toFixed(2)}px, 0)`
        el.style.opacity = (1 - fadeOut(faded)).toFixed(3)
      })
    }

    const readTarget = () => {
      if (height <= 0) return 0
      const covered = Math.min(height, Math.max(0, window.scrollY))
      return covered / height
    }

    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now
      current += (target - current) * (1 - Math.exp(-dt * PARALLAX_FOLLOW))
      if (Math.abs(target - current) < 0.0008) {
        current = target
        apply(current)
        raf = 0
        last = 0
        return
      }
      apply(current)
      raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      target = readTarget()
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onResize = () => {
      height = section.offsetHeight
      onScroll()
    }

    current = target = readTarget()
    apply(current)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    lenis?.on('scroll', onScroll)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      lenis?.off('scroll', onScroll)
      copy.style.transform = ''
      split.revert()
    }
  }, [lenis])

  return (
    <section className="main statement-hero">
      <HeroGrid />

      <div className="statement-hero__content">
        <div className="statement-hero__copy">
          <h1 className="statement-hero__headline" ref={headlineRef}>
            Developing better ways to<br />think about what comes next.
          </h1>
        </div>
      </div>
    </section>
  )
}

type FeaturedItemProps = {
  color?: string
  href: string
  type: string
  title: string
  excerpt?: string
  date?: string
  image: string
  full?: boolean
  half?: boolean
}

export function FeaturedItem({
  color = '#1F19CC',
  href,
  type,
  title,
  excerpt,
  date,
  image,
  full = false,
  half = false,
}: FeaturedItemProps) {
  if (full) {
    return (
      <section className="item full" style={{ ['--color' as string]: color }}>
        <SmartLink href={href} className="overlay" aria-label={title} />
        <div className="container">
          <div className="grid vstretch-md">
            <div className="col-6-md">
              <div className="thumb">
                <img src={assetUrl(image)} alt="" loading="lazy" />
              </div>
            </div>
            <div className="col-6-md">
              <div className="block">
                <div className="top">
                  <div className="f--subtitle">{type}</div>
                  <h2 className="title f--h2">{title}</h2>
                  {excerpt && <div className="excerpt">{excerpt}</div>}
                </div>
                {date && <div className="date">{date}</div>}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (half) {
    return (
      <section className="item half" style={{ ['--color' as string]: color }}>
        <SmartLink href={href} aria-label={title} />
        <div className="container">
          <div className="grid">
            <div className="col-6-md order-1-md order-2-xs">
              <div className="block">
                <div className="top">
                  <div className="f--subtitle">{type}</div>
                  <h2 className="title f--h2">{title}</h2>
                  {excerpt && <div className="excerpt">{excerpt}</div>}
                </div>
                {date && <div className="date">{date}</div>}
              </div>
            </div>
            <div className="col-6-md order-1-xs order-2-md">
              <div className="thumb">
                <img src={assetUrl(image)} alt="" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return null
}

type WorkCardProps = {
  href: string
  label: string
  title: string
  date: string
  image: string
}

export function WorkCard({ href, label, title, date, image }: WorkCardProps) {
  return (
    <div className="item">
      <SmartLink href={href} aria-label={title} />
      <div className="top">
        <div className="thumb">
          <img src={assetUrl(image)} alt="" loading="lazy" />
          <div className="label">{label}</div>
        </div>
      </div>
      <div className="title f--h3">{title}</div>
      <div className="bottom">{date || 'Ongoing'}</div>
    </div>
  )
}

export function AboutTextSection() {
  return (
    <section className="home-about">
      <div className="container">
        <div className="home-about__row">
          <div className="home-about__left">
            <p className="home-about__label">What we do</p>
            <div className="home-about__main">
              <p>
                We develop better ways to think about the future through research, training and competitions,
                advancing the science of prediction and helping people and organisations make better decisions
                under uncertainty.
              </p>
            </div>
          </div>
        </div>
        <div className="home-about-cta">
          <Btn href="/about" orange>
            About us
          </Btn>
        </div>
      </div>
    </section>
  )
}

const services = [
  {
    id: 'competitions',
    title: 'Competitions',
    text: 'We run forecasting competitions for universities, companies and other organisations, measuring predictive ability against real world outcomes.',
    scheme: 'blue',
    layers: [
      { src: '/assets/img/services/layers/protection-back.png', role: 'art-group' },
      { src: '/assets/img/services/layers/protection-mid.png', role: 'art-hand' },
      { src: '/assets/img/services/layers/protection-front.png', role: 'art-spark' },
    ],
  },
  {
    id: 'training',
    title: 'Training',
    text: 'We train people to reason about uncertainty, make probabilistic predictions and improve by reviewing their forecasts.',
    scheme: 'green',
    layers: [
      { src: '/assets/img/services/layers/national-lie.png', role: 'art-ground' },
      { src: '/assets/img/services/layers/national-stand.png', role: 'art-point' },
      { src: '/assets/img/services/layers/national-mid.png', role: 'art-globe' },
      { src: '/assets/img/services/layers/national-front.png', role: 'art-spark' },
    ],
  },
  {
    id: 'lab',
    title: 'Lab',
    text: 'We study forecasting methods and prediction market data, and build tools that make predictive information more useful.',
    scheme: 'red',
    layers: [
      { src: '/assets/img/services/layers/missions-back.png', role: 'art-chair' },
      { src: '/assets/img/services/layers/missions-mid.png', role: 'art-lean' },
      { src: '/assets/img/services/layers/missions-front.png', role: 'art-diagram' },
    ],
  },
]

export function ServicesIntroSection() {
  return (
    <section className="text home-services" id="services">
      <div className="container">
        <div className="home-service-cards">
          {services.map((service) => (
            <SmartLink
              className="home-service-card"
              data-scheme={service.scheme}
              href={`/services#${service.id}`}
              key={service.id}
            >
              <span className="home-service-card__art">
                {service.layers.map((layer) => (
                  <img alt="" className={layer.role} key={layer.src} src={assetUrl(layer.src)} />
                ))}
              </span>
              <h3 className="editorial-subheading">{service.title}</h3>
              <p>{service.text}</p>
              <Btn decorative orange>
                Discover more
              </Btn>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  )
}
