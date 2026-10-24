import { CONTACT_EMAIL } from '../components/icons/Logo'
import { LabsHeroShapes } from '../components/blocks/LabsHeroShapes'

const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Prediction Labs')}`

/** Lab page: About/competitions hero + close, text sections. */
export function LabPage() {
  return (
    <div className="ps ps-about-page ps-lab-page">
      <section className="ps-about-hero ps-about-hero--with-lead">
        <LabsHeroShapes className="ps-about-hero__shapes" />
        <div className="ps-about-hero__copy">
          <p className="ps-kicker">Prediction labs</p>
          <h1>Research that puts prediction to work</h1>
          <p className="ps-about-hero__lead">
            We research the science of prediction and explore how it can be put to practical use. Our work spans
            original research, experimental tools and new products built around forecasting, prediction markets and
            predictive data.
          </p>
          <a className="ps-btn" href={CONTACT_HREF}>
            Get in touch
          </a>
        </div>
      </section>

      <section className="ps-steps ps-lab">
        <div className="ps-contain">
          <div className="ps-steps__head">
            <p className="ps-kicker">Research</p>
            <h2>Applied science</h2>
            <p>
              We investigate new methods, test ideas and develop tools that apply the science of prediction to
              real-world problems. This includes exploring what existing methods can achieve, where they fall short,
              and what new approaches might make possible.
            </p>
            <p>
              Our work combines scientific enquiry with practical experimentation. We aim to understand not only how
              prediction works, but how it can be made more useful.
            </p>
          </div>
          <div className="ps-steps__head">
            <p className="ps-kicker">Products</p>
            <h2>Ventures</h2>
            <p>
              Some projects begin as research questions; others emerge from opportunities in data, technology or
              forecasting. We develop promising ideas through research, prototyping and evaluation, with the aim of
              turning the strongest into independent products, projects or businesses.
            </p>
            <p>
              Not every experiment leads to a product. The goal is to identify what works, understand why, and build
              on the results.
            </p>
          </div>
        </div>
      </section>

      <section className="ps-close" id="ps-close">
        <LabsHeroShapes className="ps-close__shapes" />
        <div className="ps-close__copy">
          <p className="ps-kicker">Get started</p>
          <h2>Have a prediction project in mind?</h2>
          <p>
            Whether you're interested in exploring a research question, building an experimental tool or developing a
            new venture, we'd be happy to hear what you have in mind.
          </p>
          <a className="ps-btn" href={CONTACT_HREF}>
            Get in touch
          </a>
        </div>
      </section>
    </div>
  )
}
