/**
 * Auto-playing grid showcases — edit `SHOWCASE.sequence` to try new patterns.
 *
 * On-screen HUD shows `#N · label` so you can call out favourites.
 *
 * @example
 * SHOWCASE.sequence.push({ type: 'ripple', duration: 2000, origin: 'center' })
 */

import {
  glyphChar,
  sampleGlyphAt,
  sampleGlyphStructure,
  type DotField,
} from './dotField'

export type ShowcaseLayerId = 'yellow' | 'pink' | 'blue' | 'black'

/** Which layers a show affects. */
export type ShowLayers =
  | 'all'
  | 'color'
  | 'black'
  | ShowcaseLayerId
  | ShowcaseLayerId[]

type ShowBase = {
  /** Length of this beat in ms. */
  duration: number
  /** Short name for the HUD / notes. */
  label?: string
  /** Layers that respond. Default: all. */
  layers?: ShowLayers
  /** 0–1 mix toward each circle’s maxSize. Default 1. */
  intensity?: number
  /**
   * Multiplies peak dot radius while this beat is active (1 = normal).
   * Use for a first-frame “big dots” look without growing the spot band.
   */
  dotScale?: number
  /**
   * Amplify per-colour lag / phase / fade stagger (1 = default voice,
   * 2–3 = obvious colour chase like the pendulum).
   */
  stagger?: number
}

export type GridShow =
  | (ShowBase & { type: 'pause' })
  | (ShowBase & {
      type: 'ripple'
      origin?:
        | 'center'
        | 'tl'
        | 'tr'
        | 'bl'
        | 'br'
        | { x: number; y: number }
      band?: number
      travel?: number
    })
  | (ShowBase & {
      type: 'duoRipple'
      band?: number
      /** Second origin; first is always center unless overridden. */
      originB?: 'tl' | 'tr' | 'bl' | 'br' | { x: number; y: number }
    })
  | (ShowBase & {
      type: 'wipe'
      axis?: 'x' | 'y' | 'diag'
      reverse?: boolean
      soft?: number
    })
  | (ShowBase & {
      type: 'scanner'
      axis?: 'x' | 'y'
      reverse?: boolean
      soft?: number
    })
  | (ShowBase & {
      type: 'cross'
      soft?: number
    })
  | (ShowBase & {
      type: 'spiral'
      turns?: number
      band?: number
    })
  | (ShowBase & {
      type: 'rain'
      columns?: number
      soft?: number
    })
  | (ShowBase & {
      type: 'bloom'
      band?: number
    })
  | (ShowBase & {
      type: 'orbit'
      radius?: number
      band?: number
    })
  | (ShowBase & {
      type: 'heartbeat'
      beats?: number
    })
  | (ShowBase & {
      type: 'checker'
      cells?: number
    })
  | (ShowBase & {
      type: 'stagger'
      axis?: 'x' | 'y'
      soft?: number
    })
  | (ShowBase & {
      type: 'burst'
      hold?: number
    })
  | (ShowBase & {
      type: 'diamond'
      band?: number
      travel?: number
    })
  | (ShowBase & {
      type: 'bars'
      count?: number
      soft?: number
    })
  | (ShowBase & {
      type: 'vortex'
      turns?: number
      band?: number
    })
  | (ShowBase & {
      type: 'sparkle'
      density?: number
    })
  | (ShowBase & {
      type: 'moire'
      band?: number
    })
  | (ShowBase & {
      type: 'pendulum'
      band?: number
      /** Default horizontal swing; `y` = vertical bob chase. */
      axis?: 'x' | 'y'
    })
  | (ShowBase & {
      /**
       * Three colour circles at left / middle / right that drift and play.
       * Intended with `layers: 'color'` (no black).
       */
      type: 'trio'
      band?: number
      /** How far each circle wanders from its lane (0–1 of min side). */
      play?: number
    })
  | (ShowBase & {
      type: 'split'
      axis?: 'x' | 'y'
      soft?: number
    })
  | (ShowBase & {
      type: 'fan'
      soft?: number
    })
  | (ShowBase & {
      type: 'comet'
      band?: number
      path?: 'diag' | 'orbit' | 'horizontal'
    })
  | (ShowBase & {
      type: 'target'
      rings?: number
      band?: number
    })
  | (ShowBase & {
      type: 'shear'
      soft?: number
    })
  | (ShowBase & {
      type: 'breathe'
      waves?: number
    })
  | (ShowBase & {
      type: 'tunnel'
      rings?: number
      band?: number
    })
  | (ShowBase & {
      type: 'glitch'
      slices?: number
    })
  | (ShowBase & {
      type: 'ladder'
      soft?: number
    })
  | (ShowBase & {
      type: 'glyph'
      /** Key in `GLYPHS` from `dotField.ts` (A, world, eye, …). */
      glyph: string
      /** Travel landing centre when morphing from a spot (0–1). */
      at?: { x: number; y: number }
      /** Soft disc band used while travelling into the glyph. */
      band?: number
    })
  | (ShowBase & {
      type: 'spot'
      /** Relative center (0–1). */
      at?: { x: number; y: number }
      band?: number
      /** Disc silhouette. Default `circle`. */
      shape?: 'circle' | 'square'
    })

/** How consecutive glyphs dissolve into each other. */
export type GlyphMorphConfig = {
  /** Crossfade window in ms at glyph→glyph boundaries. 0 = independent fades. */
  ms: number
  /**
   * Combine overlapping samples:
   * - `transfer` — shared dots stay; spare mass feeds neighbours (no spin/slide)
   * - `crossfade` — linear lerp
   * - `max` / `softMax` — union dissolves
   * - `migrate` — legacy sliding (prefer `transfer`)
   */
  mode: 'transfer' | 'migrate' | 'crossfade' | 'max' | 'softMax'
  /** How strongly neighbours catch leaving mass (0–1). */
  neighbor?: number
  /** How long leaving ink lingers while handing off (0–1). */
  trail?: number
  /** Lattice steps to search for leave→arrive paths. */
  pathRadius?: number
  /** Minimum arrive allowed without inbound mass (keep small). */
  seed?: number
  /** Legacy migrate knobs (ignored by `transfer`). */
  flow?: 'diag' | 'x' | 'y' | 'radial'
  front?: number
  travel?: number
  twist?: number
  zoom?: number
  pathTaps?: number
}

/**
 * Spot travel easings — fluid showcase-style curves (pendulum pace).
 */
export type SpotTravelEase =
  | 'sine' // easeInOutSine — same family as pendulum / chase
  | 'smooth' // smoothstep
  | 'cubic' // easeInOutCubic
  | 'surge' // kept as optional sharper option
  | 'surgeSoft'
  | 'surgeHard'
  | 'surgeLate'
  | 'surgeEarly'
  | 'surgeCoast'
  | 'surgeSnap'
  | 'surgeDeep'

/** Default compare reel — fluid curves only. */
export const SPOT_TRAVEL_EASES: SpotTravelEase[] = [
  'sine',
  'smooth',
  'cubic',
]

/** One-shot boot: full black field → pause → ease into beat 1. */
export type IntroConfig = {
  /** Hold every black circle at full size. */
  holdMs: number
  /** Flood → first spot ease. Defaults to `glyphMorph.ms`. */
  morphMs?: number
  /** Flood centre (0–1). Default middle. */
  at?: { x: number; y: number }
  /** Flood radius — large enough to cover the whole grid. */
  band?: number
  /**
   * Peak-radius multiplier for the full-screen flood so dots overlap into
   * a solid black field. Lerps down to 1 as the first spot lands.
   */
  dotScale?: number
}

export type ShowcaseConfig = {
  enabled: boolean
  loop: boolean
  gapMs: number
  hoverDuring: number
  hoverAfter: boolean
  /** Show `#N · label` overlay while playing. */
  hud: boolean
  /** First-load only — not part of the looping reel. */
  intro?: IntroConfig | null
  /** Glyph→glyph morph. Tune `ms` / `mode` here. */
  glyphMorph: GlyphMorphConfig
  /** Spot centre travel curve (left ↔ right). */
  spotTravel: {
    /** Used when `compare` is false. */
    ease: SpotTravelEase
    /** Cycle every easing on each morph so you can pick by eye. */
    compare: boolean
    /**
     * Path shape between spots:
     * - `straight` — linear chord
     * - `swing` / `chase` / `arc` — soft destination-aware bezier
     */
    path: 'straight' | 'swing' | 'chase' | 'arc'
    /** Subtle curve amount (normalized, ~0.04–0.1). */
    swing: number
  }
  sequence: GridShow[]
}

/**
 * Placeholder ambient reel — one simple geometric pattern for now.
 * Swap `sequence` later when the real hero story is ready.
 */
export const SHOWCASE: ShowcaseConfig = {
  enabled: true,
  loop: true,
  gapMs: 0,
  hoverDuring: 1,
  hoverAfter: true,
  hud: false,
  intro: null,
  glyphMorph: {
    ms: 2600,
    mode: 'transfer',
    neighbor: 1.35,
    trail: 1.05,
    pathRadius: 5,
    seed: 0.03,
  },
  spotTravel: {
    ease: 'sine',
    compare: false,
    path: 'chase',
    swing: 0.14,
  },
  // One pattern: floating trio — homes sit clear of the hero copy.
  sequence: [
    {
      type: 'trio',
      label: 'trio',
      duration: 60000,
      layers: 'color',
      band: 120,
      play: 0.1,
      stagger: 1,
      intensity: 0.92,
    },
  ],
}

export type ShowEvalContext = {
  x: number
  y: number
  width: number
  height: number
  col: number
  row: number
  layerId: ShowcaseLayerId
  /** Absolute raf time — keeps ambient floats continuous across beat loops. */
  timeMs?: number
  /** Pointer / touch in hero-local px — soft repulsion for floating circles. */
  pointer?: { x: number; y: number } | null
  /** 0–1 eased scroll progress — freeze float + grow to page fill. */
  scroll?: number
}

/**
 * Soft zone covering the hero headline + description (normalized 0–1 in the
 * full hero box). Floating centres are nudged out of this so colour blobs
 * don't sit under the copy.
 */
function copyAvoidRect(width: number) {
  // Mobile: copy stacks full-width near the top → keep blobs in the lower band.
  if (width <= 768) {
    return { x0: 0, x1: 1, y0: 0, y1: 0.62 }
  }
  // Tablet / desktop: copy is a left column → keep blobs on the right.
  if (width <= 1024) {
    return { x0: 0, x1: 0.58, y0: 0.18, y1: 0.82 }
  }
  return { x0: 0, x1: 0.56, y0: 0.22, y1: 0.78 }
}

/** Preferred page-fill centre once scroll grows the trio (away from copy). */
function trioFillCenter(width: number) {
  if (width <= 768) return { x: 0.5, y: 0.74 }
  if (width <= 1024) return { x: 0.68, y: 0.56 }
  return { x: 0.7, y: 0.55 }
}

/** Nudge a float centre out of the copy rectangle toward open space. */
function avoidCopyCenter(
  ox: number,
  oy: number,
  width: number,
  height: number,
) {
  const zone = copyAvoidRect(width)
  const nx = ox / width
  const ny = oy / height
  if (nx < zone.x0 || nx > zone.x1 || ny < zone.y0 || ny > zone.y1) {
    return { x: ox, y: oy }
  }

  // Mobile: push down. Wider layouts: push right (and a little down if needed).
  if (width <= 768) {
    const targetY = zone.y1 + 0.1
    return { x: ox, y: Math.max(oy, targetY * height) }
  }

  const targetX = zone.x1 + 0.1
  const targetY = Math.min(Math.max(ny, 0.42), 0.72)
  return {
    x: Math.max(ox, targetX * width),
    y: oy * 0.65 + targetY * height * 0.35,
  }
}

/**
 * Soft mask: 0 deep under the copy, 1 in open field. Keeps blob edges from
 * reading through the headline even when a centre sits nearby.
 */
function copyClearance(x: number, y: number, width: number, height: number) {
  const zone = copyAvoidRect(width)
  const nx = x / width
  const ny = y / height
  const inside =
    nx >= zone.x0 && nx <= zone.x1 && ny >= zone.y0 && ny <= zone.y1
  if (!inside) return 1
  const edgeDist = Math.min(
    nx - zone.x0,
    zone.x1 - nx,
    ny - zone.y0,
    zone.y1 - ny,
  )
  const soft = width <= 768 ? 0.07 : 0.09
  return smoothstep(1 - edgeDist / soft)
}

/** Per-colour float recipes — incommensurate freqs so paths never lock.
 *  Lanes/homes sit to the right (desktop) / lower (mobile) of the hero copy. */
const TRIO_FLOAT: Record<
  Exclude<ShowcaseLayerId, 'black'>,
  {
    lane: number
    homeY: number
    /** Mobile overrides — copy occupies the upper full width. */
    laneMobile: number
    homeYMobile: number
    fx: number
    fy: number
    f2x: number
    f2y: number
    ax: number
    ay: number
    a2: number
    phase: number
    react: number
  }
> = {
  yellow: {
    lane: 0.62,
    homeY: 0.58,
    laneMobile: 0.3,
    homeYMobile: 0.74,
    fx: 0.07,
    fy: 0.11,
    f2x: 0.19,
    f2y: 0.13,
    ax: 0.85,
    ay: 0.7,
    a2: 0.32,
    phase: 0.35,
    react: 0.95,
  },
  pink: {
    lane: 0.78,
    homeY: 0.64,
    laneMobile: 0.52,
    homeYMobile: 0.8,
    fx: 0.05,
    fy: 0.09,
    f2x: 0.15,
    f2y: 0.21,
    ax: 0.62,
    ay: 0.95,
    a2: 0.36,
    phase: 1.85,
    react: 1.2,
  },
  blue: {
    lane: 0.9,
    homeY: 0.56,
    laneMobile: 0.74,
    homeYMobile: 0.76,
    fx: 0.09,
    fy: 0.06,
    f2x: 0.17,
    f2y: 0.14,
    ax: 0.72,
    ay: 0.82,
    a2: 0.3,
    phase: 3.1,
    react: 1.05,
  },
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

function clamp01(t: number) {
  return Math.min(1, Math.max(0, t))
}

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * clamp01(t)) - 1) / 2
}

/** Quintic smootherstep — soft accel/decel for mass travel. */
function easeInOutSmooth(t: number) {
  const x = clamp01(t)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

/** Double-smoothed — extra-silky coasts at both ends. */
function easeInOutSilky(t: number) {
  return easeInOutSmooth(easeInOutSmooth(clamp01(t)))
}

function easeInOutCubic(t: number) {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

/** CSS cubic-bezier(x1, y1, x2, y2) for values in [0, 1]. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
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
    const target = clamp01(x)
    if (target <= 0) return sampleY(0)
    if (target >= 1) return sampleY(1)
    let t = target
    for (let i = 0; i < 8; i++) {
      const xEst = sampleX(t) - target
      const dx = sampleDX(t)
      if (Math.abs(xEst) < 1e-6 || Math.abs(dx) < 1e-6) break
      t = clamp01(t - xEst / dx)
    }
    return sampleY(t)
  }
}

const easeSurge = cubicBezier(0.55, 0, 0.14, 1)
const easeSurgeSoft = cubicBezier(0.45, 0, 0.18, 1)
const easeSurgeHard = cubicBezier(0.7, 0, 0.12, 1)
const easeSurgeLate = cubicBezier(0.75, 0, 0.16, 1)
const easeSurgeEarly = cubicBezier(0.4, 0, 0.12, 1)
const easeSurgeCoast = cubicBezier(0.55, 0, 0.22, 1)
const easeSurgeSnap = cubicBezier(0.6, 0, 0.1, 1)
const easeSurgeDeep = cubicBezier(0.85, 0, 0.14, 1)

function _easeSpotTravel(t: number, ease: SpotTravelEase = 'sine') {
  const x = clamp01(t)
  switch (ease) {
    case 'sine':
      return easeInOutSine(x)
    case 'smooth':
      return smoothstep(x)
    case 'cubic':
      return easeInOutCubic(x)
    case 'surge':
      return easeSurge(x)
    case 'surgeSoft':
      return easeSurgeSoft(x)
    case 'surgeHard':
      return easeSurgeHard(x)
    case 'surgeLate':
      return easeSurgeLate(x)
    case 'surgeEarly':
      return easeSurgeEarly(x)
    case 'surgeCoast':
      return easeSurgeCoast(x)
    case 'surgeSnap':
      return easeSurgeSnap(x)
    case 'surgeDeep':
      return easeSurgeDeep(x)
    default:
      return easeInOutSine(x)
  }
}
void _easeSpotTravel

/** Soft attack/release so each beat blooms and settles instead of popping. */
function beatEnvelope(
  t: number,
  attack = 0.16,
  release = 0.26,
) {
  const x = clamp01(t)
  if (x < attack) return smoothstep(x / attack)
  if (x > 1 - release) return 1 - smoothstep((x - (1 - release)) / release)
  return 1
}

/**
 * Per-colour personality — lag, size, softness, phase, and fade length.
 * Tune these to change how colours chase each other on staggered beats.
 */
const LAYER_VOICE: Record<
  ShowcaseLayerId,
  {
    lag: number
    size: number
    soft: number
    phase: number
    fadeIn: number
    fadeOut: number
  }
> = {
  black: { lag: 0, size: 1, soft: 0.92, phase: 0, fadeIn: 0.9, fadeOut: 0.85 },
  yellow: {
    lag: 0.06,
    size: 1.08,
    soft: 1.18,
    phase: 0.11,
    fadeIn: 1.05,
    fadeOut: 1.15,
  },
  pink: {
    lag: 0.13,
    size: 0.94,
    soft: 1.28,
    phase: 0.23,
    fadeIn: 1.2,
    fadeOut: 1.4,
  },
  blue: {
    lag: 0.09,
    size: 0.84,
    soft: 0.88,
    phase: 0.17,
    fadeIn: 0.95,
    fadeOut: 1.05,
  },
}

/** Gentle spatial drift so rings and fronts aren't perfectly circular. */
function organicWarp(x: number, y: number, t: number, amp = 1) {
  return (
    (Math.sin(x * 0.011 + t * 2.4) * 0.55 +
      Math.sin(y * 0.014 - t * 1.8) * 0.4 +
      Math.sin((x + y) * 0.007 + t * 3.1) * 0.3) *
    amp
  )
}

function hash01(a: number, b: number, c: number) {
  let n = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263)
  n = Math.imul(n ^ (c | 0), 1597334677)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

export function layerInShow(
  layers: ShowLayers | undefined,
  id: ShowcaseLayerId,
): boolean {
  if (!layers || layers === 'all') return true
  if (layers === 'color') return id !== 'black'
  if (layers === 'black') return id === 'black'
  if (typeof layers === 'string') return layers === id
  return layers.includes(id)
}


function resolveOrigin(
  origin:
    | 'center'
    | 'tl'
    | 'tr'
    | 'bl'
    | 'br'
    | { x: number; y: number }
    | undefined,
  width: number,
  height: number,
): { x: number; y: number } {
  if (!origin || origin === 'center') return { x: width / 2, y: height / 2 }
  if (origin === 'tl') return { x: 0, y: 0 }
  if (origin === 'tr') return { x: width, y: 0 }
  if (origin === 'bl') return { x: 0, y: height }
  if (origin === 'br') return { x: width, y: height }
  return { x: origin.x * width, y: origin.y * height }
}

function bandStrength(distance: number, band: number) {
  if (band <= 0) return 0
  return smoothstep(1 - Math.abs(distance) / band)
}

/** Strength 0–1 for one circle under the active show. */
export function evaluateShow(
  show: GridShow,
  t: number,
  ctx: ShowEvalContext,
  opts?: { morphIn?: boolean; morphOut?: boolean },
): number {
  const intensity = show.intensity ?? 1
  if (show.type === 'pause' || intensity <= 0) return 0
  if (!layerInShow(show.layers, ctx.layerId)) return 0

  const { x, y, width, height, col, row, layerId } = ctx
  const diag = Math.hypot(width, height) || 1
  const rawT = clamp01(t)
  const voice = LAYER_VOICE[layerId]
  const stagger = show.stagger ?? 1
  // Colours trail / lead with their own lag — amplified by `stagger`.
  const lagged = clamp01(rawT - voice.lag * stagger)
  // Travel patterns ease; cyclic patterns keep near-linear phase + voice offset.
  const uTravel = easeInOutSine(lagged)
  const uCycle =
    (easeInOutCubic(lagged * 0.15 + lagged * 0.85) +
      voice.phase * stagger * 0.35) %
    1
  const cx = width / 2
  const cy = height / 2
  const warp = organicWarp(x, y, rawT + voice.phase)

  let strength = 0

  switch (show.type) {
    case 'ripple': {
      const origin = resolveOrigin(show.origin, width, height)
      const band = (show.band ?? 100) * (1 + warp * 0.08)
      const travel = (show.travel ?? 1.05) * diag
      const radius = uTravel * travel
      const dist = Math.hypot(x - origin.x, y - origin.y) + warp * 14
      strength = bandStrength(dist - radius, band) * (1 - uTravel * 0.2)
      break
    }
    case 'duoRipple': {
      const band = (show.band ?? 95) * (1 + warp * 0.06)
      const travel = 1.05 * diag
      const radius = uTravel * travel
      const a = resolveOrigin('center', width, height)
      const b = resolveOrigin(show.originB ?? 'br', width, height)
      const da = Math.hypot(x - a.x, y - a.y) + warp * 12
      const db = Math.hypot(x - b.x, y - b.y) - warp * 10
      strength = Math.max(
        bandStrength(da - radius, band),
        bandStrength(db - radius * 0.92, band),
      )
      break
    }
    case 'wipe': {
      const soft = show.soft ?? 0.26
      let along =
        show.axis === 'y'
          ? y / height
          : show.axis === 'diag'
            ? (x / width + y / height) / 2
            : x / width
      along += warp * 0.025
      if (show.reverse) along = 1 - along
      strength = Math.exp(-((along - uTravel) ** 2) / (2 * soft * soft))
      break
    }
    case 'scanner': {
      const soft = show.soft ?? 0.16
      let along = show.axis === 'y' ? y / height : x / width
      along += warp * 0.02
      if (show.reverse) along = 1 - along
      strength = Math.exp(-((along - uTravel) ** 2) / (2 * soft * soft))
      break
    }
    case 'cross': {
      const soft = show.soft ?? 0.13
      const hx = Math.exp(-((x / width - uTravel) ** 2) / (2 * soft * soft))
      const hy = Math.exp(-((y / height - uTravel) ** 2) / (2 * soft * soft))
      const vx = Math.exp(-((x / width - (1 - uTravel)) ** 2) / (2 * soft * soft))
      const vy = Math.exp(-((y / height - (1 - uTravel)) ** 2) / (2 * soft * soft))
      strength = Math.max(hx * 0.8 + vy * 0.8, hy * 0.8 + vx * 0.8)
      strength = clamp01(strength)
      break
    }
    case 'spiral': {
      const turns = show.turns ?? 2
      const band = (show.band ?? 85) * (1 + warp * 0.07)
      const dist = Math.hypot(x - cx, y - cy) + warp * 10
      const ang = Math.atan2(y - cy, x - cx)
      const spiralR = ((ang + Math.PI) / (Math.PI * 2) + turns * uTravel) % 1
      const target = spiralR * diag * 0.55
      strength =
        bandStrength(dist - target, band) *
        (0.7 + 0.3 * Math.sin(ang * 2.4 + rawT * 5.5))
      break
    }
    case 'rain': {
      // Continuous column delay (no hard column floors) for a wash feel.
      const columns = Math.max(1, show.columns ?? 4)
      const soft = show.soft ?? 0.16
      const colF = (x / width) * columns
      const delay = (colF / columns) * 0.5 + warp * 0.04
      const localT = clamp01((uTravel - delay) / Math.max(0.25, 1 - delay * 0.45))
      const along = y / height
      strength = Math.exp(-((along - localT) ** 2) / (2 * soft * soft))
      strength *= 0.85 + 0.15 * Math.sin(colF * 1.7 + rawT * 4)
      break
    }
    case 'bloom': {
      const band = (show.band ?? 130) * (1 + warp * 0.05)
      const dist = Math.hypot(x - cx, y - cy) + warp * 16
      const radius = easeInOutCubic(lagged) * diag * 0.55
      const ring = bandStrength(dist - radius, band)
      const fill = smoothstep(1 - dist / Math.max(1, radius + band))
      strength = Math.max(ring, fill * (1 - lagged) * 0.65)
      break
    }
    case 'orbit': {
      const band = (show.band ?? 110) * (1 + warp * 0.05)
      const r = (show.radius ?? 0.28) * Math.min(width, height)
      // Slight elliptical drift.
      const ang = uCycle * Math.PI * 2 + warp * 0.15
      const ox = cx + Math.cos(ang) * r * (1 + 0.06 * Math.sin(rawT * 3))
      const oy = cy + Math.sin(ang) * r * (0.92 + 0.08 * Math.cos(rawT * 2.2))
      const dist = Math.hypot(x - ox, y - oy)
      strength = smoothstep(1 - dist / band)
      break
    }
    case 'heartbeat': {
      const beats = Math.max(1, show.beats ?? 2)
      const phase = (uCycle * beats) % 1
      // Wider, softer pulses.
      const a = Math.exp(-((phase - 0.22) ** 2) / 0.012)
      const b = Math.exp(-((phase - 0.42) ** 2) / 0.018)
      strength = Math.max(a, b * 0.7)
      strength *= 0.85 + 0.15 * (1 - Math.hypot(x - cx, y - cy) / diag)
      break
    }
    case 'checker': {
      const cells = Math.max(1, show.cells ?? 3)
      const on = (Math.floor(col / cells) + Math.floor(row / cells)) % 2 === 0
      // Soft sine rather than hard flip.
      const pulse = 0.5 + 0.5 * Math.sin(uCycle * Math.PI * 2)
      const soft = on ? pulse : (1 - pulse) * 0.5
      strength = soft * soft // round the peaks
      break
    }
    case 'stagger': {
      const soft = show.soft ?? 0.2
      const along =
        (show.axis === 'y' ? y / height : x / width) + warp * 0.03
      strength = Math.exp(-((along - uTravel) ** 2) / (2 * soft * soft))
      break
    }
    case 'burst': {
      const hold = show.hold ?? 0.28
      if (lagged < hold) strength = easeInOutCubic(lagged / hold)
      else strength = 1 - easeInOutCubic((lagged - hold) / (1 - hold))
      strength *= 0.9 + 0.1 * Math.sin(warp * 2)
      break
    }
    case 'diamond': {
      const band = (show.band ?? 100) * (1 + warp * 0.06)
      const travel = (show.travel ?? 1.0) * (width + height) * 0.5
      const manhattan =
        Math.abs(x - cx) + Math.abs(y - cy) + warp * 12
      const radius = uTravel * travel
      strength = bandStrength(manhattan - radius, band) * (1 - uTravel * 0.15)
      break
    }
    case 'bars': {
      const count = Math.max(2, show.count ?? 6)
      const soft = show.soft ?? 0.14
      // Continuous bar index for soft delays.
      const barF = (x / width) * count
      const delay = barF / count
      const localT = clamp01((uTravel - delay * 0.45) / (1 - delay * 0.35))
      const along = 1 - y / height
      strength = Math.exp(-((along - localT) ** 2) / (2 * soft * soft))
      break
    }
    case 'vortex': {
      const turns = show.turns ?? 2.2
      const band = (show.band ?? 95) * (1 + warp * 0.06)
      const dist = Math.hypot(x - cx, y - cy) + warp * 10
      const ang = Math.atan2(y - cy, x - cx)
      const twist = ang + dist * 0.008 - turns * uTravel * Math.PI * 2
      const arm = Math.abs(Math.sin(twist * 2)) ** 1.35 // softer arms
      const radius = uTravel * diag * 0.5
      strength = arm * bandStrength(dist - radius, band * 1.5)
      break
    }
    case 'sparkle': {
      // Continuous twinkle — no hard on/off strobe.
      const density = show.density ?? 0.16
      const seed = hash01(col, row, 7)
      const phase = seed * Math.PI * 2
      const twinkle =
        0.5 +
        0.5 *
          Math.sin(rawT * Math.PI * 2 * (0.7 + seed) + phase) *
          Math.sin(rawT * Math.PI * 3.1 + phase * 1.3)
      const gate = smoothstep((density * 1.8 - seed) / Math.max(0.08, density))
      strength = gate * (0.35 + 0.65 * twinkle)
      break
    }
    case 'moire': {
      const band = (show.band ?? 80) * (1 + warp * 0.05)
      const d1 = Math.hypot(x - width * 0.35, y - height * 0.4) + warp * 8
      const d2 = Math.hypot(x - width * 0.65, y - height * 0.6) - warp * 8
      const r = uTravel * diag * 0.7
      strength = Math.abs(
        bandStrength(d1 - r, band) - bandStrength(d2 - r * 0.9, band),
      )
      break
    }
    case 'pendulum': {
      // Each colour swings on its own phase / band — the chase you liked.
      const band =
        (show.band ?? 120) * voice.soft * (1 + warp * 0.04)
      const phase =
        easeInOutSine(clamp01(lagged)) + voice.phase * stagger
      const swing = 0.5 + 0.42 * Math.sin(phase * Math.PI * 2)
      const vertical = show.axis === 'y'
      const ox = vertical
        ? width *
          (0.42 +
            0.05 * voice.phase +
            0.14 * Math.sin(phase * Math.PI + warp * 0.35))
        : swing * width
      const oy = vertical
        ? swing * height
        : height *
          (0.36 +
            0.04 * voice.phase +
            0.16 * Math.sin(phase * Math.PI + warp * 0.4))
      const dist = Math.hypot(x - ox, y - oy)
      strength = smoothstep(1 - dist / band)
      break
    }
    case 'trio': {
      // Float while idle; scroll freezes motion and grows blobs until page fill.
      if (layerId === 'black') {
        strength = 0
        break
      }
      // `scroll` is already late cubic-bezier eased — fill only in the last stretch.
      const scroll = clamp01(ctx.scroll ?? 0)
      // Soft freeze mid-scroll; keep a little life until then.
      const freeze = smoothstep(clamp01(scroll / 0.55))
      // Page fill reserved for the final ~40% of eased progress.
      const grow = smoothstep(clamp01((scroll - 0.58) / 0.42))
      const baseBand = (show.band ?? 120) * voice.soft
      // Expand until the three blobs cover the hero (dots stay modest via endScale).
      const fillBand = Math.hypot(width, height) * 0.55
      const band =
        (baseBand + (fillBand - baseBand) * grow) * (1 + warp * 0.03 * (1 - freeze))
      const playBase = (show.play ?? 0.14) * Math.min(width, height)
      const play = playBase * (1 - freeze)
      const secs = (ctx.timeMs ?? rawT * show.duration) * 0.001
      const ptr = freeze < 0.85 ? ctx.pointer : null
      const recipe = TRIO_FLOAT[layerId]
      const ph = recipe.phase
      const mobile = width <= 768
      const lane = mobile ? recipe.laneMobile : recipe.lane
      const homeY = mobile ? recipe.homeYMobile : recipe.homeY

      let ox =
        lane * width +
        play *
          (recipe.ax * Math.sin(secs * recipe.fx * Math.PI * 2 + ph) +
            recipe.a2 *
              Math.sin(secs * recipe.f2x * Math.PI * 2 + ph * 1.7)) +
        warp * 10 * (1 - freeze)
      let oy =
        homeY * height +
        play *
          (recipe.ay * Math.sin(secs * recipe.fy * Math.PI * 2 + ph * 1.3) +
            recipe.a2 *
              Math.cos(secs * recipe.f2y * Math.PI * 2 + ph * 0.6)) +
        warp * 8 * (1 - freeze)

      // Keep float centres out from under the hero copy.
      ;({ x: ox, y: oy } = avoidCopyCenter(ox, oy, width, height))

      // Ease toward a copy-safe fill centre (not page middle through the text).
      const fill = trioFillCenter(width)
      ox += (fill.x * width - ox) * grow * 0.28
      oy += (fill.y * height - oy) * grow * 0.22

      let near = 0
      if (ptr) {
        const dx = ox - ptr.x
        const dy = oy - ptr.y
        const d = Math.hypot(dx, dy) || 1
        const reach = band * 2.2
        near = smoothstep(1 - d / reach)
        const push = near * play * 0.7 * recipe.react
        ox += (dx / d) * push
        oy += (dy / d) * push
        ;({ x: ox, y: oy } = avoidCopyCenter(ox, oy, width, height))
      }

      strength = smoothstep(
        1 - Math.hypot(x - ox, y - oy) / (band * (1 + near * 0.06)),
      )
      // Idle: clear the copy. Scroll-grow may refill the whole hero.
      const clear =
        copyClearance(x, y, width, height) * (1 - grow) + 1 * grow
      return clamp01(strength * intensity * voice.size * clear)
    }
    case 'split': {
      const soft = show.soft ?? 0.2
      const along =
        (show.axis === 'y' ? y / height : x / width) + warp * 0.02
      const left = 0.5 - uTravel * 0.55
      const right = 0.5 + uTravel * 0.55
      const a = Math.exp(-((along - left) ** 2) / (2 * soft * soft))
      const b = Math.exp(-((along - right) ** 2) / (2 * soft * soft))
      strength = Math.max(a, b)
      break
    }
    case 'fan': {
      const soft = show.soft ?? 0.17
      const ang = (Math.atan2(y - cy, x - cx) + Math.PI) / (Math.PI * 2)
      let delta = Math.abs(ang - uTravel)
      delta = Math.min(delta, 1 - delta)
      strength = Math.exp(-(delta * delta) / (2 * soft * soft))
      const dist = Math.hypot(x - cx, y - cy) / diag
      strength *= 1 - dist * 0.3
      break
    }
    case 'comet': {
      const band = (show.band ?? 100) * (1 + warp * 0.05)
      const path = show.path ?? 'diag'
      let ox: number
      let oy: number
      if (path === 'horizontal') {
        ox = uTravel * width
        oy = height * (0.45 + warp * 0.03)
      } else if (path === 'orbit') {
        const r = 0.28 * Math.min(width, height)
        const ang = uCycle * Math.PI * 2
        ox = cx + Math.cos(ang) * r
        oy = cy + Math.sin(ang) * r * 0.92
      } else {
        ox = uTravel * width
        oy = uTravel * height
      }
      const head = smoothstep(1 - Math.hypot(x - ox, y - oy) / band)
      // Longer soft trail.
      let trail = 0
      for (let k = 1; k <= 3; k++) {
        const trailU = uTravel - k * 0.055
        if (trailU <= 0) continue
        let tx = ox
        let ty = oy
        if (path === 'horizontal') {
          tx = trailU * width
          ty = height * 0.45
        } else if (path === 'orbit') {
          const r = 0.28 * Math.min(width, height)
          const ang = trailU * Math.PI * 2
          tx = cx + Math.cos(ang) * r
          ty = cy + Math.sin(ang) * r * 0.92
        } else {
          tx = trailU * width
          ty = trailU * height
        }
        const fall = 0.55 / k
        trail = Math.max(
          trail,
          smoothstep(1 - Math.hypot(x - tx, y - ty) / (band * (1 + k * 0.25))) *
            fall,
        )
      }
      strength = Math.max(head, trail)
      break
    }
    case 'target': {
      const rings = Math.max(1, show.rings ?? 3)
      const band = (show.band ?? 80) * (1 + warp * 0.05)
      const dist = Math.hypot(x - cx, y - cy) + warp * 10
      let best = 0
      for (let i = 0; i < rings; i++) {
        const local = easeInOutSine(clamp01(uTravel * rings - i))
        const radius = local * diag * (0.2 + i * 0.12)
        best = Math.max(best, bandStrength(dist - radius, band) * (1 - i * 0.08))
      }
      strength = best
      break
    }
    case 'shear': {
      const soft = show.soft ?? 0.18
      const along = x / width + (y / height - 0.5) * 0.45 + warp * 0.03
      strength = Math.exp(-((along - uTravel) ** 2) / (2 * soft * soft))
      break
    }
    case 'breathe': {
      const waves = show.waves ?? 2.5
      const dist = Math.hypot(x - cx, y - cy) / diag
      const phase = dist * waves * Math.PI * 2 - uCycle * Math.PI * 2 + warp * 0.5
      // Rounded sine — less harsh crest.
      const wave = 0.5 + 0.5 * Math.sin(phase)
      strength = wave * wave
      strength *= 0.5 + 0.5 * (1 - dist)
      break
    }
    case 'tunnel': {
      const rings = Math.max(2, show.rings ?? 5)
      const band = (show.band ?? 70) * (1 + warp * 0.05)
      const dist = Math.hypot(x - cx, y - cy) + warp * 8
      let best = 0
      for (let i = 0; i < rings; i++) {
        const local = (uTravel + i / rings) % 1
        const radius = (0.08 + easeInOutSine(local) * 0.55) * diag
        best = Math.max(best, bandStrength(dist - radius, band))
      }
      strength = best
      break
    }
    case 'glitch': {
      // Softened — more smear than strobe.
      const slices = Math.max(3, show.slices ?? 8)
      const sliceF = (y / height) * slices
      const slice = Math.floor(sliceF)
      const offset = hash01(slice, 9, Math.floor(rawT * 4)) * 0.22 - 0.04
      const along = x / width
      const beam = (uTravel + offset + slice * 0.02) % 1
      strength = Math.exp(-((along - beam) ** 2) / 0.022)
      strength *= 0.55 + 0.45 * Math.sin(sliceF * 1.3 + rawT * 6)
      break
    }
    case 'ladder': {
      const soft = show.soft ?? 0.15
      const steps = 8
      const stepF = (1 - y / height) * steps
      const delay = stepF / steps
      const localT = easeInOutSine(clamp01((uTravel - delay * 0.5) / 0.55))
      const along = x / width + warp * 0.02
      const rung = Math.exp(-((along - 0.5) ** 2) / (2 * soft * soft))
      strength = rung * localT
      break
    }
    case 'spot': {
      // letterPrism-style: shared silhouette; colours are weaker underlays.
      const base = show.at ?? { x: 0.5, y: 0.5 }
      const prism = spotPrismAmount(show.layers)
      // Use black’s falloff for prism so colours don’t bloom larger than the core.
      const soft = prism > 0 ? LAYER_VOICE.black.soft : voice.soft
      const echo = prism > 0 ? spotPrismEcho(layerId, prism) : 1
      strength =
        spotField(
          x,
          y,
          width,
          height,
          base,
          (show.band ?? 150) * soft,
          2.4,
          show.shape === 'square' ? 1 : 0,
        ) * echo
      // Neutralize voice.size on colour underlays (applied again at return).
      if (prism > 0 && layerId !== 'black') strength /= Math.max(0.01, voice.size)
      break
    }
    case 'glyph':
      // Sampled in HeroGrid via dotField — keep 0 here.
      strength = 0
      break
    default:
      strength = 0
  }

  // Soft attack/release — morph edges skip fade so travel owns the handoff.
  const env = beatEnvelope(
    rawT,
    opts?.morphIn ? 0 : 0.14 * voice.fadeIn,
    opts?.morphOut ? 0 : 0.22 * voice.fadeOut * (0.75 + stagger * 0.15),
  )
  return clamp01(strength * intensity * voice.size * env)
}

/**
 * Whether this spot should use letterPrism-style colour underlays
 * (black structure + yellow/pink/blue echo on the same silhouette).
 */
function spotPrismAmount(layers: ShowLayers | undefined): number {
  if (!layers || layers === 'black') return 0
  if (layers === 'all') return 1
  // Single tint / colour-only — full strength, not an underlay.
  if (layers === 'color' || typeof layers === 'string') return 0
  const hasBlack = layers.includes('black')
  const hasColor = layers.some((id) => id !== 'black')
  return hasBlack && hasColor ? 1 : 0
}

/**
 * letterPrism echo weights — same shape, weaker colour presence.
 * Mirrors `sampleGlyphAt` luma echo (colorEcho 0.85 × layer scale).
 * Note: amount 0 → 0 for colours (not 1) so callers can lerp to full tint.
 */
function spotPrismEcho(layerId: ShowcaseLayerId, amount: number): number {
  if (layerId === 'black') return 1
  if (amount <= 0) return 0
  const echo = 0.85 * amount
  if (layerId === 'yellow') return echo * 1
  if (layerId === 'pink') return echo * 0.72
  return echo * 0.55
}

/** True when `layers` is exactly one named tint (e.g. `'yellow'`). */
function spotSoleTint(
  layers: ShowLayers | undefined,
): ShowcaseLayerId | null {
  if (!layers || layers === 'all' || layers === 'color' || layers === 'black') {
    return null
  }
  if (typeof layers === 'string') {
    return layers === 'yellow' || layers === 'pink' || layers === 'blue'
      ? layers
      : null
  }
  return null
}

/**
 * Soft spot field at a relative center (0–1).
 * `shapeT` 0 = circle, 1 = square (Chebyshev); in-between morphs the metric.
 */
export function spotField(
  x: number,
  y: number,
  width: number,
  height: number,
  at: { x: number; y: number },
  band: number,
  falloffPower = 2.4,
  shapeT = 0,
): number {
  const ox = at.x * width
  const oy = at.y * height
  const dx = x - ox
  const dy = y - oy
  const circ = Math.hypot(dx, dy)
  const sq = Math.max(Math.abs(dx), Math.abs(dy))
  const t = clamp01(shapeT)
  const dist = circ + (sq - circ) * t
  const proximity = smoothstep(1 - dist / Math.max(1, band))
  return 1 - Math.pow(1 - proximity, falloffPower)
}

/**
 * Trio / pendulum swing path A → B.
 *
 * Same recipe as showcase `pendulum`:
 *   phase = easeInOutSine(t)
 *   along = ½ − ½·cos(π·phase)     // harmonic half-swing (rest→rest)
 *   cross = sin(π·phase)             // secondary bob (0 at ends)
 *
 * Pins exactly at u=0/1 so held spots don’t jump.
 */
function spotTravelCentre(
  morph: SpotMorphState,
  uRaw: number,
  layerId: ShowcaseLayerId = 'black',
): { x: number; y: number } {
  const { fromAt: a, toAt: b } = morph
  const t = clamp01(uRaw)
  if (t <= 0) return { x: a.x, y: a.y }
  if (t >= 1) return { x: b.x, y: b.y }

  const cdx = b.x - a.x
  const cdy = b.y - a.y
  const span = Math.hypot(cdx, cdy) || 1
  const px = -cdy / span
  const py = cdx / span

  // Pendulum phase — always sine for trio-swing feel.
  const phase = easeInOutSine(t)
  if (phase <= 0) return { x: a.x, y: a.y }
  if (phase >= 1) return { x: b.x, y: b.y }

  // Harmonic progress along the chord (not a linear / bezier lerp).
  const along = 0.5 - 0.5 * Math.cos(phase * Math.PI)
  let x = a.x + cdx * along
  let y = a.y + cdy * along

  if (morph.path === 'straight' || morph.swingAmp <= 0) {
    return { x, y }
  }

  // Prefer bowing toward canvas centre (reads natural on the hero).
  const midX = (a.x + b.x) * 0.5
  const midY = (a.y + b.y) * 0.5
  const inwardX = 0.5 - midX
  const inwardY = 0.5 - midY
  const inwardLen = Math.hypot(inwardX, inwardY) || 1
  const towardInward =
    px * (inwardX / inwardLen) + py * (inwardY / inwardLen)
  const side = towardInward >= 0 ? 1 : -1

  // Secondary axis — same family as pendulum’s idle-axis sine.
  const cross = Math.sin(phase * Math.PI)
  const amp = morph.swingAmp * (0.75 + Math.min(1, span) * 0.5)
  x += px * cross * amp * side
  y += py * cross * amp * side

  // Trio chase: per-colour phase lag on the secondary (black stays centred).
  const voice = LAYER_VOICE[layerId]
  if (layerId !== 'black' && morph.path === 'chase') {
    const lagBob =
      cross *
      amp *
      0.55 *
      Math.sin(phase * Math.PI + voice.phase * Math.PI * 2 + morph.phase)
    x += px * lagBob * side
    y += py * lagBob * side
  }

  // Light organicWarp-style breathe (gated by cross so ends stay pinned).
  const warp =
    cross *
    (Math.sin(phase * 2.4 + morph.phase) * 0.55 +
      Math.sin(phase * 1.8 - morph.phase) * 0.4) *
    0.035
  x += px * warp * side
  y += py * warp * side

  return { x, y }
}

/**
 * Spot travelling A → B — soft destination-led path + size; resting
 * field at the ends so the handoff stays smooth.
 */
export function evaluateSpotTravel(
  x: number,
  y: number,
  width: number,
  height: number,
  morph: SpotMorphState,
  layerId: ShowcaseLayerId,
): number {
  const voice = LAYER_VOICE[layerId]
  const at = spotTravelCentre(morph, morph.u, layerId)
  // Progress for size/shape uses the same sine phase as the swing.
  const u = easeInOutSine(clamp01(morph.u))
  const uSmooth = smoothstep(u)
  // Prism echo ramps with the end that has black+colour underlays.
  const fromPrism = spotPrismAmount(morph.fromLayers)
  const toPrism = spotPrismAmount(morph.toLayers)
  const prism =
    fromPrism && toPrism
      ? 1
      : toPrism
        ? uSmooth * toPrism
        : fromPrism
          ? (1 - uSmooth) * fromPrism
          : 0

  const soleTo = spotSoleTint(morph.toLayers)
  const soleFrom = spotSoleTint(morph.fromLayers)
  // Yellow→black (etc.): blend tint soft into black soft so the disc
  // doesn’t jump size when the sole colour dissolves.
  const fromSoft =
    fromPrism > 0
      ? LAYER_VOICE.black.soft
      : soleFrom && layerId === soleFrom
        ? LAYER_VOICE[soleFrom].soft
        : voice.soft
  const toSoft =
    toPrism > 0
      ? LAYER_VOICE.black.soft
      : soleTo && layerId === soleTo
        ? LAYER_VOICE[soleTo].soft
        : LAYER_VOICE.black.soft
  const soft = fromSoft + (toSoft - fromSoft) * uSmooth

  const bandT = smoothstep(u * 1.15)
  const band =
    (morph.fromBand + (morph.toBand - morph.fromBand) * bandT) * soft
  // Morph circle ↔ square with the travel (ease toward dest shape).
  const shapeT =
    morph.fromShape + (morph.toShape - morph.fromShape) * u

  // Pendulum uses plain smoothstep mid-flight; blend to spotField at ends
  // so the handoff into the held shape stays seamless.
  const ox = at.x * width
  const oy = at.y * height
  const dx = x - ox
  const dy = y - oy
  const circ = Math.hypot(dx, dy)
  const sq = Math.max(Math.abs(dx), Math.abs(dy))
  const dist = circ + (sq - circ) * clamp01(shapeT)
  const pend = smoothstep(1 - dist / Math.max(1, band))
  const rest = spotField(x, y, width, height, at, band, 2.4, shapeT)
  const mid = Math.sin(Math.PI * clamp01(morph.u))
  const fieldRaw = pend * mid + rest * (1 - mid)

  // Sole tint dest: ease underlay → full. Sole tint source → black: hold
  // full tint weight and let the dissolve gate fade it (no echo snap).
  let echoMul: number
  if (soleTo === layerId) {
    const underlay = spotPrismEcho(layerId, 1)
    echoMul = underlay + (1 - underlay) * easeInOutSine(u)
  } else if (soleFrom === layerId && toPrism > 0) {
    const underlay = spotPrismEcho(layerId, 1)
    echoMul = 1 + (underlay - 1) * easeInOutSine(u)
  } else if (soleFrom === layerId) {
    echoMul = 1
  } else if (layerId !== 'black' && (fromPrism > 0 || toPrism > 0)) {
    echoMul = spotPrismEcho(layerId, Math.max(prism, 0.0001))
    if (prism <= 0) echoMul = 0
  } else {
    echoMul = 1
  }

  const underlaySize =
    layerId !== 'black' &&
    soleTo !== layerId &&
    soleFrom !== layerId &&
    (fromPrism > 0 || toPrism > 0)
  const field = underlaySize
    ? (fieldRaw * echoMul) / Math.max(0.01, voice.size)
    : fieldRaw * echoMul

  const intensity =
    morph.fromIntensity +
    (morph.toIntensity - morph.fromIntensity) * uSmooth

  const inFrom = layerInShow(morph.fromLayers, layerId)
  const inTo = layerInShow(morph.toLayers, layerId)
  if (!inFrom && !inTo) return 0
  let layerGate = 1
  if (inFrom && inTo) {
    layerGate = 1
  } else if (inTo) {
    // Black (or colour) arriving — same organic wash-in as other morphs.
    layerGate = spotColourBloomGate(
      u,
      layerId,
      'in',
      x,
      y,
      at,
      width,
      height,
      band,
    )
  } else if (soleFrom === layerId) {
    // Sole tint → black: dissolve like the others, finished before land.
    layerGate = spotSoleTintDissolve(u, x, y, at, width, height, band)
  } else {
    layerGate = spotColourBloomGate(
      u,
      layerId,
      'out',
      x,
      y,
      at,
      width,
      height,
      band,
    )
  }

  return clamp01(field * intensity * voice.size * layerGate)
}

/** Organic dissolve for a sole tint (yellow→black) — rim first, done by ~0.85. */
function spotSoleTintDissolve(
  u: number,
  x: number,
  y: number,
  at: { x: number; y: number },
  width: number,
  height: number,
  band: number,
): number {
  const ox = at.x * width
  const oy = at.y * height
  const dist = Math.hypot(x - ox, y - oy)
  const radial = clamp01(dist / Math.max(1, band))
  const speckA = hash01(Math.floor(x / 8), Math.floor(y / 8), 3)
  const speckB = hash01(Math.floor(x / 3), Math.floor(y / 5), 17)
  const speck = speckA * 0.65 + speckB * 0.35
  // Rim clears first; centre follows — complete before handoff.
  const delay = (1 - radial) * 0.18 + speck * 0.14
  const span = 0.55
  const local = clamp01((u - delay) / span)
  return 1 - Math.pow(easeInOutSine(local), 1.5)
}

/** Clear colour order so underlays don’t sync (yellow → pink → blue). */
const COLOUR_BLOOM_ORDER: Record<ShowcaseLayerId, number> = {
  black: -1,
  yellow: 0,
  pink: 1,
  blue: 2,
}

/**
 * Organic colour wash for black↔prism handoffs.
 * Strong per-colour stagger + radial wash + per-dot noise so dots don’t
 * share one reveal time.
 */
function spotColourBloomGate(
  u: number,
  layerId: ShowcaseLayerId,
  dir: 'in' | 'out',
  x: number,
  y: number,
  at: { x: number; y: number },
  width: number,
  height: number,
  band: number,
): number {
  const ox = at.x * width
  const oy = at.y * height
  const dist = Math.hypot(x - ox, y - oy)
  const radial = clamp01(dist / Math.max(1, band))
  // Two noise samples — enough scatter that neighbours don’t lock step.
  const speckA = hash01(Math.floor(x / 8), Math.floor(y / 8), layerId.charCodeAt(0))
  const speckB = hash01(Math.floor(x / 3), Math.floor(y / 5), 11 + layerId.charCodeAt(0))
  const speck = speckA * 0.65 + speckB * 0.35

  if (layerId === 'black') {
    // Quick release like showcase beatEnvelope (~0.2 of the beat).
    if (dir === 'out') {
      const delay = radial * 0.06 + speck * 0.04
      const local = clamp01((u - delay) / 0.35)
      return 1 - easeInOutSine(local)
    }
    const delay = radial * 0.1 + speck * 0.05
    const local = clamp01((u - delay) / 0.7)
    return easeInOutSine(local)
  }

  const order = COLOUR_BLOOM_ORDER[layerId] ?? 0

  if (dir === 'in') {
    // Staggered wash-in, compressed to fit chase-paced travel.
    const colourDelay = 0.02 + order * 0.14
    const delay = colourDelay + radial * 0.28 + speck * 0.16
    const span = 0.28 + speck * 0.12 + (1 - radial) * 0.08
    const local = clamp01((u - delay) / Math.max(0.18, span))
    const t = easeInOutSine(local)
    return Math.pow(t, 1.6)
  }

  // Leave = reverse wash, snappy like pendulum/chase release.
  const leaveOrder = 2 - order
  const leaveColourDelay = 0.01 + leaveOrder * 0.1
  const leaveDelay =
    leaveColourDelay + (1 - radial) * 0.22 + speck * 0.12
  const leaveSpan = 0.24 + speck * 0.1 + radial * 0.08
  const leaveLocal = clamp01((u - leaveDelay) / Math.max(0.16, leaveSpan))
  const leaveT = easeInOutSine(leaveLocal)
  return 1 - Math.pow(leaveT, 1.45)
}

/** Spot silhouette used as the source of a spot→glyph transfer morph. */
export type SpotMorphSource = {
  at: { x: number; y: number }
  band: number
  /** 0 = circle, 1 = square. */
  shape: number
  layers?: ShowLayers
}

export type GlyphMorphState = {
  /** Previous glyph id being dissolved from (glyph→glyph). */
  fromGlyph?: string
  /** Previous spot silhouette (spot→glyph). */
  fromSpot?: SpotMorphSource
  fromLabel: string
  fromIntensity: number
  fromLayers?: ShowLayers
  toLayers?: ShowLayers
  /** 0 = fully previous, 1 = fully current. */
  u: number
}

/**
 * Structure sample for a held spot — same field as `evaluateShow`/`spot`,
 * without the beat envelope (morph owns the dissolve).
 */
export function sampleSpotStructure(
  x: number,
  y: number,
  width: number,
  height: number,
  spot: SpotMorphSource,
  intensity = 1,
): number {
  const prism = spotPrismAmount(spot.layers)
  const sole = spotSoleTint(spot.layers)
  const soft =
    prism > 0
      ? LAYER_VOICE.black.soft
      : sole
        ? LAYER_VOICE[sole].soft
        : LAYER_VOICE.black.soft
  return (
    spotField(
      x,
      y,
      width,
      height,
      spot.at,
      spot.band * soft,
      2.4,
      spot.shape,
    ) * intensity
  )
}

/**
 * Per-layer mix for a held spot (prism echo / sole tint / black).
 * Comparable to `sampleGlyphAt` so colour presence can hand off cleanly.
 */
export function sampleSpotLayer(
  x: number,
  y: number,
  width: number,
  height: number,
  spot: SpotMorphSource,
  layerId: ShowcaseLayerId,
  intensity = 1,
): number {
  if (!layerInShow(spot.layers, layerId)) return 0
  const struct = sampleSpotStructure(x, y, width, height, spot, intensity)
  const prism = spotPrismAmount(spot.layers)
  if (prism > 0) {
    const echo = spotPrismEcho(layerId, prism)
    if (layerId !== 'black') {
      return (struct * echo) / Math.max(0.01, LAYER_VOICE[layerId].size)
    }
    return struct
  }
  return struct
}

/** Full hero-space glyph box (same sizing as `sampleGlyphStructure`). */
function glyphHeroBox(
  field: DotField,
  width: number,
  height: number,
): { boxW: number; boxH: number } {
  const cfg = field.config
  const scale = cfg.scale ?? 0.75
  const fit = cfg.fit ?? 'contain'
  const fieldAspect = field.width / field.height
  const heroAspect = width / height
  let boxW: number
  let boxH: number
  if (fit === 'cover') {
    if (fieldAspect > heroAspect) {
      boxH = height * scale
      boxW = boxH * fieldAspect
    } else {
      boxW = width * scale
      boxH = boxW / fieldAspect
    }
  } else if (fieldAspect > heroAspect) {
    boxW = width * scale
    boxH = boxW / fieldAspect
  } else {
    boxH = height * scale
    boxW = boxH * fieldAspect
  }
  return { boxW, boxH }
}

/**
 * Sample glyph UV inside a frame of size (frameW×frameH) centred on `centre`.
 * Fits the letter *into* the travelling blob so silhouette morph reads like
 * circle↔square — full-page glyph sampling was invisible inside a small disc.
 */
function sampleGlyphInFrame(
  field: DotField,
  x: number,
  y: number,
  width: number,
  height: number,
  centre: { x: number; y: number },
  frameW: number,
  frameH: number,
  glyphWeight: number,
): number {
  const weight = (field.config.weight ?? 1) * clamp01(glyphWeight)
  if (weight <= 0 || frameW <= 1 || frameH <= 1) return 0
  const left = centre.x * width - frameW / 2
  const top = centre.y * height - frameH / 2
  const gu = (x - left) / frameW
  const gv = (y - top) / frameH
  if (gu < 0 || gv < 0 || gu > 1 || gv > 1) return 0

  const fx = gu * (field.width - 1)
  const fy = gv * (field.height - 1)
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
  const [z0, z1] = field.config.sizeRange ?? [0, 1]
  return (z0 + (z1 - z0) * luma) * weight
}

/**
 * Spot → glyph: letter is fitted inside the travelling disc and the
 * silhouette morphs disc→letter during the move (same idea as shapeT),
 * then the frame grows to the real glyph box as it lands.
 */
export function evaluateSpotToGlyph(
  x: number,
  y: number,
  width: number,
  height: number,
  spotMorph: SpotMorphState,
  field: DotField,
  layerId: ShowcaseLayerId,
  glyphWeight = 1,
): number {
  const voice = LAYER_VOICE[layerId]
  const inFrom = layerInShow(spotMorph.fromLayers, layerId)
  const inTo = layerInShow(spotMorph.toLayers, layerId)
  if (!inFrom && !inTo) return 0

  const rawU = clamp01(spotMorph.u)
  const at = spotTravelCentre(spotMorph, rawU, layerId)
  const travelU = easeInOutSine(rawU)
  // Shape finishes early while the blob is still moving — fluid, front-loaded.
  const shapeMorph = easeInOutSine(clamp01(rawU / 0.42))

  const soft = LAYER_VOICE.black.soft
  const bandT = smoothstep(travelU * 1.15)
  const band =
    (spotMorph.fromBand +
      (spotMorph.toBand - spotMorph.fromBand) * bandT) *
    soft
  const shapeT = spotMorph.fromShape * (1 - shapeMorph)

  const disc = spotField(x, y, width, height, at, band, 2.4, shapeT)

  // Fit letter into the current disc, then grow to the real glyph box on land.
  const { boxW, boxH } = glyphHeroBox(field, width, height)
  const fit = Math.max(band * 2.15, 8)
  const aspect = boxW / Math.max(1, boxH)
  let frameW = aspect >= 1 ? fit : fit * aspect
  let frameH = aspect >= 1 ? fit / aspect : fit
  // Frame grows with travel so landing matches the held letter.
  frameW += (boxW - frameW) * travelU
  frameH += (boxH - frameH) * travelU

  const glyphLocal = inTo
    ? sampleGlyphInFrame(
        field,
        x,
        y,
        width,
        height,
        at,
        frameW,
        frameH,
        glyphWeight,
      )
    : 0

  // Smooth handoff — disc gone ~early, letter in by ~40% of the trip.
  const discW = 1 - shapeMorph
  const glyphW = shapeMorph
  const bridge =
    Math.min(disc, glyphLocal) * Math.sin(Math.PI * shapeMorph) * 0.4
  const body = disc * discW + glyphLocal * glyphW + bridge

  const restTo = inTo
    ? layerId === 'black'
      ? sampleGlyphStructure(field, x, y, width, height, glyphWeight)
      : sampleGlyphAt(field, layerId, x, y, width, height, glyphWeight).mix
    : 0
  const restPin = smoothstep(clamp01((travelU - 0.88) / 0.12))
  const rest = body * (1 - restPin) + restTo * restPin

  const mid = Math.sin(Math.PI * rawU)
  const fieldRaw = body * mid + rest * (1 - mid)

  const intensity =
    spotMorph.fromIntensity +
    (spotMorph.toIntensity - spotMorph.fromIntensity) * smoothstep(travelU)

  let layerGate = 1
  if (inFrom && inTo) {
    layerGate = 1
  } else if (inTo) {
    layerGate = spotColourBloomGate(
      travelU,
      layerId,
      'in',
      x,
      y,
      at,
      width,
      height,
      band,
    )
  } else {
    layerGate = spotColourBloomGate(
      travelU,
      layerId,
      'out',
      x,
      y,
      at,
      width,
      height,
      band,
    )
  }

  return clamp01(fieldRaw * intensity * voice.size * layerGate)
}

/** One leave→arrive packet travelling along a lattice path. */
export type GlyphTransportPath = {
  fromCol: number
  fromRow: number
  toCol: number
  toRow: number
  mass: number
  /** Perpendicular bow in cells (longer hops arc more). */
  bow: number
  /** 0–1 start offset so packets cascade instead of moving in lockstep. */
  delay: number
}

/** Precomputed mass-transport plan for a letter→letter morph. */
export type GlyphTransportPlan = {
  paths: GlyphTransportPath[]
  leftoverLeave: Float32Array
  leftoverArrive: Float32Array
  fromS: Float32Array
  toS: Float32Array
  cols: number
}

type TransportSite = { col: number; row: number; i: number; mass: number }

/**
 * Match leaving lattice mass to arriving sites (greedy nearest), then
 * sampleGlyphTransport moves each packet along its path over `u`.
 */
export function buildGlyphTransportPlan(
  fromS: Float32Array,
  toS: Float32Array,
  cols: number,
  maxCol: number,
  maxRow: number,
): GlyphTransportPlan {
  const n = cols * maxRow
  const leftoverLeave = new Float32Array(n)
  const leftoverArrive = new Float32Array(n)
  const leaves: TransportSite[] = []
  const arrives: TransportSite[] = []
  const thr = 0.06

  for (let row = 0; row < maxRow; row++) {
    for (let col = 0; col < maxCol; col++) {
      const i = col + row * cols
      const leave = Math.max(0, fromS[i] - toS[i])
      const arrive = Math.max(0, toS[i] - fromS[i])
      if (leave > thr) leaves.push({ col, row, i, mass: leave })
      if (arrive > thr) arrives.push({ col, row, i, mass: arrive })
    }
  }

  leaves.sort((a, b) => b.mass - a.mass)
  const remain = arrives.map((a) => a.mass)
  const paths: GlyphTransportPath[] = []
  // Finer packets = continuous ink streams instead of chunky hops.
  const packet = 0.2

  for (const leaf of leaves) {
    let left = leaf.mass
    while (left > thr) {
      let best = -1
      let bestD = Infinity
      for (let j = 0; j < arrives.length; j++) {
        if (remain[j] <= thr) continue
        const d =
          Math.hypot(leaf.col - arrives[j].col, leaf.row - arrives[j].row) +
          // Slight preference for short hops so mass doesn’t leap across.
          Math.abs(leaf.col - arrives[j].col) * 0.08 +
          Math.abs(leaf.row - arrives[j].row) * 0.08
        if (d < bestD) {
          bestD = d
          best = j
        }
      }
      if (best < 0) break
      const take = Math.min(packet, left, remain[best])
      const dest = arrives[best]
      const len = Math.hypot(dest.col - leaf.col, dest.row - leaf.row)
      // Soft bow — enough to feel alive, not enough to smear.
      const bow =
        (paths.length % 2 === 0 ? 1 : -1) * Math.min(1.35, len * 0.12)
      // Wider cascade so the field peels and reforms like liquid.
      const radial =
        Math.hypot(leaf.col - maxCol * 0.5, leaf.row - maxRow * 0.5) /
        Math.max(1, Math.hypot(maxCol, maxRow) * 0.5)
      const delay = clamp01(
        0.04 + radial * 0.22 + (paths.length % 7) * 0.018,
      )
      paths.push({
        fromCol: leaf.col,
        fromRow: leaf.row,
        toCol: dest.col,
        toRow: dest.row,
        mass: take,
        bow,
        delay,
      })
      remain[best] -= take
      left -= take
    }
    if (left > thr) leftoverLeave[leaf.i] += left
  }

  for (let j = 0; j < arrives.length; j++) {
    if (remain[j] > thr) leftoverArrive[arrives[j].i] += remain[j]
  }

  return {
    paths,
    leftoverLeave,
    leftoverArrive,
    fromS,
    toS,
    cols,
  }
}

/**
 * How strongly a colour layer should paint glyph ink (tint / prism echo).
 * Black always returns 1 — structure carries the silhouette.
 */
export function glyphColourWeight(
  field: DotField | undefined,
  layerId: ShowcaseLayerId,
): number {
  if (layerId === 'black') return 1
  if (!field) return 0
  const cfg = field.config
  if (cfg.colorMode === 'tint') {
    return cfg.tint === layerId ? 1 : 0
  }
  const echo = cfg.colorEcho ?? 0
  if (echo <= 0) return 0
  const echoScale =
    layerId === 'yellow' ? 1 : layerId === 'pink' ? 0.72 : 0.55
  return echo * echoScale
}

/**
 * Soft colour handoff during letter morph — destination leads, source lags
 * (same chase language as spot colour layers).
 */
export function glyphColourMorphGate(
  uRaw: number,
  layerId: ShowcaseLayerId,
  fromField: DotField | undefined,
  toField: DotField | undefined,
  fromLayers?: ShowLayers,
  toLayers?: ShowLayers,
): number {
  const fromOk = layerInShow(fromLayers, layerId)
  const toOk = layerInShow(toLayers, layerId)
  const fromW = fromOk ? glyphColourWeight(fromField, layerId) : 0
  const toW = toOk ? glyphColourWeight(toField, layerId) : 0
  if (fromW <= 0.001 && toW <= 0.001) return 0
  const lag = LAYER_VOICE[layerId].lag
  const t = easeInOutSilky(
    clamp01((clamp01(uRaw) - lag * 0.55) / (1 - lag * 0.55)),
  )
  return fromW * (1 - t) + toW * t
}

/**
 * Presence at a lattice cell while mass packets travel leave→arrive.
 * Shared ink stays put; spare mass slides along assigned paths.
 * Ends pin to the real letter samples so letters resolve cleanly.
 */
export function sampleGlyphTransport(
  col: number,
  row: number,
  uRaw: number,
  plan: GlyphTransportPlan,
  layerId: ShowcaseLayerId = 'black',
): number {
  const i = col + row * plan.cols
  const from = plan.fromS[i] ?? 0
  const to = plan.toS[i] ?? 0
  const rawU = clamp01(uRaw)
  // Longer soft pins — letters melt out / into place instead of cutting.
  const fromPin = easeInOutSmooth(clamp01((0.16 - rawU) / 0.16))
  const toPin = easeInOutSmooth(clamp01((rawU - 0.84) / 0.16))
  if (fromPin >= 0.999) {
    return clamp01(from * LAYER_VOICE[layerId].size)
  }
  if (toPin >= 0.999) {
    return clamp01(to * LAYER_VOICE[layerId].size)
  }

  const stay = Math.min(from, to)
  const globalT = easeInOutSilky(rawU)
  const flight = Math.sin(Math.PI * globalT)
  // Soft splat — wider mid-flight so streams blend into liquid ink.
  const sigma = 0.36 + flight * 0.62

  let moving = 0
  for (let p = 0; p < plan.paths.length; p++) {
    const path = plan.paths[p]
    const span = Math.max(0.62, 1 - path.delay * 0.55)
    const local = easeInOutSilky(clamp01((rawU - path.delay) / span))
    if (local <= 0 && rawU < path.delay) {
      // Still waiting at the leave site.
      const d0 = Math.hypot(col - path.fromCol, row - path.fromRow)
      if (d0 < sigma * 3) {
        moving += path.mass * Math.exp((-d0 * d0) / (2 * sigma * sigma))
      }
      continue
    }
    const dx = path.toCol - path.fromCol
    const dy = path.toRow - path.fromRow
    const len = Math.hypot(dx, dy)
    const nx = len > 0.5 ? -dy / len : 0
    const ny = len > 0.5 ? dx / len : 0
    // Longer ribbon trail — continuous stream, not a single blob.
    for (let k = 0; k < 7; k++) {
      const tk = clamp01(local - k * 0.048)
      const trail = Math.exp(-k * 0.38)
      if (trail <= 0.04) break
      const headFlight = Math.sin(Math.PI * tk)
      const px = path.fromCol + dx * tk + nx * path.bow * headFlight
      const py = path.fromRow + dy * tk + ny * path.bow * headFlight
      const d = Math.hypot(col - px, row - py)
      if (d > sigma * 3.4) continue
      moving +=
        path.mass *
        trail *
        0.28 *
        Math.exp((-d * d) / (2 * sigma * sigma))
    }
  }

  // Unmatched mass eases away / in — no hard pops.
  const leaveFade = Math.pow(1 - globalT, 1.25)
  const arriveFade = Math.pow(globalT, 1.4)
  const leftover =
    (plan.leftoverLeave[i] ?? 0) * leaveFade +
    (plan.leftoverArrive[i] ?? 0) * arriveFade

  let mix = stay + moving + leftover
  if (fromPin > 0) mix = mix * (1 - fromPin) + from * fromPin
  if (toPin > 0) mix = mix * (1 - toPin) + to * toPin

  const voice = LAYER_VOICE[layerId]
  return clamp01(mix * voice.size)
}

/**
 * @deprecated Prefer buildGlyphTransportPlan + sampleGlyphTransport.
 * Kept for spot experiments / fallback.
 */
export function evaluateGlyphToGlyph(
  x: number,
  y: number,
  width: number,
  height: number,
  fromField: DotField,
  toField: DotField,
  uRaw: number,
  layerId: ShowcaseLayerId,
  fromIntensity = 1,
  toIntensity = 1,
  fromLayers?: ShowLayers,
  toLayers?: ShowLayers,
): number {
  const inFrom = layerInShow(fromLayers, layerId)
  const inTo = layerInShow(toLayers, layerId)
  if (!inFrom && !inTo) return 0
  const u = easeInOutSine(clamp01(uRaw))
  const fromMix = inFrom
    ? sampleGlyphStructure(fromField, x, y, width, height, fromIntensity)
    : 0
  const toMix = inTo
    ? sampleGlyphStructure(toField, x, y, width, height, toIntensity)
    : 0
  const voice = LAYER_VOICE[layerId]
  return clamp01((fromMix * (1 - u) + toMix * u) * voice.size)
}

export type SpotMorphState = {
  fromAt: { x: number; y: number }
  fromBand: number
  fromLabel: string
  fromLayers?: ShowLayers
  fromIntensity: number
  /** 0 = circle, 1 = square. */
  fromShape: number
  fromDotScale: number
  toAt: { x: number; y: number }
  toBand: number
  toLayers?: ShowLayers
  toIntensity: number
  toShape: number
  toDotScale: number
  /** 0 = at source spot, 1 = at destination. */
  u: number
  /** Easing locked for this morph (stable while compare cycles). */
  ease: SpotTravelEase
  path: 'straight' | 'swing' | 'chase' | 'arc'
  /** Bow amplitude (normalized). */
  swingAmp: number
  /** +1 / -1 which side of the chord to bow. */
  swingSign: number
  /** Phase for chase wobble. */
  phase: number
}

/** Peak-radius multiplier for a beat (defaults to 1). */
export function showDotScale(show: GridShow | undefined): number {
  if (!show || show.type === 'pause') return 1
  const s = show.dotScale
  return s != null && s > 0 ? s : 1
}

/** Lerped peak-radius multiplier during spot travel / intro morph. */
export function activeDotScale(active: ActiveShow): number {
  const morph = active.spotMorph
  if (morph && morph.u < 1) {
    const u = easeInOutSine(clamp01(morph.u))
    return (
      morph.fromDotScale + (morph.toDotScale - morph.fromDotScale) * u
    )
  }
  return showDotScale(active.show)
}

function spotShapeT(shape: 'circle' | 'square' | undefined): number {
  return shape === 'square' ? 1 : 0
}

export type ActiveShow = {
  show: GridShow
  t: number
  index: number
  total: number
  /** True when previous beat morphs into this one (skip fade-in). */
  morphIn: boolean
  /** True when this beat morphs into the next (skip fade-out). */
  morphOut: boolean
  /** Active crossfade from the previous glyph, if any. */
  morph?: GlyphMorphState
  /** Active spot→spot travel, if any. */
  spotMorph?: SpotMorphState
}

function isGlyph(
  show: GridShow | undefined,
): show is Extract<GridShow, { type: 'glyph' }> {
  return !!show && show.type === 'glyph'
}

function isSpot(
  show: GridShow | undefined,
): show is Extract<GridShow, { type: 'spot' }> {
  return !!show && show.type === 'spot'
}

/**
 * Family key for morph pairing — same letter (or world/worldSoft) should not
 * dissolve into itself; those beats use normal fades instead.
 */
function glyphFamily(id: string): string {
  const ch = glyphChar(id)
  if (ch) return `char:${ch}`
  return id.replace(
    /(Soft|Sharp|Punch|Heavy|Halo|Prism|Ghost|Yellow|Pink|Blue)$/i,
    '',
  )
}

function canMorphGlyphs(
  from: Extract<GridShow, { type: 'glyph' }>,
  to: Extract<GridShow, { type: 'glyph' }>,
): boolean {
  return glyphFamily(from.glyph) !== glyphFamily(to.glyph)
}

function neighborIndex(
  i: number,
  delta: -1 | 1,
  len: number,
  loop: boolean,
): number | null {
  const j = i + delta
  if (j >= 0 && j < len) return j
  if (!loop || len < 2) return null
  return delta < 0 ? len - 1 : 0
}

function resolveSpotTravelEase(
  morphIndex: number,
  config: ShowcaseConfig = SHOWCASE,
): SpotTravelEase {
  if (!config.spotTravel.compare) return config.spotTravel.ease
  const list = SPOT_TRAVEL_EASES
  return list[((morphIndex % list.length) + list.length) % list.length]
}

function introMorphMs(config: ShowcaseConfig): number {
  return config.intro?.morphMs ?? config.glyphMorph?.ms ?? 2100
}

/** Total one-shot intro length (hold + morph), or 0 if disabled. */
export function introDurationMs(config: ShowcaseConfig = SHOWCASE): number {
  if (!config.intro) return 0
  return config.intro.holdMs + introMorphMs(config)
}

function introFloodShow(config: ShowcaseConfig): Extract<GridShow, { type: 'spot' }> {
  const intro = config.intro!
  return {
    type: 'spot',
    label: 'intro flood',
    duration: intro.holdMs,
    at: intro.at ?? { x: 0.5, y: 0.5 },
    band: intro.band ?? 1400,
    layers: 'black',
    intensity: 1,
    /** Oversized dots — solid black fill until they shrink into beat 1. */
    dotScale: intro.dotScale ?? 4.5,
  }
}

/** Intro flood peak-radius multiplier (for seeding radii on first paint). */
export function introDotScale(config: ShowcaseConfig = SHOWCASE): number {
  return config.intro?.dotScale ?? 4.5
}

/**
 * First-load only: maxed black field → pause → ease into sequence[0].
 */
function getIntroActive(
  elapsedMs: number,
  config: ShowcaseConfig,
): ActiveShow | null {
  const intro = config.intro
  const first = config.sequence[0]
  if (!intro || !first || !isSpot(first)) return null

  const morphMs = introMorphMs(config)
  const flood = introFloodShow(config)
  const total = config.sequence.length

  if (elapsedMs < intro.holdMs) {
    return {
      show: flood,
      t: elapsedMs / Math.max(1, intro.holdMs),
      index: 0,
      total,
      morphIn: true,
      morphOut: true,
    }
  }

  const morphLocal = elapsedMs - intro.holdMs
  if (morphLocal >= morphMs) return null

  const travel = config.spotTravel
  const u = clamp01(morphLocal / Math.max(1, morphMs))
  return {
    show: first,
    t: u * Math.min(1, morphMs / Math.max(1, first.duration)),
    index: 0,
    total,
    morphIn: true,
    morphOut: isSpot(config.sequence[1]) || isGlyph(config.sequence[1]),
    spotMorph: {
      fromAt: flood.at ?? { x: 0.5, y: 0.5 },
      fromBand: flood.band ?? 1400,
      fromLabel: flood.label ?? 'intro',
      fromLayers: flood.layers,
      fromIntensity: flood.intensity ?? 1,
      fromShape: spotShapeT(flood.shape),
      fromDotScale: showDotScale(flood),
      toAt: first.at ?? { x: 0.5, y: 0.5 },
      toBand: first.band ?? 150,
      toLayers: first.layers,
      toIntensity: first.intensity ?? 1,
      toShape: spotShapeT(first.shape),
      toDotScale: showDotScale(first),
      u,
      ease: travel.ease,
      path: travel.path,
      swingAmp: travel.swing * 0.55,
      swingSign: 1,
      phase: 0.12,
    },
  }
}

export function getActiveShow(
  elapsedMs: number,
  config: ShowcaseConfig = SHOWCASE,
): ActiveShow | 'done' | null {
  if (!config.enabled || config.sequence.length === 0) return null

  const introMs = introDurationMs(config)
  if (introMs > 0 && elapsedMs < introMs) {
    return getIntroActive(elapsedMs, config)
  }

  const { sequence, gapMs, loop } = config
  const total = sequence.reduce(
    (sum, show, i) =>
      sum + show.duration + (i < sequence.length - 1 ? gapMs : 0),
    0,
  )

  // Reel clock starts after the one-shot intro.
  const reelElapsed = Math.max(0, elapsedMs - introMs)

  let t = reelElapsed
  if (loop && total > 0) t = reelElapsed % total
  else if (reelElapsed >= total) return 'done'

  const cyclesDone =
    loop && total > 0 ? Math.floor(reelElapsed / Math.max(1, total)) : 0

  let cursor = 0
  for (let i = 0; i < sequence.length; i++) {
    const show = sequence[i]
    if (t < cursor + show.duration) {
      const localMs = t - cursor
      const localT = localMs / Math.max(1, show.duration)
      const prevI = neighborIndex(i, -1, sequence.length, loop)
      const nextI = neighborIndex(i, 1, sequence.length, loop)
      const prev = prevI != null ? sequence[prevI] : undefined
      const next = nextI != null ? sequence[nextI] : undefined
      // Loop wrap (last→first) only morphs after a real cycle — otherwise the
      // opening beat inherits the final spot’s colours (e.g. yellow on load).
      const wrapFromEnd = loop && i === 0 && prevI === sequence.length - 1
      const allowWrapIn = !wrapFromEnd || cyclesDone > 0
      const glyphMorphIn =
        allowWrapIn &&
        isGlyph(show) &&
        isGlyph(prev) &&
        canMorphGlyphs(prev, show)
      const spotToGlyphIn = allowWrapIn && isGlyph(show) && isSpot(prev)
      const glyphMorphOut =
        isGlyph(show) && isGlyph(next) && canMorphGlyphs(show, next)
      const spotMorphIn = allowWrapIn && isSpot(show) && isSpot(prev)
      /** Hold spot full until glyph morph takes over (no fade-then-snap). */
      const spotMorphOut =
        isSpot(show) && (isSpot(next) || isGlyph(next))
      // Intro already landed on beat 1 — skip the opening fade-in.
      const fromIntro =
        !!config.intro && cyclesDone === 0 && i === 0 && isSpot(show)
      const morphIn =
        glyphMorphIn || spotMorphIn || spotToGlyphIn || fromIntro
      const morphOut = glyphMorphOut || spotMorphOut

      let morph: GlyphMorphState | undefined
      let spotMorph: SpotMorphState | undefined
      const morphMs = config.glyphMorph?.ms ?? 0
      if (glyphMorphIn && morphMs > 0 && isGlyph(prev) && isGlyph(show)) {
        // Linear clock — evaluateGlyphToGlyph applies sine (avoid cubic hold/snap).
        const u = clamp01(localMs / Math.max(1, morphMs))
        morph = {
          fromGlyph: prev.glyph,
          fromLabel: prev.label ?? prev.glyph,
          fromIntensity: prev.intensity ?? 1,
          fromLayers: prev.layers,
          toLayers: show.layers,
          u,
        }
      }
      if (spotToGlyphIn && morphMs > 0 && isSpot(prev) && isGlyph(show)) {
        // Same chase travel as spot→spot, then late dissolve into glyph strokes.
        const u = clamp01(localMs / Math.max(1, morphMs))
        const morphIndex = cyclesDone * sequence.length + i
        const ease = resolveSpotTravelEase(morphIndex, config)
        const travel = config.spotTravel
        morph = {
          fromSpot: {
            at: prev.at ?? { x: 0.5, y: 0.5 },
            band: prev.band ?? 150,
            shape: spotShapeT(prev.shape),
            layers: prev.layers,
          },
          fromLabel: prev.label ?? 'spot',
          fromIntensity: prev.intensity ?? 1,
          u,
        }
        spotMorph = {
          fromAt: prev.at ?? { x: 0.5, y: 0.5 },
          fromBand: prev.band ?? 150,
          fromLabel: prev.label ?? 'spot',
          fromLayers: prev.layers,
          fromIntensity: prev.intensity ?? 1,
          fromShape: spotShapeT(prev.shape),
          fromDotScale: showDotScale(prev),
          toAt: show.at ?? { x: 0.5, y: 0.48 },
          toBand: show.band ?? 155,
          toLayers: show.layers ?? 'black',
          toIntensity: show.intensity ?? 1,
          toShape: 0,
          toDotScale: showDotScale(show),
          u,
          ease,
          path: travel.path,
          swingAmp: travel.swing,
          swingSign: morphIndex % 2 === 0 ? 1 : -1,
          phase: (morphIndex * 0.37) % 1,
        }
      }
      if (spotMorphIn && morphMs > 0 && isSpot(prev) && isSpot(show)) {
        const u = clamp01(localMs / morphMs)
        const morphIndex = cyclesDone * sequence.length + i
        const ease = resolveSpotTravelEase(morphIndex, config)
        const travel = config.spotTravel
        spotMorph = {
          fromAt: prev.at ?? { x: 0.5, y: 0.5 },
          fromBand: prev.band ?? 150,
          fromLabel: prev.label ?? 'spot',
          fromLayers: prev.layers,
          fromIntensity: prev.intensity ?? 1,
          fromShape: spotShapeT(prev.shape),
          fromDotScale: showDotScale(prev),
          toAt: show.at ?? { x: 0.5, y: 0.5 },
          toBand: show.band ?? 150,
          toLayers: show.layers,
          toIntensity: show.intensity ?? 1,
          toShape: spotShapeT(show.shape),
          toDotScale: showDotScale(show),
          u,
          ease,
          path: travel.path,
          swingAmp: travel.swing,
          // Alternate bow side each hop so the triangle path feels alive.
          swingSign: morphIndex % 2 === 0 ? 1 : -1,
          phase: (morphIndex * 0.37) % 1,
        }
      }

      return {
        show,
        t: localT,
        index: i,
        total: sequence.length,
        morphIn,
        morphOut,
        morph,
        spotMorph,
      }
    }
    cursor += show.duration
    if (i < sequence.length - 1) cursor += gapMs
  }

  return loop ? null : 'done'
}

export type GlyphMorphSampleCtx = {
  x: number
  y: number
  width: number
  height: number
  col: number
  row: number
  /** Leaving mass nearby (structure) — source for travelling ink. */
  neighborLeave?: number
  /** Arriving mass nearby — tells leavers they have a destination. */
  neighborArrive?: number
  /** Mid-path glow when leave and arrive sit on opposite sides. */
  corridor?: number
}

/**
 * Blend two glyph mixes during a morph window.
 *
 * `transfer`: shared dots stay; spare mass travels through neighbours /
 * corridors into the new shape. Arrive is gated by inbound mass so dots
 * rarely pop in from empty space. A late settle gently finishes orphans.
 */
export function blendGlyphMix(
  from: number,
  to: number,
  u: number,
  morph: GlyphMorphConfig = SHOWCASE.glyphMorph,
  ctx?: GlyphMorphSampleCtx,
): number {
  const mode = morph.mode ?? 'transfer'

  if (mode === 'crossfade') return from * (1 - u) + to * u
  if (mode === 'max') return Math.max(from * (1 - u), to * u)
  if (mode === 'softMax') {
    const a = from * (1 - u)
    const b = to * u
    const k = 10
    const ea = Math.exp(k * a)
    const eb = Math.exp(k * b)
    return (a * ea + b * eb) / (ea + eb + 1e-9)
  }

  const trail = morph.trail ?? 0.95
  const neighbor = morph.neighbor ?? 1.15
  const seed = morph.seed ?? 0.04
  const t = clamp01(u)
  const handoff = easeInOutCubic(t)
  // Peak mid-morph — mass is “in flight” between shapes.
  const flight = Math.sin(Math.PI * t)
  // Late settle: only after most travel has happened, fill remaining gaps.
  const settle = smoothstep(clamp01((t - 0.68) / 0.32))

  const stay = Math.min(from, to)
  const leave = Math.max(0, from - to)
  const arrive = Math.max(0, to - from)

  const inbound = ctx?.neighborLeave ?? 0
  const outbound = ctx?.neighborArrive ?? 0
  const corridor = ctx?.corridor ?? 0

  // Leavers hang while a destination is nearby, then dissolve into the path.
  const destBoost = 1 + clamp01(outbound * 2.2) * 0.55 * trail
  const leaveW = Math.pow(1 - handoff, 0.9 / destBoost)
  const leaveCore = leave * leaveW
  const leaveTrail =
    leave *
    Math.pow(1 - handoff, 0.28) *
    trail *
    flight *
    (0.35 + outbound * 0.7)

  // Arrive grows as leave shrinks — fuelled by inbound / corridor mass.
  const travelSignal = clamp01(inbound * 2.2 + corridor * 1.7 + leave * handoff * 0.45)
  const transferGate =
    seed * (0.3 + 0.7 * settle) +
    (1 - seed) * smoothstep(travelSignal)
  const arriveW = Math.pow(handoff, 0.95)
  const arriveCore = arrive * arriveW * transferGate
  // Orphans complete only at the end, softly — still not an early pop-in.
  const orphanSettle = arrive * settle * settle * (0.5 + seed)

  // Mass visibly occupying the path between leave and arrive sites.
  const pathGlow =
    corridor * neighbor * flight * (0.75 + trail * 0.5) * (1 - settle * 0.3)
  const feed =
    inbound *
    neighbor *
    flight *
    (arrive > 0.02 ? 1.15 : 0.25) *
    (1 - settle * 0.35)

  const stayAlive = stay * (0.96 + 0.04 * flight)

  return clamp01(
    stayAlive +
      leaveCore +
      leaveTrail +
      arriveCore +
      orphanSettle +
      pathGlow +
      feed,
  )
}

export type ColourPresenceCtx = {
  /** Structure leaving nearby — fuel for this colour to bloom into. */
  neighborLeave?: number
  /** Structure arriving nearby — pulls this colour along. */
  neighborArrive?: number
  /** Leave↔arrive corridor through this cell. */
  corridor?: number
}

/**
 * How strongly a colour layer paints the morphing structure.
 *
 * Leaving and arriving colours are coupled: as one shrinks, the other grows
 * into that freed energy (even when the destination colour was unused on
 * the source mask). Extra colour blooms from neighbouring leave/corridors
 * so multi-colour remaps feel organic instead of popping in place.
 */
export function glyphColourPresence(
  fromLayer: number,
  toLayer: number,
  u: number,
  structFrom = 0,
  structTo = 0,
  structMix = 1,
  nx = 0.5,
  ny = 0.5,
  ctx?: ColourPresenceCtx,
): number {
  const t = clamp01(u)
  // Organic handoff curve — soft start, sustained middle, soft finish.
  const handoff = easeInOutCubic(t)
  const flight = Math.sin(Math.PI * t)
  const settle = smoothstep(clamp01((t - 0.68) / 0.32))

  const stay = Math.min(fromLayer, toLayer)
  const leave = Math.max(0, fromLayer - toLayer)
  const arrive = Math.max(0, toLayer - fromLayer)

  const structLeave = Math.max(0, structFrom - structTo)
  const structArrive = Math.max(0, structTo - structFrom)
  // Mass leaving the structure that isn't this colour — free fuel for others.
  const foreignLeave = Math.max(0, structLeave - leave)

  const neighborLeave = ctx?.neighborLeave ?? 0
  const neighborArrive = ctx?.neighborArrive ?? 0
  const corridor = ctx?.corridor ?? 0

  // Diagonal front for tint-only remaps (structure barely changing).
  const structDelta = Math.abs(structTo - structFrom)
  const tintTravel = clamp01(1 - structDelta * 3)
  const front = smoothstep(
    clamp01((nx * 0.52 + ny * 0.48 - (handoff * 1.25 - 0.18)) / 0.34),
  )

  // Complementary shrink ↔ grow on the same cell (tint remaps).
  const tintLeave = leave * front * tintTravel
  const tintArrive = arrive * (1 - front) * tintTravel

  // As this colour shrinks, freed energy is available for the new colour.
  const leaveW = Math.pow(1 - handoff, 0.85)
  const leavePaint =
    leave * leaveW * (0.5 + structMix * 0.55) * (1 - tintTravel * 0.65) +
    tintLeave * (0.9 + 0.1 * flight)

  // Bloom from neighbours / corridors / this cell's own leave / foreign leave.
  const bloom = clamp01(
    neighborLeave * 1.9 +
      corridor * 1.45 +
      neighborArrive * 0.55 +
      foreignLeave * 1.25 +
      leave * handoff * 0.9,
  )

  const structGate = smoothstep(
    clamp01(
      structMix * 1.25 +
        structArrive * flight * 0.85 +
        bloom * 0.55,
    ),
  )

  // Arrive rises as leave falls — mirrored handoff, then neighbor bloom fills gaps.
  const arriveW = Math.pow(handoff, 0.9)
  const fuel = clamp01(
    leave * handoff * 0.7 +
      foreignLeave * (0.45 + 0.55 * flight) +
      bloom * (0.4 + 0.6 * flight) +
      settle * 0.4,
  )
  const arrivePaint =
    arrive *
      arriveW *
      (0.06 * settle + 0.94 * Math.max(structGate, fuel)) *
      (1 - tintTravel * 0.55) +
    tintArrive * (0.3 + structMix * 0.7 + bloom * 0.25)

  const stayAlive = stay * (0.96 + 0.04 * flight)

  return clamp01(stayAlive + leavePaint + arrivePaint)
}

export function formatShowHud(active: ActiveShow): string {
  if (
    active.show.type === 'spot' &&
    active.show.label === 'intro flood' &&
    !active.spotMorph
  ) {
    return `#0 · intro hold`
  }
  if (active.morph && active.morph.u < 0.92 && active.show.type === 'glyph') {
    const to = active.show.label ?? active.show.glyph
    return `#${active.index + 1}/${active.total} · ${active.morph.fromLabel} → ${to}`
  }
  if (
    active.spotMorph &&
    active.spotMorph.u < 0.98 &&
    (active.show.type === 'spot' || active.show.type === 'glyph')
  ) {
    const to =
      active.show.type === 'glyph'
        ? (active.show.label ?? active.show.glyph)
        : (active.show.label ?? 'spot')
    const ease = active.spotMorph.ease
    const n = SPOT_TRAVEL_EASES.indexOf(ease) + 1
    const total = SPOT_TRAVEL_EASES.length
    return SHOWCASE.spotTravel.compare
      ? `#${active.index + 1}/${active.total} · ${active.spotMorph.fromLabel} → ${to} · ease ${n}/${total}: ${ease}`
      : `#${active.index + 1}/${active.total} · ${active.spotMorph.fromLabel} → ${to} · ${ease}`
  }
  const name = active.show.label ?? active.show.type
  return `#${active.index + 1}/${active.total} · ${name}`
}
