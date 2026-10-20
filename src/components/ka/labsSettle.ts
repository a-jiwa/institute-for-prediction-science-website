/** Settle card-art float-ins against viewport position. */

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function smoothstep(t: number) {
  const p = clamp01(t)
  return p * p * (3 - 2 * p)
}

/**
 * 1 when the plate centre is near mid-viewport (float in).
 * Below the fold stays at 0. Stays settled while above mid-viewport.
 */
export function measureCardArtSettle(root: HTMLElement): number {
  const rect = root.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) return 0

  const vh = window.innerHeight
  const elCenter = rect.top + rect.height / 2
  const viewCenter = vh / 2
  const range = Math.max(160, vh * 0.5)

  return smoothstep(1 - (elCenter - viewCenter) / range)
}
