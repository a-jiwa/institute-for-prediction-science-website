import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import siteData from '../data/site-data.json'
import { PageHero } from '../components/sections/SharedSections'

type DetailPageProps = {
  type: 'research' | 'career' | 'team'
}

function findItem(type: DetailPageProps['type'], slug: string) {
  if (type === 'career') {
    return siteData.careers.find((job) => job.href.endsWith(`/${slug}`))
  }

  if (type === 'research') {
    const all = [
      siteData.featured,
      ...siteData.featuredWork,
      ...siteData.researchFeatured,
    ].filter(Boolean)

    return all.find((item) => item && item.href.endsWith(`/${slug}`))
  }

  for (const section of siteData.teamSections) {
    const member = section.members.find((m) => m.href.endsWith(`/${slug}`))
    if (member) return { ...member, section: section.title }
  }

  return null
}

export function DetailPage({ type }: DetailPageProps) {
  const { slug = '' } = useParams()
  const item = findItem(type, slug)

  if (!item) {
    return (
      <section className="bg-white py-24">
        <div className="container text-center">
          <h1 className="mb-4">Page not found</h1>
          <Link to="/" className="text-orange underline">
            Return home
          </Link>
        </div>
      </section>
    )
  }

  const title =
    'title' in item ? item.title : 'name' in item ? item.name : 'Details'

  return (
    <>
      <PageHero title={title} />
      <section className="bg-white py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {'image' in item && item.image && (
              <div className="thumb mb-10 overflow-hidden rounded-xl pb-[56%]">
                <img src={item.image} alt="" />
              </div>
            )}

            {'type' in item && item.type && (
              <div className="f--subtitle mb-4 text-[#1F19CC]">{item.type}</div>
            )}

            {'label' in item && item.label && (
              <div className="f--subtitle mb-4 text-[#1F19CC]">{item.label}</div>
            )}

            {'position' in item && item.position && (
              <p className="mb-6 text-lg text-teal">{item.position}</p>
            )}

            {'section' in item && item.section && (
              <p className="mb-6 font-mono text-sm uppercase tracking-wide text-orange">
                {item.section}
              </p>
            )}

            {'excerpt' in item && item.excerpt && (
              <p className="mb-6 text-lg leading-relaxed">{item.excerpt}</p>
            )}

            {'tags' in item && item.tags && (
              <ul className="mb-8 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-green/20 px-3 py-1 font-mono text-xs uppercase tracking-wide"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            {'date' in item && item.date && (
              <p className="mb-6 font-mono text-sm uppercase tracking-wide text-green/70">
                {item.date}
              </p>
            )}

            <p className="leading-relaxed">
              This page mirrors the structure of forecastingresearch.org. Full article and job
              descriptions are available on the original site.
            </p>

            <div className="mt-10">
              <a
                href={`https://forecastingresearch.org${'href' in item ? item.href : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm uppercase tracking-wide text-orange underline"
              >
                View on forecastingresearch.org
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
