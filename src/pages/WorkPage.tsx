import { CONTACT_EMAIL } from '../components/icons/Logo'
import { SmartLink } from '../components/ui/SmartLink'
import { services } from '../data/services'

const CONTACT_HREF = `mailto:${CONTACT_EMAIL}`

export function WorkPage() {
  return (
    <div className="home-cover">
      <div className="ka">
        <section className="ka-intro ka-intro--title">
          <div className="ka-contain">
            <div className="ka-intro__copy">
              <h2>Services</h2>
            </div>
          </div>
        </section>

        <section className="ka-steps ka-steps--white">
          <div className="ka-contain">
            {services.map((service) => (
              <div className="ka-step" id={service.id} key={service.id}>
                <h3>{service.title}</h3>
                <p>{service.lead}</p>
                <SmartLink className="ka-btn" href={`/services/${service.id}`}>
                  Learn more
                </SmartLink>
              </div>
            ))}
          </div>
        </section>

        <section className="ka-close" id="contact-us">
          <div className="ka-shape" aria-hidden="true" />
          <div className="ka-contain">
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
