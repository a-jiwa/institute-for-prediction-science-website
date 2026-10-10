import { CtaSection } from '../components/sections/CtaSection'
import { Btn } from '../components/ui/Btn'
import { CONTACT_EMAIL } from '../components/icons/Logo'

const services = [
  {
    id: 'competitions',
    title: 'Competitions',
    paragraphs: [
      'We run our own forecasting competitions and design bespoke competitions for universities, companies and other organisations. They provide a practical way to measure predictive ability, compare approaches and learn from real-world outcomes.',
    ],
    action: { label: 'Learn about our competitions', href: '/research/theyearahead' },
  },
  {
    id: 'training',
    title: 'Training',
    paragraphs: [
      'We help individuals and organisations develop their forecasting skills through practical training. Participants learn to reason more carefully about uncertainty, make probabilistic predictions and improve by evaluating their forecasts over time.',
    ],
  },
  {
    id: 'lab',
    title: 'The Lab',
    paragraphs: [
      'We research how forecasting works and experiment with new ways to apply it. This includes studying forecasting methods, exploring prediction-market data and developing tools and applications that make predictive information more useful.',
    ],
  },
] as const

export function WorkPage() {
  return (
    <>
      <section className="work-hero">
        <div className="container">
          <div className="work-hero-inner">
            <h1>Our work in practice</h1>
            <p className="work-hero-lead">
              We approach forecasting from three directions, measuring how well people predict, helping them
              improve and exploring new ways to apply forecasting in practice.
            </p>
          </div>
        </div>
      </section>

      <section className="work-focus">
        <div className="container">
          <div className="work-focus-intro">
            <div className="f--subtitle">Services</div>
          </div>
          <div className="work-cards">
            {services.map((service, index) => (
              <article className="work-card" id={service.id} key={service.id}>
                <div className="work-index">{String(index + 1).padStart(2, '0')}</div>
                <h3>{service.title}</h3>
                <p className="work-card-lead">{service.paragraphs[0]}</p>
                {service.paragraphs.slice(1).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {'action' in service && service.action && (
                  <div className="work-action">
                    <Btn href={service.action.href} orange>
                      {service.action.label}
                    </Btn>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

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
