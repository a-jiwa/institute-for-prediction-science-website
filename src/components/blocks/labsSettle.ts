/** Settle card-art float-ins against viewport position. */

export type CardArtSettleOptions = {
  /**
   * Viewport Y fraction where settle completes (0 = top, 1 = bottom).
   * Unused while float-in is disabled; kept for call-site compatibility.
   */
  anchor?: number
}

/**
 * Always fully settled — shapes stay in final form with no scroll float-in.
 */
export function measureCardArtSettle(
  _root: HTMLElement,
  _options?: CardArtSettleOptions,
): number {
  return 1
}
