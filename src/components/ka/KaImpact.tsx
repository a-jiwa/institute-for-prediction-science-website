import { assetUrl } from '../../utils/assetUrl'
import { KA_IMPACT } from './defaults'
import { KaAppStage } from './KaAppStage'

type Stat = {
  value: string
  label: string
  mark: string
  tone: 'yellow' | 'orange' | string
}

type KaImpactProps = {
  kicker?: string
  title?: string
  pink?: { title: string; body: string; image: string }
  stats?: Stat[]
  copy?: {
    title: string
    body: string
    actions: { label: string; href: string }[]
  }
  dark?: {
    title: string
    body: string
    cta: { label: string; href: string }
  }
}

export function KaImpact({
  kicker = KA_IMPACT.kicker,
  title = KA_IMPACT.title,
  pink = KA_IMPACT.pink,
  stats = KA_IMPACT.stats,
  copy = KA_IMPACT.copy,
  dark = KA_IMPACT.dark,
}: KaImpactProps) {
  return (
    <section className="ka-impact">
      <div className="ka-contain">
        <p className="ka-kicker">{kicker}</p>
        <h2>{title}</h2>
        <div className="ka-pink">
          <div>
            <h3>{pink.title}</h3>
            <p>{pink.body}</p>
          </div>
          <KaAppStage className="ka-ph ka-ph--bleed">
            <div className="ka-app-stage__bit ka-app-stage__chip">Live forecast</div>
            <div className="ka-app-stage__bit ka-app-stage__card">
              <span className="ka-app-stage__dot" />
              <div>
                <strong>Round 3 brief</strong>
                <span>Will inflation cool by Q3?</span>
              </div>
            </div>
            <div className="ka-app-stage__bit ka-app-stage__meter">
              <span>Team edge</span>
              <div className="ka-app-stage__bar">
                <i style={{ width: '68%' }} />
              </div>
            </div>
          </KaAppStage>
        </div>
        <div className="ka-stats">
          <div className="ka-stats__pair">
            {stats.map((stat) => (
              <article className={`ka-stat-card ka-stat-card--${stat.tone}`} key={stat.value}>
                <img alt="" className="ka-stat-mark" src={assetUrl(stat.mark)} />
                <p className="ka-stat">
                  <strong>{stat.value}</strong>
                </p>
                <p>{stat.label}</p>
              </article>
            ))}
          </div>
          <div className="ka-stats__copy">
            <h3>{copy.title}</h3>
            <p>{copy.body}</p>
            <div className="ka-actions">
              {copy.actions.map((action) => (
                <a className="ka-btn ka-btn--text" href={action.href} key={action.label}>
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="ka-dark">
          <div>
            <h3>{dark.title}</h3>
            <p>{dark.body}</p>
          </div>
          <a className="ka-btn" href={dark.cta.href}>
            {dark.cta.label}
          </a>
        </div>
      </div>
    </section>
  )
}
