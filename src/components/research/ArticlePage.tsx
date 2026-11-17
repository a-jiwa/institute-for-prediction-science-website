import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { articleContent, findResearch, type ArticleBlock } from '../../data/research'

function EssayCrumb({ title }: { title: string }) {
  return (
    <nav className="essay-crumb" aria-label="Breadcrumb">
      <Link className="essay-crumb__parent" to="/research">
        Research
      </Link>
      <span className="essay-crumb__sep" aria-hidden="true">
        /
      </span>
      <span className="essay-crumb__current">{title}</span>
    </nav>
  )
}

function Blocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'p') {
          return <p key={`p-${index}`}>{block.text}</p>
        }
        if (block.type === 'h3') {
          return <h3 key={`h3-${index}`}>{block.text}</h3>
        }
        if (block.type === 'note') {
          return (
            <aside key={`note-${index}`} className="essay-note">
              {block.text}
            </aside>
          )
        }
        if (block.type === 'formula') {
          return (
            <p key={`formula-${index}`} className="essay-formula">
              {block.text}
            </p>
          )
        }
        if (block.type === 'table') {
          return (
            <figure key={`table-${index}`} className="essay-table">
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
              <div className="essay-table__scroll">
                <table>
                  <thead>
                    <tr>
                      {block.headers.map((header) => (
                        <th key={header} scope="col">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => (
                      <tr key={row.join('|')}>
                        {row.map((cell, cellIndex) => (
                          <td key={`${cell}-${cellIndex}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
          )
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
  const contentsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    if (!content) return
    const ids = content.sections.map((section) => section.id)
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
        <div className="essay-toolbar">
          <div className="container">
            <EssayCrumb title="Page not found" />
          </div>
        </div>
        <div className="container">
          <h1>Page not found</h1>
          <p>This piece isn’t on the site.</p>
        </div>
      </section>
    )
  }

  return (
    <article className="essay">
      <div className="essay-toolbar">
        <div className="container">
          <EssayCrumb title={item.title} />
        </div>
      </div>

      <div className="container">
        <div className="essay-layout">
          <aside className="essay-rail">
            <div className="essay-rail-block essay-rail-contents">
              <h3>Contents</h3>
              <ol>
                {content.sections.map((section) => (
                  <li key={section.id} className={section.id === activeId ? 'is-active' : ''}>
                    <a href={`#${section.id}`}>{section.heading}</a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="essay-header">
            <time dateTime={item.date === 'Ongoing' ? undefined : item.date}>{item.date}</time>
            <h1>{item.title}</h1>
            <p className="essay-dek">{content.lead}</p>
            <details className="essay-contents" ref={contentsRef}>
              <summary>
                <span className="essay-contents__current">
                  {content.sections.find((section) => section.id === activeId)?.heading ??
                    content.sections[0]?.heading ??
                    'Contents'}
                </span>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <ol>
                {content.sections.map((section) => (
                  <li key={section.id} className={section.id === activeId ? 'is-active' : ''}>
                    <a
                      href={`#${section.id}`}
                      onClick={() => {
                        if (contentsRef.current) contentsRef.current.open = false
                      }}
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
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
          </div>
        </div>
      </div>
    </article>
  )
}
