#!/usr/bin/env node
/**
 * Bake an image into a compact JSON dot-field for the hero grid.
 *
 * Usage:
 *   node scripts/bake-dot-field.mjs public/assets/img/glyphs/world.svg --out public/assets/glyphs/world.field.json --invert
 *
 * Live sampling (no bake required) lives in src/components/hero/dotField.ts.
 * Install sharp for this script: npm i -D sharp
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
if (args.length === 0 || args.includes('--help')) {
  console.log(
    'Usage: node scripts/bake-dot-field.mjs <image> [--out file] [--res 96] [--threshold 0.35] [--invert]',
  )
  process.exit(0)
}

const input = resolve(args[0])
const outIdx = args.indexOf('--out')
const resIdx = args.indexOf('--res')
const thrIdx = args.indexOf('--threshold')
const out =
  outIdx >= 0
    ? resolve(args[outIdx + 1])
    : input.replace(/\.[^.]+$/, '.field.json')
const resolution = resIdx >= 0 ? Number(args[resIdx + 1]) : 96
const threshold = thrIdx >= 0 ? Number(args[thrIdx + 1]) : 0.35
const invert = args.includes('--invert')

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error(
      'Install sharp to bake fields: npm i -D sharp\n' +
        'The site already samples glyphs live in the browser.',
    )
    process.exit(1)
  }

  const img = sharp(input).ensureAlpha()
  const meta = await img.metadata()
  const aspect = (meta.width || 1) / (meta.height || 1)
  const width =
    aspect >= 1 ? resolution : Math.max(8, Math.round(resolution * aspect))
  const height =
    aspect >= 1 ? Math.max(8, Math.round(resolution / aspect)) : resolution

  const { data } = await img
    .resize(width, height, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const luma = []
  for (let i = 0; i < width * height; i++) {
    const o = i * 4
    const r = data[o] / 255
    const g = data[o + 1] / 255
    const b = data[o + 2] / 255
    const a = data[o + 3] / 255
    let y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    if (a < 0.02) y = 0
    else if (invert) y = (1 - y) * a
    else y *= a
    y = y < threshold ? 0 : Math.min(1, (y - threshold) / 0.1)
    luma.push(Math.round(y * 1000) / 1000)
  }

  const payload = {
    id: input.split('/').pop()?.replace(/\.[^.]+$/, '') ?? 'glyph',
    width,
    height,
    luma,
    source: pathToFileURL(input).href,
  }

  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, JSON.stringify(payload))
  console.log(`Wrote ${out} (${width}×${height})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
