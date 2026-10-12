import { useEffect, useRef } from 'react'
import { animate, splitText, stagger } from 'animejs'
import { SmartLink } from '../ui/SmartLink'
import { Btn } from '../ui/Btn'
import { HeroGrid } from '../hero/HeroGrid'
import { assetUrl } from '../../utils/assetUrl'
import { useLenis } from '../layout/CookieBanner'

/** Full travel at the end of a letter's move, as a fraction of the hero's height. */
const HERO_PARALLAX = 0.24
/** Higher follows the scroll more tightly. Low enough to hide 1px steps. */
const PARALLAX_FOLLOW = 14
/** Random start delay per letter, as a fraction of the hero scroll. */
const CHAR_DELAY = 0.62
/** How much scroll a letter uses to fade and lift once its delay is met. */
const CHAR_SPAN = 0.06

/** Ease-out. The letter holds, then most of the move happens immediately. */
function easeOut(t: number) {
  return 1 - (1 - t) ** 3
}

export function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    const headline = headlineRef.current
    const section = headline?.closest('section')
    if (!headline || !section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const split = splitText(headline, {
      chars: { class: 'hero-char' },
    })

    let height = section.offsetHeight
    let target = 0
    let current = 0
    let raf = 0
    let last = 0
    let introPlayed = false
    let intro: { complete: () => void; revert: () => void } | undefined
    let charNodes: HTMLElement[] = []
    let offsets: number[] = []

    const syncChars = () => {
      const next = [...headline.querySelectorAll<HTMLElement>('.hero-char')]
      if (next.length === charNodes.length && next.every((el, index) => el === charNodes[index])) return
      charNodes = next
      offsets = next.map(() => Math.random() * CHAR_DELAY)
    }

    split.addEffect(({ chars }) => {
      const nodes = chars as HTMLElement[]
      if (introPlayed || window.scrollY > 8) {
        introPlayed = true
        nodes.forEach((el) => {
          el.style.opacity = '1'
        })
        return
      }
      introPlayed = true
      const slow = new Set<number>()
      while (slow.size < Math.min(2, nodes.length)) {
        slow.add(Math.floor(Math.random() * nodes.length))
      }
      const baseDelay = stagger(22, { from: 'random' })
      intro = animate(nodes, {
        opacity: [0, 1],
        duration: (_el, index) => (slow.has(index ?? -1) ? 920 : 520),
        ease: 'out(2)',
        delay: (el, index, targets) => {
          const delay = Number(baseDelay(el, index, targets))
          return delay + (slow.has(index ?? -1) ? 240 : 0)
        },
      })
      return () => intro?.revert()
    })

    const apply = (progress: number) => {
      syncChars()
      if (progress > 0.01 && intro) {
        intro.complete()
        intro = undefined
      }
      const travel = height * HERO_PARALLAX
      charNodes.forEach((el, index) => {
        const offset = offsets[index] ?? 0
        const local = Math.min(1, Math.max(0, (progress - offset) / CHAR_SPAN))
        const eased = easeOut(local)
        el.style.transform = `translate3d(0, ${(-eased * travel).toFixed(2)}px, 0)`
        if (progress > 0.004) el.style.opacity = (1 - eased).toFixed(3)
        else if (introPlayed && el.style.opacity === '') el.style.opacity = '1'
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
      intro?.revert()
      split.revert()
    }
  }, [lenis])

  return (
    <section className="main statement-hero">
      <HeroGrid />

      <div className="statement-hero__content">
        <div className="statement-hero__copy">
          <h1 className="statement-hero__headline" ref={headlineRef}>
            Improving how we think about the future
          </h1>
          <p className="statement-hero__description">
            We study, teach, and apply the science of prediction, so people and organisations can act with
            greater clarity under uncertainty.
          </p>
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
                The Institute for Predictive Sciences develops and applies the science of forecasting to help
                people and organisations make better decisions under uncertainty.
              </p>
            </div>
          </div>
          <div className="home-about__right">
            <div className="home-about__secondary">
              <p>
                We put prediction into practice through competitions, training and research, building the methods,
                tools and evidence needed to measure judgment, learn from outcomes and systematically improve how
                decisions are made.
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
    text: 'We run our own forecasting competitions and design bespoke competitions for universities, companies and other organisations. They provide a practical way to measure predictive ability, compare approaches and learn from real world outcomes.',
  },
  {
    id: 'training',
    title: 'Training',
    text: 'We help individuals and organisations develop their forecasting skills through practical training. Participants learn to reason more carefully about uncertainty, make probabilistic predictions and improve by evaluating their forecasts over time.',
  },
  {
    id: 'lab',
    title: 'Lab',
    text: 'We research how forecasting works and experiment with new ways to apply it. This includes studying forecasting methods, exploring prediction market data and developing tools and applications that make predictive information more useful.',
  },
]

export function ServicesIntroSection() {
  return (
    <section className="text home-services" id="services">
      <div className="container">
        <div className="grid vstart-md">
          <div className="col-6-md">
            <div className="home-services-intro">
              <div className="f--subtitle">Services</div>
              <h2 className="editorial-heading">Our work in practice</h2>
              <p>
                We approach forecasting from three directions, measuring how well people predict, helping them
                improve and exploring new ways to apply forecasting in practice.
              </p>
            </div>
          </div>
          <div className="col-6-md">
            <ol className="home-services-list">
              {services.map((service, index) => (
                <li key={service.id}>
                  <SmartLink href={`/services#${service.id}`}>
                    <span className="work-index">{String(index + 1).padStart(2, '0')}</span>
                    <span>
                      <h3 className="editorial-subheading">{service.title}</h3>
                      <p>{service.text}</p>
                    </span>
                  </SmartLink>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="home-services-cta">
          <Btn href="/services" orange>
            Our services
          </Btn>
        </div>
      </div>
    </section>
  )
}
