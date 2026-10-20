import { KA_ASSESS_HERO } from './defaults'
import { Placeholder } from './Placeholder'

type Action = {
  label: string
  href: string
  text?: boolean
}

type KaAssessSplitProps = {
  variant?: 'hero' | 'default'
  /** Calendar / teach graphic: fixed 240px height like Khan interim-assessment. */
  media?: 'default' | 'calendar'
  title?: string
  body?: string
  paragraphs?: string[]
  image?: string
  imageFirst?: boolean
  actions?: Action[]
}

export function KaAssessSplit({
  variant = 'default',
  media = 'default',
  title = KA_ASSESS_HERO.title,
  body,
  paragraphs,
  image = KA_ASSESS_HERO.image,
  imageFirst = false,
  actions,
}: KaAssessSplitProps) {
  const copy = (
    <div>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
      {paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {actions && actions.length > 0 && (
        <div className="ka-actions">
          {actions.map((action) => (
            <a
              className={`ka-btn${action.text ? ' ka-btn--text' : ''}`}
              href={action.href}
              key={action.label}
            >
              {action.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )

  const mediaEl = <Placeholder frame="shot" label="Image" src={image} />

  const sectionClass = [
    'ka-assess',
    variant === 'hero' ? 'ka-assess--hero' : '',
    media === 'calendar' ? 'ka-assess--calendar' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={sectionClass}>
      <div className="ka-contain">
        <div className="ka-split">
          {imageFirst ? (
            <>
              {mediaEl}
              {copy}
            </>
          ) : (
            <>
              {copy}
              {mediaEl}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
