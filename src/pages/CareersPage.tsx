import { CareersBoard } from '../components/careers/CareersBoard'
import { CAREERS_EMAIL } from '../components/icons/Logo'
import './careers.css'

const GENERAL_HREF = `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent('General application')}`

export function CareersPage() {
  return (
    <div className="ps ps-about-page ps-lab-page ps-careers">
      <section className="ps-about-hero ps-about-hero--with-lead">
        <div className="ps-about-hero__copy">
          <p className="ps-kicker">Careers</p>
          <h1>Join the Institute</h1>
          <p className="ps-about-hero__lead">We are actively hiring for the following roles</p>
        </div>
      </section>
      <CareersBoard />
      <section className="ps-close" id="general-application">
        <div className="ps-close__copy">
          <p className="ps-kicker">Apply</p>
          <h2>Don’t see a role that fits?</h2>
          <p>Send your CV and a short covering note. We read general applications alongside the roles listed above.</p>
          <a className="ps-btn" href={GENERAL_HREF}>
            Get in touch
          </a>
        </div>
      </section>
    </div>
  )
}
