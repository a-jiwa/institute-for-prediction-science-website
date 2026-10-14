import { useParams } from 'react-router-dom'
import { CtaSection } from '../components/sections/CtaSection'
import { HeroSection } from '../components/sections/HomeSections'
import { CONTACT_EMAIL } from '../components/icons/Logo'
import { getService } from '../data/services'
import { assetUrl } from '../utils/assetUrl'
import { NotFoundPage } from './NotFoundPage'

export function ServicePage() {
  const { slug } = useParams()
  const service = getService(slug)

  if (!service) return <NotFoundPage />

  return (
    <>
      <HeroSection lines={[service.title]} compact />

      <div className="home-cover services-page">
        <div className="page-stories">
          <article className="page-story service-detail">
            <div className="container">
              <div className="page-story__layout">
                <figure className="page-story__art">
                  {service.layers.map((layer) => (
                    <img alt="" className={layer.role} key={layer.src} src={assetUrl(layer.src)} />
                  ))}
                </figure>
                <div className="page-story__copy">
                  {service.sections.map((section) => (
                    <div className="service-detail__section" id={section.id} key={section.id}>
                      <h2>{section.title}</h2>
                      <p className="page-story__lead">{section.lead}</p>
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>

        <CtaSection
          id="contact-us"
          title={service.contact.title}
          support={<p>{service.contact.support}</p>}
          action={{ label: 'Get in touch', href: `mailto:${CONTACT_EMAIL}` }}
        >
          <p>{service.contact.prompt}</p>
        </CtaSection>
      </div>
    </>
  )
}
