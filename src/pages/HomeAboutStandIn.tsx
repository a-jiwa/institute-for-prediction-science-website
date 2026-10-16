import { useState } from 'react'
import { assetUrl } from '../utils/assetUrl'

const AUDIENCE = [
  { title: 'Student', body: 'Working through a round on my own', src: '/assets/placeholders/khan/headshot-1.webp' },
  { title: 'Family', body: 'Following a student from home', src: '/assets/placeholders/khan/headshot-2.webp' },
  { title: 'Coach', body: 'Running a room of teams', src: '/assets/placeholders/khan/headshot-3.webp' },
]

const PROOF = [
  { figure: '180M+', caption: 'registered people' },
  { figure: '63B+', caption: 'minutes of practice' },
  { figure: 'Free', caption: 'for students and coaches' },
  { figure: '15+ years', caption: 'on a single aim' },
]

const COURSES = [
  'Maths, early years',
  'Maths, later years',
  'Maths across grades',
  'Core maths',
  'Aligned drill sets',
  'A second aligned set',
  'Ready-made briefs',
  'Test practice',
  'Extended writing',
  'Science',
  'Social topics',
  'Economics',
  'Computing',
  'Life skills',
  'Shared packs',
  'Coach guides',
]

const BENEFITS = [
  {
    label: 'Students',
    title: 'A path for every person in the room.',
    body: 'Practice lands where someone actually is, with a next step that is clear enough to start.',
    bullets: ['A round that can be assigned quickly', 'A note on who is stuck, and why', 'Practice people want to finish', 'Room for a team that is already ahead'],
  },
  {
    label: 'Coaches',
    title: 'See the round without chasing the scores.',
    body: 'The readout shows the call, the working, and the next brief, in one place.',
    bullets: ['Assign the next round in minutes', 'Spot the same miss across teams', 'Keep the brief at contest level', 'Leave a record a coach can use'],
  },
  {
    label: 'Families',
    title: 'Follow the work without sitting in the room.',
    body: 'A short view of what was practised, what landed, and what comes next.',
    bullets: ['A nightly look at the latest round', 'Plain language, not a score dump', 'A way to encourage the next step', 'Progress that is easy to share'],
  },
]

const STORIES = [
  {
    role: 'Organiser',
    quote: 'When the briefs got harder, the teams stumbled first. That stumble was part of the work, and it showed up in the record.',
    by: 'An organiser',
  },
  {
    role: 'Coach',
    quote: 'The contest stopped being a tool we opened on the side. It became the way the room talked about a call.',
    by: 'A team coach',
  },
  {
    role: 'Family',
    quote: 'The evening check became a habit. I can see what was practised without asking anyone to retell the round.',
    by: 'A parent',
  },
]

const FAQS = [
  {
    q: 'Is the contest free to enter?',
    a: 'Yes. Students and coaches can use the rounds without a fee. The work of writing and scoring them is paid for by supporters.',
  },
  {
    q: 'Do coaches already run rounds this way?',
    a: 'Yes. Rooms already use the briefs for practice, for a live review, and for a record of how a call was made.',
  },
  {
    q: 'Can one round serve teams at different levels?',
    a: 'Yes. A team that is behind gets a step that fills the gap. A team that is ahead gets a step that keeps moving.',
  },
  {
    q: 'Do the rounds change the calls people make?',
    a: 'Steady practice shows up in later scores. The more sound calls a team logs, the more the later round tends to move.',
  },
]

const PRODUCTS = [
  {
    title: 'University contests',
    body: 'Partners get the tools and the support to turn practice into a result, so teams are far more likely to hit the pace you set.',
  },
  {
    title: 'Early rounds',
    body: 'A free set for students in the early years, for a coach in a room or a family at home.',
  },
  {
    title: 'A scored check',
    body: 'The check does more than record a number. It points each team to the support that should come next.',
  },
  {
    title: 'A coach on call',
    body: 'Teams get help whenever they are stuck, and coaches get tools that stay with them through the round.',
  },
  {
    title: 'Tools a coach can keep',
    body: 'Support from donors keeps the classroom tools free, with aligned practice and help for planning the next round.',
  },
]

export function HomeAboutStandIn() {
  const [benefit, setBenefit] = useState(0)
  const [open, setOpen] = useState(0)
  const current = BENEFITS[benefit]

  return (
    <div className="ka">
      <section className="ka-home">
        <div className="ka-contain">
          <h2>Turn large practice goals into results you can see.</h2>
          <p>
            The rounds help a field personalise practice, strengthen the core calls, and support every team, whether it is catching up, keeping pace, or ready to move ahead.
          </p>
          <ul className="ka-audience">
            {AUDIENCE.map((item) => (
              <li key={item.title}>
                <a href="#ka-home-close">
                  <img alt="" src={assetUrl(item.src)} />
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="ka-home__login">Already have an account? Log in</p>
        </div>
      </section>

      <section className="ka-proof">
        <div className="ka-contain">
          <h2>Proof of the work</h2>
          <ul>
            {PROOF.map((item) => (
              <li key={item.caption}>
                <strong>{item.figure}</strong>
                <span>{item.caption}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ka-explore">
        <div className="ka-contain">
          <h2>Explore the rounds</h2>
          <ul>
            {COURSES.map((label, index) => (
              <li key={label}>
                <a href="#ka-home-close">
                  <img alt="" src={assetUrl(`/assets/placeholders/khan/subject-${(index % 10) + 1}.svg`)} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ka-assess">
        <div className="ka-contain">
          <div className="ka-split">
            <div>
              <h2>How a round actually works</h2>
              <p>
                People improve when they can practise often, hear back straight away, and get help at the moment they stall. The contest is built so that can happen.
              </p>
              <ul className="ka-ticks">
                <li>Practice builds the call through aligned skills</li>
                <li>Feedback keeps a team moving when it sticks</li>
                <li>Coach notes show what the room needs next</li>
              </ul>
            </div>
            <div>
              <h2>What the practice adds up to</h2>
              <p>Each sound call builds on the last, closing a gap or pushing a team further. The change is something you can count.</p>
              <ul className="ka-ticks">
                <li>1 sound call, a small lift</li>
                <li>10 sound calls, a clear lift</li>
                <li>60 sound calls, a wide lift</li>
              </ul>
              <a className="ka-btn" href="#ka-home-close">
                See the record
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="ka-benefits">
        <div className="ka-contain">
          <h2>What it changes for students, coaches, and families</h2>
          <div className="ka-benefits__tabs" role="tablist">
            {BENEFITS.map((item, index) => (
              <button
                aria-selected={benefit === index}
                key={item.label}
                onClick={() => setBenefit(index)}
                role="tab"
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="ka-split">
            <div>
              <h3>{current.title}</h3>
              <p>{current.body}</p>
              <ul className="ka-ticks">
                {current.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <div className="ka-actions">
                <a className="ka-btn" href="#ka-home-close">
                  Join free
                </a>
                <a className="ka-btn ka-btn--text" href="#ka-home-close">
                  See the coach tools
                </a>
              </div>
            </div>
            <img alt="" className="ka-benefits__shot" src={assetUrl('/assets/placeholders/khan/teach.png')} />
          </div>
        </div>
      </section>

      <section className="ka-stories">
        <div className="ka-contain">
          <h2>Stories from the rooms using it</h2>
          <ul>
            {STORIES.map((story) => (
              <li key={story.role}>
                <p className="ka-kicker">{story.role}</p>
                <blockquote>
                  <p>{story.quote}</p>
                </blockquote>
                <span>{story.by}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ka-mission">
        <div className="ka-contain">
          <div className="ka-split">
            <div>
              <h2>Built for the work. Not for a margin.</h2>
              <p>
                This is a nonprofit with a plain aim: a free, serious education for anyone, anywhere. Donors and partners fund it, so the work can stay on learning.
              </p>
            </div>
            <div className="ka-actions">
              <a className="ka-btn" href="#ka-home-close">
                Give
              </a>
              <a className="ka-btn ka-btn--text" href="#ka-about">
                Read the aim
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="ka-faq">
        <div className="ka-contain">
          <h2>Questions people ask, answered.</h2>
          <div className="ka-acc__list">
            {FAQS.map((item, index) => {
              const expanded = open === index
              return (
                <div key={item.q}>
                  <button aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : index)} type="button">
                    <span>{item.q}</span>
                    <svg aria-hidden="true" className="ka-acc__chevron" viewBox="0 0 66 70">
                      <path d="M17 2L50 35L17 68" />
                    </svg>
                  </button>
                  {expanded && <p>{item.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="ka-home-close" id="ka-home-close">
        <div className="ka-contain">
          <h2>Strengthen every room.</h2>
          <p>From one student to a whole field, this is where the practice happens.</p>
          <a className="ka-btn" href="#ka-about">
            Get started
          </a>
        </div>
      </section>

      <section className="ka-about" id="ka-about">
        <div className="ka-contain">
          <p className="ka-kicker">About us</p>
          <h2>Our aim is a free, world-class education for anyone, anywhere.</h2>
        </div>
      </section>

      <section className="ka-reach">
        <div className="ka-contain">
          <h2>The rounds are open in 190+ countries and in 55+ languages.</h2>
          <ul className="ka-reach__pair">
            <li>
              <strong>200M</strong>
              <span>registered people</span>
            </li>
            <li>
              <strong>70B</strong>
              <span>minutes of practice</span>
            </li>
          </ul>
          <h3>In the last school year:</h3>
          <ul className="ka-reach__year">
            <li>
              <strong>100M</strong>
              <span>people who used a round</span>
            </li>
            <li>
              <strong>20M</strong>
              <span>new registered people</span>
            </li>
            <li>
              <strong>12B</strong>
              <span>new minutes of practice</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="ka-assess">
        <div className="ka-contain">
          <h2>Teams are slipping on the skills that matter most.</h2>
          <div className="ka-prose">
            <p>Here and elsewhere, the latest figures show many people missing basic marks in the core subjects.</p>
            <p>Some are climbing back. The gap is still widening for the people who were already behind.</p>
            <p>The holes are in the foundations, the exact skills a later round depends on.</p>
          </div>
        </div>
      </section>

      <section className="ka-assess">
        <div className="ka-contain">
          <div className="ka-split">
            <div>
              <h2>The practice works.</h2>
              <p>More sound calls on these rounds line up with higher later scores.</p>
              <p>For a typical team, that extra work can be the difference between falling behind and meeting the mark.</p>
              <a className="ka-btn ka-btn--text" href="#ka-home-close">
                Read the research
              </a>
            </div>
            <img alt="" className="ka-benefits__shot" src={assetUrl('/assets/placeholders/khan/split.png')} />
          </div>
        </div>
      </section>

      <section className="ka-assess">
        <div className="ka-contain">
          <h2>No gap. Learning that stays.</h2>
          <div className="ka-prose">
            <p>The rounds are free for anyone, a student, a coach, or a family. They are built to hold attention until a hard idea finally clicks.</p>
            <p>Each path is personal, aimed at the calls that still need work and at the gaps those calls leave behind.</p>
            <p>Under it is a free platform with hundreds of rounds across the core subjects, from the early years through the first years of college.</p>
          </div>
        </div>
      </section>

      <section className="ka-band">
        <div className="ka-contain">
          <h2>Better results start in the room</h2>
          <p className="ka-band__note">
            We work beside coaches to bring the rounds to the place where most of the practice already happens.
          </p>
          <ul className="ka-products">
            {PRODUCTS.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
          <blockquote className="ka-pull">
            <p>
              It shows you how to learn from the call you missed. It keeps you on the question, and it offers another way through. When I miss, I want to know why.
            </p>
          </blockquote>
        </div>
      </section>

      <section className="ka-assess">
        <div className="ka-contain">
          <h2>Driven by care. Shown in the results.</h2>
          <p className="ka-prose">
            A free education for everyone is a large aim. It draws people from teaching and from technology, led by a small team and a board. Care and experience are what keep the rounds honest.
          </p>
        </div>
      </section>

      <section className="ka-gift">
        <div className="ka-contain">
          <h2>Give the gift of a round.</h2>
          <p>As a nonprofit, the work depends on support if the next million people are going to have it too.</p>
          <a className="ka-btn" href="#ka-home-close">
            Give today
          </a>
        </div>
      </section>
    </div>
  )
}
