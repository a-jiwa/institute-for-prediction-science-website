export type PageTone = 'blue' | 'green' | 'pink' | 'sand' | 'lilac'

/** Header and hero colour for the pages that use the DeepMind pastels. */
export function toneForPath(pathname: string): PageTone | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/about') return 'lilac'
  if (path === '/services/competitions') return 'blue'
  if (path === '/services/training') return 'green'
  if (path === '/services/lab') return 'pink'
  if (path === '/services') return 'sand'
  return null
}
