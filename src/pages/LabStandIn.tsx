import { CONTACT_EMAIL } from '../components/icons/Logo'
import { assetUrl } from '../utils/assetUrl'

const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Prediction Labs')}`

/** Lab page: case-studies header, then the two text sections. */
export function LabStandIn() {
  return (
    <div className="ka ka-lab-page">
      <section className="ka-intro ka-intro--title">
        <div className="ka-contain">
          <div className="ka-intro__copy">
            <img
              alt=""
              className="ka-intro__mark"
              src={assetUrl('/assets/placeholders/khan/case-studies-mark.webp')}
            />
            <h2>Prediction Labs</h2>
            <svg aria-hidden="true" className="ka-intro__scribble" fill="none" viewBox="0 0 261 17">
              <path
                d="M35.6768 4.76528C81.9571 3.89226 87.9844 3.01925 128.906 2.5637C169.828 2.10815 203.988 2.09652 221.23 2.09053C238.473 2.08454 237.762 2.08454 221.449 2.53631C205.137 2.98808 173.244 3.89162 139.795 5.5771C106.346 7.26259 72.3065 9.70263 51.9315 11.0859C31.5566 12.4691 25.8774 12.7216 20.661 12.905C10.8968 13.2482 4.02547 13.4222 2.01996 13.6098C1.71545 13.6383 4.5363 13.699 35.6759 13.593C66.8156 13.487 126.617 13.2552 167.015 13.3094C207.413 13.3636 239.026 13.7109 259 14.0894"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
            <p>
              We research the science of prediction and explore how it can be put to practical use. Our work spans
              original research, experimental tools and new products built around forecasting, prediction markets and
              predictive data.
            </p>
          </div>
        </div>
      </section>

      <section className="ka-steps ka-lab">
        <div className="ka-contain">
          <div className="ka-steps__head">
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
          <div className="ka-steps__head">
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

      <section className="ka-close" id="contact-us">
        <div className="ka-shape" aria-hidden="true" />
        <div className="ka-contain">
          <p className="ka-kicker">Contact us</p>
          <h2>Have a prediction project in mind?</h2>
          <p>
            Whether you're interested in exploring a research question, building an experimental tool or developing a
            new venture, we'd be happy to hear what you have in mind.
          </p>
          <a className="ka-btn" href={CONTACT_HREF}>
            Get in touch
          </a>
        </div>
      </section>
    </div>
  )
}
