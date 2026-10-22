import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { invertHex } from './labsBlend'

/**
 * Wash region from “What we do” downward.
 *
 * A Labs circle sits in the title band and expands with scroll. Bloom 0→1
 * covers that band exactly when it docks under the header. Near the end of
 * that range a second soft phase grows the same circle out to the full
 * region — no hard cut to `clip-path: none` until the circle already fills it.
 */

export const LABS_SHAPE_WASH = {
  /** Clover yellow — same fill as the Labs clover shape. */
  color: '#fcc934',
  /** Resting circle diameter (px). */
  restSizePx: 168,
  /**
   * How far the yellow region box extends above the Services content edge (px).
   * Implemented as margin-top/padding-top on `.ka-wash-region` (not overflow),
   * so ancestors can’t clip it. Keep in sync with `--wash-overhang` in CSS.
   */
  overhangPx: 120,
  /** Origin inside the title band (fractions of band width / height). */
  origin: { x: 0.78, y: 0.55 },
  /** Soft follow — keep low so dock timing stays honest. */
  follow: 14,
  /** How quickly the circle eases from title-cover → full-region cover. */
  expandFollow: 6,
  /**
   * Bloom at which the full-region expand begins (title is mostly covered).
   * Finishes as bloom reaches 1 / after dock.
   */
  expandFrom: 0.88,
  ink: {
    /**
     * Body/heading fade target on the wash.
     * Solid near-black on clover yellow (not difference invert).
     */
    color: '#202020',
    from: 0.35,
    to: 0.85,
    enabled: true,
  },
} as const

export type LabsShapeWashInk = {
  /** Override; default is LABS_SHAPE_WASH.ink.color, else invert(wash color). */
  color?: string
  from?: number
  to?: number
  enabled?: boolean
}

type LabsShapeWashProps = {
  children: ReactNode
  /** Title band inside the region (What we do). */
  trackSelector?: string
  color?: string
  ink?: LabsShapeWashInk
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function smoothstep(t: number) {
  const p = clamp01(t)
  return p * p * (3 - 2 * p)
}

function headerBottomPx() {
  const header = document.querySelector('header')
  if (header) return header.getBoundingClientRect().bottom
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--layout-header-height')
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : 72
}

function resolveInk(ink: LabsShapeWashInk | undefined, washColor: string) {
  return {
    color: ink?.color ?? LABS_SHAPE_WASH.ink.color ?? invertHex(washColor),
    from: ink?.from ?? LABS_SHAPE_WASH.ink.from,
    to: ink?.to ?? LABS_SHAPE_WASH.ink.to,
    enabled: ink?.enabled ?? LABS_SHAPE_WASH.ink.enabled,
  }
}

export function LabsShapeWash({
  children,
  trackSelector = '#services',
  color = LABS_SHAPE_WASH.color,
  ink: inkProp,
}: LabsShapeWashProps) {
  const regionRef = useRef<HTMLDivElement>(null)
  const ink = resolveInk(inkProp, color)

  useLayoutEffect(() => {
    const region = regionRef.current
    if (!region) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { restSizePx, origin, follow, expandFollow, expandFrom, overhangPx } = LABS_SHAPE_WASH
    const inkColor = ink.color
    const restR = restSizePx / 2

    let raf = 0
    let bloomCurrent = 0
    let inkCurrent = 0
    let expandCurrent = 0
    let radiusCurrent = restR
    let last = performance.now()

    const inkAmount = (bloom: number) => {
      if (!ink.enabled) return 0
      return clamp01((bloom - ink.from) / Math.max(0.001, ink.to - ink.from))
    }

    /** Origin in wash-layer coords (region box includes overhang padding). */
    const washOrigin = (regionBox: DOMRect, trackBox: DOMRect | undefined) => {
      if (trackBox) {
        return {
          ox: trackBox.left - regionBox.left + trackBox.width * origin.x,
          oy: trackBox.top - regionBox.top + trackBox.height * origin.y,
        }
      }
      return {
        ox: regionBox.width * origin.x,
        oy: overhangPx + Math.min(regionBox.height * 0.12, 220),
      }
    }

    const measureBloom = () => {
      const track = region.querySelector(trackSelector) as HTMLElement | null
      if (!track) return 0

      const rect = track.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const headerBottom = headerBottomPx()

      // 0: band just reaching the bottom of the viewport
      // 1: band top docked under the header
      const start = vh
      const end = headerBottom
      return clamp01((start - rect.top) / (start - end))
    }

    const paint = (bloom: number, inkT: number, expand: number, radius: number) => {
      const track = region.querySelector(trackSelector) as HTMLElement | null
      const regionBox = region.getBoundingClientRect()
      const trackBox = track?.getBoundingClientRect()
      const { ox, oy } = washOrigin(regionBox, trackBox ?? undefined)

      // Only flip to solid fill once the circle already covers the region —
      // otherwise the old clip-path:none snap reads as a glitch.
      const filled = bloom > 0.995 && expand > 0.985

      /*
        A circle covering a tall region from a top-heavy origin sticks out
        above the region box. Extend the wash layer by that amount so the
        clip isn’t a hard cut at Building Better Judgment / Services top.
        Collapse when full — region background owns the fill then.
      */
      const bleedTop = filled ? 0 : Math.ceil(Math.max(0, radius - oy))

      region.style.setProperty('--wash-color', color)
      region.style.setProperty('--wash-overhang', `${overhangPx}px`)
      region.style.setProperty('--wash-bleed-top', `${bleedTop}px`)
      region.style.setProperty('--wash-ox', `${ox}px`)
      // Origin is relative to the wash layer; shift down when we bleed upward.
      region.style.setProperty('--wash-oy', `${oy + bleedTop}px`)
      region.style.setProperty('--wash-r', `${radius}px`)
      region.style.setProperty('--wash-ink', inkColor)
      region.style.setProperty('--wash-ink-t', inkT.toFixed(4))

      region.dataset.wash = filled ? 'full' : bloom > 0.02 || expand > 0.02 ? 'active' : 'idle'
      region.dataset.washInk = inkT > 0.02 ? 'on' : 'off'

      // Header plate tracks expand 1:1 so the bar matches the yellow field
      // instead of staying white until a late remap. Lock fully when filled.
      const root = document.documentElement
      const headerT = filled ? 1 : clamp01(expand)
      root.style.setProperty('--wash-color', color)
      root.style.setProperty('--wash-progress', bloom.toFixed(4))
      root.style.setProperty('--wash-header-t', headerT.toFixed(4))
    }

    const measureCovers = () => {
      const track = region.querySelector(trackSelector) as HTMLElement | null
      const regionBox = region.getBoundingClientRect()
      const trackBox = track?.getBoundingClientRect()
      const { ox, oy } = washOrigin(regionBox, trackBox ?? undefined)

      let trackCover = restR
      if (trackBox) {
        const left = trackBox.left - regionBox.left
        const top = trackBox.top - regionBox.top
        const right = trackBox.right - regionBox.left
        const bottom = trackBox.bottom - regionBox.top
        trackCover = Math.hypot(
          Math.max(ox - left, right - ox),
          Math.max(oy - top, bottom - oy),
        )
      }

      const regionCover = Math.hypot(
        Math.max(ox, regionBox.width - ox),
        Math.max(oy, regionBox.height - oy),
      )

      return { trackCover: Math.max(trackCover, restR), regionCover: Math.max(regionCover, trackCover) }
    }

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      const bloomTarget = measureBloom()
      const inkTarget = inkAmount(bloomTarget)
      // Begin easing out to the full region as the title nears dock.
      const expandTarget = smoothstep(
        clamp01((bloomTarget - expandFrom) / Math.max(0.001, 1 - expandFrom)),
      )

      const { trackCover, regionCover } = measureCovers()

      if (reduce) {
        bloomCurrent = bloomTarget
        inkCurrent = inkTarget
        expandCurrent = expandTarget
        const trackR = restR + (trackCover - restR) * bloomCurrent
        radiusCurrent = trackR + (regionCover - trackR) * expandCurrent
      } else {
        const kBloom = 1 - Math.exp(-follow * dt)
        const kExpand = 1 - Math.exp(-expandFollow * dt)
        bloomCurrent += (bloomTarget - bloomCurrent) * kBloom
        inkCurrent += (inkTarget - inkCurrent) * kBloom
        expandCurrent += (expandTarget - expandCurrent) * kExpand
        const trackR = restR + (trackCover - restR) * bloomCurrent
        const rTarget = trackR + (regionCover - trackR) * expandCurrent
        radiusCurrent += (rTarget - radiusCurrent) * kExpand
        if (Math.abs(bloomTarget - bloomCurrent) < 0.0003) bloomCurrent = bloomTarget
        if (Math.abs(inkTarget - inkCurrent) < 0.0003) inkCurrent = inkTarget
        if (Math.abs(expandTarget - expandCurrent) < 0.0003) expandCurrent = expandTarget
        if (Math.abs(rTarget - radiusCurrent) < 0.25) radiusCurrent = rTarget
      }

      paint(bloomCurrent, inkCurrent, expandCurrent, radiusCurrent)
    }

    paint(0, 0, 0, restR)
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      const root = document.documentElement
      root.style.removeProperty('--wash-progress')
      root.style.removeProperty('--wash-color')
      root.style.removeProperty('--wash-header-t')
    }
  }, [trackSelector, color, ink.color, ink.from, ink.to, ink.enabled])

  return (
    <div className="ka-wash-region" ref={regionRef}>
      <div aria-hidden="true" className="ka-shape-wash" />
      {children}
    </div>
  )
}
