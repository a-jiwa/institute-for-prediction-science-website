import siteData from '../data/site-data.json'
import {
  HeroSection,
  FeaturedItem,
  AboutTextSection,
  ServicesIntroSection,
} from '../components/sections/HomeSections'
import { CtaSection } from '../components/sections/CtaSection'
import { CONTACT_EMAIL } from '../components/icons/Logo'

export function HomePage() {
  const { featured } = siteData

  return (
    <>
      <HeroSection />
      {/* Opaque stack that scrolls over the sticky hero (DeepMind-style cover). */}
      <div className="home-cover">
        {featured && (
          <div className="hero-reserve" aria-hidden="true" inert>
            <FeaturedItem
              full
              color={featured.color}
              href={featured.href}
              type={featured.type}
              title={featured.title}
              excerpt={featured.excerpt}
              date={featured.date}
              image={featured.image}
            />
          </div>
        )}
        <AboutTextSection />
        <ServicesIntroSection />
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
