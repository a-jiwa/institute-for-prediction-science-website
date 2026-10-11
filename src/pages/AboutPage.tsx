import { AboutIntroSection } from '../components/sections/AboutIntroSection'
import { CtaSection } from '../components/sections/CtaSection'
import { CONTACT_EMAIL } from '../components/icons/Logo'

export function AboutPage() {
  return (
    <>
      <AboutIntroSection />
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
