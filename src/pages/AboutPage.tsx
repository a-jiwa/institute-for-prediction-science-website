import siteData from '../data/site-data.json'
import { AboutIntroSection } from '../components/sections/AboutIntroSection'
import { CtaSection } from '../components/sections/CtaSection'
import { TeamSection } from '../components/sections/SharedSections'

export function AboutPage() {
  const { teamSections } = siteData

  return (
    <>
      <AboutIntroSection />
      {teamSections.flatMap((section) => {
        const blocks = [
          <TeamSection
            key={section.id || section.title}
            id={section.id || undefined}
            title={section.title}
            members={section.members}
            variant={(section as { variant?: 'full' | 'min' }).variant}
          />,
        ]

        if (section.title === 'The Foresight Institute Team') {
          blocks.push(
            <CtaSection
              key="join-us"
              id="join-us"
              title="Join us"
              action={{ label: 'Read more', href: '/careers' }}
            >
              <p>Want to join our team? See our careers page for ways to get involved</p>
            </CtaSection>,
          )
        }

        if (section.title === 'Board of Directors') {
          blocks.push(
            <CtaSection
              key="transparency"
              id="transparency"
              title="Transparency"
              action={{ label: 'Read more', href: 'https://forecastingresearch.org/transparency' }}
            >
              <p>Find out more about our funding and governance</p>
            </CtaSection>,
          )
        }

        if (section.title === 'Other Collaborators') {
          blocks.push(
            <CtaSection key="contact-us" id="contact-us" title="Contact us">
              <p>Please get in touch at info@forecastingresearch.org with any questions or suggestions</p>
            </CtaSection>,
          )
        }

        return blocks
      })}
    </>
  )
}
