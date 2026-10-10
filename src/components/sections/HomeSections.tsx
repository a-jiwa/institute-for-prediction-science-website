import { useEffect, useRef } from 'react'
import { SmartLink } from '../ui/SmartLink'
import { Btn } from '../ui/Btn'
import { HeroGrid } from '../hero/HeroGrid'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const resize = () => {
      const reserve = document.querySelector('.hero-reserve')
      const next = (reserve ?? section.nextElementSibling) as HTMLElement | null
      if (!next) return
      const nextHeight = next.getBoundingClientRect().height
      if (nextHeight <= 0) return
      const height = window.innerHeight - nextHeight
      section.style.height = height > 0 ? `${height}px` : ''
    }

    resize()
    const reserve = document.querySelector('.hero-reserve')
    const observer = reserve ? new ResizeObserver(resize) : null
    if (reserve) observer?.observe(reserve)
    window.addEventListener('resize', resize)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="main" ref={sectionRef}>
      <HeroGrid />

      <div className="bottom">
        <div className="container">
          <div className="max">
            <div className="f--subtitle-500">Our Mission</div>
            <h1>We’re building a better understanding of forecasting and finding practical ways to apply it to real-world problems.</h1>
          </div>
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
                <img src={image} alt="" loading="lazy" />
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
                <img src={image} alt="" loading="lazy" />
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
          <img src={image} alt="" loading="lazy" />
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
    <section className="text home-about">
      <div className="container">
        <div className="grid vstart-md">
          <div className="col-6-md">
            <div className="max">
              <h2>
                We’re an independent research and innovation organisation exploring how forecasting can help
                people and organisations make better decisions under uncertainty.
              </h2>
            </div>
          </div>
          <div className="col-6-md">
            <div className="content">
              <p>
                We know that predictions influence decisions every day, but there are still relatively few ways
                to measure how good those predictions are, learn from mistakes and systematically improve. We
                want to change that by putting forecasting into practice, studying what works and developing
                new ways to use it.
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
    text: 'We run our own forecasting competitions and design bespoke competitions for universities, companies and other organisations. They provide a practical way to measure predictive ability, compare approaches and learn from real-world outcomes.',
  },
  {
    id: 'training',
    title: 'Training',
    text: 'We help individuals and organisations develop their forecasting skills through practical training. Participants learn to reason more carefully about uncertainty, make probabilistic predictions and improve by evaluating their forecasts over time.',
  },
  {
    id: 'lab',
    title: 'The Lab',
    text: 'We research how forecasting works and experiment with new ways to apply it. This includes studying forecasting methods, exploring prediction-market data and developing tools and applications that make predictive information more useful.',
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
              <h2>Our work in practice</h2>
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
                      <h3>{service.title}</h3>
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
