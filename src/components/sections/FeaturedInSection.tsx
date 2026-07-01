import { useRef } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import type { Splide as SplideType } from '@splidejs/splide'

type Logo = { src: string; href: string }

function LogoSlide({ logo }: { logo: Logo }) {
  return (
    <div className="logo">
      <img src={logo.src} alt="" />
      <a href={logo.href} target="_blank" rel="noopener noreferrer" title="Featured In" />
    </div>
  )
}

function LogoMarquee({ logos }: { logos: Logo[] }) {
  const track = [...logos, ...logos]

  return (
    <div className="roll">
      <div className="roll-track">
        {track.map((logo, index) => (
          <LogoSlide key={`${logo.src}-${index}`} logo={logo} />
        ))}
      </div>
    </div>
  )
}

export function FeaturedInSection({ logos }: { logos: Logo[] }) {
  const splideRef = useRef<SplideType | null>(null)

  return (
    <>
      <div className="visible-md">
        <section className="items">
          <div className="container">
            <div className="grid">
              <div className="col-7-xs col-8-sm">
                <div className="grid vcenter-xs">
                  <div className="f--subtitle-500">Featured in</div>
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
                      perPage: 6,
                      perMove: 1,
                      gap: '30px',
                      autoplay: true,
                      interval: 5000,
                      breakpoints: {
                        1199: { perPage: 3 },
                        1023: { perPage: 2, gap: '20px' },
                      },
                    }}
                    aria-label="Featured in"
                  >
                    {logos.map((logo) => (
                      <SplideSlide key={logo.src}>
                        <LogoSlide logo={logo} />
                      </SplideSlide>
                    ))}
                </Splide>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="hidden-md">
        <section className="logos">
          <div className="container">
            <div className="grid">
              <div className="col-12-sm">
                <div className="f--subtitle-500">Featured in</div>
              </div>
            </div>
            <LogoMarquee logos={logos} />
          </div>
        </section>
      </div>
    </>
  )
}
