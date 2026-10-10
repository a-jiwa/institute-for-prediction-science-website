/**
 * Image / text → sampled dot-field for the hero grid.
 *
 * Sources:
 * - `{ type: 'url', src }` — any image/SVG under public/
 * - `{ type: 'text', text }` — rendered letter/word
 * - `{ type: 'procedural', name: 'eye' | 'world' }` — drawn glyphs
 *
 * Tune sharpness with blur / threshold / softEdge / contrast.
 */

export type GlyphSource =
  | { type: 'url'; src: string }
  | { type: 'text'; text: string; font?: string }
  | { type: 'procedural'; name: 'eye' | 'world' }

export type GlyphColorMode = 'luma' | 'layers' | 'tint'

export type GlyphConfig = {
  id: string
  source: GlyphSource
  /** Sample resolution (field width). Height follows aspect. */
  resolution?: number
  /** Gaussian-ish blur in CSS px before sampling. 0 = sharp. */
  blur?: number
  /** Luma below this (after contrast) → empty. */
  threshold?: number
  /** Soft ramp width around threshold (0–0.5). */
  softEdge?: number
  /** Contrast around mid-grey. 1 = unchanged. */
  contrast?: number
  /** Invert luma (useful for black-on-white logos). */
  invert?: boolean
  /**
   * Map ink luma → size mix. Only applies where ink exists —
   * empty pixels stay at 0 (no bounding-box square).
   */
  sizeRange?: [number, number]
  colorMode?: GlyphColorMode
  /**
   * For `tint` mode: which colour layer carries the letter.
   * For text sources: also sets fill colour when drawing.
   */
  tint?: 'yellow' | 'pink' | 'blue' | 'black'
  /** Soft colour underlay strength in luma mode (0–1). Default 0. */
  colorEcho?: number
  /** How the glyph sits in the hero. */
  fit?: 'contain' | 'cover'
  scale?: number
  /** Anchor in hero UV (0–1). */
  anchor?: { x: number; y: number }
  /** Overall mix strength. */
  weight?: number
}

export type DotField = {
  id: string
  width: number
  height: number
  /** Row-major luma 0–1 after threshold/contrast. */
  luma: Float32Array
  /**
   * Signed distance in field pixels: &lt;0 inside ink, &gt;0 outside.
   * Used for continuous letter↔letter morphs (same language as shape SDF morph).
   */
  sdf: Float32Array
  /** Optional colour channels 0–1 (same length). */
  r: Float32Array
  g: Float32Array
  b: Float32Array
  config: GlyphConfig
}

export type GlyphSample = {
  /** 0–1 size mix contribution. */
  mix: number
  /** Which colour layer should prefer this sample (layers mode). */
  layerBias: 'yellow' | 'pink' | 'blue' | 'black' | null
  r: number
  g: number
  b: number
}

const fieldCache = new Map<string, Promise<DotField>>()

const LETTER = 'A'

/**
 * Google Sans Flex only — matches `typography.css` / site sans.
 * No system fallbacks so canvas never rasterizes Helvetica by mistake.
 */
const GLYPH_FONT_FAMILY = '"Google Sans Flex", Sans'

function glyphFont(sizePx: number, weight = 700) {
  return `${weight} ${Math.round(sizePx)}px ${GLYPH_FONT_FAMILY}`
}

let glyphFontReady: Promise<void> | null = null

/** Wait until Google Sans Flex is usable on canvas before rasterizing letters. */
function ensureGlyphFont(font = glyphFont(75, 700)): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) {
    return Promise.resolve()
  }
  if (!glyphFontReady) {
    glyphFontReady = (async () => {
      await document.fonts.ready.catch(() => undefined)
      // Load the weights/sizes glyphs actually draw with.
      await Promise.all([
        document.fonts.load(font),
        document.fonts.load(glyphFont(64, 500)),
        document.fonts.load(glyphFont(75, 700)),
        document.fonts.load(glyphFont(96, 900)),
        document.fonts.load('700 75px "Google Sans Flex"'),
        document.fonts.load('700 75px Sans'),
      ]).catch(() => undefined)
    })()
  }
  return glyphFontReady
}

function letterStyle(
  id: string,
  text: string,
  overrides: Partial<GlyphConfig> = {},
): GlyphConfig {
  const baseSource: GlyphSource = {
    type: 'text',
    text,
    font: glyphFont(96 * 0.78, 700),
  }
  const mergedSource = overrides.source
    ? overrides.source.type === 'text'
      ? {
          ...baseSource,
          ...overrides.source,
          font: overrides.source.font ?? baseSource.font,
        }
      : overrides.source
    : baseSource
  return {
    id,
    resolution: 96,
    blur: 0.5,
    threshold: 0.42,
    softEdge: 0.1,
    contrast: 1.35,
    invert: true,
    sizeRange: [0.18, 1],
    colorMode: 'luma',
    colorEcho: 0,
    fit: 'contain',
    scale: 0.72,
    weight: 1,
    ...overrides,
    source: mergedSource,
  }
}

/** Character for a text glyph, or null for image / procedural glyphs. */
export function glyphChar(id: string): string | null {
  const g = GLYPHS[id]
  if (!g || g.source.type !== 'text') return null
  return g.source.text
}

/** Registry used by the showcase `glyph` beats. */
export const GLYPHS: Record<string, GlyphConfig> = {
  // ── Single-letter style reel (Google Sans Flex) ─
  letterSharp: letterStyle('letterSharp', LETTER, {
    resolution: 112,
    blur: 0,
    threshold: 0.48,
    softEdge: 0.04,
    contrast: 1.55,
    sizeRange: [0.35, 1],
    scale: 0.7,
    source: { type: 'text', text: LETTER, font: glyphFont(112 * 0.78, 700) },
  }),
  letterSoft: letterStyle('letterSoft', LETTER, {
    blur: 1.8,
    threshold: 0.34,
    softEdge: 0.14,
    contrast: 1.2,
    sizeRange: [0.05, 0.9],
    scale: 0.74,
    weight: 0.95,
    source: { type: 'text', text: LETTER, font: glyphFont(96 * 0.78, 500) },
  }),
  letterPunch: letterStyle('letterPunch', LETTER, {
    blur: 0.3,
    threshold: 0.4,
    softEdge: 0.06,
    contrast: 1.5,
    sizeRange: [0.55, 1],
    scale: 0.68,
    source: { type: 'text', text: LETTER, font: glyphFont(96 * 0.8, 800) },
  }),
  letterGhost: letterStyle('letterGhost', LETTER, {
    resolution: 88,
    blur: 1.1,
    threshold: 0.36,
    softEdge: 0.12,
    contrast: 1.2,
    sizeRange: [0, 0.5],
    scale: 0.76,
    weight: 0.7,
    source: { type: 'text', text: LETTER, font: glyphFont(88 * 0.78, 400) },
  }),
  letterYellow: letterStyle('letterYellow', LETTER, {
    colorMode: 'tint',
    tint: 'yellow',
    sizeRange: [0.2, 1],
  }),
  letterPink: letterStyle('letterPink', LETTER, {
    colorMode: 'tint',
    tint: 'pink',
    sizeRange: [0.2, 1],
  }),
  letterBlue: letterStyle('letterBlue', LETTER, {
    colorMode: 'tint',
    tint: 'blue',
    sizeRange: [0.2, 1],
  }),
  letterHalo: letterStyle('letterHalo', LETTER, {
    blur: 1.4,
    threshold: 0.36,
    softEdge: 0.14,
    contrast: 1.3,
    sizeRange: [0.15, 1],
    colorEcho: 0.55,
  }),
  letterPrism: letterStyle('letterPrism', LETTER, {
    resolution: 100,
    blur: 0.8,
    threshold: 0.38,
    softEdge: 0.12,
    sizeRange: [0.18, 1],
    colorEcho: 0.85,
  }),
  letterHeavy: letterStyle('letterHeavy', LETTER, {
    blur: 0.4,
    threshold: 0.4,
    softEdge: 0.08,
    contrast: 1.4,
    sizeRange: [0.3, 1],
    colorEcho: 0.12,
    scale: 0.78,
    source: { type: 'text', text: LETTER, font: glyphFont(96 * 0.82, 900) },
  }),

  // ── More letters / combos for transfer morphs ─
  BSharp: letterStyle('BSharp', 'B', {
    blur: 0,
    threshold: 0.48,
    softEdge: 0.04,
    contrast: 1.55,
    sizeRange: [0.35, 1],
  }),
  BSoft: letterStyle('BSoft', 'B', {
    blur: 1.8,
    threshold: 0.34,
    softEdge: 0.14,
    contrast: 1.2,
    sizeRange: [0.05, 0.9],
    weight: 0.95,
  }),
  BYellow: letterStyle('BYellow', 'B', {
    colorMode: 'tint',
    tint: 'yellow',
    sizeRange: [0.2, 1],
  }),
  BPink: letterStyle('BPink', 'B', {
    colorMode: 'tint',
    tint: 'pink',
    sizeRange: [0.2, 1],
  }),
  BPrism: letterStyle('BPrism', 'B', {
    blur: 0.8,
    colorEcho: 0.85,
    sizeRange: [0.18, 1],
  }),
  CSharp: letterStyle('CSharp', 'C', {
    blur: 0,
    threshold: 0.48,
    softEdge: 0.04,
    contrast: 1.55,
    sizeRange: [0.35, 1],
  }),
  CSoft: letterStyle('CSoft', 'C', {
    blur: 1.8,
    threshold: 0.34,
    softEdge: 0.14,
    sizeRange: [0.05, 0.9],
    weight: 0.95,
  }),
  CBlue: letterStyle('CBlue', 'C', {
    colorMode: 'tint',
    tint: 'blue',
    sizeRange: [0.2, 1],
  }),
  DPunch: letterStyle('DPunch', 'D', {
    blur: 0.3,
    threshold: 0.4,
    softEdge: 0.06,
    contrast: 1.5,
    sizeRange: [0.55, 1],
    scale: 0.7,
  }),
  DYellow: letterStyle('DYellow', 'D', {
    colorMode: 'tint',
    tint: 'yellow',
    sizeRange: [0.2, 1],
  }),
  DHalo: letterStyle('DHalo', 'D', {
    blur: 1.4,
    softEdge: 0.14,
    colorEcho: 0.55,
    sizeRange: [0.15, 1],
  }),
  EPunch: letterStyle('EPunch', 'E', {
    blur: 0.3,
    threshold: 0.4,
    softEdge: 0.06,
    contrast: 1.5,
    sizeRange: [0.55, 1],
    scale: 0.7,
  }),
  EPink: letterStyle('EPink', 'E', {
    colorMode: 'tint',
    tint: 'pink',
    sizeRange: [0.2, 1],
  }),
  ESoft: letterStyle('ESoft', 'E', {
    blur: 1.8,
    threshold: 0.34,
    softEdge: 0.14,
    sizeRange: [0.05, 0.9],
    weight: 0.95,
  }),
  EBlue: letterStyle('EBlue', 'E', {
    colorMode: 'tint',
    tint: 'blue',
    sizeRange: [0.2, 1],
  }),
  FSharp: letterStyle('FSharp', 'F', {
    blur: 0,
    threshold: 0.48,
    softEdge: 0.04,
    contrast: 1.55,
    sizeRange: [0.35, 1],
  }),
  FYellow: letterStyle('FYellow', 'F', {
    colorMode: 'tint',
    tint: 'yellow',
    sizeRange: [0.2, 1],
  }),
  HHeavy: letterStyle('HHeavy', 'H', {
    source: { type: 'text', text: 'H', font: glyphFont(96 * 0.82, 900) },
    blur: 0.4,
    sizeRange: [0.3, 1],
    scale: 0.76,
    colorEcho: 0.12,
  }),
  HPink: letterStyle('HPink', 'H', {
    colorMode: 'tint',
    tint: 'pink',
    sizeRange: [0.2, 1],
  }),
  LSoft: letterStyle('LSoft', 'L', {
    blur: 1.6,
    softEdge: 0.14,
    sizeRange: [0.08, 0.92],
    weight: 0.95,
  }),
  LBlue: letterStyle('LBlue', 'L', {
    colorMode: 'tint',
    tint: 'blue',
    sizeRange: [0.2, 1],
  }),
  MHeavy: letterStyle('MHeavy', 'M', {
    source: {
      type: 'text',
      text: 'M',
      font: glyphFont(96 * 0.82, 900),
    },
    blur: 0.4,
    sizeRange: [0.3, 1],
    scale: 0.78,
    colorEcho: 0.12,
  }),
  MBlue: letterStyle('MBlue', 'M', {
    colorMode: 'tint',
    tint: 'blue',
    sizeRange: [0.2, 1],
    scale: 0.76,
  }),
  MSoft: letterStyle('MSoft', 'M', {
    blur: 1.8,
    softEdge: 0.14,
    sizeRange: [0.05, 0.9],
    weight: 0.95,
    scale: 0.76,
  }),
  MYellow: letterStyle('MYellow', 'M', {
    colorMode: 'tint',
    tint: 'yellow',
    sizeRange: [0.2, 1],
    scale: 0.76,
  }),
  NSharp: letterStyle('NSharp', 'N', {
    blur: 0,
    threshold: 0.48,
    softEdge: 0.04,
    contrast: 1.55,
    sizeRange: [0.35, 1],
  }),
  NPink: letterStyle('NPink', 'N', {
    colorMode: 'tint',
    tint: 'pink',
    sizeRange: [0.2, 1],
  }),
  OSoft: letterStyle('OSoft', 'O', {
    blur: 1.8,
    softEdge: 0.14,
    sizeRange: [0.05, 0.9],
    weight: 0.95,
  }),
  OPrism: letterStyle('OPrism', 'O', {
    blur: 0.8,
    colorEcho: 0.85,
    sizeRange: [0.18, 1],
  }),
  OYellow: letterStyle('OYellow', 'O', {
    colorMode: 'tint',
    tint: 'yellow',
    sizeRange: [0.2, 1],
  }),
  PPunch: letterStyle('PPunch', 'P', {
    blur: 0.3,
    contrast: 1.5,
    sizeRange: [0.55, 1],
    scale: 0.7,
  }),
  PBlue: letterStyle('PBlue', 'P', {
    colorMode: 'tint',
    tint: 'blue',
    sizeRange: [0.2, 1],
  }),
  RSharp: letterStyle('RSharp', 'R', {
    blur: 0,
    threshold: 0.48,
    softEdge: 0.04,
    contrast: 1.55,
    sizeRange: [0.35, 1],
  }),
  RHalo: letterStyle('RHalo', 'R', {
    blur: 1.4,
    threshold: 0.36,
    softEdge: 0.14,
    colorEcho: 0.55,
    sizeRange: [0.15, 1],
  }),
  RPink: letterStyle('RPink', 'R', {
    colorMode: 'tint',
    tint: 'pink',
    sizeRange: [0.2, 1],
  }),
  SSoft: letterStyle('SSoft', 'S', {
    blur: 1.8,
    threshold: 0.34,
    softEdge: 0.14,
    contrast: 1.2,
    sizeRange: [0.05, 0.9],
    weight: 0.95,
  }),
  SPrism: letterStyle('SPrism', 'S', {
    blur: 0.8,
    colorEcho: 0.85,
    sizeRange: [0.18, 1],
  }),
  SYellow: letterStyle('SYellow', 'S', {
    colorMode: 'tint',
    tint: 'yellow',
    sizeRange: [0.2, 1],
  }),
  TSharp: letterStyle('TSharp', 'T', {
    blur: 0,
    threshold: 0.48,
    softEdge: 0.04,
    contrast: 1.55,
    sizeRange: [0.35, 1],
  }),
  TBlue: letterStyle('TBlue', 'T', {
    colorMode: 'tint',
    tint: 'blue',
    sizeRange: [0.2, 1],
  }),
  THalo: letterStyle('THalo', 'T', {
    blur: 1.4,
    softEdge: 0.14,
    colorEcho: 0.55,
    sizeRange: [0.15, 1],
  }),

  // Legacy single-letter keys (still usable)
  A: letterStyle('A', 'A'),
  B: letterStyle('B', 'B'),
  M: letterStyle('M', 'M', {
    blur: 0,
    threshold: 0.4,
    softEdge: 0.08,
    contrast: 1.4,
    sizeRange: [0.2, 1],
    scale: 0.78,
  }),
  S: letterStyle('S', 'S', {
    blur: 1.2,
    threshold: 0.38,
    softEdge: 0.14,
    contrast: 1.25,
    sizeRange: [0.15, 1],
    colorEcho: 0.2,
  }),
  eye: {
    id: 'eye',
    source: { type: 'procedural', name: 'eye' },
    resolution: 112,
    blur: 0.8,
    threshold: 0.22,
    softEdge: 0.12,
    contrast: 1.15,
    invert: true,
    sizeRange: [0.1, 1],
    colorMode: 'layers',
    fit: 'contain',
    scale: 0.55,
    weight: 1,
  },
  world: {
    id: 'world',
    source: { type: 'url', src: `${import.meta.env.BASE_URL}assets/img/glyphs/world.svg` },
    resolution: 128,
    blur: 0.4,
    threshold: 0.4,
    softEdge: 0.08,
    contrast: 1.35,
    invert: true,
    sizeRange: [0.05, 1],
    colorMode: 'layers',
    fit: 'contain',
    scale: 0.88,
    anchor: { x: 0.5, y: 0.42 },
    weight: 1,
  },
  worldSoft: {
    id: 'worldSoft',
    source: { type: 'url', src: `${import.meta.env.BASE_URL}assets/img/glyphs/world.svg` },
    resolution: 96,
    blur: 2.4,
    threshold: 0.32,
    softEdge: 0.14,
    contrast: 1.2,
    invert: true,
    sizeRange: [0, 0.85],
    colorMode: 'luma',
    colorEcho: 0,
    fit: 'contain',
    scale: 0.9,
    anchor: { x: 0.5, y: 0.42 },
    weight: 0.95,
  },
}

/**
 * Squared Euclidean distance transform (Felzenszwalb & Huttenlocher).
 * `grid` is INF outside the feature set, 0 on features; overwritten in place
 * with squared distance to the nearest feature.
 */
function edtSquared(grid: Float32Array, w: number, h: number) {
  const INF = 1e10
  const f = new Float32Array(Math.max(w, h))
  const d = new Float32Array(Math.max(w, h))
  const v = new Int32Array(Math.max(w, h))
  const z = new Float32Array(Math.max(w, h) + 1)

  const edt1d = (n: number) => {
    let k = 0
    v[0] = 0
    z[0] = -INF
    z[1] = INF
    for (let q = 1; q < n; q++) {
      let s =
        (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
      while (s <= z[k]) {
        k--
        s =
          (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
      }
      k++
      v[k] = q
      z[k] = s
      z[k + 1] = INF
    }
    k = 0
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++
      const r = q - v[k]
      d[q] = r * r + f[v[k]]
    }
  }

  // Columns
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x]
    edt1d(h)
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y]
  }
  // Rows
  for (let y = 0; y < h; y++) {
    const row = y * w
    for (let x = 0; x < w; x++) f[x] = grid[row + x]
    edt1d(w)
    for (let x = 0; x < w; x++) grid[row + x] = d[x]
  }
}

/** Build signed distance field from soft luma (field-pixel units). */
function buildGlyphSdf(
  luma: Float32Array,
  w: number,
  h: number,
  thr = 0.28,
): Float32Array {
  const n = w * h
  const INF = 1e10
  const outside = new Float32Array(n)
  const inside = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const ink = luma[i] > thr
    outside[i] = ink ? 0 : INF
    inside[i] = ink ? INF : 0
  }
  edtSquared(outside, w, h)
  edtSquared(inside, w, h)
  const sdf = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    // Negative inside ink, positive outside — zero on the contour.
    sdf[i] = Math.sqrt(outside[i]) - Math.sqrt(inside[i])
  }
  return sdf
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

function applyContrast(luma: number, contrast: number) {
  return clamp01((luma - 0.5) * contrast + 0.5)
}

function drawProcedural(
  ctx: CanvasRenderingContext2D,
  name: 'eye' | 'world',
  size: number,
) {
  ctx.clearRect(0, 0, size, size)
  if (name === 'eye') {
    ctx.fillStyle = '#000'
    // Outer eye almond
    ctx.beginPath()
    ctx.ellipse(size / 2, size / 2, size * 0.42, size * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    // Iris (blue-ish for layer bias)
    ctx.fillStyle = '#2f6bff'
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.16, 0, Math.PI * 2)
    ctx.fill()
    // Pupil
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.07, 0, Math.PI * 2)
    ctx.fill()
    // Highlight
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(size * 0.56, size * 0.44, size * 0.03, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  // Procedural fallback globe (used if SVG fails).
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineWidth = size * 0.03
  ctx.beginPath()
  ctx.ellipse(size / 2, size / 2, size * 0.18, size * 0.4, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(size / 2, size / 2, size * 0.4, size * 0.16, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalCompositeOperation = 'source-over'
}

async function rasterizeGlyph(
  config: GlyphConfig,
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const res = config.resolution ?? 96
  const blur = config.blur ?? 0
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('2d context unavailable')

  const pad = Math.ceil(blur * 2) + 4
  let drawW = res
  let drawH = res

  const source = config.source
  if (source.type === 'url') {
    const img = await loadImage(source.src)
    const aspect = img.naturalWidth / Math.max(1, img.naturalHeight)
    if (aspect >= 1) {
      drawW = res
      drawH = Math.max(8, Math.round(res / aspect))
    } else {
      drawH = res
      drawW = Math.max(8, Math.round(res * aspect))
    }
    canvas.width = drawW + pad * 2
    canvas.height = drawH + pad * 2
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (blur > 0) ctx.filter = `blur(${blur}px)`
    ctx.drawImage(img, pad, pad, drawW, drawH)
    ctx.filter = 'none'
  } else if (source.type === 'text') {
    const font = source.font ?? glyphFont(res * 0.78, 700)
    await ensureGlyphFont(font)
    canvas.width = res + pad * 2
    canvas.height = res + pad * 2
    drawW = res
    drawH = res
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (blur > 0) ctx.filter = `blur(${blur}px)`
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = font
    // Sans caps sit slightly high optically — nudge down a touch.
    ctx.fillText(source.text, canvas.width / 2, canvas.height / 2 + res * 0.02)
    ctx.filter = 'none'
  } else {
    canvas.width = res + pad * 2
    canvas.height = res + pad * 2
    drawW = res
    drawH = res
    // Draw into a temp canvas then blur-copy for consistent blur handling.
    const tmp = document.createElement('canvas')
    tmp.width = res
    tmp.height = res
    const tctx = tmp.getContext('2d')
    if (!tctx) throw new Error('2d context unavailable')
    drawProcedural(tctx, source.name, res)
    if (blur > 0) ctx.filter = `blur(${blur}px)`
    ctx.drawImage(tmp, pad, pad)
    ctx.filter = 'none'
  }

  return { canvas, width: canvas.width, height: canvas.height }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load glyph image: ${src}`))
    img.src = src
  })
}

function hueToLayer(r: number, g: number, b: number): GlyphSample['layerBias'] {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max < 0.08) return 'black'
  if (max - min < 0.08) return 'black'
  // Rough hue buckets → our palette.
  if (b >= r && b >= g) return 'blue'
  if (r >= g && g >= b * 0.6 && r > 0.35) return 'pink'
  if (r > 0.4 && g > 0.3 && b < 0.35) return 'yellow'
  if (g > r && g > b) return 'yellow'
  return 'black'
}

/** Build (and cache) a sampled field for a glyph config. */
export function loadDotField(config: GlyphConfig): Promise<DotField> {
  const key = JSON.stringify(config)
  const cached = fieldCache.get(key)
  if (cached) return cached

  const promise = (async () => {
    try {
      const { canvas, width, height } = await rasterizeGlyph(config)
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) throw new Error('2d context unavailable')
      const { data } = ctx.getImageData(0, 0, width, height)
      const count = width * height
      const luma = new Float32Array(count)
      const rCh = new Float32Array(count)
      const gCh = new Float32Array(count)
      const bCh = new Float32Array(count)

      const contrast = config.contrast ?? 1
      const invert = config.invert ?? false
      const threshold = config.threshold ?? 0
      const soft = Math.max(0.0001, config.softEdge ?? 0.08)

      for (let i = 0; i < count; i++) {
        const o = i * 4
        let r = data[o] / 255
        let g = data[o + 1] / 255
        let b = data[o + 2] / 255
        const a = data[o + 3] / 255
        // Transparent → empty. Opaque dark ink on clear → high after invert.
        let y = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if (a < 0.04) {
          y = 0
        } else if (invert) {
          // Paper-white / near-white plate (common when SVGs rasterize
          // onto an opaque backdrop) must not become a filled square.
          if (y > 0.82) {
            y = 0
          } else {
            y = (1 - y) * a
          }
        } else {
          y *= a
        }
        y = applyContrast(y, contrast)
        // Hard kill below threshold, soft ramp above — no ghost plate.
        if (y <= threshold) {
          y = 0
        } else {
          y = clamp01((y - threshold) / soft)
        }
        luma[i] = y
        rCh[i] = r * a
        gCh[i] = g * a
        bCh[i] = b * a
      }

      return {
        id: config.id,
        width,
        height,
        luma,
        sdf: buildGlyphSdf(luma, width, height),
        r: rCh,
        g: gCh,
        b: bCh,
        config,
      } satisfies DotField
    } catch (err) {
      // Procedural world fallback if SVG missing.
      if (
        config.source.type === 'url' &&
        config.id.toLowerCase().includes('world')
      ) {
        return loadDotField({
          ...config,
          source: { type: 'procedural', name: 'world' },
        })
      }
      throw err
    }
  })()

  fieldCache.set(key, promise)
  return promise
}

export async function preloadGlyphs(ids: string[]) {
  await Promise.all(
    ids.map((id) => {
      const config = GLYPHS[id]
      if (!config) return Promise.resolve(null)
      return loadDotField(config)
    }),
  )
}

/**
 * Map a hero-space point into the glyph and return a size mix for a layer.
 */
export function sampleGlyphAt(
  field: DotField,
  layerId: string,
  x: number,
  y: number,
  heroW: number,
  heroH: number,
  fade = 1,
): GlyphSample {
  const cfg = field.config
  const weight = (cfg.weight ?? 1) * clamp01(fade)
  if (weight <= 0) {
    return { mix: 0, layerBias: null, r: 0, g: 0, b: 0 }
  }

  const anchor = cfg.anchor ?? { x: 0.5, y: 0.48 }
  const scale = cfg.scale ?? 0.75
  const fit = cfg.fit ?? 'contain'
  const fieldAspect = field.width / field.height
  const heroAspect = heroW / heroH

  let boxW: number
  let boxH: number
  if (fit === 'cover') {
    if (fieldAspect > heroAspect) {
      boxH = heroH * scale
      boxW = boxH * fieldAspect
    } else {
      boxW = heroW * scale
      boxH = boxW / fieldAspect
    }
  } else {
    if (fieldAspect > heroAspect) {
      boxW = heroW * scale
      boxH = boxW / fieldAspect
    } else {
      boxH = heroH * scale
      boxW = boxH * fieldAspect
    }
  }

  const left = anchor.x * heroW - boxW / 2
  const top = anchor.y * heroH - boxH / 2
  const u = (x - left) / boxW
  const v = (y - top) / boxH
  if (u < 0 || v < 0 || u > 1 || v > 1) {
    return { mix: 0, layerBias: null, r: 0, g: 0, b: 0 }
  }

  // Bilinear sample.
  const fx = u * (field.width - 1)
  const fy = v * (field.height - 1)
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(field.width - 1, x0 + 1)
  const y1 = Math.min(field.height - 1, y0 + 1)
  const tx = fx - x0
  const ty = fy - y0

  const at = (xx: number, yy: number) => yy * field.width + xx
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const sampleChan = (chan: Float32Array) => {
    const c00 = chan[at(x0, y0)]
    const c10 = chan[at(x1, y0)]
    const c01 = chan[at(x0, y1)]
    const c11 = chan[at(x1, y1)]
    return lerp(lerp(c00, c10, tx), lerp(c01, c11, tx), ty)
  }

  const luma = sampleChan(field.luma)
  const r = sampleChan(field.r)
  const g = sampleChan(field.g)
  const b = sampleChan(field.b)

  // Empty ink → no dots (avoids the glyph bounding-box square).
  if (luma <= 0.04) {
    return { mix: 0, layerBias: null, r, g, b }
  }

  const [z0, z1] = cfg.sizeRange ?? [0, 1]
  // z0 is the size at the faintest visible ink, z1 at full ink —
  // never applied when luma is empty (gated above).
  const mix = (z0 + (z1 - z0) * luma) * weight
  const mode = cfg.colorMode ?? 'luma'
  const bias = mode === 'layers' ? hueToLayer(r, g, b) : null
  const tint = cfg.tint ?? 'black'
  const echo = cfg.colorEcho ?? 0

  if (mode === 'tint') {
    if (layerId === tint) {
      return { mix, layerBias: tint, r, g, b }
    }
    // Subtle black structure under colour tints.
    if (layerId === 'black' && tint !== 'black') {
      return { mix: mix * 0.2, layerBias: tint, r, g, b }
    }
    return { mix: 0, layerBias: tint, r, g, b }
  }

  if (mode === 'layers') {
    if (layerId === 'black') {
      const chromatic = bias && bias !== 'black'
      return {
        mix: mix * (chromatic ? 0.22 : 1),
        layerBias: bias,
        r,
        g,
        b,
      }
    }
    if (bias === layerId) {
      return { mix: Math.min(1, mix * 1.05), layerBias: bias, r, g, b }
    }
    return { mix: 0, layerBias: bias, r, g, b }
  }

  // luma mode — black carries the letter; optional colour underlay.
  if (layerId !== 'black') {
    if (echo <= 0) return { mix: 0, layerBias: null, r, g, b }
    // Stagger colour layers so the halo reads as multi-colour, not mud.
    const echoScale =
      layerId === 'yellow' ? 1 : layerId === 'pink' ? 0.72 : 0.55
    return {
      mix: mix * echo * echoScale,
      layerBias: null,
      r,
      g,
      b,
    }
  }

  return { mix, layerBias: bias, r, g, b }
}

/**
 * Hero-space signed distance to glyph ink (&lt;0 inside, &gt;0 outside).
 * Outside the glyph box continues the field so morphs don’t clip to a square.
 */
export function sampleGlyphSdf(
  field: DotField,
  x: number,
  y: number,
  heroW: number,
  heroH: number,
): number {
  const cfg = field.config
  const anchor = cfg.anchor ?? { x: 0.5, y: 0.48 }
  const scale = cfg.scale ?? 0.75
  const fit = cfg.fit ?? 'contain'
  const fieldAspect = field.width / field.height
  const heroAspect = heroW / heroH

  let boxW: number
  let boxH: number
  if (fit === 'cover') {
    if (fieldAspect > heroAspect) {
      boxH = heroH * scale
      boxW = boxH * fieldAspect
    } else {
      boxW = heroW * scale
      boxH = boxW / fieldAspect
    }
  } else if (fieldAspect > heroAspect) {
    boxW = heroW * scale
    boxH = boxW / fieldAspect
  } else {
    boxH = heroH * scale
    boxW = boxH * fieldAspect
  }

  const left = anchor.x * heroW - boxW / 2
  const top = anchor.y * heroH - boxH / 2
  const u = (x - left) / boxW
  const v = (y - top) / boxH
  const px = boxW / Math.max(1, field.width - 1)

  const sampleAt = (uu: number, vv: number) => {
    const fx = clamp01(uu) * (field.width - 1)
    const fy = clamp01(vv) * (field.height - 1)
    const x0 = Math.floor(fx)
    const y0 = Math.floor(fy)
    const x1 = Math.min(field.width - 1, x0 + 1)
    const y1 = Math.min(field.height - 1, y0 + 1)
    const tx = fx - x0
    const ty = fy - y0
    const at = (xx: number, yy: number) => yy * field.width + xx
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    return lerp(
      lerp(field.sdf[at(x0, y0)], field.sdf[at(x1, y0)], tx),
      lerp(field.sdf[at(x0, y1)], field.sdf[at(x1, y1)], tx),
      ty,
    )
  }

  if (u < 0 || v < 0 || u > 1 || v > 1) {
    const edge = sampleAt(u, v) * px
    const dx = (u < 0 ? -u : u > 1 ? u - 1 : 0) * boxW
    const dy = (v < 0 ? -v : v > 1 ? v - 1 : 0) * boxH
    return Math.hypot(dx, dy) + Math.max(0, edge)
  }

  return sampleAt(u, v) * px
}

/**
 * Shape-only sample (luma ink) — used for mass-transfer morphs so colour
 * layers follow the same travelling structure instead of fading in alone.
 */
export function sampleGlyphStructure(
  field: DotField,
  x: number,
  y: number,
  heroW: number,
  heroH: number,
  fade = 1,
): number {
  // Reuse layer routing with a synthetic "structure" pass via black luma path:
  // call with black and bump tint underlay — cleaner to sample luma directly.
  const cfg = field.config
  const weight = (cfg.weight ?? 1) * clamp01(fade)
  if (weight <= 0) return 0

  const anchor = cfg.anchor ?? { x: 0.5, y: 0.48 }
  const scale = cfg.scale ?? 0.75
  const fit = cfg.fit ?? 'contain'
  const fieldAspect = field.width / field.height
  const heroAspect = heroW / heroH

  let boxW: number
  let boxH: number
  if (fit === 'cover') {
    if (fieldAspect > heroAspect) {
      boxH = heroH * scale
      boxW = boxH * fieldAspect
    } else {
      boxW = heroW * scale
      boxH = boxW / fieldAspect
    }
  } else if (fieldAspect > heroAspect) {
    boxW = heroW * scale
    boxH = boxW / fieldAspect
  } else {
    boxH = heroH * scale
    boxW = boxH * fieldAspect
  }

  const left = anchor.x * heroW - boxW / 2
  const top = anchor.y * heroH - boxH / 2
  const u = (x - left) / boxW
  const v = (y - top) / boxH
  if (u < 0 || v < 0 || u > 1 || v > 1) return 0

  const fx = u * (field.width - 1)
  const fy = v * (field.height - 1)
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(field.width - 1, x0 + 1)
  const y1 = Math.min(field.height - 1, y0 + 1)
  const tx = fx - x0
  const ty = fy - y0
  const at = (xx: number, yy: number) => yy * field.width + xx
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const luma = lerp(
    lerp(field.luma[at(x0, y0)], field.luma[at(x1, y0)], tx),
    lerp(field.luma[at(x0, y1)], field.luma[at(x1, y1)], tx),
    ty,
  )
  if (luma <= 0.04) return 0
  const [z0, z1] = cfg.sizeRange ?? [0, 1]
  return (z0 + (z1 - z0) * luma) * weight
}

/**
 * Glyph presence over a beat.
 * When morphing from/to another glyph, skip the matching edge fade
 * so the morph window owns the dissolve instead.
 */
export function glyphFade(
  t: number,
  opts: { morphIn?: boolean; morphOut?: boolean } = {},
) {
  const edgeIn = 0.16
  const edgeOut = 0.22
  if (!opts.morphIn && t < edgeIn) return smoothstep(t / edgeIn)
  if (!opts.morphOut && t > 1 - edgeOut) {
    return 1 - smoothstep((t - (1 - edgeOut)) / edgeOut)
  }
  return 1
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}
