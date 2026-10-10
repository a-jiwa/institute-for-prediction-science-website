import siteData from '../data/site-data.json'
import { AboutIntroSection } from '../components/sections/AboutIntroSection'
import { CtaSection } from '../components/sections/CtaSection'
import { TeamSection } from '../components/sections/SharedSections'
import { CONTACT_EMAIL } from '../components/icons/Logo'

export function AboutPage() {
  const team = siteData.teamSections[0]

  return (
    <>
      <AboutIntroSection />
      {team && (
        <TeamSection
          id={team.id || 'team'}
          title={team.title}
          members={team.members}
        />
      )}
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
