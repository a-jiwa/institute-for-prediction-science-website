export type PageTone = 'blue' | 'green' | 'pink' | 'sand' | 'lilac'

/** Header and hero colour for pages that use the pastel tones. */
export function toneForPath(pathname: string): PageTone | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (
    path === '/' ||
    path === '/about' ||
    path === '/services/lab' ||
    path.startsWith('/research/') ||
    path === '/privacy-policy' ||
    path === '/cookie-policy'
  ) {
    return 'lilac'
  }
  return null
}
