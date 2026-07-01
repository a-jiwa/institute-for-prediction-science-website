import siteData from '../data/site-data.json'
import { CareersList, PageHero } from '../components/sections/SharedSections'

export function CareersPage() {
  return (
    <>
      <PageHero
        label="Join Us"
        title="We are actively hiring for the following roles"
        bg="careers"
      />
      <CareersList jobs={siteData.careers} />
    </>
  )
}
