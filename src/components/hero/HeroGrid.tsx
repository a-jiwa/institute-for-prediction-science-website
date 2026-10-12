import { useEffect, useRef, useState } from 'react'
import {
  SHOWCASE,
  activeDotScale,
  buildGlyphTransportPlan,
  evaluateShow,
  evaluateSpotToGlyph,
  evaluateSpotTravel,
  formatShowHud,
  getActiveShow,
  glyphColourMorphGate,
  glyphColourWeight,
  layerInShow,
  sampleGlyphTransport,
  sampleSpotLayer,
  type GlyphTransportPlan,
  type ShowcaseLayerId,
} from './heroGridShowcase'
import {
  GLYPHS,
  glyphFade,
  loadDotField,
  preloadGlyphs,
  sampleGlyphAt,
  sampleGlyphStructure,
  type DotField,
} from './dotField'

export { SHOWCASE } from './heroGridShowcase'
export type { GridShow, ShowcaseConfig } from './heroGridShowcase'
export { GLYPHS } from './dotField'
export type { GlyphConfig, DotField } from './dotField'

/**
 * Per-layer circle knobs. Omit a field to inherit from `HERO_GRID.defaults`.
 *
 * @example
 * HERO_GRID.circles.black.maxSize = 2.5
 * HERO_GRID.circles.yellow.opacity = 0.35
 * circle('blue').falloff = 220
 */
export type CircleJitter = {
  /** ± fraction of resting size. */
  size?: number
  /** ± fraction of maxSize (0.14 ≈ ±14%). */
  maxSize?: number
  /** ± fraction of falloff. */
  falloff?: number
  /** ± fraction of growRate. */
  growRate?: number
  /** ± fraction of shrinkRate. */
  shrinkRate?: number
  /** ± fraction of layer opacity. */
  opacity?: number
  /** Max position stagger in px (±). 0 = locked to lattice. */
  position?: number
  /** Random response delay range in ms: [min, max]. */
  delayMs?: [number, number]
}

export type CircleLayerConfig = {
  color: string
  /** Resting size, and size far from the pointer (px radius). */
  size?: number
  /** Peak size at the pointer (px radius). */
  maxSize?: number
  /** How far the hover enlargement reaches (px). */
  falloff?: number
  opacity?: number
  /** Grow toward the pointer (higher = snappier). */
  growRate?: number
  /** Shrink when the pointer leaves (lower = slower). */
  shrinkRate?: number
  /** Per-circle randomness within this layer (merged over defaults.jitter). */
  jitter?: CircleJitter
  /**
   * Cell corner for this layer, in cell fractions from the top-left.
   * Omit (or set `intersections: true`) for the base line-intersection grid.
   */
  corner?: [number, number]
  /** Extra rotation of `corner` around the cell centre (degrees). */
  rotation?: number
  /** Draw on line intersections instead of a rotated cell corner. */
  intersections?: boolean
}

type ResolvedJitter = {
  size: number
  maxSize: number
  falloff: number
  growRate: number
  shrinkRate: number
  opacity: number
  position: number
  delayMs: [number, number]
}

type ResolvedLayer = Required<
  Pick<
    CircleLayerConfig,
    'color' | 'size' | 'maxSize' | 'falloff' | 'opacity' | 'growRate' | 'shrinkRate'
  >
> & {
  id: CircleId
  corner?: [number, number]
  rotation?: number
  intersections: boolean
  jitter: ResolvedJitter
}

type GridFrame = {
  ox: number
  oy: number
  cx: number
  cy: number
}

type CircleSample = {
  size: number
  maxSize: number
  falloff: number
  growRate: number
  shrinkRate: number
  opacity: number
  offsetX: number
  offsetY: number
  delayMs: number
  /** Breath phase (radians). */
  pulsePhase: number
  /** Primary pulse frequency (Hz). */
  pulseFreq: number
  /** Secondary slower wobble frequency (Hz). */
  pulseFreq2: number
  /** Per-circle amplitude scale 0.5–1.5. */
  pulseAmp: number
}

const LAYER_IDS = ['yellow', 'pink', 'blue', 'black'] as const
export type CircleId = (typeof LAYER_IDS)[number]

const LAYER_SEED: Record<CircleId, number> = {
  yellow: 11,
  pink: 29,
  blue: 47,
  black: 67,
}

/** Shared grid knobs — edit these (or mutate `circles.*`) to play with the look. */
export const HERO_GRID = {
  /**
   * Master switch for the animated dot field.
   * Set to `true` to bring the dots back.
   */
  showDots: false,
  /**
   * Spacing between intersection dots (px).
   * ~19 keeps letterforms readable; much larger and A/O/S fall apart.
   */
  cell: 19.01,
  /** Hide structural lines — the field should read as dots, not a ruled grid. */
  lineColor: 'transparent',
  lineWidth: 0,
  /** Rotation of the whole base lattice (degrees). 45° = diagonal. */
  gridRotation: 45,
  /** Default corner rotation around each cell centre (degrees). */
  cellRotation: 45,

  /**
   * Hover influence shape. Multiplies each layer’s falloff, and warps the
   * boundary so the bloom isn’t a perfect circle.
   */
  hover: {
    /** Scales all falloff radii (1.4 ≈ 40% larger hover area). */
    radiusScale: 3.5,
    /** 0 = perfect circle. Keep tiny for a barely-irregular edge. */
    warp: 0.055,
    /** How many angular lobes shape the warp. */
    harmonics: 2,
    /**
     * Spatial size curve vs distance. Higher = size holds longer near the
     * pointer, then eases down. Typical 1.8–3.
     */
    falloffPower: 2.4,
    /**
     * Scare hover on already-visible dots only (never reveals hidden dots).
     * Near pointer → shrink; further out → grow.
     */
    scare: 0.2,
    /** Swell for dots further from the pointer (still in reach). */
    rimBoost: 0.18,
    /** Multiplies scare/rim for yellow/pink/blue — light but readable on touch. */
    colorScare: 0.55,
    /** How quickly the warp field drifts as the pointer moves (px⁻¹). */
    flowSpeed: 0.004,
    /** How smoothly the field follows movement (higher = snappier drift). */
    flowSmooth: 2.2,
    /** Gentle ongoing morph even when the pointer is still. */
    idleDrift: 0.12,
    /**
     * Living breath for any visible dot. Settled dots use a slow calm
     * pulse; freshly grown dots get a reactive bounce that decays into it.
     */
    pulse: {
      /** Calm settled breath (± fraction of radius). */
      amount: 0.1,
      /** Extra breath while a dot is still reacting to motion. */
      excite: 0.22,
      /**
       * How much of the breath applies even at solid glyph/hover centres.
       * 1 = full breath everywhere; lower = quieter centres, livelier edges.
       */
      core: 0.85,
      /** Extra breath toward soft edges (added on top of `core`). */
      edgeBoost: 0.2,
      /** Base frequency range in Hz [min, max] — settled / calm. */
      freqHz: [0.22, 0.55] as [number, number],
      /** Quieter second harmonic mix (0–1). */
      secondary: 0.55,
      /** Slow third wave for a less mechanical feel (0–1). */
      tertiary: 0.4,
      /** Impulse scale when a dot grows (fade-in / morph arrive). */
      kick: 3.2,
      /** Weaker impulse when shrinking (leave trail bounce). */
      kickShrink: 0.9,
      /** Spring stiffness pulling reactive offset back to 0. */
      stiffness: 22,
      /** Spring damping — higher settles faster. */
      damping: 6.5,
      /** Clamp on reactive overshoot (fraction of radius). */
      maxOvershoot: 0.48,
    },
  },

  /**
   * Scroll-linked grow — slow early, fills only near the end of the scroll.
   * Reverses cleanly on scroll up (see trio `scroll` handling).
   */
  scroll: {
    /** Fraction of hero height that maps to full fill (higher = later). */
    distance: 1.2,
    /**
     * Cubic-bezier [x1, y1, x2, y2] — heavy ease-in so growth stays quiet
     * until late in the scroll, then settles into the fill.
     */
    bezier: [0.84, 0, 0.2, 1] as [number, number, number, number],
    /** Softer catch-up so the ease doesn’t feel stepped. */
    follow: 11,
    /**
     * Peak radius multiplier at full scroll (1 = unchanged).
     * Keep modest so dots swell, not balloon.
     */
    endScale: {
      yellow: 1.28,
      pink: 1.24,
      blue: 1.26,
      black: 1,
    } satisfies Record<CircleId, number>,
    /** Opacity stays solid so the fill reads clearly. */
    endOpacity: {
      yellow: 1,
      pink: 1,
      blue: 1,
      black: 1,
    } satisfies Record<CircleId, number>,
  },

  /** Fallbacks when a layer omits a field. */
  defaults: {
    /** Resting / min size while a dot is on (hover or showcase). */
    size: 2.9,
    maxSize: 6.2,
    falloff: 160,
    opacity: 0.5,
    /** Snappy grow toward the pointer. */
    growRate: 28,
    /** Slow ease when leaving / far from the pointer. */
    shrinkRate: 1.15,
    /**
     * Default per-circle stagger. Amounts are ± fractions unless noted.
     * Tighten/widen these to make the field more uniform or more organic.
     */
    jitter: {
      size: 0.2,
      maxSize: 0.16,
      falloff: 0.04,
      growRate: 0.28,
      shrinkRate: 0.22,
      /** Coloured layers: visible opacity variation. */
      opacity: 0.22,
      /** Coloured layers: slight lattice stagger (px). */
      position: 1.6,
      delayMs: [0, 85] as [number, number],
    },
  },

  /**
   * Draw order, bottom → top.
   * Black is last so it sits above the colours.
   */
  layerOrder: ['yellow', 'pink', 'blue', 'black'] as CircleId[],

  /**
   * Per-colour circle settings. This is the main place to experiment.
   *
   *   HERO_GRID.circles.black.maxSize = 2
   *   HERO_GRID.circles.pink.falloff = 200
   *   HERO_GRID.circles.yellow.jitter.maxSize = 0.25
   */
  circles: {
    yellow: {
      color: '#f5c400',
      opacity: 0.7,
      size: 3.1,
      maxSize: 6.6,
      falloff: 190,
      growRate: 24,
      shrinkRate: 1.0,
      corner: [0, 1],
      jitter: {
        size: 0.28,
        maxSize: 0.32,
        opacity: 0.28,
        position: 1.8,
      },
    },
    pink: {
      color: '#ff4fa3',
      opacity: 0.7,
      size: 2.95,
      maxSize: 6.4,
      falloff: 160,
      growRate: 30,
      shrinkRate: 1.25,
      corner: [1, 1],
      jitter: {
        size: 0.26,
        maxSize: 0.3,
        opacity: 0.25,
        position: 1.5,
      },
    },
    blue: {
      color: '#2f6bff',
      opacity: 0.7,
      size: 2.85,
      maxSize: 6.3,
      falloff: 175,
      growRate: 27,
      shrinkRate: 1.1,
      corner: [1, 0],
      jitter: {
        size: 0.24,
        maxSize: 0.28,
        opacity: 0.26,
        position: 1.7,
      },
    },
    black: {
      color: '#000',
      opacity: 0.95,
      size: 2.7,
      /** Peak size — keep even; large variation reads as noise. */
      maxSize: 4.4,
      falloff: 100,
      growRate: 34,
      shrinkRate: 1.35,
      intersections: true,
      /** Size varies; lattice position/opacity stay locked. */
      jitter: {
        size: 0.1,
        maxSize: 0.06,
        falloff: 0.08,
        growRate: 0.08,
        shrinkRate: 0.08,
        opacity: 0,
        position: 0,
        delayMs: [0, 12],
      },
    },
  } as Record<CircleId, CircleLayerConfig>,
}

/**
 * Per-dot peak-size overrides on the black (intersection) lattice.
 * Key is `${col},${row}`. Set to `0` to hide.
 */
export const circleSize: Record<string, number> = {
  // '8,3': 6,
}

export function circleKey(col: number, row: number) {
  return `${col},${row}`
}

/** Grab a layer config for quick programmatic tweaks. */
export function circle(id: CircleId): CircleLayerConfig {
  return HERO_GRID.circles[id]
}

function mergeJitter(
  base: CircleJitter,
  override?: CircleJitter,
): ResolvedJitter {
  const delay = override?.delayMs ?? base.delayMs ?? [0, 0]
  return {
    size: override?.size ?? base.size ?? 0,
    maxSize: override?.maxSize ?? base.maxSize ?? 0,
    falloff: override?.falloff ?? base.falloff ?? 0,
    growRate: override?.growRate ?? base.growRate ?? 0,
    shrinkRate: override?.shrinkRate ?? base.shrinkRate ?? 0,
    opacity: override?.opacity ?? base.opacity ?? 0,
    position: override?.position ?? base.position ?? 0,
    delayMs: [delay[0], delay[1]],
  }
}

/** Resolve a layer with defaults filled in. */
export function resolveCircle(id: CircleId): ResolvedLayer {
  const layer = HERO_GRID.circles[id]
  const d = HERO_GRID.defaults
  return {
    id,
    color: layer.color,
    size: layer.size ?? d.size,
    maxSize: layer.maxSize ?? d.maxSize,
    falloff: layer.falloff ?? d.falloff,
    opacity: layer.opacity ?? d.opacity,
    growRate: layer.growRate ?? d.growRate,
    shrinkRate: layer.shrinkRate ?? d.shrinkRate,
    corner: layer.corner,
    rotation: layer.rotation,
    intersections: layer.intersections ?? !layer.corner,
    jitter: mergeJitter(d.jitter, layer.jitter),
  }
}

function orderedLayers(): ResolvedLayer[] {
  return HERO_GRID.layerOrder.map(resolveCircle)
}

/** Stable 0..1 random from integer seeds. */
function hash01(a: number, b: number, c: number, d: number) {
  let n = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263)
  n = Math.imul(n ^ Math.imul(c | 0, 2147483647), 1013904223)
  n = Math.imul(n ^ (d | 0), 1597334677)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

function jittered(base: number, amount: number, rand: number) {
  if (amount <= 0) return base
  return base * (1 + (rand * 2 - 1) * amount)
}

/** Per-circle sample of this layer’s knobs (stable across frames). */
export function sampleCircle(
  layer: ResolvedLayer,
  col: number,
  row: number,
): CircleSample {
  const seed = LAYER_SEED[layer.id]
  const j = layer.jitter
  const rSize = hash01(seed, col, row, 0)
  const rMax = hash01(seed, col, row, 1)
  const rFall = hash01(seed, col, row, 2)
  const rGrow = hash01(seed, col, row, 3)
  const rShrink = hash01(seed, col, row, 4)
  const rDelay = hash01(seed, col, row, 5)
  const rPulse = hash01(seed, col, row, 6)
  const rPulse2 = hash01(seed, col, row, 7)
  const rPulse3 = hash01(seed, col, row, 8)
  const rOpacity = hash01(seed, col, row, 9)
  const rPosX = hash01(seed, col, row, 10)
  const rPosY = hash01(seed, col, row, 11)
  const [delayMin, delayMax] = j.delayMs
  const [freqMin, freqMax] = HERO_GRID.hover.pulse.freqHz
  const opacity = Math.min(
    1,
    Math.max(0.05, jittered(layer.opacity, j.opacity, rOpacity)),
  )
  // Keep resting floor at 0 when configured — don't jitter idle dots back on.
  const size =
    layer.size <= 0 ? 0 : Math.max(0, jittered(layer.size, j.size, rSize))

  return {
    size,
    maxSize: Math.max(0.05, jittered(layer.maxSize, j.maxSize, rMax)),
    falloff: jittered(layer.falloff, j.falloff, rFall),
    growRate: jittered(layer.growRate, j.growRate, rGrow),
    shrinkRate: jittered(layer.shrinkRate, j.shrinkRate, rShrink),
    opacity,
    offsetX: j.position > 0 ? (rPosX * 2 - 1) * j.position : 0,
    offsetY: j.position > 0 ? (rPosY * 2 - 1) * j.position : 0,
    delayMs: delayMin + rDelay * Math.max(0, delayMax - delayMin),
    pulsePhase: rPulse * Math.PI * 2,
    pulseFreq: freqMin + rPulse2 * Math.max(0, freqMax - freqMin),
    pulseFreq2: freqMin * 0.45 + rPulse3 * (freqMax * 0.55),
    pulseAmp: 0.55 + rPulse * 0.9,
  }
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/** CSS cubic-bezier(x1, y1, x2, y2) sampled for scroll progress. */
function cubicBezierEase(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (t: number) => number {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x: number) => {
    const target = Math.min(1, Math.max(0, x))
    if (target <= 0) return 0
    if (target >= 1) return 1
    let t = target
    for (let i = 0; i < 8; i++) {
      const xEst = sampleX(t) - target
      const dx = sampleDX(t)
      if (Math.abs(xEst) < 1e-6 || Math.abs(dx) < 1e-6) break
      t = Math.min(1, Math.max(0, t - xEst / dx))
    }
    return sampleY(t)
  }
}

let scrollBezierFn: ((t: number) => number) | null = null
let scrollBezierKey = ''

function easeScrollProgress(t: number) {
  const [x1, y1, x2, y2] = HERO_GRID.scroll.bezier ?? [0.45, 0.02, 0.2, 1]
  const key = `${x1},${y1},${x2},${y2}`
  if (!scrollBezierFn || key !== scrollBezierKey) {
    scrollBezierFn = cubicBezierEase(x1, y1, x2, y2)
    scrollBezierKey = key
  }
  return scrollBezierFn(Math.min(1, Math.max(0, t)))
}

/**
 * Spatial falloff: hold size near the pointer, then ease down
 * (controlled by `HERO_GRID.hover.falloffPower`).
 */
type WarpField = {
  /** Smoothed pointer sample used for location-based morph. */
  x: number
  y: number
  /** Accumulated phase drift from travel + idle. */
  p1: number
  p2: number
  p3: number
}

/**
 * Directional falloff radius from the pointer — lightly warped so the bloom
 * isn’t a perfect circle. Shape drifts via `field` as the pointer moves.
 */
function hoverReach(
  sampleFalloff: number,
  dx: number,
  dy: number,
  field: WarpField,
) {
  const { radiusScale, warp, harmonics } = HERO_GRID.hover
  const base = sampleFalloff * radiusScale
  if (warp <= 0) return base

  const ang = Math.atan2(dy, dx)
  const loc = field.x * 0.003 + field.y * 0.0025
  let shape = 1
  const lobes = Math.max(1, Math.round(harmonics))
  for (let k = 1; k <= lobes; k++) {
    const phase = field.p1 * (0.35 + k * 0.15) + loc * k + k * 0.4
    shape += (warp / k) * Math.sin(k * ang + phase)
  }
  shape +=
    warp *
    0.18 *
    Math.sin(4.2 * ang + field.p2 + loc) *
    Math.cos(2.6 * ang + field.p3 * 0.5)

  return base * Math.max(0.85, shape)
}

function rotateAround(
  x: number,
  y: number,
  cx: number,
  cy: number,
  degrees: number,
) {
  const rad = (degrees * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = x - cx
  const dy = y - cy
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  }
}

function layerPoint(
  layer: ResolvedLayer,
  col: number,
  row: number,
  frame: GridFrame,
) {
  const { cell, cellRotation, gridRotation } = HERO_GRID

  let localX: number
  let localY: number

  if (layer.intersections || !layer.corner) {
    localX = col * cell
    localY = row * cell
  } else {
    const [cx, cy] = layer.corner
    const centerX = (col + 0.5) * cell
    const centerY = (row + 0.5) * cell
    const relX = (cx - 0.5) * cell
    const relY = (cy - 0.5) * cell
    const rad = ((layer.rotation ?? cellRotation) * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    localX = centerX + relX * cos - relY * sin
    localY = centerY + relX * sin + relY * cos
  }

  return rotateAround(
    frame.ox + localX,
    frame.oy + localY,
    frame.cx,
    frame.cy,
    gridRotation,
  )
}

/** Lattice point plus per-circle position stagger (coloured layers only). */
function circleWorldPoint(
  layer: ResolvedLayer,
  col: number,
  row: number,
  frame: GridFrame,
  sample: CircleSample,
) {
  const point = layerPoint(layer, col, row, frame)
  return {
    x: point.x + sample.offsetX,
    y: point.y + sample.offsetY,
  }
}

/** Optional: call after mutating config at rest to force a redraw. */
let requestHeroGridRedraw: (() => void) | null = null
export function refreshHeroGrid() {
  requestHeroGridRedraw?.()
}

export function HeroGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hud, setHud] = useState<string | null>(
    SHOWCASE.enabled && SHOWCASE.hud ? '…' : null,
  )
  const hudTextRef = useRef<string | null>(null)

  useEffect(() => {
    if (!HERO_GRID.showDots) return

    const el = ref.current
    const canvas = canvasRef.current
    if (!el || !canvas) return

    const hero = el.closest('section') ?? el
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let frame: GridFrame = { ox: 0, oy: 0, cx: 0, cy: 0 }
    let dpr = 1
    let cols = 0
    let rows = 0
    /** radii[layerIndex][col + row * cols] */
    let radii: Float32Array[] = []
    /** When each circle last entered the influence zone (ms), or -1. */
    let activatedAt: Float32Array[] = []
    /** Previous frame target — drives reactive kicks. */
    let prevTargets: Float32Array[] = []
    /** Reactive bounce offset (fraction of radius). */
    let reactPos: Float32Array[] = []
    /** Reactive bounce velocity. */
    let reactVel: Float32Array[] = []
    let pointer: { x: number; y: number } | null = null
    let prevPointer: { x: number; y: number } | null = null
    const warpField: WarpField = { x: 0, y: 0, p1: 0, p2: 0, p3: 0 }
    let raf = 0
    let needsResize = true
    let lastTime = 0
    let settling = true
    let showcaseStart = 0
    let showcaseDone = !SHOWCASE.enabled
    /** Don't start the reel until letter/glyph fields are ready. */
    let glyphsReady = false
    const glyphFields = new Map<string, DotField>()
    /** Smoothed 0–1 hero scroll progress for parallax shrink. */
    let scrollT = 0
    let scrollTTarget = 0
    let scrollRaf = 0
    /** Letter→letter mass-transport plan (leave→arrive paths). */
    let glyphTransport: GlyphTransportPlan | null = null
    let glyphTransportKey = ''
    let morphFromS = new Float32Array(0)
    let morphToS = new Float32Array(0)

    const readScrollProgress = () => {
      const section = el.closest('section') ?? hero
      const rect = section.getBoundingClientRect()
      const span = Math.max(1, rect.height * (HERO_GRID.scroll.distance ?? 0.88))
      // Sticky hero keeps rect.top ≈ 0; measure how far `.home-cover` has risen over it.
      const cover = document.querySelector('.home-cover')
      if (cover) {
        const covered = Math.max(0, rect.height - cover.getBoundingClientRect().top)
        return Math.min(1, Math.max(0, covered / span))
      }
      const scrolled = Math.max(0, -rect.top)
      return Math.min(1, Math.max(0, scrolled / span))
    }

    const updateScrollTarget = () => {
      scrollRaf = 0
      scrollTTarget = readScrollProgress()
      schedule()
    }

    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScrollTarget)
    }

    const advanceWarp = (dt: number) => {
      const { flowSpeed, flowSmooth, idleDrift } = HERO_GRID.hover
      if (pointer) {
        const follow = 1 - Math.exp(-dt * flowSmooth)
        warpField.x += (pointer.x - warpField.x) * follow
        warpField.y += (pointer.y - warpField.y) * follow

        if (prevPointer) {
          const moved = Math.hypot(
            pointer.x - prevPointer.x,
            pointer.y - prevPointer.y,
          )
          const drift = moved * flowSpeed
          warpField.p1 += drift
          warpField.p2 += drift * 0.73
          warpField.p3 += drift * 1.21
        }
        prevPointer = { x: pointer.x, y: pointer.y }
      } else {
        prevPointer = null
      }
      // Subtle ongoing morph so the edge never feels frozen.
      const idle = idleDrift * dt
      warpField.p1 += idle * 0.9
      warpField.p2 += idle * 1.15
      warpField.p3 += idle * 0.7
    }

    const resizeLayerBuf = (
      bufs: Float32Array[],
      L: number,
      count: number,
      fill: number,
    ) => {
      if (bufs[L].length !== count) {
        const next = new Float32Array(count)
        next.fill(fill)
        next.set(bufs[L].subarray(0, Math.min(bufs[L].length, count)))
        bufs[L] = next
      }
    }

    const ensureBuffers = (layers: ResolvedLayer[]) => {
      const count = cols * rows
      while (radii.length < layers.length) {
        radii.push(new Float32Array(count))
        const act = new Float32Array(count)
        act.fill(-1)
        activatedAt.push(act)
        prevTargets.push(new Float32Array(count))
        reactPos.push(new Float32Array(count))
        reactVel.push(new Float32Array(count))
      }
      radii = radii.slice(0, layers.length)
      activatedAt = activatedAt.slice(0, layers.length)
      prevTargets = prevTargets.slice(0, layers.length)
      reactPos = reactPos.slice(0, layers.length)
      reactVel = reactVel.slice(0, layers.length)
      for (let L = 0; L < radii.length; L++) {
        const fill = layers[L]?.size ?? HERO_GRID.defaults.size
        resizeLayerBuf(radii, L, count, fill)
        resizeLayerBuf(activatedAt, L, count, -1)
        resizeLayerBuf(prevTargets, L, count, 0)
        resizeLayerBuf(reactPos, L, count, 0)
        resizeLayerBuf(reactVel, L, count, 0)
      }
    }

    const resize = () => {
      const rect = el.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (width <= 0 || height <= 0) return

      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cover = Math.hypot(width, height)
      frame = {
        ox: (width - cover) / 2,
        oy: (height - cover) / 2,
        cx: width / 2,
        cy: height / 2,
      }

      const { cell } = HERO_GRID
      cols = Math.ceil(cover / cell) + 2
      rows = Math.ceil(cover / cell) + 2
      ensureBuffers(orderedLayers())

      el.style.setProperty('--grid-cover', `${cover}px`)
      el.style.setProperty('--grid-rotation', `${HERO_GRID.gridRotation}deg`)
      el.style.setProperty('--grid-cell', `${HERO_GRID.cell}px`)
      el.style.setProperty('--grid-line', HERO_GRID.lineColor)
      el.style.setProperty('--grid-line-width', `${HERO_GRID.lineWidth}px`)
      needsResize = false
    }

    const targetAt = (
      layer: ResolvedLayer,
      col: number,
      row: number,
      sample: CircleSample,
      activated: Float32Array,
      index: number,
      now: number,
      showMix: number,
      /** Peak radius multiplier (first-frame big dots, etc.). */
      dotScale = 1,
    ) => {
      const override =
        layer.intersections ? circleSize[circleKey(col, row)] : undefined
      if (override === 0) return 0

      const floor = override ?? sample.size
      const peak =
        Math.max(floor + 0.05, override ?? sample.maxSize) *
        Math.max(0.05, dotScale)
      const { x, y } = circleWorldPoint(layer, col, row, frame, sample)

      // Visibility comes from the showcase only — hover never reveals dots.
      // showMix drops as the travel centre moves away, so leavers fade live.
      if (showMix <= 0.001) {
        activated[index] = -1
        return 0
      }
      let size = floor + (peak - floor) * showMix

      const hoverAllowed = showcaseDone
        ? SHOWCASE.hoverAfter
          ? 1
          : 0
        : SHOWCASE.hoverDuring

      if (pointer && hoverAllowed > 0) {
        const dx = x - pointer.x
        const dy = y - pointer.y
        const dist = Math.hypot(dx, dy)
        const reach = hoverReach(sample.falloff, dx, dy, warpField)
        const proximity = smoothstep(1 - dist / Math.max(1, reach))

        if (proximity >= 0.01) {
          if (activated[index] < 0) activated[index] = now
          // Instant response — delay made the scare feel broken / missing.
          const colorMul =
            layer.id === 'black' ? 1 : (HERO_GRID.hover.colorScare ?? 0.28)
          const scare = (HERO_GRID.hover.scare ?? 0.2) * colorMul
          const rimBoost = (HERO_GRID.hover.rimBoost ?? 0.18) * colorMul
          // Near pointer: shrink. Mid-ring: swell. Edge: fades out.
          const near = proximity * proximity
          const rim = Math.sin(proximity * Math.PI)
          size *= 1 + (-scare * near + rimBoost * rim) * hoverAllowed
        } else {
          activated[index] = -1
        }
      } else {
        activated[index] = -1
      }

      return size
    }

    /** Ambient wave + edge weighting for a sample at time `now`. */
    const breathWave = (
      sample: CircleSample,
      now: number,
      edgeSoft: number,
      energy: number,
    ) => {
      const { pulse } = HERO_GRID.hover
      const secs = now * 0.001
      const breath =
        (pulse.core ?? 0.85) + (pulse.edgeBoost ?? 0.2) * edgeSoft
      const w1 =
        Math.sin(secs * sample.pulseFreq * Math.PI * 2 + sample.pulsePhase)
      const w2 = Math.sin(
        secs * sample.pulseFreq2 * Math.PI * 2 + sample.pulsePhase * 1.7,
      )
      const w3 = Math.sin(
        secs * sample.pulseFreq * 0.37 * Math.PI * 2 +
          sample.pulsePhase * 2.3,
      )
      const sec = pulse.secondary
      const ter = pulse.tertiary ?? 0
      const wave =
        w1 * (1 - sec) * (1 - ter * 0.5) + w2 * sec + w3 * ter * 0.5
      const amt =
        pulse.amount + (pulse.excite ?? 0.2) * energy * sample.pulseAmp
      return breath * wave * amt
    }

    const tick = (time: number) => {
      raf = 0
      if (needsResize) resize()
      if (width <= 0 || height <= 0) return

      const dt = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 1 / 60
      lastTime = time

      // Smooth scroll progress so shrink feels organic, not stepped.
      {
        const follow = HERO_GRID.scroll.follow ?? 10
        const catchUp = 1 - Math.exp(-dt * follow)
        scrollT += (scrollTTarget - scrollT) * catchUp
      }

      // Don't start the reel until glyphs are ready (letter morph needs them).
      if (!glyphsReady) {
        showcaseStart = time
      } else if (!showcaseStart) {
        showcaseStart = time
      }
      const active = showcaseDone
        ? null
        : getActiveShow(time - showcaseStart, SHOWCASE)
      if (active === 'done') {
        showcaseDone = true
        const doneHud = SHOWCASE.hud ? '#done · hover' : null
        if (hudTextRef.current !== doneHud) {
          hudTextRef.current = doneHud
          setHud(doneHud)
        }
      } else if (active && SHOWCASE.hud) {
        const nextHud = formatShowHud(active)
        if (hudTextRef.current !== nextHud) {
          hudTextRef.current = nextHud
          setHud(nextHud)
        }
      }

      advanceWarp(dt)

      const layers = orderedLayers()
      ensureBuffers(layers)

      ctx.clearRect(0, 0, width, height)

      let moving = false
      let anyLit = false
      // Keep animating while showcasing or hovering.
      if (pointer || (SHOWCASE.enabled && !showcaseDone)) moving = true
      const { pulse } = HERO_GRID.hover
      const scrollCfg = HERO_GRID.scroll
      const scrollEase = easeScrollProgress(scrollT)
      let reactAlive = false

      // Letter→letter: assign leave→arrive paths once, then dots travel them.
      const letterMorphing =
        active &&
        active !== 'done' &&
        active.show.type === 'glyph' &&
        active.morph?.fromGlyph &&
        active.morph.u < 1
          ? active
          : null
      if (
        letterMorphing &&
        letterMorphing.morph?.fromGlyph &&
        letterMorphing.show.type === 'glyph'
      ) {
        const fromId = letterMorphing.morph.fromGlyph
        const toId = letterMorphing.show.glyph
        const fromField = glyphFields.get(fromId)
        const toField = glyphFields.get(toId)
        const blackLayer =
          layers.find((l) => l.id === 'black') ?? layers[layers.length - 1]
        const fade =
          glyphFade(letterMorphing.t, {
            morphIn: letterMorphing.morphIn,
            morphOut: letterMorphing.morphOut,
          }) * (letterMorphing.show.intensity ?? 1)
        if (fromField && toField && blackLayer) {
          const maxCol = blackLayer.intersections ? cols : cols - 1
          const maxRow = blackLayer.intersections ? rows : rows - 1
          const key = `${fromId}>${toId}:${cols}x${rows}:${Math.round(width)}x${Math.round(height)}`
          if (key !== glyphTransportKey || !glyphTransport) {
            const count = cols * rows
            if (morphFromS.length !== count) {
              morphFromS = new Float32Array(count)
              morphToS = new Float32Array(count)
            }
            for (let row = 0; row < maxRow; row++) {
              for (let col = 0; col < maxCol; col++) {
                const i = col + row * cols
                const sample = sampleCircle(blackLayer, col, row)
                const { x, y } = circleWorldPoint(
                  blackLayer,
                  col,
                  row,
                  frame,
                  sample,
                )
                morphFromS[i] = sampleGlyphStructure(
                  fromField,
                  x,
                  y,
                  width,
                  height,
                  letterMorphing.morph.fromIntensity,
                )
                morphToS[i] = sampleGlyphStructure(
                  toField,
                  x,
                  y,
                  width,
                  height,
                  fade,
                )
              }
            }
            glyphTransport = buildGlyphTransportPlan(
              morphFromS,
              morphToS,
              cols,
              maxCol,
              maxRow,
            )
            glyphTransportKey = key
          }
        }
      } else {
        glyphTransport = null
        glyphTransportKey = ''
      }

      for (let L = 0; L < layers.length; L++) {
        const layer = layers[L]
        const layerRadii = radii[L]
        const layerActivated = activatedAt[L]
        const layerPrev = prevTargets[L]
        const layerReact = reactPos[L]
        const layerReactVel = reactVel[L]
        const endScale = scrollCfg.endScale[layer.id] ?? 0.2
        const endOpacity = scrollCfg.endOpacity[layer.id] ?? 0.25
        const scrollScale = 1 + (endScale - 1) * scrollEase
        const scrollAlpha = 1 + (endOpacity - 1) * scrollEase

        ctx.fillStyle = layer.color

        const maxCol = layer.intersections ? cols : cols - 1
        const maxRow = layer.intersections ? rows : rows - 1

        for (let row = 0; row < maxRow; row++) {
          for (let col = 0; col < maxCol; col++) {
            const i = col + row * cols
            const sample = sampleCircle(layer, col, row)
            const { x, y } = circleWorldPoint(layer, col, row, frame, sample)
            let showMix = 0
            if (active && active !== 'done') {
              if (active.show.type === 'glyph') {
                const field = glyphFields.get(active.show.glyph)
                const fade =
                  glyphFade(active.t, {
                    morphIn: active.morphIn,
                    morphOut: active.morphOut,
                  }) * (active.show.intensity ?? 1)
                const layerAllowed = layerInShow(
                  active.show.layers,
                  layer.id as ShowcaseLayerId,
                )

                if (active.morph?.fromSpot) {
                  if (active.spotMorph && active.spotMorph.u < 1 && field) {
                    // Same chase travel as shape→shape, then resolve into letter.
                    showMix = evaluateSpotToGlyph(
                      x,
                      y,
                      width,
                      height,
                      active.spotMorph,
                      field,
                      layer.id as ShowcaseLayerId,
                      fade,
                    )
                  } else if (!field) {
                    // Glyph not ready — hold the spot so we never flash empty.
                    showMix = sampleSpotLayer(
                      x,
                      y,
                      width,
                      height,
                      active.morph.fromSpot,
                      layer.id as ShowcaseLayerId,
                      active.morph.fromIntensity,
                    )
                  } else if (layerAllowed) {
                    // Morph settled — hold the letter for the rest of the beat.
                    showMix = sampleGlyphAt(
                      field,
                      layer.id,
                      x,
                      y,
                      width,
                      height,
                      fade,
                    ).mix
                  }
                } else if (field && active.morph?.fromGlyph) {
                  if (active.morph.u < 1 && glyphTransport) {
                    // Mass travels leave→arrive; colour soft-hands off with it.
                    const struct = sampleGlyphTransport(
                      col,
                      row,
                      active.morph.u,
                      glyphTransport,
                      'black',
                    )
                    const fromField = glyphFields.get(active.morph.fromGlyph)
                    if (layer.id === 'black') {
                      // Tint letters still keep a light black under-structure.
                      const fromTint =
                        fromField?.config.colorMode === 'tint'
                          ? 0.22
                          : glyphColourWeight(fromField, 'black')
                      const toTint =
                        field.config.colorMode === 'tint'
                          ? 0.22
                          : glyphColourWeight(field, 'black')
                      const u = active.morph.u
                      const blackW = fromTint + (toTint - fromTint) * u
                      showMix = struct * Math.max(0.18, blackW)
                    } else {
                      showMix =
                        struct *
                        glyphColourMorphGate(
                          active.morph.u,
                          layer.id as ShowcaseLayerId,
                          fromField,
                          field,
                          active.morph.fromLayers,
                          active.morph.toLayers ?? active.show.layers,
                        )
                    }
                  } else if (layerAllowed) {
                    showMix = sampleGlyphAt(
                      field,
                      layer.id,
                      x,
                      y,
                      width,
                      height,
                      fade,
                    ).mix
                  }
                } else if (field && layerAllowed) {
                    showMix = sampleGlyphAt(
                      field,
                      layer.id,
                      x,
                      y,
                      width,
                      height,
                      fade,
                    ).mix
                  }
              } else if (
                active.show.type === 'spot' &&
                active.spotMorph &&
                active.spotMorph.u < 1
              ) {
                // Blob slides left → right (or reverse) so dots travel with it.
                showMix = evaluateSpotTravel(
                  x,
                  y,
                  width,
                  height,
                  active.spotMorph,
                  layer.id as ShowcaseLayerId,
                )
              } else {
                showMix = evaluateShow(
                  active.show,
                  active.t,
                  {
                    x,
                    y,
                    width,
                    height,
                    col,
                    row,
                    layerId: layer.id as ShowcaseLayerId,
                    timeMs: time,
                    pointer,
                    scroll: scrollEase,
                  },
                  {
                    morphIn: active.morphIn,
                    morphOut: active.morphOut,
                  },
                )
              }
            }
            const showcasing = !!(active && active !== 'done')
            const morphing = !!(
              active &&
              active !== 'done' &&
              ((active.morph && active.morph.u < 1) ||
                (active.spotMorph && active.spotMorph.u < 1))
            )
            // Spot travel stays snappy; letter→letter uses a softer fluid track
            // so fade-out / mass drift don’t pop.
            const glyphMorphing = !!(
              active &&
              active !== 'done' &&
              active.morph?.fromGlyph &&
              active.morph.u < 1
            )
            const spotTraveling = !!(
              active &&
              active !== 'done' &&
              ((active.spotMorph && active.spotMorph.u < 1) ||
                (active.morph?.fromSpot && active.morph.u < 1))
            )
            const current = layerRadii[i] ?? sample.size
            const dotScale =
              active && active !== 'done' ? activeDotScale(active) : 1
            const target = targetAt(
              layer,
              col,
              row,
              sample,
              layerActivated,
              i,
              time,
              showMix,
              dotScale,
            )
            // Letter morph: butter springs (follow field, never snap). Spot stays snappy.
            const fieldTracking = spotTraveling || glyphMorphing
            const colourLayer = fieldTracking && layer.id !== 'black'
            const shrinking = fieldTracking && target < current - 0.015
            const growDamp = glyphMorphing
              ? colourLayer
                ? 0.72
                : 0.88
              : fieldTracking
                ? colourLayer && !shrinking
                  ? 1.05
                  : 1.45
                : morphing
                  ? 0.38
                  : showcasing
                    ? 0.5
                    : 1
            const shrinkDamp = glyphMorphing
              ? colourLayer
                ? shrinking
                  ? 2.4
                  : 1.55
                : shrinking
                  ? 2.85
                  : 1.7
              : fieldTracking
                ? shrinking
                  ? colourLayer
                    ? 3.6
                    : 5.2
                  : colourLayer
                    ? 2.1
                    : 2.4
                : target <= 0.001
                  ? showcasing
                    ? 2.0
                    : 1.6
                  : morphing
                    ? 0.42
                    : showcasing
                      ? 0.7
                      : 1
            // Hover-style springs: grow snappy, shrink a touch softer.
            let step: number
            if (target > current) {
              step = 1 - Math.exp(-dt * sample.growRate * growDamp)
            } else {
              step = 1 - Math.exp(-dt * sample.shrinkRate * shrinkDamp)
            }
            const next = current + (target - current) * step
            layerRadii[i] = next

            // Reactive bounce — muted during letter morph so travel stays silky.
            const prevT = layerPrev[i] ?? 0
            const dTarget = target - prevT
            layerPrev[i] = target
            const peak = Math.max(0.001, sample.maxSize)
            const dNorm = dTarget / peak
            const kickMul = glyphMorphing ? 0.22 : 1
            if (dNorm > 0.015) {
              layerReactVel[i] += dNorm * (pulse.kick ?? 3) * kickMul
            } else if (dNorm < -0.02) {
              layerReactVel[i] += dNorm * (pulse.kickShrink ?? 0.9) * kickMul
            }
            const stiff = pulse.stiffness ?? 22
            const damp = pulse.damping ?? 6.5
            layerReactVel[i] +=
              (-stiff * layerReact[i] - damp * layerReactVel[i]) * dt
            layerReact[i] += layerReactVel[i] * dt
            const maxO = pulse.maxOvershoot ?? 0.48
            if (layerReact[i] > maxO) {
              layerReact[i] = maxO
              layerReactVel[i] *= 0.35
            } else if (layerReact[i] < -maxO * 0.65) {
              layerReact[i] = -maxO * 0.65
              layerReactVel[i] *= 0.35
            }

            const energy = Math.min(
              1,
              Math.hypot(layerReact[i] * 1.6, layerReactVel[i] * 0.07),
            )
            if (energy > 0.02 || Math.abs(layerReact[i]) > 0.008) {
              reactAlive = true
            }

            if (Math.abs(target - next) > 0.02) moving = true
            if (next <= 0.02 && energy < 0.04) {
              layerReact[i] = 0
              layerReactVel[i] = 0
              continue
            }
            anyLit = true

            const edgeSoft =
              showMix > 0.01 ? (1 - showMix) ** 1.1 : 0.5
            const ambient = breathWave(sample, time, edgeSoft, energy)
            const drawn = Math.max(
              0,
              next * (1 + ambient + layerReact[i]) * scrollScale,
            )
            if (drawn <= 0.02) continue

            ctx.globalAlpha = sample.opacity * scrollAlpha
            ctx.beginPath()
            ctx.arc(x, y, drawn, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      ctx.globalAlpha = 1
      // Breath / reactive bounce / scroll catch-up never freeze mid-motion.
      const breathAlive =
        (anyLit && pulse.amount > 0) || reactAlive
      const scrollMoving = Math.abs(scrollTTarget - scrollT) > 0.002
      settling = moving || !!pointer || breathAlive || scrollMoving
      if (settling) raf = requestAnimationFrame(tick)
      else lastTime = 0
    }

    const schedule = () => {
      settling = true
      if (!raf) {
        lastTime = 0
        raf = requestAnimationFrame(tick)
      }
    }

    requestHeroGridRedraw = schedule

    const glyphIds = [
      ...new Set(
        SHOWCASE.sequence
          .filter((s): s is Extract<(typeof SHOWCASE.sequence)[number], { type: 'glyph' }> => s.type === 'glyph')
          .map((s) => s.glyph),
      ),
    ]
    if (glyphIds.length === 0) {
      glyphsReady = true
    } else {
      void preloadGlyphs(glyphIds)
        .then(async () => {
          await Promise.all(
            glyphIds.map(async (id) => {
              const config = GLYPHS[id]
              if (!config) return
              glyphFields.set(id, await loadDotField(config))
            }),
          )
          glyphsReady = true
          showcaseStart = 0
          schedule()
        })
        .catch((err) => {
          console.warn('[HeroGrid] glyph preload failed', err)
          glyphsReady = true
          showcaseStart = 0
          schedule()
        })
    }

    const setPointer = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      schedule()
    }

    const onPointerLeave = () => {
      pointer = null
      schedule()
    }

    const onPointerUp = (event: PointerEvent) => {
      // Touch lifts clear; mouse keeps hover until leave.
      if (event.pointerType === 'touch' || event.pointerType === 'pen') {
        pointer = null
        schedule()
      }
    }

    const onResize = () => {
      needsResize = true
      schedule()
    }

    resize()
    scrollTTarget = readScrollProgress()
    scrollT = scrollTTarget
    schedule()

    // pointerdown covers mobile tap; move covers hover + drag.
    hero.addEventListener('pointerdown', setPointer)
    hero.addEventListener('pointermove', setPointer)
    hero.addEventListener('pointerup', onPointerUp)
    hero.addEventListener('pointercancel', onPointerUp)
    hero.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    const observer = new ResizeObserver(onResize)
    observer.observe(el)

    return () => {
      requestHeroGridRedraw = null
      hero.removeEventListener('pointerdown', setPointer)
      hero.removeEventListener('pointermove', setPointer)
      hero.removeEventListener('pointerup', onPointerUp)
      hero.removeEventListener('pointercancel', onPointerUp)
      hero.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(scrollRaf)
    }
  }, [])

  return (
    <>
      <div
        ref={ref}
        className="bg bg--grid"
        aria-hidden="true"
        style={{
          ['--grid-cell' as string]: `${HERO_GRID.cell}px`,
          ['--grid-line' as string]: HERO_GRID.lineColor,
          ['--grid-line-width' as string]: `${HERO_GRID.lineWidth}px`,
          ['--grid-rotation' as string]: `${HERO_GRID.gridRotation}deg`,
        }}
      >
        <div className="hero-grid__lines" />
        {HERO_GRID.showDots && (
          <canvas ref={canvasRef} className="hero-grid__dots" />
        )}
      </div>
      {hud && (
        <div className="hero-grid__hud" aria-live="polite">
          {hud}
        </div>
      )}
    </>
  )
}
