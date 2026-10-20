import { KaSteps, LabsHeroShapes, LabsShapeWash } from '../components/ka'
import { CONTACT_EMAIL } from '../components/icons/Logo'
import { SmartLink } from '../components/ui/SmartLink'
import { assetUrl } from '../utils/assetUrl'

const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('About the institute')}`

const YEAR = [
  { figure: '168', caption: 'Events Predicted', tone: '#72BB82' },
  { figure: '96%', caption: 'Accuracy', tone: '#FDD673' },
  { figure: '100%', caption: 'Satisfaction', tone: '#57BAFD' },
] as const

function StatGrid({ items }: { items: readonly { figure: string; caption: string; tone: string }[] }) {
  return (
    <ul className="ka-reach__grid" data-labs-avoid-from="">
      {items.map((item) => (
        <li key={item.caption}>
          <div className="ka-reach__card" style={{ background: item.tone }}>
            <div className="ka-reach__card-body">
              <strong>{item.figure}</strong>
              <span>{item.caption}</span>
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
            homes={[{ x: 0.88, y: 0.3 }]}
            only={['circle']}
          />
          <div className="ka-about-hero__copy">
            <p className="ka-kicker">Who we are</p>
            <h1>Our mission is to advance the science of forecasting</h1>
            <p className="ka-about-hero__lead">
              We develop and apply forecasting methods to improve decision-making on the most important issues. We
              build on the foundations of forecasting by running large-scale forecasting studies on issues such as AI,
              biosecurity, and geopolitics. We then bring these results to policymakers, researchers, and the public
              to inform decisions on consequential topics.
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
                <h2>Organisations are falling behind in the judgements that matter most.</h2>
                <div className="ka-story__body">
                  <p>
                    In boardrooms and governments around the world, the latest evidence shows many teams are
                    struggling to hit basic benchmarks in judgement under uncertainty.
                  </p>
                  <p>
                    While some organisations are starting to take forecasting seriously, the gap is getting wider for
                    teams that still rely on gut feel alone.
                  </p>
                  <p>
                    Leaders have huge holes in their foundational forecasting skills—the exact skills they need to
                    actually make better decisions in the real world.
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
                <h2>Forecasting works.</h2>
                <div className="ka-story__body">
                  <p>Practising forecasts against real outcomes leads to sharper, better-calibrated judgement.</p>
                  <p>
                    For the typical team, that extra practice can make the difference between falling behind and
                    making clearer calls when it counts.
                  </p>
                  <p>
                    Read more about our{' '}
                    <SmartLink href="/research">research</SmartLink>.
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
            />
            <div className="ka-about-hero__copy">
              <p className="ka-kicker">What we do</p>
              <h1>Unlocking the power of forecasting</h1>
            </div>
          </section>

          <KaSteps kicker="" title="" />

          <section className="ka-close" id="contact-us">
            <LabsHeroShapes className="ka-close__shapes" />
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
