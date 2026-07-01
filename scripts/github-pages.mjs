import fs from 'node:fs'
import path from 'node:path'

const DIST = 'dist'
const BASE = '/forecasting-institute'

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

// SPA fallback for direct loads of client-side routes on GitHub Pages.
const html404 = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>The Foresight Institute</title>
    <script type="text/javascript">
      var segmentCount = 1;
      var location = window.location;
      location.replace(
        location.protocol +
          '//' +
          location.hostname +
          (location.port ? ':' + location.port : '') +
          location.pathname
            .split('/')
            .slice(0, 1 + segmentCount)
            .join('/') +
          '/?/' +
          location.pathname
            .slice(1)
            .split('/')
            .slice(segmentCount)
            .join('/')
            .replace(/&/g, '~and~') +
          (location.search ? '&' + location.search.slice(1).replace(/&/g, '~and~') : '') +
          location.hash
      );
    </script>
  </head>
  <body></body>
</html>
`

fs.writeFileSync(path.join(DIST, '404.html'), html404)
