import type { ReactNode } from 'react'

export const LEGAL_UPDATED = '17 November 2026'

export function LegalPage({
  title,
  lead,
  children,
}: {
  title: string
  lead: string
  children: ReactNode
}) {
  return (
    <div className="home-cover">
      <div className="ps ps-about-page ps-lab-page ps-legal">
        <section className="ps-about-hero ps-about-hero--with-lead">
          <div className="ps-about-hero__copy">
            <p className="ps-kicker">Policies</p>
            <h1>{title}</h1>
            <p className="ps-about-hero__lead">{lead}</p>
            <p className="ps-legal__updated">Last updated {LEGAL_UPDATED}</p>
          </div>
        </section>

        <div className="ps-legal__body">
          <div className="ps-contain">
            <div className="ps-legal__prose">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
