import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import siteData from '../data/site-data.json'
import { PageHero } from '../components/sections/SharedSections'
import { ArticlePage } from '../components/research/ArticlePage'
import { assetUrl } from '../utils/assetUrl'

type DetailPageProps = {
  type: 'research' | 'career' | 'team'
}

function findItem(type: DetailPageProps['type'], slug: string) {
  if (type === 'career') {
    return siteData.careers.find((job) => job.href.endsWith(`/${slug}`))
  }

  for (const section of siteData.teamSections) {
    const member = section.members.find((m) => m.href.endsWith(`/${slug}`))
    if (member) return { ...member, section: section.title }
  }

  return null
}

export function DetailPage({ type }: DetailPageProps) {
  const { slug = '' } = useParams()

  if (type === 'research') {
    return <ArticlePage slug={slug} />
  }

  const item = findItem(type, slug)

  if (!item) {
    return (
      <section className="bg-white py-24">
        <div className="container text-center">
          <h1 className="editorial-title mb-4">Page not found</h1>
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
            {'image' in item && typeof item.image === 'string' && item.image ? (
              <div className="thumb mb-10 overflow-hidden rounded-xl pb-[56%]">
                <img src={assetUrl(item.image)} alt="" />
              </div>
            ) : null}

            {'type' in item && typeof item.type === 'string' && item.type ? (
              <div className="f--subtitle mb-4 text-[#1F19CC]">{item.type}</div>
            ) : null}

            {'label' in item && typeof item.label === 'string' && item.label ? (
              <div className="f--subtitle mb-4 text-[#1F19CC]">{item.label}</div>
            ) : null}

            {'position' in item && typeof item.position === 'string' && item.position ? (
              <p className="mb-6 text-lg text-teal">{item.position}</p>
            ) : null}

            {'section' in item && typeof item.section === 'string' && item.section ? (
              <p className="mb-6 font-mono text-sm uppercase tracking-wide text-orange">
                {item.section}
              </p>
            ) : null}

            {'excerpt' in item && typeof item.excerpt === 'string' && item.excerpt ? (
              <p className="mb-6 text-lg leading-relaxed">{item.excerpt}</p>
            ) : null}

            {'tags' in item && Array.isArray(item.tags) ? (
              <ul className="mb-8 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li
                    key={String(tag)}
                    className="rounded-full border border-green/20 px-3 py-1 font-mono text-xs uppercase tracking-wide"
                  >
                    {String(tag)}
                  </li>
                ))}
              </ul>
            ) : null}

            {'date' in item && typeof item.date === 'string' && item.date ? (
              <p className="mb-6 font-mono text-sm uppercase tracking-wide text-green/70">
                {item.date}
              </p>
            ) : null}

            <p className="leading-relaxed">
              {'excerpt' in item && typeof item.excerpt === 'string' && item.excerpt
                ? item.excerpt
                : 'Learn more about this role and how to get involved with The Institute for Predictive Sciences.'}
            </p>

            <div className="mt-10">
              <Link
                to="/about#contact-us"
                className="font-mono text-sm uppercase tracking-wide text-orange underline"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
