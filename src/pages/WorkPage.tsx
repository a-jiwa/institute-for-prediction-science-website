import { CtaSection } from '../components/sections/CtaSection'
import { CONTACT_EMAIL } from '../components/icons/Logo'
import { assetUrl } from '../utils/assetUrl'

const services = [
  {
    id: 'competitions',
    title: 'Competitions',
    lead: 'We run our own forecasting competitions and design bespoke competitions for universities, companies and other organisations.',
    paragraphs: [
      'A competition puts people on the same questions and scores the answers the same way. Once the outcome is known, it is possible to see who was well calibrated, which approaches held up, and where a confident forecast came apart.',
      'A bespoke competition is built around the decisions an organisation actually faces. The questions, the people taking part, and the way answers are scored are chosen for that setting, whether that is a university, a company, or another organisation.',
      'In both cases the value is the record. Competitions are a practical way to measure predictive ability, compare approaches, and learn from real world outcomes rather than from the forecast alone.',
    ],
    layers: [
      { src: '/assets/img/services/layers/protection-back.png', role: 'art-group' },
      { src: '/assets/img/services/layers/protection-mid.png', role: 'art-hand' },
      { src: '/assets/img/services/layers/protection-front.png', role: 'art-spark' },
    ],
  },
  {
    id: 'training',
    title: 'Training',
    lead: 'We help individuals and organisations develop their forecasting skills through practical training.',
    paragraphs: [
      'People make probabilistic predictions, write down the reasoning behind them, and later compare that record with what happened. The training is built around that loop.',
      'Looking back shows where judgment is sharp and where it slips: too much confidence, an alternative that was never considered, or a forecast that was never checked. The point is to get better by evaluating forecasts over time.',
      'Individuals can take part on their own. Teams can train together, so making a forecast and then reviewing it becomes part of how the group reasons about uncertainty.',
    ],
    layers: [
      { src: '/assets/img/services/layers/national-lie.png', role: 'art-ground' },
      { src: '/assets/img/services/layers/national-stand.png', role: 'art-point' },
      { src: '/assets/img/services/layers/national-mid.png', role: 'art-globe' },
      { src: '/assets/img/services/layers/national-front.png', role: 'art-spark' },
    ],
  },
  {
    id: 'lab',
    title: 'Lab',
    lead: 'We research how forecasting works and experiment with new ways to apply it.',
    paragraphs: [
      'The lab studies forecasting methods and prediction market data, and develops tools and applications that make predictive information more useful in a real decision.',
      'It is where measurement and practice meet. What the evidence says about how forecasts behave should change the questions people ask and the systems built around those questions.',
      'Ideas are tried, checked against outcomes, and kept when they make forecasting more useful. The work stays close to the other two parts of the institute: the competitions that produce a record, and the training that teaches people to use it.',
    ],
    layers: [
      { src: '/assets/img/services/layers/missions-back.png', role: 'art-chair' },
      { src: '/assets/img/services/layers/missions-mid.png', role: 'art-lean' },
      { src: '/assets/img/services/layers/missions-front.png', role: 'art-diagram' },
    ],
  },
] as const

export function WorkPage() {
  return (
    <>
      <section className="home-about page-intro">
        <div className="container">
          <div className="home-about__row">
            <div className="home-about__left">
              <p className="home-about__label">Services</p>
              <div className="home-about__main">
                <h1>Our work in practice</h1>
              </div>
            </div>
            <div className="home-about__right">
              <div className="home-about__secondary">
                <p>
                  We approach forecasting from three directions, measuring how well people predict, helping
                  them improve and exploring new ways to apply forecasting in practice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-stories">
        {services.map((service) => (
          <article className="page-story" id={service.id} key={service.id}>
            <div className="container">
              <div className="page-story__layout">
                <figure className="page-story__art">
                  {service.layers.map((layer) => (
                    <img alt="" className={layer.role} key={layer.src} src={assetUrl(layer.src)} />
                  ))}
                </figure>
                <div className="page-story__copy">
                  <h2>{service.title}</h2>
                  <p className="page-story__lead">{service.lead}</p>
                  {service.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <CtaSection
        id="contact-us"
        title="Contact us"
        support={
          <p>
            Whether you're interested in running a forecasting competition, developing your team's
            forecasting skills or trying something new, we'd be happy to hear what you have in mind.
          </p>
        }
        action={{ label: 'Get in touch', href: `mailto:${CONTACT_EMAIL}` }}
      >
        <p>Have a forecasting project in mind?</p>
      </CtaSection>
    </>
  )
}
