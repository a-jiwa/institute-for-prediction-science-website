import siteData from '../data/site-data.json'
import { FeaturedItem } from '../components/sections/HomeSections'
import { PageHero } from '../components/sections/SharedSections'
import { ResearchGrid } from '../components/sections/ResearchGrid'

export function ResearchPage() {
  const { researchFeatured } = siteData

  return (
    <>
      <PageHero
        label="Research"
        title="Explore our ongoing projects, working papers, and academic articles"
        bg="research"
      />
      {researchFeatured.map((item) => (
        <FeaturedItem
          key={item.href}
          half
          href={item.href}
          type={item.type}
          title={item.title}
          excerpt={item.excerpt}
          image={item.image}
        />
      ))}
      <ResearchGrid />
    </>
  )
}
