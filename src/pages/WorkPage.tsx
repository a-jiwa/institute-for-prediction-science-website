import { CtaSection } from '../components/sections/CtaSection'
import { HeroSection } from '../components/sections/HomeSections'
import { Btn } from '../components/ui/Btn'
import { CONTACT_EMAIL } from '../components/icons/Logo'
import { services } from '../data/services'
import { assetUrl } from '../utils/assetUrl'

export function WorkPage() {
  return (
    <>
      <HeroSection lines={['Services']} compact />

      <div className="home-cover services-page">
        <div className="page-stories">
          {services.map((service) => (
            <article className="page-story" data-scheme={service.id} id={service.id} key={service.id}>
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
                    <Btn className="page-story__more" href={`/services/${service.id}`} orange>
                      Learn more
                    </Btn>
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
      </div>
    </>
  )
}
