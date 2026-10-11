import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  articleContent,
  authorInitials,
  findResearch,
  type ArticleBlock,
  type ResearchAuthor,
} from '../../data/research'
import { assetUrl } from '../../utils/assetUrl'

function AuthorCard({
  author,
  compact = false,
}: {
  author: ResearchAuthor
  compact?: boolean
}) {
  return (
    <div className={`essay-author${compact ? ' is-compact' : ''}`}>
      <div className="essay-author-avatar" aria-hidden="true">
        {authorInitials(author.name)}
      </div>
      <div className="essay-author-meta">
        <a className="essay-author-name" href="#contributing-authors">
          {author.name}
        </a>
        <div className="essay-author-byline">{author.role}</div>
      </div>
    </div>
  )
}

function Blocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'p') {
          return <p key={`p-${index}`}>{block.text}</p>
        }
        if (block.type === 'ul') {
          return (
            <ul key={`ul-${index}`}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )
        }
        return (
          <ol key={`ol-${index}`}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        )
      })}
    </>
  )
}

export function ArticlePage({ slug }: { slug: string }) {
  const item = findResearch(slug)
  const content = useMemo(() => (item ? articleContent(item) : null), [item])
  const [activeId, setActiveId] = useState(content?.sections[0]?.id ?? '')
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!content) return
    const ids = [...content.sections.map((section) => section.id), 'contributing-authors']
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node))
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.35, 0.7] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [content])

  if (!item || !content) {
    return (
      <section className="essay essay-missing">
        <div className="container">
          <h1 className="editorial-title">Page not found</h1>
          <Link to="/research">All research</Link>
        </div>
      </section>
    )
  }

  return (
    <article className="essay">
      <div className="container">
        <div className="essay-layout">
          <aside className="essay-rail">
            <div className="essay-rail-block essay-rail-authors">
              <h3>Authors</h3>
              <div className="essay-authors">
                {content.authors.map((author) => (
                  <AuthorCard key={author.name} author={author} />
                ))}
              </div>
            </div>
            <div className="essay-rail-block essay-rail-contents">
              <h3>Contents</h3>
              <ol>
                {content.sections.map((section) => (
                  <li key={section.id} className={section.id === activeId ? 'is-active' : ''}>
                    <a href={`#${section.id}`}>{section.heading}</a>
                  </li>
                ))}
                <li className={activeId === 'contributing-authors' ? 'is-active' : ''}>
                  <a href="#contributing-authors">Contributing authors</a>
                </li>
              </ol>
            </div>
          </aside>

          <div className="essay-header">
            <time dateTime={item.date === 'Ongoing' ? undefined : item.date}>{item.date}</time>
            <h1>{item.title}</h1>
            <p className="essay-dek">{content.lead}</p>
            <div className="essay-header-authors">
              {content.authors.map((author) => (
                <AuthorCard key={author.name} author={author} compact />
              ))}
            </div>
            {item.image && (
              <figure className="essay-media">
                <img src={assetUrl(item.image)} alt="" />
              </figure>
            )}
          </div>

          <div className="essay-body">
            {content.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            {content.sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2>{section.heading}</h2>
                <Blocks blocks={section.blocks} />
              </section>
            ))}

            <section className="essay-contributors" id="contributing-authors">
              <h2>Contributing authors</h2>
              <div className="essay-contributor-list">
                {content.authors.map((author) => {
                  const expanded = expandedBios[author.name]
                  const bio = author.bio ?? ''
                  const short = bio.length > 180 && !expanded ? `${bio.slice(0, 180).trim()}…` : bio
                  return (
                    <div className="essay-contributor" key={author.name}>
                      <div className="essay-author-avatar" aria-hidden="true">
                        {authorInitials(author.name)}
                      </div>
                      <div>
                        <h3>{author.name}</h3>
                        <div className="essay-contributor-role">{author.role}</div>
                        {bio && <p>{short}</p>}
                        {bio.length > 180 && (
                          <button
                            type="button"
                            className="essay-read-more"
                            onClick={() =>
                              setExpandedBios((current) => ({
                                ...current,
                                [author.name]: !expanded,
                              }))
                            }
                          >
                            {expanded ? '− Show less' : '+ Read more'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <p className="essay-back">
              <Link to="/research">All research</Link>
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
