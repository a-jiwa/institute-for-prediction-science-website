/**
 * Labs mix-blend helpers.
 *
 * White text + `mix-blend-mode: difference` over a fill F paints
 * invert(F). So to get a chosen intersection colour I on the letters,
 * paint the shape as invert(I).
 */

export type LabsShapeName = 'hexagon' | 'circle' | 'square' | 'clover'

/** Paint the shape this colour, or ask for the letter colour you want on white text. */
export type LabsShapeColorSpec =
  | { fill: string; intersect?: undefined }
  | { intersect: string; fill?: undefined }

/** Channel-wise invert — same as difference of white against `hex`. */
export function invertHex(hex: string): string {
  const raw = hex.trim().replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return hex
  const n = Number.parseInt(full, 16)
  const r = 255 - ((n >> 16) & 255)
  const g = 255 - ((n >> 8) & 255)
  const b = 255 - (n & 255)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** Shape fill that yields `intersect` under white + difference text. */
export function fillFromIntersect(intersect: string): string {
  return invertHex(intersect)
}

/** Letter colour when white + difference sits on `fill`. */
export function intersectFromFill(fill: string): string {
  return invertHex(fill)
}

/**
 * Authored text colour T such that |T − backdrop| ≈ desired under
 * `mix-blend-mode: difference` (prefer backdrop ± desired, clamped).
 */
export function authoredForDifference(backdrop: string, desired: string): string {
  const parse = (hex: string) => {
    const raw = hex.trim().replace('#', '')
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((c) => c + c)
            .join('')
        : raw
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
    const n = Number.parseInt(full, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
  }
  const b = parse(backdrop)
  const d = parse(desired)
  if (!b || !d) return desired
  const out = b.map((ch, i) => {
    const up = ch + d[i]
    return up <= 255 ? up : ch - d[i]
  })
  return `#${out.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`
}

export function resolveLabsShapeFill(spec: LabsShapeColorSpec): string {
  return 'intersect' in spec && spec.intersect != null
    ? fillFromIntersect(spec.intersect)
    : spec.fill
}

/**
 * Default shape paints. Swap any entry to `{ intersect: '#…' }` to author
 * the colour you want on white difference text instead of the fill.
 *
 * Examples (current fills → their white-text intersections):
 *   hexagon #48f08b → #b70f74
 *   circle  #5e9bff → #a16400
 *   square  #ffbdf9 → #004206
 *   clover  #fcc934 → #0336cb
 */
export const LABS_SHAPE_COLORS: Record<LabsShapeName, LabsShapeColorSpec> = {
  hexagon: { fill: '#48f08b' },
  circle: { fill: '#5e9bff' },
  square: { fill: '#ffbdf9' },
  clover: { fill: '#fcc934' },
}

/**
 * Orange-only set for floaters on the yellow wash — never wash yellow
 * (#fcc934) or near-yellow, so shapes stay readable on that field.
 */
export const LABS_SHAPE_COLORS_WARM: Record<LabsShapeName, LabsShapeColorSpec> = {
  hexagon: { fill: '#e96b26' },
  circle: { fill: '#d4551a' },
  square: { fill: '#c2410c' },
  clover: { fill: '#ea580c' },
}

export function resolveLabsShapeFills(
  overrides?: Partial<Record<LabsShapeName, LabsShapeColorSpec>>,
): Record<LabsShapeName, string> {
  const names = Object.keys(LABS_SHAPE_COLORS) as LabsShapeName[]
  return Object.fromEntries(
    names.map((name) => [
      name,
      resolveLabsShapeFill(overrides?.[name] ?? LABS_SHAPE_COLORS[name]),
    ]),
  ) as Record<LabsShapeName, string>
}
