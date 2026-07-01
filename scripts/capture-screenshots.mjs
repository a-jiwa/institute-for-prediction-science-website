import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'

const OUT = path.resolve('.screenshots')
const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
]

const PAGES = [
  { slug: 'home', path: '/' },
  { slug: 'research', path: '/research' },
  { slug: 'about', path: '/about' },
  { slug: 'careers', path: '/careers' },
  { slug: 'privacy', path: '/privacy-policy' },
]

const SITES = [
  { name: 'clone', base: 'http://localhost:5173' },
  { name: 'original', base: 'https://forecastingresearch.org' },
]

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()

for (const site of SITES) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()

    for (const pg of PAGES) {
      const url = `${site.base}${pg.path}`
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
        await page.waitForTimeout(1500)
        const file = path.join(OUT, `${site.name}-${pg.slug}-${vp.name}.png`)
        await page.screenshot({ path: file, fullPage: true })
        console.log('saved', file)
      } catch (err) {
        console.error('failed', url, err.message)
      }
    }

    await context.close()
  }
}

await browser.close()
console.log('done')
