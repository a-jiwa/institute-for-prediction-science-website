import { useRef } from 'react'
import { StoryScrollFrame, ServiceSteps, LabsHeroShapes, LabsShapeWash } from '../components/blocks'
import { useLabsFloatIn } from '../components/blocks/useLabsFloatIn'
import { CONTACT_EMAIL } from '../components/icons/Logo'
import { assetUrl } from '../utils/assetUrl'

const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('About the institute')}`

const YEAR = [
  { figure: '168', caption: 'Events Predicted', tone: '#72BB82' },
  { figure: '96%', caption: 'Accuracy', tone: '#FDD673' },
  { figure: '100%', caption: 'Satisfaction', tone: '#57BAFD' },
] as const

function StatFigure({ figure }: { figure: string }) {
  const hasPercent = figure.endsWith('%')
  const value = hasPercent ? figure.slice(0, -1) : figure

  return (
    <strong className="ps-reach__figure">
      <span className="ps-reach__value" data-stat-target={value}>
        0
      </span>
      {hasPercent ? <span className="ps-reach__pct">%</span> : null}
    </strong>
  )
}

function StatGrid({ items }: { items: readonly { figure: string; caption: string; tone: string }[] }) {
  const gridRef = useRef<HTMLUListElement>(null)
  useLabsFloatIn(gridRef)

  return (
    <ul className="ps-reach__grid" data-labs-avoid-from="" ref={gridRef}>
      {items.map((item) => (
        <li key={item.caption}>
          <div
            className="ps-reach__card"
            style={{ background: item.tone, ['--ps-reach-tone' as string]: item.tone }}
          >
            <div className="ps-reach__card-body">
              <StatFigure figure={item.figure} />
              <span className="ps-reach__caption">{item.caption}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function AboutPage() {
  return (
    <div className="home-cover">
      <div className="ps ps-about-page">
        <section className="ps-about-hero ps-about-hero--with-lead" id="about">
          <div className="ps-shape-stage">
            <LabsHeroShapes
              className="ps-about-hero__shapes"
              colors={{ square: { fill: '#00a4ff' } }}
              homes={[{ x: 0.92, y: 0.18 }]}
              only={['square']}
              scale={0.62}
              speed={0.55}
            />
            <LabsHeroShapes
              className="ps-about-hero__shapes"
              colors={{ circle: { fill: '#ff7e1d' } }}
              edgeBleed={0.5}
              homes={[{ x: -0.06, y: 0.78 }]}
              leash={40}
              only={['circle']}
              scale={1.45}
              speed={0.35}
            />
          </div>
          <div className="ps-about-hero__copy">
            <p className="ps-kicker">Who we are</p>
            <h1>
              <span className="ps-about-hero__title-line">
                Advancing prediction science <span className="ps-about-hero__title-em">today</span>
              </span>
              <span className="ps-about-hero__title-line">
                so we can navigate what comes <span className="ps-about-hero__title-em">tomorrow</span>
              </span>
            </h1>
            <p className="ps-about-hero__lead">
              We bridge the gap between academic research and real-world application by turning forecasting into a
              practical, measurable skill.
            </p>
          </div>
        </section>

        <section className="ps-reach">
          <div className="ps-reach__contain">
            <StatGrid items={YEAR} />
          </div>
        </section>

        <section className="ps-story">
          <div className="ps-story__contain">
            <div className="ps-story__grid">
              <div className="ps-story__copy">
                <h2>What is Prediction Science?</h2>
                <div className="ps-story__body">
                  <p>
                    Prediction science gives us a structured way to think about the future by breaking problems into
                    smaller parts, evaluating available evidence, and using probabilistic thinking to measure
                    likelihood.
                  </p>
                  <p>Research shows that forecasting is a trainable skill that improves with practice.</p>
                </div>
              </div>
              <div className="ps-story__media ps-story__media--3x2">
                <img
                  alt="Bar chart of global income distribution, with the top 1% and top 10% marked."
                  src={assetUrl('/assets/ui/about-income-percentile.webp')}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="ps-story">
          <div className="ps-story__contain">
            <div className="ps-story__grid ps-story__grid--media-start">
              <div className="ps-story__copy">
                <h2>Building better judgment</h2>
                <div className="ps-story__body">
                  <p>
                    Just like any other skill, you can improve your forecasting ability through deliberate practice.
                    However, most predictions we make go unrecorded, which means we miss out on the chance to learn
                    from them.
                  </p>
                  <p>
                    We make it easy to record your predictions and measure your accuracy over time. This creates a
                    practical way to strengthen your critical thinking, highlight your personal biases, and leads to a
                    better understanding of the future.
                  </p>
                </div>
              </div>
              <div
                className="ps-story__media ps-story__media--scroll"
                data-labs-avoid-to=""
              >
                <StoryScrollFrame />
              </div>
            </div>
          </div>
        </section>

        <LabsShapeWash trackSelector="#services">
          <section className="ps-about-hero" id="services">
            {/* Two floaters only — placed at load, no respawn while scrolling. */}
            <LabsHeroShapes
              className="ps-about-hero__shapes"
              homes={[
                { x: 0.14, y: 0.55 },
                { x: 0.86, y: 0.28 },
              ]}
              only={['hexagon', 'circle']}
              speed={0.5}
            />
            <div className="ps-about-hero__copy">
              <p className="ps-kicker">What we do</p>
              <h1>Unlocking the power of forecasting</h1>
            </div>
          </section>

          <ServiceSteps kicker="" title="" />

          <section className="ps-close" id="contact-us">
            <LabsHeroShapes className="ps-close__shapes" speed={0.5} />
            <div className="ps-close__copy">
              <p className="ps-kicker">Contact us</p>
              <h2>Have a forecasting project in mind?</h2>
              <p>
                Whether you want to run a competition, train a team, or explore a research question, we would be glad to
                hear what you have in mind.
              </p>
              <a className="ps-btn" href={CONTACT_HREF}>
                Get in touch
              </a>
            </div>
          </section>
        </LabsShapeWash>
      </div>
    </div>
  )
}
