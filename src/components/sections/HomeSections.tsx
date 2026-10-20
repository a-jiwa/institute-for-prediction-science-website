import { useLocation } from 'react-router-dom'
import { SmartLink } from '../ui/SmartLink'
import { Btn } from '../ui/Btn'
import { HeroGrid } from '../hero/HeroGrid'
import { toneForPath } from '../../data/pageTones'
import { assetUrl } from '../../utils/assetUrl'

const homeHeroLines = ['Developing better ways to think about what comes next.'] as const

export function HeroSection({
  lines = homeHeroLines,
  compact = false,
}: {
  lines?: readonly string[]
  compact?: boolean
} = {}) {
  const { pathname } = useLocation()
  const tone = toneForPath(pathname)

  return (
    <section className={compact ? 'main statement-hero statement-hero--compact' : 'main statement-hero'}>
      {tone ? null : <HeroGrid />}

      <div className="statement-hero__content">
        <div className="statement-hero__copy">
          <h1 className="statement-hero__headline">
            {lines.map((line) => (
              <span className="statement-hero__line" key={line}>
                {line}
              </span>
            ))}
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
            <p className="home-about__label">Who we are</p>
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
          <Btn href="/#about" orange>
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
    title: 'Custom competitions',
    text: 'We run custom forecasting competitions that score predictions against real world outcomes.',
    scheme: 'blue',
    layers: [
      { src: '/assets/img/services/layers/protection-back.png', role: 'art-group' },
      { src: '/assets/img/services/layers/protection-mid.png', role: 'art-hand' },
      { src: '/assets/img/services/layers/protection-front.png', role: 'art-spark' },
    ],
  },
  {
    id: 'training',
    title: 'Prediction training',
    text: 'We provide training services that help people make better forecasts by reviewing their predictions.',
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
    title: 'Prediction labs',
    text: 'The prediction lab researches forecasting methods and builds tools that put that evidence to use.',
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
        <p className="home-about__label">What we do</p>
        <p className="home-services__intro">
          Unlocking the power of forecasting
        </p>
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
              <div className="home-service-card__copy">
                <h3 className="editorial-subheading">{service.title}</h3>
                <p>{service.text}</p>
                <Btn decorative orange>
                  Discover more
                </Btn>
              </div>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  )
}
