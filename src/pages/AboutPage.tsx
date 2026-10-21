import { useRef } from 'react'
import { KaSteps, LabsHeroShapes, LabsShapeWash } from '../components/ka'
import { useLabsFloatIn } from '../components/ka/useLabsFloatIn'
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
    <strong className="ka-reach__figure">
      <span className="ka-reach__value" data-stat-target={value}>
        0
      </span>
      {hasPercent ? <span className="ka-reach__pct">%</span> : null}
    </strong>
  )
}

function StatGrid({ items }: { items: readonly { figure: string; caption: string; tone: string }[] }) {
  const gridRef = useRef<HTMLUListElement>(null)
  useLabsFloatIn(gridRef)

  return (
    <ul className="ka-reach__grid" data-labs-avoid-from="" ref={gridRef}>
      {items.map((item) => (
        <li key={item.caption}>
          <div
            className="ka-reach__card"
            style={{ background: item.tone, ['--ka-reach-tone' as string]: item.tone }}
          >
            <div className="ka-reach__card-body">
              <StatFigure figure={item.figure} />
              <span className="ka-reach__caption">{item.caption}</span>
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
      <div className="ka ka-about-page">
        <section className="ka-about-hero ka-about-hero--with-lead" id="about">
          <LabsHeroShapes
            className="ka-about-hero__shapes"
            colors={{ square: { fill: '#00a4ff' } }}
            homes={[{ x: 0.92, y: 0.18 }]}
            only={['square']}
            scale={0.62}
            speed={0.55}
          />
          <LabsHeroShapes
            className="ka-about-hero__shapes"
            colors={{ circle: { fill: '#ff7e1d' } }}
            edgeBleed={0.5}
            homes={[{ x: -0.06, y: 0.78 }]}
            leash={40}
            only={['circle']}
            scale={1.45}
            speed={0.35}
          />
          <div className="ka-about-hero__copy">
            <p className="ka-kicker">Who we are</p>
            <h1>
              <span className="ka-about-hero__title-line">
                Advancing prediction science <span className="ka-about-hero__title-em">today</span>
              </span>
              <span className="ka-about-hero__title-line">
                so we can navigate what comes <span className="ka-about-hero__title-em">tomorrow</span>
              </span>
            </h1>
            <p className="ka-about-hero__lead">
              We make predictions every day, but we rarely check how accurate they were. We bridge the gap between
              academic research and real-world application by turning forecasting into a practical, measurable skill.
            </p>
          </div>
        </section>

        <section className="ka-reach">
          <div className="ka-reach__contain">
            <StatGrid items={YEAR} />
          </div>
        </section>

        <section className="ka-story">
          <div className="ka-story__contain">
            <div className="ka-story__grid">
              <div className="ka-story__copy">
                <h2>What is Prediction Science?</h2>
                <div className="ka-story__body">
                  <p>
                    Prediction science studies how our minds handle the unknown. It gives us a structured playbook for
                    decision-making by breaking complex problems into smaller parts, weighing the available evidence,
                    and using probabilities to measure likelihood.
                  </p>
                  <p>
                    Research in decision science shows that forecasting is a trainable cognitive skill that sharpens
                    with practice, tracking, and feedback.
                  </p>
                </div>
              </div>
              <div className="ka-story__media ka-story__media--3x2">
                <img
                  alt="Bar chart of global income distribution, with the top 1% and top 10% marked."
                  src={assetUrl('/assets/placeholders/khan/about-income-percentile.webp')}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="ka-story">
          <div className="ka-story__contain">
            <div className="ka-story__grid ka-story__grid--media-start">
              <div className="ka-story__copy">
                <h2>Building Better Judgment</h2>
                <div className="ka-story__body">
                  <p>
                    Just like any skill you can improve your forecasting ability through deliberate practice. Most
                    everyday predictions go unrecorded, which means we miss out on the chance to learn from them.
                  </p>
                  <p>
                    We make it easy to record your predictions and measure your accuracy over time. This creates a
                    practical way to strengthen your critical thinking, highlight personal biases, and leads to smarter
                    choices.
                  </p>
                </div>
              </div>
              <div
                className="ka-story__media ka-story__media--16x9"
                data-labs-avoid-to=""
              >
                <img
                  alt="Impact per dollar chart comparing charities with 1x, 10x, and 100x impact."
                  src={assetUrl('/assets/placeholders/khan/about-impact-per-dollar.webp')}
                />
              </div>
            </div>
          </div>
        </section>

        <LabsShapeWash trackSelector="#services">
          <section className="ka-about-hero" id="services">
            {/* Two floaters only — placed at load, no respawn while scrolling. */}
            <LabsHeroShapes
              className="ka-about-hero__shapes"
              homes={[
                { x: 0.14, y: 0.55 },
                { x: 0.86, y: 0.28 },
              ]}
              only={['hexagon', 'circle']}
              speed={0.5}
            />
            <div className="ka-about-hero__copy">
              <p className="ka-kicker">What we do</p>
              <h1>Unlocking the power of forecasting</h1>
            </div>
          </section>

          <KaSteps kicker="" title="" />

          <section className="ka-close" id="contact-us">
            <LabsHeroShapes className="ka-close__shapes" speed={0.5} />
            <div className="ka-close__copy">
              <p className="ka-kicker">Contact us</p>
              <h2>Have a forecasting project in mind?</h2>
              <p>
                Whether you want to run a competition, train a team, or explore a research question, we would be glad to
                hear what you have in mind.
              </p>
              <a className="ka-btn" href={CONTACT_HREF}>
                Get in touch
              </a>
            </div>
          </section>
        </LabsShapeWash>
      </div>
    </div>
  )
}
