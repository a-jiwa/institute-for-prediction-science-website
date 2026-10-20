import { LabsHeroShapes } from './LabsHeroShapes'
import { KA_CLOSE } from './defaults'

type KaCloseProps = {
  id?: string
  title?: string
  body?: string
  cta?: { label: string; href: string }
}

export function KaClose({
  id = 'ka-close',
  title = KA_CLOSE.title,
  body = KA_CLOSE.body,
  cta = KA_CLOSE.cta,
}: KaCloseProps) {
  return (
    <section className="ka-close" id={id}>
      <LabsHeroShapes className="ka-close__shapes" />
      <div className="ka-close__copy">
        <h2>{title}</h2>
        <p>{body}</p>
        <a className="ka-btn" href={cta.href}>
          {cta.label}
        </a>
      </div>
    </section>
  )
}
