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
      <div className="ka-shape" aria-hidden="true" />
      <div className="ka-contain">
        <h2>{title}</h2>
        <p>{body}</p>
        <a className="ka-btn" href={cta.href}>
          {cta.label}
        </a>
      </div>
    </section>
  )
}
