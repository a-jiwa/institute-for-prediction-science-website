import { KaAssessSplit, KaSteps, KA_ASSESS_TEACH, LabsHeroShapes } from '../components/ka'
import { CONTACT_EMAIL } from '../components/icons/Logo'

const CONTACT_HREF = `mailto:${CONTACT_EMAIL}`

export function WorkPage() {
  return (
    <div className="home-cover">
      <div className="ka ka-about-page">
        <section className="ka-about-hero">
          <LabsHeroShapes className="ka-about-hero__shapes" />
          <div className="ka-about-hero__copy">
            <p className="ka-kicker">What we do</p>
            <h1>Unlocking the power of forecasting</h1>
          </div>
        </section>

        <KaSteps kicker="" title="" />

        <KaAssessSplit
          media="calendar"
          title={KA_ASSESS_TEACH.title}
          paragraphs={KA_ASSESS_TEACH.paragraphs}
          image={KA_ASSESS_TEACH.image}
          imageFirst={KA_ASSESS_TEACH.imageFirst}
        />

        <section className="ka-close" id="contact-us">
          <LabsHeroShapes className="ka-close__shapes" />
          <div className="ka-close__copy">
            <p className="ka-kicker">Contact us</p>
            <h2>Have a forecasting project in mind?</h2>
            <p>
              Whether you're interested in running a forecasting competition, developing your team's
              forecasting skills or trying something new, we'd be happy to hear what you have in mind.
            </p>
            <a className="ka-btn" href={CONTACT_HREF}>
              Get in touch
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
