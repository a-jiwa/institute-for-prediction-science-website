import { useState } from 'react'
import { CONTACT_EMAIL } from '../components/icons/Logo'
import { KaAppStage, type KaAppStageVariant } from '../components/ka/KaAppStage'
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
    src: '/assets/placeholders/khan/scores-white.svg',
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
    <div className="ka">
      {/* 1. Hero — idea and educational purpose */}
      <section className="ka-intro">
        <div aria-hidden="true" className="ka-map">
          <div className="ka-map__element">
            <svg className="ka-map__lines" fill="none" viewBox="0 0 1440 479" xmlns="http://www.w3.org/2000/svg">
              <mask
                height="479"
                id="ka-map-mask"
                maskUnits="userSpaceOnUse"
                style={{ maskType: 'alpha' }}
                width="1440"
                x="0"
                y="0"
              >
                <rect fill="white" height="478" stroke="#EEF7FE" width="1439" x="0.5" y="0.5" />
              </mask>
              <g mask="url(#ka-map-mask)">
                <path d="M1133 -24V500" stroke="currentColor" strokeWidth="26" />
                <path d="M1578.5 121.5H1404C1381.91 121.5 1364 103.591 1364 81.5V-5" stroke="currentColor" strokeWidth="26" />
                <path
                  d="M1468 500V401C1468 378.909 1450.09 361 1428 361H1080C1057.91 361 1040 378.909 1040 401V500"
                  stroke="currentColor"
                  strokeWidth="26"
                />
                <path d="M1735.5 -18L1200.5 519" stroke="currentColor" strokeWidth="26" />
                <path d="M258 125.5H83.5C61.4086 125.5 43.5 107.591 43.5 85.5V-1" stroke="currentColor" strokeWidth="26" />
                <path
                  d="M112 523V424C112 401.909 94.0914 384 72 384H-276C-298.091 384 -316 401.909 -316 424V523"
                  stroke="currentColor"
                  strokeWidth="26"
                />
                <path d="M444 -53L-112 505" stroke="currentColor" strokeWidth="26" />
              </g>
            </svg>

            <div className="ka-map__icon ka-map__icon--1">
              <svg fill="none" viewBox="0 0 67 56" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="26.1477" width="66.5579" y="29.7325" />
                <path
                  className="ka-map__cutout"
                  d="M16.64 40.2289C19.7032 40.2291 22.1859 42.7345 22.1859 45.8246C22.1859 46.1567 22.185 46.482 22.1781 46.7982H22.1859V55.933H11.0931V46.7982H11.1009C11.094 46.482 11.0931 46.1567 11.0931 45.8246C11.0931 42.7344 13.5766 40.2289 16.64 40.2289Z"
                  fill="currentColor"
                />
                <path
                  className="ka-map__cutout"
                  d="M49.9189 40.2289C52.9821 40.2291 55.4648 42.7345 55.4648 45.8246C55.4648 46.1567 55.4639 46.482 55.457 46.7982H55.4648V55.933H44.3721V46.7982H44.3799C44.373 46.482 44.3721 46.1567 44.3721 45.8246C44.3721 42.7344 46.8556 40.2289 49.9189 40.2289Z"
                  fill="currentColor"
                />
                <path d="M33.2788 29.7324H66.5577L49.9183 13.0929L33.2788 29.7324Z" fill="currentColor" />
                <path
                  d="M49.9185 21.4128V7.79491M49.9185 7.79491V2.00007H60.0594V7.79491H54.9889H49.9185Z"
                  stroke="currentColor"
                  strokeWidth="3.75796"
                />
                <rect fill="currentColor" height="5.79484" width="9.85123" x="50.2085" y="2.28986" />
              </svg>
            </div>

            <div className="ka-map__icon ka-map__icon--2">
              <svg fill="none" viewBox="0 0 36 58" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="26.58" width="35.3927" y="31.0076" />
                <path
                  className="ka-map__cutout"
                  d="M17.6964 36.2C19.6 36.2002 21.15 37.75 21.15 39.68C21.15 39.9 21.149 40.11 21.144 40.32H21.15V46.2H14.2426V40.32H14.2484C14.2435 40.11 14.2426 39.9 14.2426 39.68C14.2426 37.75 15.7926 36.2 17.6964 36.2Z"
                  fill="currentColor"
                />
                <path
                  className="ka-map__cutout"
                  d="M17.6964 47.2C20.2 47.2002 22.25 49.25 22.25 51.78C22.25 52.05 22.249 52.32 22.243 52.58H22.25V57.5876H13.1426V52.58H13.1494C13.1435 52.32 13.1426 52.05 13.1426 51.78C13.1426 49.25 15.1926 47.2 17.6964 47.2Z"
                  fill="currentColor"
                />
                <path d="M0 31.0077H35.3927L17.6964 14.4579L0 31.0077Z" fill="currentColor" />
                <path
                  d="M17.4316 21.4128V7.7949M17.4316 7.7949V2.00006H27.5726V7.7949H22.5021H17.4316Z"
                  stroke="currentColor"
                  strokeWidth="3.75796"
                />
                <rect fill="currentColor" height="5.79484" width="9.85123" x="17.7217" y="2.28976" />
              </svg>
            </div>

            <div className="ka-map__icon ka-map__icon--3">
              <svg fill="none" viewBox="0 0 67 55" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="26.1477" width="66.5579" y="28.1478" />
                <path
                  className="ka-map__cutout"
                  d="M16.64 38.6441C19.7032 38.6443 22.1859 41.1497 22.1859 44.2398C22.1859 44.5719 22.185 44.8972 22.1781 45.2134H22.1859V54.3482H11.0931V45.2134H11.1009C11.094 44.8972 11.0931 44.5719 11.0931 44.2398C11.0931 41.1496 13.5766 38.6441 16.64 38.6441Z"
                  fill="currentColor"
                />
                <path
                  className="ka-map__cutout"
                  d="M49.9189 38.6441C52.9821 38.6443 55.4648 41.1497 55.4648 44.2398C55.4648 44.5719 55.4639 44.8972 55.457 45.2134H55.4648V54.3482H44.3721V45.2134H44.3799C44.373 44.8972 44.3721 44.5719 44.3721 44.2398C44.3721 41.1496 46.8556 38.6441 49.9189 38.6441Z"
                  fill="currentColor"
                />
                <path d="M33.2788 28.1478H66.5577L49.9183 11.5083L33.2788 28.1478Z" fill="currentColor" />
                <path
                  d="M49.9185 21.4128V7.79495M49.9185 7.79495V2.00011H60.0594V7.79495H54.9889H49.9185Z"
                  stroke="currentColor"
                  strokeWidth="3.75796"
                />
                <rect fill="currentColor" height="5.79484" width="9.85123" x="50.2085" y="2.28993" />
              </svg>
            </div>

            <div className="ka-map__icon ka-map__icon--4">
              <svg fill="none" viewBox="0 0 65 68" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="31.6942" width="64.1808" y="36.0712" />
                <path d="M9.44397 17.8469L0 36.169L18.8888 36.169L9.44397 17.8469Z" fill="currentColor" />
                <path d="M54.608 17.8469L45.1641 36.169L64.0528 36.169L54.608 17.8469Z" fill="currentColor" />
                <rect fill="currentColor" height="18.2242" width="45.1643" x="9.5083" y="17.8469" />
                <path
                  className="ka-map__cutout"
                  d="M15.0552 52C18.1183 52.0002 20.6011 54.5056 20.6011 57.5957C20.6011 57.9278 20.6002 58.2531 20.5933 58.5693H20.6011V67.7041H9.5083V58.5693H9.51611C9.50922 58.2531 9.5083 57.9278 9.5083 57.5957C9.5083 54.5055 11.9918 52 15.0552 52Z"
                  fill="currentColor"
                />
                <path
                  className="ka-map__cutout"
                  d="M31.6948 52C34.758 52.0002 37.2407 54.5056 37.2407 57.5957C37.2407 57.9278 37.2398 58.2531 37.2329 58.5693H37.2407V67.7041H26.1479V58.5693H26.1558C26.1489 58.2531 26.1479 57.9278 26.1479 57.5957C26.1479 54.5055 28.6315 52 31.6948 52Z"
                  fill="currentColor"
                />
                <path
                  className="ka-map__cutout"
                  d="M48.334 52C51.3971 52.0002 53.8799 54.5056 53.8799 57.5957C53.8799 57.9278 53.879 58.2531 53.8721 58.5693H53.8799V67.7041H42.7871V58.5693H42.7949C42.788 58.2531 42.7871 57.9278 42.7871 57.5957C42.7871 54.5055 45.2707 52 48.334 52Z"
                  fill="currentColor"
                />
                <path
                  className="ka-map__cutout"
                  d="M15.0552 32.1094C18.1183 32.1096 20.6011 34.615 20.6011 37.7051C20.6011 38.0372 20.6002 38.3625 20.5933 38.6787H20.6011V47.8135H9.5083V38.6787H9.51611C9.50922 38.3625 9.5083 37.7051C9.5083 34.6149 11.9918 32.1094 15.0552 32.1094Z"
                  fill="currentColor"
                />
                <path
                  className="ka-map__cutout"
                  d="M31.6948 32.1094C34.758 32.1096 37.2407 34.615 37.2407 37.7051C37.2407 38.0372 37.2398 38.3625 37.2329 38.6787H37.2407V47.8135H26.1479V38.6787H26.1558C26.1489 38.3625 26.1479 37.7051C26.1479 34.6149 28.6315 32.1094 31.6948 32.1094Z"
                  fill="currentColor"
                />
                <path
                  className="ka-map__cutout"
                  d="M48.334 32.1094C51.3971 32.1096 53.8799 34.615 53.8799 37.7051C53.8799 38.0372 53.879 38.3625 53.8721 38.6787H53.8799V47.8135H42.7871V38.6787H42.7949C42.788 38.3625 42.7871 37.7051C42.7871 34.6149 45.2707 32.1094 48.334 32.1094Z"
                  fill="currentColor"
                />
                <path
                  d="M32.4863 21.4128V7.7949M32.4863 7.7949V2.00006H42.6273V7.7949H37.5568H32.4863Z"
                  stroke="currentColor"
                  strokeWidth="3.75796"
                />
                <rect fill="currentColor" height="5.79484" width="9.85123" x="32.7759" y="2.28972" />
              </svg>
            </div>

            <div className="ka-map__icon ka-map__icon--5">
              <svg fill="none" viewBox="0 0 36 58" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="26.58" width="35.3927" y="31.2274" />
                <path
                  className="ka-map__cutout"
                  d="M17.6964 36.42C19.6 36.4202 21.15 37.97 21.15 39.9C21.15 40.12 21.149 40.33 21.144 40.54H21.15V46.42H14.2426V40.54H14.2484C14.2435 40.33 14.2426 40.12 14.2426 39.9C14.2426 37.97 15.7926 36.42 17.6964 36.42Z"
                  fill="currentColor"
                />
                <path
                  className="ka-map__cutout"
                  d="M17.6964 47.42C20.2 47.4202 22.25 49.47 22.25 52C22.25 52.27 22.249 52.54 22.243 52.8H22.25V57.8074H13.1426V52.8H13.1494C13.1435 52.54 13.1426 52.27 13.1426 52C13.1426 49.47 15.1926 47.42 17.6964 47.42Z"
                  fill="currentColor"
                />
                <path d="M0 31.2275H35.3927L17.6964 14.6777L0 31.2275Z" fill="currentColor" />
                <path
                  d="M17.4316 21.4128V7.7949M17.4316 7.7949V2.00006H27.5726V7.7949H22.5021H17.4316Z"
                  stroke="currentColor"
                  strokeWidth="3.75796"
                />
                <rect fill="currentColor" height="5.79484" width="9.85123" x="17.7217" y="2.28976" />
              </svg>
            </div>
          </div>
        </div>

        <div className="ka-contain">
          <div className="ka-intro__copy">
            <h2>Bring the real world into your teaching</h2>
            <p>
              Our custom forecasting competitions bring learning to life, building sharp critical thinking as students compete to test their theory against real-world events.
            </p>
            <a className="ka-btn" href={ENQUIRE_HREF}>
              {CTA_LABEL}
            </a>
          </div>

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
              src="/assets/placeholders/khan/impact-coach.svg"
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
              <img alt="" src={assetUrl('/assets/placeholders/khan/headshot-1.webp')} />
              <div>
                <strong>Dr Maria Psyllou</strong>
                <span>Imperial College London</span>
              </div>
            </div>
          </blockquote>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="ka-close" id="ka-close">
        <div className="ka-shape" aria-hidden="true" />
        <div className="ka-contain">
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
