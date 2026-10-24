import { CONTACT_EMAIL } from '../components/icons/Logo'
import { LabsHeroShapes } from '../components/blocks/LabsHeroShapes'
import { SmartLink } from '../components/ui/SmartLink'
import { assetUrl } from '../utils/assetUrl'

const CTA_LABEL = 'Request a programme'
const ENQUIRE_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Forecasting training')}`

function trackHref(track: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Forecasting training — ${track}`)}`
}

const GAINS = [
  {
    title: 'Record your forecasts',
    body: 'Write down what you expect to happen and how likely you think it is.',
    tone: 'review',
  },
  {
    title: 'Learn from results',
    body: 'Compare your predictions with what actually happened and identify where your judgement could improve.',
    tone: 'feedback',
  },
  {
    title: 'Train with others',
    body: 'Compare forecasts, discuss different views, and learn how others assess the same evidence.',
    tone: 'together',
  },
] as const

const REVIEW_POINTS = [
  {
    title: 'Recorded in advance',
    body: 'Predictions and reasoning are saved before the outcome is known.',
  },
  {
    title: 'Clear',
    body: 'Each forecast states what is expected and how likely it is.',
  },
  {
    title: 'Measurable',
    body: 'Predictions are scored consistently so performance can be tracked.',
  },
  {
    title: 'Useful',
    body: 'Participants apply what they learn to future forecasts.',
  },
]

const TRACKS = [
  {
    title: 'Individual training',
    body: 'Track your predictions, review your accuracy and identify ways to improve your judgement.',
    href: trackHref('individuals'),
    label: 'Ask about individual training',
    tone: 'sand',
  },
  {
    title: 'Team training',
    body: 'Forecast the same questions, compare estimates and discuss why people reach different conclusions.',
    href: trackHref('teams'),
    label: 'Ask about team training',
    tone: 'pink',
  },
  {
    title: 'Training for organisations',
    body: 'Practise forecasting on questions relevant to your organisation, with exercises tailored to your team and objectives.',
    href: trackHref('organisations'),
    label: 'Ask about a programme',
    tone: 'blue',
  },
] as const

/** Training page — About/competitions hero + close, existing content bands. */
export function TrainingPage() {
  return (
    <div className="ps ps-about-page ps-training-page">
      <section className="ps-about-hero ps-about-hero--with-lead">
        <LabsHeroShapes className="ps-about-hero__shapes" />
        <div className="ps-about-hero__copy">
          <p className="ps-kicker">Forecasting training</p>
          <h1>Learn to make better predictions</h1>
          <p className="ps-about-hero__lead">
            Practise estimating the likelihood of future events, record your reasoning, and learn from the results. Our
            training programmes help individuals and teams improve their forecasting skills through practice and
            feedback.
          </p>
          <a className="ps-btn" href={ENQUIRE_HREF}>
            {CTA_LABEL}
          </a>
        </div>
      </section>

      <section className="ps-train-gains">
        <div className="ps-contain">
          <p className="ps-kicker">How it works</p>
          <h2>Practise, review and improve</h2>
          <div className="ps-train-gains__grid">
            {GAINS.map((gain) => (
              <article className={`ps-train-gain ps-train-gain--${gain.tone}`} key={gain.title}>
                <strong>{gain.title}</strong>
                <p>{gain.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ps-train-study">
        <div className="ps-contain">
          <p className="ps-kicker">Research</p>
          <h2>What does forecasting research tell us?</h2>
          <div className="ps-train-study__split">
            <div>
              <h3>Practice and feedback can improve accuracy.</h3>
              <p>
                Research on forecasting tournaments has found that training in probabilistic reasoning, combined with
                practice and feedback, can improve forecasting accuracy. Our programmes use these methods to help
                people make, assess and improve their predictions.
              </p>
              <a className="ps-btn" href={ENQUIRE_HREF}>
                {CTA_LABEL}
              </a>
            </div>
            <img
              alt=""
              className="ps-train-chart"
              src={assetUrl('/assets/ui/impact-chart.avif')}
            />
          </div>
        </div>
      </section>

      <section className="ps-train-center">
        <div className="ps-contain">
          <p className="ps-kicker">Method</p>
          <h2>How the training works</h2>
          <p>
            Participants make forecasts, record their reasoning and review the results. Over time, this helps them
            recognise common mistakes, such as being too confident or overlooking alternative outcomes.
          </p>
          <a className="ps-btn" href={ENQUIRE_HREF}>
            Talk to us
          </a>
        </div>
      </section>

      <section className="ps-train-proof">
        <div className="ps-contain">
          <div className="ps-train-panel">
            <img
              alt=""
              className="ps-train-sketch"
              src={assetUrl('/assets/ui/impact-evidence.avif')}
            />
            <div>
              <p className="ps-kicker">Practice design</p>
              <h2>What makes a good forecasting exercise?</h2>
              <ul>
                {REVIEW_POINTS.map((point) => (
                  <li key={point.title}>
                    <strong>{point.title}</strong> — {point.body}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ps-train-tracks">
            <p className="ps-kicker">Programmes</p>
            <h2>Training for individuals, teams and organisations</h2>
          </div>
          <div className="ps-train-tiers">
            {TRACKS.map((track) => (
              <article className={`ps-train-tier ps-train-tier--${track.tone}`} key={track.title}>
                <h3>{track.title}</h3>
                <p>{track.body}</p>
                <a href={track.href}>
                  {track.label} <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ps-close" id="ps-close">
        <LabsHeroShapes className="ps-close__shapes" />
        <div className="ps-close__copy">
          <p className="ps-kicker">Get started</p>
          <h2>Start improving your forecasts</h2>
          <p>
            Learn to assess uncertainty, make more informed predictions and understand how well your forecasts
            perform.
          </p>
          <a className="ps-btn" href={ENQUIRE_HREF}>
            {CTA_LABEL}
          </a>
          <p className="ps-train-close__alt">
            <SmartLink href="/services/competitions">See competitions</SmartLink>
          </p>
        </div>
      </section>
    </div>
  )
}
