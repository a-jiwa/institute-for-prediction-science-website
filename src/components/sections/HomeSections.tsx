import { useEffect, useRef } from 'react'
import { SmartLink } from '../ui/SmartLink'
import { Btn } from '../ui/Btn'
import { assetUrl } from '../../utils/assetUrl'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const resize = () => {
      const next = section.nextElementSibling as HTMLElement | null
      if (!next) return
      const nextHeight = next.getBoundingClientRect().height
      section.style.height = `${window.innerHeight - nextHeight}px`
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <section className="main" ref={sectionRef}>
      <div className="bg">
        <div className="parallax">
          <video autoPlay muted playsInline>
            <source src={assetUrl('/assets/videos/hero4.mp4')} type="video/mp4" />
          </video>
          <video autoPlay muted playsInline>
            <source src={assetUrl('/assets/videos/hero4_mobile.mp4')} type="video/mp4" />
          </video>
        </div>
      </div>

      <div className="bottom">
        <div className="container">
          <div className="max">
            <div className="f--subtitle-500">Our Mission</div>
            <h1>We apply the science of forecasting to help individuals and organisations make better decisions under uncertainty.</h1>
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
    <section className="text">
      <div className="container">
        <div className="grid vstart-md">
          <div className="col-6-md">
            <div className="max">
              <h2>
                We apply the science of forecasting and probabilistic reasoning to transform how individuals
                and organisations make decisions under uncertainty.
              </h2>
            </div>
          </div>
          <div className="col-6-md">
            <div className="content">
              <p>
                Academic research — pioneered by Philip Tetlock and others — has established that structured
                probabilistic thinking dramatically improves the quality of human judgment and prediction. We
                build on this foundation by translating these insights into practical tools, training, and
                strategies that work in the real world — for businesses, institutions, and individuals facing
                high-stakes decisions.
              </p>
              <p>Our work includes:</p>
              <ul>
                <li>
                  Designing and running forecasting competitions and tournaments that teach probabilistic
                  thinking in an engaging and intuitive way
                </li>
                <li>
                  Building products and tools that help individuals and organisations make structured,
                  evidence-based decisions
                </li>
                <li>
                  Consulting executives and leadership teams on how to apply forecasting science to strategic
                  planning and decision-making
                </li>
                <li>
                  Developing training programmes that improve judgment, calibration, and reasoning under
                  uncertainty across organisations
                </li>
                <li>
                  Communicating the science of forecasting to broader audiences to improve public understanding
                  of probabilistic thinking
                </li>
              </ul>
              <div className="cta">
                <Btn href="/about" orange>
                  More About us
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function JoinCtaSection() {
  return (
    <section className="cta" id="join-us">
      <div className="container">
        <div className="grid hcenter-xs">
          <div className="col-8-md text-center">
            <h4>Join us</h4>
            <div className="text f--h2">
              <p>Want to join our team? See our careers page for ways to get involved</p>
            </div>
            <div className="cta">
              <Btn href="/careers" orange>
                Read more
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
