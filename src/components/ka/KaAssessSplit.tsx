import { KA_ASSESS_HERO } from './defaults'
import { Placeholder } from './Placeholder'

type Action = {
  label: string
  href: string
  text?: boolean
}

type KaAssessSplitProps = {
  variant?: 'hero' | 'default'
  title?: string
  body?: string
  paragraphs?: string[]
  image?: string
  imageFirst?: boolean
  actions?: Action[]
}

export function KaAssessSplit({
  variant = 'default',
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

  const media = <Placeholder frame="shot" label="Image" src={image} />

  return (
    <section className={`ka-assess${variant === 'hero' ? ' ka-assess--hero' : ''}`}>
      <div className="ka-contain">
        <div className="ka-split">
          {imageFirst ? (
            <>
              {media}
              {copy}
            </>
          ) : (
            <>
              {copy}
              {media}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
