import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const MARK =
  'M46.15,60.85H2.48c-1.83,0-2.15-.42-2.15-.79s.35-.69,2.14-.89c6.95-.8,27.99-1.79,41.2-15,13.19-13.19,14.21-34.13,14.88-40.93.18-1.81.45-2.28.92-2.28.4,0,.76.45.76,2.28v43.54c0,9.32-4.77,14.08-14.08,14.08Z'
const MARK_W = 61.06
const MARK_H = 62
const INK = '#000000'
const PAPER = '#ffffff'
const PINE = '#102B23'
const root = process.cwd()
const outDir = path.join(root, 'public')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ips-favicons-'))

function viewBox(pad) {
  const x = -(MARK_W * pad)
  const y = -(MARK_H * pad)
  const w = MARK_W + MARK_W * pad * 2
  const h = MARK_H + MARK_H * pad * 2
  return { x, y, w, h, value: `${x} ${y} ${w} ${h}` }
}

function svg({ pad, mark, plate, adaptive = false }) {
  const box = viewBox(pad)
  const style = adaptive
    ? `<style>.mark{fill:${INK}}@media (prefers-color-scheme:dark){.mark{fill:${PAPER}}}</style>`
    : ''
  const background = plate
    ? `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="${plate}"/>`
    : ''
  const fillClass = adaptive ? ' class="mark"' : ''
  const fillAttr = adaptive ? '' : ` fill="${mark}"`
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.value}">
  ${style}
  ${background}
  <path${fillClass}${fillAttr} d="${MARK}"/>
</svg>
`
}

function writeSvg(name, spec) {
  const file = path.join(tmp, name)
  fs.writeFileSync(file, svg(spec))
  return file
}

function raster(svgFile, size, dest) {
  execFileSync('rsvg-convert', ['-w', String(size), '-h', String(size), svgFile, '-o', dest], {
    stdio: 'inherit',
  })
}

const light = writeSvg('light.svg', { pad: 0.1, mark: INK })
const dark = writeSvg('dark.svg', { pad: 0.1, mark: PAPER })
const appleLight = writeSvg('apple-light.svg', { pad: 0.18, mark: INK, plate: PAPER })
const appleDark = writeSvg('apple-dark.svg', { pad: 0.18, mark: PAPER, plate: PINE })
const maskLight = writeSvg('mask-light.svg', { pad: 0.28, mark: INK, plate: PAPER })
const maskDark = writeSvg('mask-dark.svg', { pad: 0.28, mark: PAPER, plate: PINE })
const pinned = writeSvg('pinned.svg', { pad: 0.1, mark: INK })

const adaptive = svg({ pad: 0.1, mark: INK, adaptive: true })
fs.writeFileSync(path.join(outDir, 'favicon.svg'), adaptive)
fs.mkdirSync(path.join(outDir, 'assets/img'), { recursive: true })
fs.writeFileSync(path.join(outDir, 'assets/img/favicon.svg'), adaptive)
fs.writeFileSync(path.join(outDir, 'safari-pinned-tab.svg'), fs.readFileSync(pinned))

const sizes = [16, 32, 48, 96]
for (const size of sizes) {
  raster(light, size, path.join(outDir, `favicon-${size}x${size}.png`))
  raster(dark, size, path.join(outDir, `favicon-${size}x${size}-dark.png`))
}

raster(light, 192, path.join(outDir, 'android-chrome-192x192.png'))
raster(light, 512, path.join(outDir, 'android-chrome-512x512.png'))
raster(dark, 192, path.join(outDir, 'android-chrome-192x192-dark.png'))
raster(dark, 512, path.join(outDir, 'android-chrome-512x512-dark.png'))
raster(appleLight, 180, path.join(outDir, 'apple-touch-icon.png'))
raster(appleDark, 180, path.join(outDir, 'apple-touch-icon-dark.png'))
raster(maskLight, 192, path.join(outDir, 'maskable-icon-192x192.png'))
raster(maskLight, 512, path.join(outDir, 'maskable-icon-512x512.png'))
raster(maskDark, 192, path.join(outDir, 'maskable-icon-dark-192x192.png'))
raster(maskDark, 512, path.join(outDir, 'maskable-icon-dark-512x512.png'))

execFileSync(
  'magick',
  [
    path.join(outDir, 'favicon-16x16.png'),
    path.join(outDir, 'favicon-32x32.png'),
    path.join(outDir, 'favicon-48x48.png'),
    path.join(outDir, 'favicon.ico'),
  ],
  { stdio: 'inherit' },
)

fs.rmSync(tmp, { recursive: true, force: true })
console.log('Wrote favicon set to public/')
