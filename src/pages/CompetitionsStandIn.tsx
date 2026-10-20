import { useState } from 'react'
import { CONTACT_EMAIL } from '../components/icons/Logo'
import { KaAppStage, type KaAppStageVariant } from '../components/ka/KaAppStage'
import { LabsHeroShapes } from '../components/ka/LabsHeroShapes'
import { assetUrl } from '../utils/assetUrl'

const CTA_LABEL = 'Request a free demo'
const ENQUIRE_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Forecasting competitions — institutional participation')}`

const ACCORDION = [
  {
    title: 'Live leaderboard',
    body: "Students can see how they rank against other participants as the competition progresses. Follow the scores, track your position and see who's leading.",
    src: '/assets/placeholders/khan/coach-white.svg',
    tone: '#72bb82',
  },
  {
    title: 'Event notifications',
    body: "Keep up with important developments and resolved questions. Notifications let students know when there's something new to follow.",
    src: '/assets/placeholders/khan/notify-white.svg',
    tone: '#fcc539',
  },
  {
    title: 'Forecast scores',
    body: 'See how forecasts compare with real-world outcomes. Scores help students track their performance across questions and learn from the results.',
    src: '/assets/placeholders/khan/notify-white.svg',
    tone: '#f8a2d6',
  },
]

const WHY = [
  {
    title: 'Learning beyond the classroom',
    body: 'Connect course material to real-world events. Students apply what they learn to questions that are still unfolding, without changing the focus of your teaching.',
    icon: '/assets/placeholders/khan/icon-folder.svg',
  },
  {
    title: 'Discussions with purpose',
    body: 'Give students a shared question to explore. They can compare forecasts, weigh evidence and explain why they see things differently.',
    icon: '/assets/placeholders/khan/icon-users.svg',
  },
  {
    title: 'Reasoning made measurable',
    body: 'Students express their judgements as probabilities, making clear not just what they think will happen, but how confident they are.',
    icon: '/assets/placeholders/khan/icon-chart.svg',
  },
  {
    title: 'Feedback from real outcomes',
    body: 'When questions are resolved, students can see how their forecasts performed. Scores give them a consistent way to track accuracy across multiple questions.',
    icon: '/assets/placeholders/khan/icon-strategy.svg',
  },
]

const STEPS: {
  title: string
  body: string
  imageFirst: boolean
  variant: KaAppStageVariant
}[] = [
  {
    title: 'Design your questions',
    body: 'Choose from our ready-made questions on various topics, or let us help you build custom questions for your course. Every question asks students to predict a future real-world event.',
    imageFirst: false,
    variant: 'brief',
  },
  {
    title: 'Make predictions',
    body: 'Students test their knowledge and judgment by estimating the likelihood of each outcome using percentages or probabilities.',
    imageFirst: true,
    variant: 'forecast',
  },
  {
    title: 'See what happens',
    body: 'As real-world events unfold, questions are answered and predictions are scored based on what actually occurred. Students get to see how accurate their forecasts were.',
    imageFirst: false,
    variant: 'result',
  },
  {
    title: 'Climb the leaderboard',
    body: 'Points add up with every question. Students can track their accuracy, compare results with classmates, and compete for the top spot!',
    imageFirst: true,
    variant: 'board',
  },
]

const STEPS_SHELL = '/assets/placeholders/khan/panel-white.svg'

const TOPICS = [
  { title: 'UK politics', flag: '/assets/placeholders/duolingo/flags/uk.svg' },
  { title: 'US politics', flag: '/assets/placeholders/duolingo/flags/english.svg' },
  { title: 'European politics', flag: '/assets/placeholders/duolingo/flags/eu.svg' },
  { title: 'Elections', icon: 'how_to_vote' },
  { title: 'Economics', icon: 'monitoring' },
  { title: 'Financial markets', icon: 'candlestick_chart' },
  { title: 'Business', icon: 'business_center' },
  { title: 'Energy', icon: 'bolt' },
  { title: 'Public health', icon: 'health_and_safety' },
]

export function CompetitionsStandIn() {
  const [open, setOpen] = useState(0)

  return (
    <div className="ka ka-about-page ka-competitions-page">
      {/* 1. Hero — About-style title band; lead + CTA sit under the title */}
      <section className="ka-about-hero ka-about-hero--with-lead">
        <LabsHeroShapes
          className="ka-about-hero__shapes"
          homes={[{ x: 0.88, y: 0.3 }]}
          only={['circle']}
        />
        <div className="ka-about-hero__copy">
          <p className="ka-kicker">Custom competitions</p>
          <h1>Bring the real world into your teaching</h1>
          <p className="ka-about-hero__lead">
            Our custom forecasting competitions bring learning to life, building sharp critical thinking as students
            compete to test their theory against real-world events.
          </p>
          <a className="ka-btn" href={ENQUIRE_HREF}>
            {CTA_LABEL}
          </a>
        </div>
      </section>

      {/* Preview under the title band */}
      <section className="ka-intro ka-intro--under-hero">
        <div className="ka-contain">
          <div className="ka-intro__preview">
            <Placeholder
              frame="screen"
              label="Hero preview"
              src="/assets/placeholders/khan/tab-white.svg"
            />
          </div>
        </div>
      </section>

      {/* 2. Why forecasting — why it belongs in education */}
      <section className="ka-services">
        <div className="ka-contain">
          <div className="ka-services__lead">
            <div>
              <p className="ka-kicker">Why forecasting?</p>
              <h2>A new way to bring learning to life</h2>
              <p>
                Students learn about politics, economics, science and society. A forecasting competition gives them a
                way to put that knowledge into practice. By predicting real-world events, students work with evidence,
                discuss different perspectives and see how their judgements compare with what happens next.
              </p>
            </div>
            <Placeholder
              frame="cover"
              label="Why forecasting"
              src="/assets/placeholders/khan/why-blue.svg"
            />
          </div>
          <ul className="ka-services__grid">
            {WHY.map((item) => (
              <li key={item.title}>
                <span className="ka-service-icon">
                  <img alt="" src={assetUrl(item.icon)} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. How it works — make the activity easy to understand */}
      <section className="ka-steps">
        <div className="ka-contain">
          <div className="ka-steps__head">
            <p className="ka-kicker">How it works</p>
            <h2>A simple process for making and measuring predictions</h2>
          </div>
          {STEPS.map((step) => (
            <div className="ka-split ka-step" key={step.title}>
              {step.imageFirst && (
                <KaAppStage className="ka-ph" shell={STEPS_SHELL} variant={step.variant} />
              )}
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              {!step.imageFirst && (
                <KaAppStage className="ka-ph" shell={STEPS_SHELL} variant={step.variant} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Explore the questions — range of topics */}
      <section className="ka-subjects">
        <div className="ka-contain">
          <p className="ka-kicker">Topics</p>
          <h2>Questions for every topic</h2>
          <p>
            Choose a broad mix of current affairs or focus on topics that connect with your course.
          </p>
          <ul>
            {TOPICS.map((topic) => (
              <li key={topic.title}>
                <a href={ENQUIRE_HREF}>
                  {'flag' in topic && topic.flag ? (
                    <img alt="" className="ka-topic-flag" src={assetUrl(topic.flag)} />
                  ) : (
                    <span aria-hidden="true" className="material-symbols-outlined ka-topic-icon">
                      {topic.icon}
                    </span>
                  )}
                  {topic.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="ka-subjects__or">
            <span>or</span>
          </p>
          <a className="ka-subjects__own" href={ENQUIRE_HREF}>
            <span aria-hidden="true" className="material-symbols-outlined ka-topic-icon">
              add_circle
            </span>
            Create your own
          </a>
        </div>
      </section>

      <section className="ka-band ka-band--split">
        <div className="ka-contain">
          <div className="ka-acc">
            <div className="ka-acc__copy">
              <p className="ka-kicker">Custom platform</p>
              <h2>Features that bring the competition to life</h2>
              <div className="ka-acc__list">
                {ACCORDION.map((item, index) => {
                  const expanded = open === index
                  return (
                    <div key={item.title}>
                      <button
                        aria-controls="ka-acc-panels"
                        aria-expanded={expanded}
                        onClick={() => setOpen(index)}
                        type="button"
                      >
                        <span>{item.title}</span>
                        <svg aria-hidden="true" className="ka-acc__chevron" viewBox="0 0 66 70">
                          <path d="M17 2L50 35L17 68" />
                        </svg>
                      </button>
                      {expanded && (
                        <div className="ka-acc__panels" id="ka-acc-panels">
                          {ACCORDION.map((panel, panelIndex) => (
                            <p
                              key={panel.title}
                              aria-hidden={panelIndex === open ? undefined : true}
                              data-active={panelIndex === open ? true : undefined}
                            >
                              {panel.body}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <Placeholder
              frame="square"
              label={`Image ${open + 1}`}
              src={ACCORDION[open].src}
              tone={ACCORDION[open].tone}
            />
          </div>
        </div>
      </section>

      {/* 6. Impact — evidence and results */}
      <section className="ka-impact">
        <div className="ka-contain">
          <p className="ka-kicker">Impact</p>
          <h2>Backed by research. Learning gains in every classroom.</h2>

          <div className="ka-pink">
            <div className="ka-pink__copy">
              <h3>Students deserve more than opinions.</h3>
              <p>
                Forecasting gives students a practical way to develop their reasoning. By weighing evidence, judging
                probabilities and comparing predictions with real-world outcomes, they practise making informed
                decisions and thinking carefully about uncertainty.
              </p>
            </div>
            <Placeholder
              frame="bleed"
              label="Platform preview"
              src="/assets/placeholders/khan/accordion.webp"
            />
          </div>

          <div className="ka-stats">
            <div className="ka-stats__pair">
              <article className="ka-stat-card ka-stat-card--yellow">
                <div className="ka-stat">
                  <strong>5×</strong>
                  <h3>More accurate judgements</h3>
                </div>
              </article>
              <article className="ka-stat-card ka-stat-card--orange">
                <div className="ka-stat">
                  <strong>2×</strong>
                  <h3>Stronger critical thinking</h3>
                </div>
              </article>
            </div>

            <div className="ka-stats__copy">
              <h3>Multiple studies show our competitions improve critical thinking.</h3>
              <p>
                Participating in a single forecasting competition can improve a student&apos;s forecasting accuracy by
                250%. Top participants can triple the average baseline accuracy.
              </p>
            </div>
          </div>

          <div className="ka-dark">
            <div>
              <h3>See the evidence behind the gains</h3>
              <p>Explore the studies that show how structured practice accelerates learning.</p>
            </div>
            <a className="ka-btn" href={ENQUIRE_HREF}>
              See the results
            </a>
          </div>
        </div>
      </section>

      <section className="ka-quote">
        <div className="ka-contain">
          <h2>Help students think for themselves</h2>
          <blockquote>
            <p>
              “One of the most important things we can teach students is how to think for themselves. Forecasting
              gives them the chance to be curious, question what they hear and discover that changing your mind when
              the evidence changes is a strength, not a weakness. I think that’s an incredibly valuable thing to
              learn.”
            </p>
            <div className="ka-quote__author">
              <img alt="" src={assetUrl('/assets/placeholders/khan/headshot-psyllou.png')} />
              <div>
                <strong>Dr Maria Psyllou</strong>
                <span>Imperial College London</span>
              </div>
            </div>
          </blockquote>
        </div>
      </section>

      {/* 7. Final CTA — same contact band as home */}
      <section className="ka-close" id="ka-close">
        <LabsHeroShapes className="ka-close__shapes" />
        <div className="ka-close__copy">
          <p className="ka-kicker">Get started</p>
          <h2>What could your students explore?</h2>
          <p>
            From a single seminar to a competition across your institution, start with a question, a subject or a
            teaching goal.
          </p>
          <a className="ka-btn" href={ENQUIRE_HREF}>
            {CTA_LABEL}
          </a>
        </div>
      </section>
    </div>
  )
}

function Placeholder({
  label,
  ratio = '16 / 9',
  src = '',
  frame,
  tone,
}: {
  label: string
  ratio?: string
  src?: string
  frame?: 'screen' | 'cover' | 'square' | 'shot' | 'bleed' | 'avatar'
  tone?: string
}) {
  if (src) {
    return (
      <div
        className={`ka-ph ka-ph--photo${frame ? ` ka-ph--${frame}` : ''}`}
        style={tone ? { background: tone } : undefined}
      >
        <img alt="" src={assetUrl(src)} />
      </div>
    )
  }

  return (
    <div className="ka-ph" style={{ aspectRatio: ratio }}>
      <span>{label}</span>
    </div>
  )
}
