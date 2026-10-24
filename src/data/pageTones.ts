export type PageTone = 'blue' | 'green' | 'pink' | 'sand' | 'lilac'

/** Header and hero colour for pages that use the pastel tones. */
export function toneForPath(pathname: string): PageTone | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (
    path === '/' ||
    path === '/about' ||
    path === '/services' ||
    path === '/services/competitions' ||
    path === '/services/lab'
  ) {
    return 'lilac'
  }
  if (path === '/services/training') return 'green'
  return null
}
