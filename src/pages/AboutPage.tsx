import { ServiceSteps, HeroConstellation, AssetLottie } from '../components/blocks'
import { CONTACT_EMAIL } from '../components/icons/Logo'
import { assetUrl } from '../utils/assetUrl'

const STORY_MICROSCOPE_SRC = assetUrl('/assets/lottie/story-microscope.json')
const STORY_JUDGMENT_SRC = assetUrl('/assets/lottie/story-judgment.json')

const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('About the institute')}`

export function AboutPage() {
  return (
    <div className="home-cover">
      <div className="ps ps-about-page">
        <section className="ps-about-hero ps-about-hero--with-lead" id="about">
          <div className="ps-about-hero__layout">
            <div className="ps-about-hero__copy">
              <h1>
                <span className="ps-about-hero__title-line">Advancing the</span>
                <span className="ps-about-hero__title-line">science of prediction</span>
              </h1>
              <p className="ps-about-hero__lead">
                We bridge the gap between academic research and real-world application by turning forecasting into a
                practical, measurable skill.
              </p>
            </div>
            <div aria-hidden="true" className="ps-about-hero__media">
              <HeroConstellation className="ps-about-hero__lottie" />
            </div>
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
              <div aria-hidden="true" className="ps-story__media ps-story__media--square">
                <AssetLottie className="ps-story__lottie" src={STORY_MICROSCOPE_SRC} />
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
                    Just like any other skill, you can improve your forecasting ability through deliberate practice. Most
                    of our predictions go unrecorded and unanalysed, which means we miss the chance to learn from them.
                  </p>
                  <p>
                    We create practical ways to strengthen your critical thinking, highlight your personal biases, and
                    build a better understanding of the future.
                  </p>
                </div>
              </div>
              <div aria-hidden="true" className="ps-story__media ps-story__media--square">
                <AssetLottie className="ps-story__lottie" src={STORY_JUDGMENT_SRC} />
              </div>
            </div>
          </div>
        </section>

        <div className="ps-services-band">
          <section className="ps-about-hero" id="services">
            <div className="ps-about-hero__copy">
              <p className="ps-kicker">What we do</p>
              <h1>Unlocking the power of forecasting</h1>
            </div>
          </section>

          <ServiceSteps kicker="" title="" />
        </div>

        <section className="ps-close" id="contact-us">
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
      </div>
    </div>
  )
}
