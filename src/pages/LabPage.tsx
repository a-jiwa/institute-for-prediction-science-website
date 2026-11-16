import { CONTACT_EMAIL } from '../components/icons/Logo'

const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Labs — funding & research support')}`

/** Lab page: About/competitions hero + close, text sections. */
export function LabPage() {
  return (
    <div className="ps ps-about-page ps-lab-page">
      <section className="ps-about-hero ps-about-hero--with-lead">
        <div className="ps-about-hero__copy">
          <p className="ps-kicker">Labs</p>
          <h1>Advancing the science of prediction</h1>
          <p className="ps-about-hero__lead">
            We study human judgment, calibration, and decision-making under uncertainty, combining empirical research
            with custom forecasting infrastructure to understand how people and institutions anticipate the future.
          </p>
        </div>
      </section>

      <section className="ps-steps ps-lab">
        <div className="ps-contain">
          <div className="ps-steps__head">
            <h2>Research</h2>
            <p>
              We investigate how forecasting methods perform in practice. Backed by an in-house team of research
              scientists and engineers who build and maintain our own platforms, we partner with external academics to
              run custom studies, produce rigorous findings, and open longitudinal datasets without administrative
              friction.
            </p>
          </div>
          <div className="ps-steps__head">
            <h2>Funding &amp; Partnerships</h2>
            <p>
              With dedicated institutional funding in place, we commission external studies, fund academic research, and
              host visiting fellows. We are actively deploying capital for ongoing partnerships, with academic cohorts
              managed by direct invitation.
            </p>
          </div>
        </div>
      </section>

      <section className="ps-close" id="ps-close">
        <div className="ps-close__copy">
          <p>
            If you are an academic exploring an aligned research question and wish to discuss funding or research
            support, get in touch with our team.
          </p>
          <a className="ps-btn" href={CONTACT_HREF}>
            Get in touch
          </a>
        </div>
      </section>
    </div>
  )
}
