import { KA_STUDY } from './defaults'

type KaStudyProps = {
  title?: string
  cta?: { label: string; href: string }
}

export function KaStudy({ title = KA_STUDY.title, cta = KA_STUDY.cta }: KaStudyProps) {
  return (
    <section className="ka-study">
      <div className="ka-contain">
        <h2>{title}</h2>
        <a className="ka-btn" href={cta.href}>
          {cta.label}
        </a>
      </div>
    </section>
  )
}
