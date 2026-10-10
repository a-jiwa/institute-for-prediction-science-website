import { SmartLink } from '../ui/SmartLink'
import { PageHero } from '../sections/SharedSections'
import { researchFeed, type ResearchItem } from '../../data/research'
import { assetUrl } from '../../utils/assetUrl'

function CardMeta({ item }: { item: ResearchItem }) {
  return (
    <div className="research-card-meta">
      <time dateTime={item.date === 'Ongoing' ? undefined : item.date}>{item.date}</time>
    </div>
  )
}

function CardBody({ item }: { item: ResearchItem }) {
  return (
    <div className="research-card-content">
      <div className="research-card-copy">
        <h2>{item.title}</h2>
        {item.excerpt && <p>{item.excerpt}</p>}
        <CardMeta item={item} />
      </div>
      {item.image && (
        <figure className="research-card-media">
          <img src={assetUrl(item.image)} alt="" loading="lazy" />
        </figure>
      )}
    </div>
  )
}

function ResearchCard({ item, feature = false }: { item: ResearchItem; feature?: boolean }) {
  const className = feature ? 'research-feature' : 'research-card'
  const body = <CardBody item={item} />

  if (item.external) {
    return (
      <a className={className} href={item.href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    )
  }

  return (
    <SmartLink className={className} href={item.href}>
      {body}
    </SmartLink>
  )
}

export function ResearchIndex() {
  const items = researchFeed()
  const [featured, ...rest] = items

  return (
    <>
      <PageHero label="Research" title="We study how people and organisations can make better predictions." bg="research" />

      <section className="research-index">
        <div className="research-articles">
          <div className="container">
            {featured ? (
              <div className="research-spotlight">
                <div className="research-featured-col" aria-label="Featured research">
                  <ResearchCard item={featured} feature />
                </div>
                {rest.length > 0 && (
                  <div className="research-rail" aria-label="Recent research">
                    {rest.map((item) => (
                      <ResearchCard key={item.href} item={item} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="research-empty">No research published yet.</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
