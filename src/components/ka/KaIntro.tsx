import { useEffect, useState } from 'react'
import { assetUrl } from '../../utils/assetUrl'
import { KA_INTRO } from './defaults'
import { Placeholder } from './Placeholder'

export type KaTab = {
  label: string
  title: string
  body: string
  icon: string
  screen: string
  shape: 'pentagon' | 'circle' | 'slant' | string
}

type KaIntroProps = {
  title?: string
  body?: string
  cta?: { label: string; href: string }
  logosLabel?: string
  logos?: string[]
  tabsLabel?: string
  tabs?: KaTab[]
  autoplayMs?: number
}

export function KaIntro({
  title = KA_INTRO.title,
  body = KA_INTRO.body,
  cta = KA_INTRO.cta,
  logosLabel = KA_INTRO.logosLabel,
  logos = KA_INTRO.logos,
  tabsLabel = KA_INTRO.tabsLabel,
  tabs = KA_INTRO.tabs,
  autoplayMs = 5000,
}: KaIntroProps) {
  const [tab, setTab] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing || tabs.length === 0) return
    const id = window.setInterval(() => {
      setTab((current) => (current + 1) % tabs.length)
    }, autoplayMs)
    return () => window.clearInterval(id)
  }, [playing, tabs.length, autoplayMs])

  const active = tabs[tab] ?? tabs[0]

  return (
    <section className="ka-intro">
      <div className="ka-map" aria-hidden="true" />
      <div className="ka-contain">
        <div className="ka-intro__copy">
          <h2>{title}</h2>
          <p>{body}</p>
          <a className="ka-btn" href={cta.href}>
            {cta.label}
          </a>
        </div>

        <div className="ka-logos">
          <p>{logosLabel}</p>
          <ul>
            {logos.map((src) => (
              <li key={src}>
                <img alt="" className="ka-logo" src={assetUrl(src)} />
              </li>
            ))}
          </ul>
        </div>

        {active && (
          <div className="ka-tabs">
            <div className="ka-tabs__bar">
              <div role="tablist" aria-label={tabsLabel}>
                {tabs.map((item, index) => (
                  <button
                    aria-selected={tab === index}
                    key={item.label}
                    onClick={() => setTab(index)}
                    role="tab"
                    type="button"
                  >
                    <img alt="" className={`ka-tab-icon ka-tab-icon--${item.shape}`} src={assetUrl(item.icon)} />
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                aria-label={playing ? 'Pause' : 'Play'}
                aria-pressed={playing}
                className="ka-tabs__play"
                onClick={() => setPlaying((value) => !value)}
                type="button"
              >
                {playing ? (
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <rect height="12" rx="0.6" width="3.4" x="3" y="2" />
                    <rect height="12" rx="0.6" width="3.4" x="9.6" y="2" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 1393 1394">
                    <path d="M1271 696.5L280 1393L280 0L1271 696.5Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="ka-tabs__panel" role="tabpanel">
              <h2>
                {active.title.split('\n').map((line, index, lines) => (
                  <span key={line}>
                    {line}
                    {index < lines.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p>{active.body}</p>
              <Placeholder frame="screen" label={`Image ${tab + 1}`} src={active.screen} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
