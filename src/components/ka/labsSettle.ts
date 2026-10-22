/** Settle card-art float-ins against viewport position. */

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function smoothstep(t: number) {
  const p = clamp01(t)
  return p * p * (3 - 2 * p)
}

export type CardArtSettleOptions = {
  /**
   * Viewport Y fraction where settle completes (0 = top, 1 = bottom).
   * Default `0.5` (mid-viewport). Higher = settle earlier / while the plate is lower.
   */
  anchor?: number
}

/**
 * 1 when the plate centre is near the settle anchor (float in).
 * Below the fold stays at 0. Stays settled while above the anchor.
 */
export function measureCardArtSettle(
  root: HTMLElement,
  options?: CardArtSettleOptions,
): number {
  const rect = root.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) return 0

  const vh = window.innerHeight
  const elCenter = rect.top + rect.height / 2
  const viewCenter = vh * clamp01(options?.anchor ?? 0.5)
  const range = Math.max(160, vh * 0.5)

  return smoothstep(1 - (elCenter - viewCenter) / range)
}
