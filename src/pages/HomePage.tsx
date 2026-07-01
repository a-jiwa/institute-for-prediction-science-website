import siteData from '../data/site-data.json'
import {
  HeroSection,
  FeaturedItem,
  AboutTextSection,
  JoinCtaSection,
} from '../components/sections/HomeSections'
import { FeaturedWorkCarousel } from '../components/sections/SharedSections'
import { FeaturedInSection } from '../components/sections/FeaturedInSection'

export function HomePage() {
  const { featured, featuredWork, logos } = siteData

  return (
    <>
      <HeroSection />
      {featured && (
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
      )}
      <FeaturedInSection logos={logos} />
      <FeaturedWorkCarousel items={featuredWork} />
      <AboutTextSection />
      <JoinCtaSection />
    </>
  )
}
