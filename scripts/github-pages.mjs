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

// SPA fallback: serve the built app shell for unknown routes on GitHub Pages.
const indexHtml = path.join(DIST, 'index.html')
fs.copyFileSync(indexHtml, path.join(DIST, '404.html'))
