/** Resolve a public/ asset path for the current Vite base URL (GitHub Pages subpath or local /). */
export function assetUrl(path: string) {
  if (!path || /^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}

export const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Strip the Vite base path so React Router navigate/Link receive app-relative paths. */
export function toRouterPath(pathname: string, search = '', hash = '') {
  let path = pathname
  if (routerBasename && path.startsWith(routerBasename)) {
    path = path.slice(routerBasename.length) || '/'
  }
  return path + search + hash
}
