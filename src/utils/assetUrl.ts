/** Resolve a public/ asset path for the current Vite base URL (GitHub Pages subpath or local /). */
export function assetUrl(path: string) {
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}

export const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')
