import { useRef } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import type { Splide as SplideType } from '@splidejs/splide'
import { WorkCard } from './HomeSections'
import { Btn } from '../ui/Btn'
import { SmartLink } from '../ui/SmartLink'

type WorkItem = {
  href: string
  label: string
  title: string
  date: string
  image: string
}

export function FeaturedWorkCarousel({ items }: { items: WorkItem[] }) {
  const splideRef = useRef<SplideType | null>(null)

  return (
    <section className="items">
      <div className="container">
        <div className="grid">
          <div className="col-7-xs col-8-sm">
            <div className="grid vcenter-xs">
              <div className="f--subtitle-500">Featured work</div>
              <div className="nav">
                <button
                  type="button"
                  className="prev"
                  aria-label="Previous"
                  onClick={() => splideRef.current?.go('<')}
                >
                  <svg width="7" height="9" viewBox="0 0 7 9" fill="none" aria-hidden>
                    <path d="M4.256 8.608L0 4.288L4.256 0H6.08L1.856 4.24V4.336L6.08 8.608H4.256Z" fill="#102B23" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="next"
                  aria-label="Next"
                  onClick={() => splideRef.current?.go('>')}
                >
                  <svg width="7" height="9" viewBox="0 0 7 9" fill="none" aria-hidden>
                    <path d="M0 8.608L4.224 4.336V4.24L0 0H1.808L6.064 4.288L1.808 8.608H0Z" fill="#102B23" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="col-5-xs col-4-sm">
            <div className="text-right">
              <Btn href="/research">See all</Btn>
            </div>
          </div>
          <div className="col-12-sm">
            <Splide
              className="default"
              ref={(splide: { splide: SplideType } | null) => {
                splideRef.current = splide?.splide ?? null
              }}
              options={{
                  type: 'slide',
                  speed: 1000,
                  rewind: true,
                  arrows: false,
                  pagination: false,
                  easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                  perPage: 4,
                  perMove: 1,
                  gap: '30px',
                  breakpoints: {
                    1199: { perPage: 3 },
                    1023: { perPage: 2, gap: '20px' },
                    767: { perPage: 1 },
                  },
                }}
                aria-label="Featured work"
              >
                {items.map((item) => (
                  <SplideSlide key={item.href}>
                    <WorkCard {...item} />
                  </SplideSlide>
                ))}
            </Splide>
          </div>
        </div>
      </div>
    </section>
  )
}

type TeamMember = {
  href: string
  name: string
  position: string
  image: string
}

export function TeamSection({
  id,
  title,
  members,
  variant = 'full',
}: {
  id?: string
  title: string
  members: TeamMember[]
  variant?: 'full' | 'min'
}) {
  if (variant === 'min') {
    return (
      <section className="team" id={id}>
        <div className="container">
          <div className="grid">
            <div className="col-4-md">
              <div className="sticky">
                <h2>{title}</h2>
              </div>
            </div>
            <div className="col-8-md">
              <div className="grid list">
                {members.map((member) => (
                  <div key={member.name} className="col-4-sm col-3-xmd">
                    <div className="item min">
                      <div className="f--h3">{member.name}</div>
                      {member.position && (
                        <div className="position" dangerouslySetInnerHTML={{ __html: member.position }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="team" id={id}>
      <div className="container">
        <div className="grid">
          <div className="col-4-md">
            <div className="sticky">
              <h2>{title}</h2>
            </div>
          </div>
          <div className="col-8-md">
            <div className="grid list">
              {members.map((member) => (
                <div key={member.href || member.name} className="col-6-sm">
                  <div className="item">
                    {member.href && <SmartLink href={member.href} aria-label={member.name} />}
                    {member.image && (
                      <div className="thumb">
                        <img src={member.image} alt={member.name} loading="lazy" />
                      </div>
                    )}
                    <div className="info">
                      <div className="top">
                        <div className="f--h3">{member.name}</div>
                        {member.position && <div className="position">{member.position}</div>}
                      </div>
                      {member.href && (
                        <div className="bottom">
                          <div className="more">Read more</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CareersList({
  jobs,
}: {
  jobs: { href: string; title: string; tags: string[] }[]
}) {
  return (
    <section className="careers">
      <div className="container">
        <div className="grid">
          <div className="col-6-md">
            <h4>open positions</h4>
          </div>
          <div className="col-6-md">
            <div className="list">
              {jobs.map((job) => (
                <div key={job.href} className="item">
                  <SmartLink href={job.href} aria-label={job.title} />
                  <div className="title">{job.title}</div>
                  <ul className="tags">
                    {job.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <div className="apply">Apply</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PageHero({
  label,
  title,
  bg = 'text',
}: {
  label?: string
  title: string
  bg?: 'text' | 'research' | 'careers'
}) {
  return (
    <section className="main min">
      <div className="bg">
        <div className="parallax">
          <div className="svg" data-bg={bg} aria-hidden />
        </div>
      </div>
      <div className="bottom">
        <div className="container">
          <div className="max">
            {label && <h1 className="f--subtitle-500">{label}</h1>}
            <h2 className="f--h2">{title}</h2>
          </div>
        </div>
      </div>
    </section>
  )
}
