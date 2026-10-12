import { CtaSection } from '../components/sections/CtaSection'
import { CONTACT_EMAIL } from '../components/icons/Logo'
import { assetUrl } from '../utils/assetUrl'

const chapters = [
  {
    id: 'why-we-exist',
    title: 'Why we exist',
    lead: 'Predictions influence decisions every day, but there are still relatively few ways to measure how good those predictions are.',
    paragraphs: [
      'A forecast is often made, acted on, and then forgotten. Without a record it is hard to learn from mistakes, or to tell a careful judgment from one that only sounded sure at the time.',
      'We want to change that. The Institute for Predictive Sciences studies how forecasting works and puts it into practice, so people and organisations can see what holds up and improve on purpose.',
    ],
    layers: [
      { src: '/assets/img/services/layers/missions-back.png', role: 'art-chair' },
      { src: '/assets/img/services/layers/missions-mid.png', role: 'art-lean' },
      { src: '/assets/img/services/layers/missions-front.png', role: 'art-diagram' },
    ],
  },
  {
    id: 'what-we-do',
    title: 'What we do',
    lead: 'We put forecasting into practice through competitions, training and research.',
    paragraphs: [
      'Competitions give people the same questions and a shared way to score the answers. That makes it possible to measure predictive ability against real world outcomes, and to compare approaches once the result is known.',
      'Training helps individuals and teams reason about uncertainty, make probabilistic predictions, and get better by reviewing their forecasts over time.',
      'The lab studies forecasting methods and prediction market data, and develops tools and applications that make predictive information more useful in a real decision.',
    ],
    layers: [
      { src: '/assets/img/services/layers/protection-back.png', role: 'art-group' },
      { src: '/assets/img/services/layers/protection-mid.png', role: 'art-hand' },
      { src: '/assets/img/services/layers/protection-front.png', role: 'art-spark' },
    ],
  },
  {
    id: 'how-we-work',
    title: 'How we work',
    lead: 'We are an independent research and innovation organisation.',
    paragraphs: [
      'The work stays close to decisions. A useful forecast is one that can be checked, compared, and learned from, not only one that sounds plausible when it is made.',
      'We look for what works, keep the methods that hold up, and develop new ways to use forecasting when the existing ones are not enough. The aim is better decisions under uncertainty.',
    ],
    layers: [
      { src: '/assets/img/services/layers/national-lie.png', role: 'art-ground' },
      { src: '/assets/img/services/layers/national-stand.png', role: 'art-point' },
      { src: '/assets/img/services/layers/national-mid.png', role: 'art-globe' },
      { src: '/assets/img/services/layers/national-front.png', role: 'art-spark' },
    ],
  },
] as const

export function AboutPage() {
  return (
    <>
      <section className="home-about page-intro">
        <div className="container">
          <div className="home-about__row">
            <div className="home-about__left">
              <p className="home-about__label">About us</p>
              <div className="home-about__main">
                <h1>An independent institute for forecasting</h1>
              </div>
            </div>
            <div className="home-about__right">
              <div className="home-about__secondary">
                <p>
                  We explore how forecasting can help people and organisations make better decisions under
                  uncertainty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-stories">
        {chapters.map((chapter) => (
          <article className="page-story" id={chapter.id} key={chapter.id}>
            <div className="container">
              <div className="page-story__layout">
                <figure className="page-story__art">
                  {chapter.layers.map((layer) => (
                    <img alt="" className={layer.role} key={layer.src} src={assetUrl(layer.src)} />
                  ))}
                </figure>
                <div className="page-story__copy">
                  <h2>{chapter.title}</h2>
                  <p className="page-story__lead">{chapter.lead}</p>
                  {chapter.paragraphs.map((paragraph) => (
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
