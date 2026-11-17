import fs from 'node:fs'
import path from 'node:path'

const DIST = 'dist'
// Custom domain is served at the root, so CSS asset URLs stay /assets/...
const BASE = ''

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  })
}

function fixCssAssetPaths(file) {
  const content = fs.readFileSync(file, 'utf8')
  const updated = content
    .replace(/url\((['"]?)\/assets\//g, `url($1${BASE}/assets/`)
    .replace(/url\(\/assets\//g, `url(${BASE}/assets/`)

  if (updated !== content) {
    fs.writeFileSync(file, updated)
  }
}

for (const file of walk(DIST)) {
  if (file.endsWith('.css')) {
    fixCssAssetPaths(file)
  }
}

// GitHub Pages serves a real file per URL. Write one HTML file for each public
// page so the title, description, and canonical are present before JavaScript runs.
const SITE = 'https://www.predictionscience.org'
const SITE_NAME = 'Institute for Prediction Science'
const OG_IMAGE = `${SITE}/assets/img/og/default.jpg`
const OG_ALT = `${SITE_NAME}. Advancing the science of prediction.`
const HOME_DESCRIPTION =
  'The Institute for Prediction Science is an independent research institute with a mission to improve how people and organisations forecast uncertain events and make better decisions.'
const HOME_SHARE = HOME_DESCRIPTION

function escapeAttr(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}

function shareBlock(share) {
  const lines = [
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:title" content="${escapeAttr(share.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(share.ogDescription)}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:secure_url" content="${OG_IMAGE}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeAttr(OG_ALT)}" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    ...(share.url ? [`<meta property="og:url" content="${share.url}" />`] : []),
    `<meta property="og:type" content="${share.type}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@PredictionSci" />`,
    `<meta name="twitter:title" content="${escapeAttr(share.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(share.ogDescription)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttr(OG_ALT)}" />`,
  ]
  return `<!--share-start-->\n    ${lines.join('\n    ')}\n    <!--share-end-->`
}

function applyShare(html, share, { canonical = true } = {}) {
  const title = share.title === SITE_NAME ? SITE_NAME : `${share.title} — ${SITE_NAME}`
  let next = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`)
  next = next.replace(
    /<meta name="description" content="[\s\S]*?"\s*\/>/,
    `<meta name="description" content="${escapeAttr(share.description)}" />`,
  )
  const robots = `<meta name="robots" content="${escapeAttr(share.robots)}" />`
  if (next.includes('name="robots"')) {
    next = next.replace(/<meta name="robots" content="[\s\S]*?"\s*\/>/, robots)
  } else {
    next = next.replace(/<meta name="description" content="[\s\S]*?"\s*\/>/, (tag) => `${tag}\n    ${robots}`)
  }
  if (canonical) {
    const link = `<link rel="canonical" href="${escapeAttr(share.url)}" />`
    if (next.includes('rel="canonical"')) {
      next = next.replace(/<link rel="canonical" href="[\s\S]*?"\s*\/>/, link)
    }
  } else {
    next = next.replace(/\s*<link rel="canonical" href="[\s\S]*?"\s*\/>/, '')
  }
  const block = shareBlock(share)
  if (next.includes('<!--share-start-->')) {
    next = next.replace(/<!--share-start-->[\s\S]*?<!--share-end-->/, block)
  }
  return next
}

function shortBlurb(text, max = 160) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const slice = clean.slice(0, max)
  const cut = slice.lastIndexOf(' ')
  return `${(cut > 60 ? slice.slice(0, cut) : slice).replace(/[.,;:]+$/, '')}…`
}

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function periodIncludesWeek(period, currentWeek) {
  const endWeek = period.startWeek + period.duration - 1
  if (endWeek > 52) {
    if (currentWeek >= period.startWeek && currentWeek <= 52) return true
    return currentWeek >= 1 && currentWeek <= endWeek - 52
  }
  return currentWeek >= period.startWeek && currentWeek <= endWeek
}

function isJobActive(job, currentWeek) {
  if (!job.activePeriods || job.activePeriods.length === 0) return true
  return job.activePeriods.some((period) => periodIncludesWeek(period, currentWeek))
}

const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const research = JSON.parse(fs.readFileSync('src/data/research-all.json', 'utf8'))
const jobs = JSON.parse(fs.readFileSync('src/data/jobs.json', 'utf8'))
const openJobs = jobs.filter((job) => isJobActive(job, isoWeek(new Date())))

const pages = [
  {
    path: '/',
    title: SITE_NAME,
    description: HOME_DESCRIPTION,
    ogDescription: HOME_SHARE,
    type: 'website',
    robots: 'index, follow',
  },
  {
    path: '/about',
    title: 'About',
    description: 'Our mission, team, and approach to advancing empirical forecasting and decision science.',
    type: 'website',
    robots: 'index, follow',
  },
  {
    path: '/services/lab',
    title: 'Research',
    description: 'Academic papers, experiments, and ongoing projects on measuring and improving prediction.',
    type: 'website',
    robots: 'index, follow',
  },
  {
    path: '/careers',
    title: 'Careers',
    description:
      'Open roles at the Institute for Prediction Science. Listings change by week. Filter by location, department, and experience.',
    type: 'website',
    robots: 'index, follow',
  },
  ...openJobs.map((job) => ({
    path: `/careers/${job.id}`,
    title: job.title,
    description: shortBlurb(`${job.title} at ${SITE_NAME}, ${job.location}. ${job.rolePurpose}`),
    type: 'website',
    robots: 'index, follow',
  })),
  {
    path: '/privacy-policy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect personal information on this website.',
    type: 'website',
    robots: 'index, follow',
  },
  {
    path: '/cookie-policy',
    title: 'Cookie Policy',
    description: 'Information about cookies and tracking on this site. We do not use cookies.',
    type: 'website',
    robots: 'index, follow',
  },
  ...research
    .filter((item) => item.href?.startsWith('/research/'))
    .map((item) => ({
      path: item.href,
      title: item.title,
      description: item.excerpt,
      type: 'article',
      robots: 'index, follow',
    })),
]

for (const page of pages) {
  const share = {
    title: page.title,
    description: page.description,
    ogDescription: page.ogDescription || page.description,
    url: page.path === '/' ? `${SITE}/` : `${SITE}${page.path}`,
    type: page.type,
    robots: page.robots,
  }
  const html = applyShare(shell, share)
  if (page.path === '/') {
    fs.writeFileSync(path.join(DIST, 'index.html'), html)
    continue
  }
  const file = path.join(DIST, page.path.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
}

fs.writeFileSync(
  path.join(DIST, '404.html'),
  applyShare(
    shell,
    {
      title: 'Page not found',
      description: 'This page could not be found.',
      ogDescription: 'This page could not be found.',
      url: '',
      type: 'website',
      robots: 'noindex, follow',
    },
    { canonical: false },
  ),
)

const required = [
  'index.html',
  '404.html',
  'CNAME',
  'robots.txt',
  'sitemap.xml',
  'favicon.svg',
  'favicon.ico',
  'site.webmanifest',
  'about/index.html',
  'services/lab/index.html',
  'careers/index.html',
  'privacy-policy/index.html',
  'cookie-policy/index.html',
  'assets/img/og/default.jpg',
]
for (const file of required) {
  if (!fs.existsSync(path.join(DIST, file))) {
    throw new Error(`GitHub Pages build is missing ${file}`)
  }
}
console.log(`Wrote ${pages.length} HTML pages for GitHub Pages`)
