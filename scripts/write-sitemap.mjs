import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.predictionscience.org'
const root = process.cwd()

const MONTHS = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
}

function fileDate(file) {
  return fs.statSync(path.join(root, file)).mtime.toISOString().slice(0, 10)
}

function lastmodFromDate(date) {
  if (!date || date === 'Ongoing') return null
  const match = String(date).match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/)
  if (!match) return null
  const month = MONTHS[match[1].slice(0, 3).toLowerCase()]
  if (!month) return null
  return `${match[3]}-${String(month).padStart(2, '0')}-${String(match[2]).padStart(2, '0')}`
}

function xmlEscape(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

const research = readJson('src/data/research-all.json')
const urls = []
const seen = new Set()

function add(pathname, lastmod) {
  const pathName = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  if (!pathName.startsWith('/')) return
  if (seen.has(pathName)) return
  seen.add(pathName)
  urls.push({
    loc: pathName === '/' ? `${SITE}/` : `${SITE}${pathName}`,
    lastmod,
  })
}

const staticRoutes = [
  ['/', 'src/pages/AboutPage.tsx'],
  ['/about', 'src/pages/AboutInstitutePage.tsx'],
  ['/services/lab', 'src/pages/LabPage.tsx'],
  ['/privacy-policy', 'src/pages/PrivacyPage.tsx'],
  ['/cookie-policy', 'src/pages/CookiePage.tsx'],
]

for (const [pathname, file] of staticRoutes) {
  add(pathname, fileDate(file))
}

const listed = new Set([
  'advancing-the-science-of-prediction',
  'building-a-system-to-measure-prediction',
  'can-human-forecasting-be-trained',
])
const catalogueDate = fileDate('src/data/research-all.json')
for (const item of research) {
  if (item.external || typeof item.href !== 'string' || !item.href.startsWith('/research/')) continue
  const slug = item.href.split('/').filter(Boolean).pop()
  if (!listed.has(slug)) continue
  add(item.href, lastmodFromDate(item.date) ?? catalogueDate)
}

const body = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) =>
    [
      '  <url>',
      `    <loc>${xmlEscape(url.loc)}</loc>`,
      url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : null,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  ),
  '</urlset>',
  '',
].join('\n')

const out = path.join(root, 'public/sitemap.xml')
fs.writeFileSync(out, body)
console.log(`Wrote ${urls.length} URLs to ${out}`)
