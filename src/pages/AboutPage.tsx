import { CONTACT_EMAIL } from '../components/icons/Logo'
import { SmartLink } from '../components/ui/SmartLink'

const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('About the institute')}`

const OPENING = [
  {
    figure: 'Practice',
    caption: 'People test a judgement, then learn from the outcome.',
    tone: 'blue',
  },
  {
    figure: 'A record',
    caption: 'What was believed is written down, so it can be checked.',
    tone: 'pink',
  },
] as const

const PLACES = [
  {
    figure: 'Competitions',
    caption: 'Same questions, scored against what happened.',
    href: '/services/competitions',
    tone: 'green',
  },
  {
    figure: 'Training',
    caption: 'Practice, feedback, and a record of judgement.',
    href: '/services/training',
    tone: 'yellow',
  },
  {
    figure: 'Labs',
    caption: 'Research, tools, and new uses of predictive data.',
    href: '/services/lab',
    tone: 'sky',
  },
] as const

export function AboutPage() {
  return (
    <div className="home-cover">
      <div className="ka ka-about-page">
        <section className="ka-about-hero">
          <div aria-hidden="true" className="ka-about-hero__shapes">
            <span className="ka-about-hero__orb" />
            <svg className="ka-about-hero__scallop" viewBox="0 0 280 120">
              <path
                d="M0 0h280v52c-18 36-52 36-70 0-18 36-52 36-70 0-18 36-52 36-70 0-18 36-52 36-70 0V0z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="ka-contain">
            <p className="ka-kicker">About us</p>
            <h1>Our mission is to advance the practice and science of forecasting.</h1>
          </div>
        </section>

        <section className="ka-about-reach">
          <div className="ka-contain">
            <h2>We make forecasting measurable, engaging and accessible.</h2>
            <ul className="ka-about-cards">
              {OPENING.map((item) => (
                <li key={item.figure}>
                  <div className={`ka-about-card ka-about-card--${item.tone}`}>
                    <strong>{item.figure}</strong>
                    <span>{item.caption}</span>
                  </div>
                </li>
              ))}
            </ul>
            <h3>The work sits in three places.</h3>
            <ul className="ka-about-cards">
              {PLACES.map((item) => (
                <li key={item.figure}>
                  <SmartLink className={`ka-about-card ka-about-card--${item.tone}`} href={item.href}>
                    <strong>{item.figure}</strong>
                    <span>{item.caption}</span>
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ka-about-split">
          <div className="ka-contain">
            <div className="ka-split">
              <div>
                <h2>Forecasting improves with practice and feedback.</h2>
                <p>
                  We build the tools and frameworks that let people test their judgement, learn from outcomes and
                  track their progress over time.
                </p>
                <p>
                  Our work brings together research and practical experimentation. We collaborate with universities,
                  companies and other organisations to develop forecasting ability, study how people predict, and turn
                  what we learn into useful tools.
                </p>
                <p>
                  The aim is a more rigorous, competitive and widely used discipline, so people and organisations can
                  navigate uncertainty with a record of what they believed.
                </p>
              </div>
              <figure className="ka-about-chart">
                <svg role="img" viewBox="0 0 420 280">
                  <title>A written forecast, checked against what happened.</title>
                  <line stroke="#9aa3ad" strokeDasharray="5 6" strokeWidth="2" x1="78" x2="392" y1="52" y2="52" />
                  <text fill="#6b7280" fontSize="13" textAnchor="end" x="386" y="40">
                    What was expected
                  </text>
                  <text fill="#6b7280" fontSize="13" transform="rotate(-90 22 150)" x="22" y="150">
                    A written forecast
                  </text>
                  <rect fill="#4c8dff" height="150" rx="6" width="52" x="108" y="78" />
                  <rect fill="#8eb6ff" height="118" rx="6" width="52" x="184" y="110" />
                  <rect fill="#c5dcff" height="92" rx="6" width="52" x="260" y="136" />
                  <rect fill="#e4efff" height="68" rx="6" width="52" x="336" y="160" />
                  <text fill="#6b7280" fontSize="13" textAnchor="middle" x="235" y="258">
                    What happened
                  </text>
                </svg>
                <figcaption>A forecast is written down, then checked against what happened.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="ka-study">
          <div className="ka-contain">
            <h2>Better predictions start with a question, a probability, and a result you can return to.</h2>
          </div>
        </section>

        <section className="ka-close" id="contact-us">
          <div aria-hidden="true" className="ka-shape" />
          <div className="ka-contain">
            <p className="ka-kicker">Contact us</p>
            <h2>Have a forecasting project in mind?</h2>
            <p>
              Whether you want to run a competition, train a team, or explore a research question, we would be glad to
              hear what you have in mind.
            </p>
            <a className="ka-btn" href={CONTACT_HREF}>
              Get in touch
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
