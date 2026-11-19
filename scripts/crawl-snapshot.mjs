import { createServer } from 'vite'

const SITE_NAME = 'Institute for Prediction Science'
const CONTACT_EMAIL = 'info@predictionscience.org'
const CAREERS_EMAIL = 'careers@predictionscience.org'
const RESEARCH_EMAIL = 'research@predictionscience.org'
const BLOG_URL = 'https://predictionscience.substack.com'
const LINKEDIN_URL = 'https://www.linkedin.com/company/institute-for-prediction-science'
const X_URL = 'https://x.com/PredictionSci'
const LEGAL_UPDATED = '17 November 2026'

const NAV = `<nav aria-label="Primary">
<a href="/">Home</a>
<a href="/about/">About</a>
<a href="/research/">Research</a>
<a href="/careers/">Careers</a>
<a href="${BLOG_URL}">Blog</a>
</nav>
<nav aria-label="Policies">
<a href="/privacy-policy/">Privacy Policy</a>
<a href="/cookie-policy/">Cookie Policy</a>
</nav>`

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function page(main) {
  return `${NAV}<main>${main}</main>`
}

function paragraphs(items) {
  return items.map((text) => `<p>${esc(text)}</p>`).join('')
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
}

function blocksHtml(blocks) {
  return blocks
    .map((block) => {
      if (block.type === 'p' || block.type === 'formula') return `<p>${esc(block.text)}</p>`
      if (block.type === 'note') return `<aside>${esc(block.text)}</aside>`
      if (block.type === 'h3') return `<h3>${esc(block.text)}</h3>`
      if (block.type === 'ul' || block.type === 'ol') {
        const items = block.items.map((item) => `<li>${esc(item)}</li>`).join('')
        return `<${block.type}>${items}</${block.type}>`
      }
      if (block.type === 'table') {
        const caption = block.caption ? `<caption>${esc(block.caption)}</caption>` : ''
        const head = block.headers.map((header) => `<th scope="col">${esc(header)}</th>`).join('')
        const rows = block.rows
          .map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`)
          .join('')
        return `<table>${caption}<thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`
      }
      return ''
    })
    .join('')
}

function benefitsParagraph(job, formatMoney) {
  if (!job.salary) return job.benefits
  const min = formatMoney(job.salary.currency, job.salary.min)
  const max = formatMoney(job.salary.currency, job.salary.max)
  const extra = job.benefits.replace(/^We offer a competitive salary along with /i, '').replace(/\.$/, '')
  return `We offer a salary of ${min} to ${max} per year, along with ${extra}.`
}

function jobMain(job, jobsMod) {
  const open = jobsMod.isJobActive(job, jobsMod.isoWeek(new Date()))
  const closing = open ? jobsMod.formatClosingDate(jobsMod.jobClosingDate(job)) : 'Closed'
  const email = job.applicationContact?.email || CAREERS_EMAIL
  const mailto = `mailto:${email}?subject=${encodeURIComponent(job.title)}`
  const facts = [job.type, job.location, job.department, job.remoteOptions, closing || 'No closing date']
  const body = open
    ? `<section><h2>About the Institute</h2><p>${esc(job.aboutCompany)}</p></section>
<section><h2>What we are looking for</h2><p>${esc(job.rolePurpose)}</p></section>
<section><h2>Key responsibilities</h2>${list(job.keyResponsibilities)}</section>
<section><h2>Requirements</h2>${list([job.requirements.experience, ...job.requirements.skills, job.requirements.qualifications])}</section>
${job.desirable?.length ? `<section><h2>Desirable</h2>${list(job.desirable)}</section>` : ''}
<section><h2>Benefits</h2><p>${esc(benefitsParagraph(job, jobsMod.formatMoney))}</p></section>
<section><h2>Equal opportunities</h2><p>${esc(job.equalOpportunities)}</p></section>
<section><h2>How to apply</h2><p>Send your CV and a covering letter to <a href="${esc(mailto)}">${esc(email)}</a>. Include the job title in the subject line.</p></section>`
    : `<section><h2>This role is closed</h2><p>It is not open for applications this week. Open roles change through the year.</p><p><a href="/careers/">See current roles</a></p></section>`

  return page(`<article>
<p><a href="/careers/">Careers</a></p>
<h1>${esc(job.title)}</h1>
<p>${facts.map((fact) => `<span>${esc(fact)}</span>`).join(' ')}</p>
${body}
</article>`)
}

function homeMain() {
  return page(`<article>
<h1>Advancing the science of prediction</h1>
<p>We bridge the gap between academic research and real-world application by turning forecasting into a practical, measurable skill.</p>
<section>
<h2>What is Prediction Science?</h2>
${paragraphs([
  'Prediction science gives us a structured way to think about the future by breaking problems into smaller parts, evaluating available evidence, and using probabilistic thinking to measure likelihood.',
  'Research shows that forecasting is a trainable skill that improves with practice.',
])}
</section>
<section>
<h2>Building better judgment</h2>
${paragraphs([
  'Just like any other skill, you can improve your forecasting ability through deliberate practice. Most of our predictions go unrecorded and unanalysed, which means we miss the chance to learn from them.',
  'We create practical ways to strengthen your critical thinking, highlight your personal biases, and build a better understanding of the future.',
])}
</section>
<section>
<p>What we do</p>
<h1>Unlocking the power of forecasting</h1>
<section>
<p>Competitions</p>
<h3>Custom forecasting challenges</h3>
<p>We design and run fully managed forecasting competitions for universities, corporate teams, and institutions. We turn subject matter into engaging, measurable prediction challenges so you can focus on the learning, not the setup.</p>
${list([
  'Score the same questions the same way, against real outcomes',
  'Shape the contest around decisions your organisation faces',
  'See who was calibrated and which approaches held up',
])}
</section>
<section>
<p>Training</p>
<h3>Practical judgment programs</h3>
<p>We deliver practical training programs that improve judgment and critical thinking. Through hands-on practice, we teach students, researchers, and professionals how to evaluate evidence, account for uncertainty, and improve predictive accuracy over time.</p>
${list([
  'Practice forecasts with a clear review loop',
  'Spot overconfidence and missed alternatives',
  'Build a personal or team record over time',
])}
</section>
<section>
<p>Labs</p>
<h3>Forecasting innovation lab</h3>
<p>We conduct applied research, build software, and incubate new tools. Our lab develops practical applications and spins out solutions for policymakers, industry, and the public.</p>
${list([
  'Study methods that hold up against real outcomes',
  'Turn prediction-market data into usable insight',
  'Build tools that support real decisions',
])}
</section>
</section>
<section>
<p>Contact us</p>
<h2>Have a forecasting project in mind?</h2>
<p>Whether you want to run a competition, train a team, or explore a research question, we would be glad to hear what you have in mind.</p>
<p><a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('About the institute')}">Get in touch</a></p>
</section>
</article>`)
}

function aboutMain() {
  return page(`<article>
<h1>Shaping the future of forecasting</h1>
<p>Bringing forecasting research into real-world practice.</p>
<section>
<p>About</p>
<p>The ${esc(SITE_NAME)} is dedicated to advancing the science and practice of forecasting. We bring together research, education and practical application to develop better ways of understanding uncertainty, anticipating future events and making informed decisions.</p>
</section>
<section>
<p>Our mission</p>
${paragraphs([
  'We are an institute with a mission to advance prediction science and improve how individuals and organisations navigate an uncertain future. We believe that a world better equipped to anticipate what comes next is a world better prepared to make informed decisions, recognise emerging opportunities and respond to complex challenges.',
  'We recognise that the ability to make accurate predictions is essential to effective decision-making, yet remains an underdeveloped skill in many areas of society. Too often, judgements about the future go unrecorded, assumptions go unchallenged and opportunities to learn from experience are lost. We aim to make forecasting a practical, measurable and continuously improving discipline.',
  'Through research, education and practice, we work to bridge the gap between academic advances in prediction science and their real-world application. We develop forecasting competitions, deliver practical training programmes and build tools that help people evaluate evidence, reason about uncertainty and improve their predictive judgement.',
  'Our focus is not simply on predicting what will happen, but on developing the knowledge, methods and capabilities that enable individuals and institutions to make better decisions about what comes next.',
])}
</section>
<section>
<p>Partnerships</p>
<h2>Building a stronger foundation for better predictions</h2>
<p>Alongside pursuing our own research agenda, much of the ${esc(SITE_NAME)}\u2019s work is shaped through collaboration with other organisations. We believe partnerships are essential to advancing the field, bringing together complementary expertise, broadening perspectives and translating research into practical applications. We work with universities, research institutions, businesses, policymakers and civil society to develop new approaches to forecasting, strengthen predictive capabilities and expand the real-world impact of prediction science.</p>
</section>
<section>
<p>Connect</p>
<h2>Interested in working with us?</h2>
<p>Whether you are interested in our work, would like to explore a potential partnership, have an idea to share or simply want to learn more about the Institute, we would be glad to hear from you.</p>
<p><a href="mailto:${RESEARCH_EMAIL}?subject=${encodeURIComponent('Research enquiry')}">Get in touch</a></p>
</section>
</article>`)
}

function researchMain(research) {
  const publications = research
    .researchFeed()
    .map((item) => {
      const href = item.href.endsWith('/') ? item.href : `${item.href}/`
      return `<li><a href="${esc(href)}"><time>${esc(item.date)}</time> <span>${esc(item.title)}</span> ${item.excerpt ? `<span>${esc(item.excerpt)}</span>` : ''}</a></li>`
    })
    .join('')

  return page(`<article>
<h1>Pioneering research into prediction science</h1>
<p>Exploring new applications of predictive science across disciplines and areas of human knowledge.</p>
<section>
<p>Research</p>
<p>We study how people and institutions reason about the future and make decisions in the face of uncertainty. Our work brings prediction science into different areas of academic enquiry, connecting formal approaches to forecasting with the wider study of human thought, collective behaviour and institutional decision-making.</p>
</section>
<section>
<h2>Computational Social Science</h2>
<p>The formation of collective expectations and how information shapes what groups believe about the future, including the conditions that make collective judgement more accurate and the social structures that influence it.</p>
<h2>Decision Science</h2>
<p>The psychology of anticipating future events, including how people perceive uncertainty, form expectations and use their beliefs to navigate an unpredictable world.</p>
<h2>Statistical Modelling</h2>
<p>The mathematical foundations of prediction and the interpretation of uncertainty, including how probabilistic approaches improve our understanding of complex systems and the evaluation of what we believe will happen.</p>
${paragraphs([
  'Our research spans established academic disciplines while remaining open to questions that fall between them. We are interested in how predictive thinking can deepen existing fields of study, reveal new connections and offer different ways of approaching longstanding problems.',
  'Our interests also extend into political science, economics, public policy and the psychology of future thinking. The boundaries between disciplines are not fixed, and the scope of our work develops as new questions and opportunities emerge.',
])}
</section>
<section>
<p>Support</p>
<h2>Independent backing</h2>
<p>Each year, we fund a select group of external researchers and independent projects. We offer multi-year support that gives you the freedom and resources to tackle complex problems without the pressure for premature results. We evaluate every project on its own merits rather than how well it fits a predefined programme, and we actively welcome ideas from a wide range of backgrounds and perspectives. If you are working in a related area, reach out to the Institute directly to discuss your work.</p>
</section>
<section>
<p>Publications</p>
<ol>${publications}</ol>
</section>
<section>
<p>Contact us</p>
<h2>Have a research idea in mind?</h2>
<p>Whether you have an idea for a research project, are curious about how prediction science could be applied in a new context, or simply want to explore a potential collaboration, we would be glad to hear from you.</p>
<p><a href="mailto:${RESEARCH_EMAIL}?subject=${encodeURIComponent('Research enquiry')}">Get in touch</a></p>
</section>
</article>`)
}

function careersMain(openJobs) {
  const roles = openJobs
    .map((job) => {
      return `<li><a href="/careers/${esc(job.id)}/"><span>${esc(job.title)}</span> <span>${esc(job.location)}</span> <span>${esc(job.type)}</span> <span>${esc(job.department)}</span></a> <p>${esc(job.rolePurpose)}</p></li>`
    })
    .join('')
  return page(`<article>
<p>Careers</p>
<h1>Join the Institute</h1>
<p>We are actively hiring for the following roles</p>
<ul>${roles}</ul>
<section>
<p>Apply</p>
<h2>Don\u2019t see a role that fits?</h2>
<p>Send your CV and a short covering note. We read general applications alongside the roles listed above.</p>
<p><a href="mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent('General application')}">Get in touch</a></p>
</section>
</article>`)
}

function articleMain(research, slug) {
  const item = research.findResearch(slug)
  const content = item ? research.articleContent(item) : null
  if (!item || !content) {
    throw new Error(`No article content for /research/${slug}`)
  }
  const intro = paragraphs(content.intro)
  const sections = content.sections
    .map(
      (section) =>
        `<section id="${esc(section.id)}"><h2>${esc(section.heading)}</h2>${blocksHtml(section.blocks)}</section>`,
    )
    .join('')
  return page(`<article>
<p><a href="/research/">Research</a></p>
<time>${esc(item.date)}</time>
<h1>${esc(item.title)}</h1>
<p>${esc(content.lead)}</p>
${intro}
${sections}
</article>`)
}

function privacyMain() {
  return page(`<article>
<p>Policies</p>
<h1>Privacy policy</h1>
<p>How the Institute handles personal information when you use this website.</p>
<p>Last updated ${LEGAL_UPDATED}</p>
<section>
<h2>Who we are</h2>
<p>${esc(SITE_NAME)} (\u201cwe\u201d) is a research institute. This policy covers www.predictionscience.org: visits to the site, messages you send us, and the newsletter we point you to. It does not cover a research study, forecasting competition, or training programme. Those activities use their own notice.</p>
<p>Questions about this policy can go to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
</section>
<section>
<h2>What we collect</h2>
<p>This website does not ask you to create an account. We collect very little:</p>
${list([
  'The contents of emails you send us, including your email address.',
  'Standard server logs our host keeps so the site stays available and secure, such as IP address, browser type, and the pages requested.',
])}
<p>Our newsletter is published on Substack. If you subscribe, Substack collects that information under its own policy. We do not run the signup on this website.</p>
</section>
<section>
<h2>How we use it</h2>
<p>We use what you send us to reply, and we use server logs to keep the website working. We do not sell personal information, we do not use it for advertising, and we do not make automated decisions about you.</p>
</section>
<section>
<h2>Cookies</h2>
<p>This website does not set cookies. Details are in our <a href="/cookie-policy/">cookie policy</a>.</p>
</section>
<section>
<h2>Who we share it with</h2>
<p>We share personal information only when we need to:</p>
${list([
  'With the provider that hosts this website, so the site can run.',
  'With Substack, if you choose to subscribe to the newsletter there.',
  'When the law requires it, or to protect the institute, our people, or others.',
])}
</section>
<section>
<h2>How long we keep it</h2>
<p>We keep email enquiries for as long as we need them to respond and keep a record of the exchange, then we delete them. Server logs are kept only for a short period.</p>
</section>
<section>
<h2>Your choices</h2>
<p>You can ask what we hold about you, ask us to correct it, or ask us to delete it. Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. We aim to reply within 30 days.</p>
</section>
<section>
<h2>Children</h2>
<p>This website is not aimed at children, and we do not knowingly collect personal information from them. If you believe we have, email us and we will delete it.</p>
</section>
<section>
<h2>Changes</h2>
<p>We may update this policy. When we do, we change the date at the top of the page.</p>
</section>
</article>`)
}

function cookieMain() {
  return page(`<article>
<p>Policies</p>
<h1>Cookie policy</h1>
<p>This website does not use cookies. This page says what that means.</p>
<p>Last updated ${LEGAL_UPDATED}</p>
<section>
<h2>Cookies on this website</h2>
<p>www.predictionscience.org does not set cookies. There are no advertising cookies, no analytics cookies, and nothing to accept or refuse when you arrive.</p>
<p>How we handle other personal information is in our <a href="/privacy-policy/">privacy policy</a>.</p>
</section>
<section>
<h2>Sites we link to</h2>
<p>Some links leave this website. Those services set their own cookies under their own policies. On this site, that includes:</p>
<ul>
<li><a href="${BLOG_URL}">Our newsletter on Substack</a></li>
<li><a href="${LINKEDIN_URL}">LinkedIn</a></li>
<li><a href="${X_URL}">X</a></li>
</ul>
</section>
<section>
<h2>Your browser</h2>
<p>You can block or delete cookies in your browser settings. Because this site does not set any, that will not change how www.predictionscience.org works.</p>
</section>
<section>
<h2>Changes</h2>
<p>If we start using cookies, we will update this page and the date at the top before we do. Questions can go to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
</section>
</article>`)
}

export async function loadSiteContent() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    const research = await server.ssrLoadModule('/src/data/research.ts')
    const jobsMod = await server.ssrLoadModule('/src/data/jobs.ts')
    return { research, jobsMod }
  } finally {
    await server.close()
  }
}

export function snapshotFor(pathname, content, openJobs) {
  if (pathname === '/') return homeMain()
  if (pathname === '/about') return aboutMain()
  if (pathname === '/research') return researchMain(content.research)
  if (pathname === '/careers') return careersMain(openJobs)
  if (pathname === '/privacy-policy') return privacyMain()
  if (pathname === '/cookie-policy') return cookieMain()
  if (pathname.startsWith('/careers/')) {
    const id = pathname.slice('/careers/'.length).replace(/\/+$/, '')
    const job = openJobs.find((item) => item.id === id) || content.jobsMod.findJob(id)
    if (!job) throw new Error(`No job content for ${pathname}`)
    return jobMain(job, content.jobsMod)
  }
  if (pathname.startsWith('/research/')) {
    const slug = pathname.slice('/research/'.length).replace(/\/+$/, '')
    return articleMain(content.research, slug)
  }
  throw new Error(`No crawl snapshot for ${pathname}`)
}

export const SNAPSHOT_STYLE =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%);border:0;pointer-events:none'

export function injectSnapshot(html, inner) {
  const block = `<div id="root"><div class="crawl-snapshot" inert style="${SNAPSHOT_STYLE}">${inner}</div></div>`
  const marker = '<div id="root"></div>'
  if (!html.includes(marker)) {
    throw new Error('Built HTML is missing <div id="root"></div>')
  }
  const next = html.replace(marker, block)
  if (!next.includes('class="crawl-snapshot"') || !next.includes('<h1') || !next.includes('<nav')) {
    throw new Error('Crawl snapshot did not include a heading and navigation')
  }
  if (next.includes('crawl-snapshot" hidden') || next.includes('display:none')) {
    throw new Error('Crawl snapshot must stay in the HTML text, not display:none')
  }
  return next
}
