import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { animate, stagger } from 'animejs'
import { IHS_LOGO_MARK } from './ihs-logo-paths'

export const LOGO_HEIGHT = 48
const GAP = 10
const CAP_SIZE = 13
const FOR_SIZE = 13
const CAP_TRACKING = '0.08em'
const SANS_FAMILY = "'Sans', Helvetica, Arial, sans-serif"
const SERIF_FAMILY = "'Serif', Georgia, serif"
const TEXT_GREEN = '#102B23'
const TEXT_INK = '#000000'
const TEXT_X = 72

export const SITE_NAME = 'The Institute for Predictive Sciences'
export const WORDMARK_NAME = 'Institute for Predictive Sciences'
export const CONTACT_EMAIL = 'info@predictivesciences.org'
export const BLOG_URL = 'https://adnaanjiwa.substack.com'
export const BLOG_SUBSCRIBE_URL =
  'https://adnaanjiwa.substack.com/subscribe?utm_source=menu&simple=true&next=https%3A%2F%2Fadnaanjiwa.substack.com%2F'
export const LINKEDIN_URL = 'https://www.linkedin.com/company/institute-for-predictive-sciences'
export const X_URL = 'https://x.com/PredictiveSci'

type LogoProps = {
  className?: string
  variant?: 'white' | 'green'
  /** Split the wordmark and fade each character in once. Header only. */
  animateChars?: boolean
}

type Ink = { x: number; y: number; width: number; height: number }

const TOP_BASELINE = 15
const BOTTOM_BASELINE = 43

function glyphBlock() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.font = `500 ${CAP_SIZE}px ${SANS_FAMILY}`
  // Flat caps (I, T, E, N) set the edge. S and C overshoot that line slightly,
  // which made the leaf look a hair taller than the wordmark.
  let ascent = 0
  for (const ch of 'ITEN') {
    const box = ctx.measureText(ch)
    if (!box.actualBoundingBoxAscent) return null
    ascent = Math.max(ascent, box.actualBoundingBoxAscent)
  }
  const y = TOP_BASELINE - ascent
  const height = BOTTOM_BASELINE - y
  return { y, height }
}

function GlyphRun({
  text,
  tracking,
  leadDx,
  x,
  y,
  fontFamily,
  fontSize,
  fontWeight,
  fontStyle,
}: {
  text: string
  tracking: string
  leadDx?: string
  x?: number
  y?: number
  fontFamily: string
  fontSize: number
  fontWeight: number
  fontStyle?: 'normal' | 'italic'
}) {
  return [...text].map((char, index) => (
    <tspan
      key={`${text}-${index}`}
      className="logo-char"
      x={index === 0 ? x : undefined}
      y={index === 0 ? y : undefined}
      dx={index === 0 ? leadDx : tracking}
      fontFamily={fontFamily}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fontStyle={fontStyle}
    >
      {char}
    </tspan>
  ))
}

function LogoWordmark({
  fill,
  textX,
  textRef,
  split,
}: {
  fill: string
  textX: number
  textRef: RefObject<SVGTextElement | null>
  split: boolean
}) {
  if (split) {
    return (
      <text ref={textRef} fill={fill} stroke="none">
        <GlyphRun
          text="INSTITUTE"
          tracking={CAP_TRACKING}
          x={textX}
          y={TOP_BASELINE}
          fontFamily={SANS_FAMILY}
          fontSize={CAP_SIZE}
          fontWeight={500}
        />
        <GlyphRun
          text="for"
          tracking="-0.01em"
          x={textX}
          y={29}
          fontFamily={SERIF_FAMILY}
          fontSize={FOR_SIZE}
          fontWeight={500}
          fontStyle="italic"
        />
        <GlyphRun
          text="PREDICTIVE"
          tracking={CAP_TRACKING}
          leadDx="0.28em"
          fontFamily={SANS_FAMILY}
          fontSize={CAP_SIZE}
          fontWeight={500}
          fontStyle="normal"
        />
        <GlyphRun
          text="SCIENCES"
          tracking={CAP_TRACKING}
          x={textX}
          y={BOTTOM_BASELINE}
          fontFamily={SANS_FAMILY}
          fontSize={CAP_SIZE}
          fontWeight={500}
        />
      </text>
    )
  }

  return (
    <text ref={textRef} fill={fill} stroke="none">
      <tspan
        x={textX}
        y={TOP_BASELINE}
        fontFamily={SANS_FAMILY}
        fontSize={CAP_SIZE}
        fontWeight={500}
        letterSpacing={CAP_TRACKING}
      >
        INSTITUTE
      </tspan>
      <tspan
        x={textX}
        y={29}
        fontFamily={SERIF_FAMILY}
        fontSize={FOR_SIZE}
        fontWeight={500}
        fontStyle="italic"
        letterSpacing="-0.01em"
      >
        for
      </tspan>
      <tspan
        dx="0.28em"
        fontFamily={SANS_FAMILY}
        fontSize={CAP_SIZE}
        fontWeight={500}
        fontStyle="normal"
        letterSpacing={CAP_TRACKING}
      >
        PREDICTIVE
      </tspan>
      <tspan
        x={textX}
        y={BOTTOM_BASELINE}
        fontFamily={SANS_FAMILY}
        fontSize={CAP_SIZE}
        fontWeight={500}
        letterSpacing={CAP_TRACKING}
      >
        SCIENCES
      </tspan>
    </text>
  )
}

export function Logo({ className = '', variant = 'green', animateChars = false }: LogoProps) {
  const fill = variant === 'white' ? '#ffffff' : TEXT_INK
  const markRef = useRef<SVGPathElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const [ink, setInk] = useState<Ink | null>(null)
  const [markBox, setMarkBox] = useState<Ink | null>(null)
  const [textBox, setTextBox] = useState<Ink | null>(null)

  useEffect(() => {
    if (!animateChars) return
    const text = textRef.current
    if (!text) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let animation: { revert: () => void } | undefined

    const play = () => {
      if (cancelled) return
      const chars = text.querySelectorAll('.logo-char')
      if (!chars.length) return
      const slow = new Set<number>()
      while (slow.size < Math.min(2, chars.length)) {
        slow.add(Math.floor(Math.random() * chars.length))
      }
      const baseDelay = stagger(9, { from: 'random' })
      animation = animate(chars, {
        opacity: [0, 1],
        duration: (_el, index) => (slow.has(index ?? -1) ? 920 : 560),
        ease: 'out(2)',
        delay: (el, index, targets) => {
          const delay = Number(baseDelay(el, index, targets))
          return delay + (slow.has(index ?? -1) ? 240 : 0)
        },
      })
    }

    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        if (!cancelled) play()
      })
    })

    return () => {
      cancelled = true
      animation?.revert()
    }
  }, [animateChars])

  useLayoutEffect(() => {
    let cancelled = false
    const measure = () => {
      const mark = markRef.current?.getBBox()
      const text = textRef.current?.getBBox()
      const block = glyphBlock()
      if (!mark || !text || !block || text.width === 0) return
      if (cancelled) return
      setMarkBox({ x: mark.x, y: mark.y, width: mark.width, height: mark.height })
      // Optical block for icon height; full text box so the viewBox does not clip glyphs.
      setInk({ x: text.x, y: block.y, width: text.width, height: block.height })
      setTextBox({ x: text.x, y: text.y, width: text.width, height: text.height })
    }
    measure()
    document.fonts?.ready.then(measure)
    return () => {
      cancelled = true
    }
  }, [])

  const scale = ink && markBox ? ink.height / markBox.height : 37 / 46.86
  const iconWidth = (markBox?.width ?? 46.86) * scale
  const textLeft = ink?.x ?? TEXT_X
  const iconLeft = textLeft - GAP - iconWidth
  const iconTop = (ink?.y ?? 5.6) - (markBox?.y ?? 0) * scale
  const iconBottom = iconTop + (markBox?.height ?? 46.86) * scale
  const textTop = textBox?.y ?? ink?.y ?? 5.692
  const textBottom = textBox ? textBox.y + textBox.height : (ink?.y ?? 5.692) + (ink?.height ?? 37.308)
  const textRight = textBox ? textBox.x + textBox.width : textLeft + (ink?.width ?? 130)
  const pad = 1
  const vbX = iconLeft - pad
  const vbY = Math.min(iconTop, textTop) - pad
  const vbH = Math.max(iconBottom, textBottom) - vbY + pad
  const vbW = textRight - vbX + pad

  return (
    <svg
      className={className}
      width={vbW}
      height={vbH}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      overflow="visible"
    >
      <g transform={`translate(${iconLeft} ${iconTop}) scale(${scale})`}>
        <path ref={markRef} d={IHS_LOGO_MARK} fill={fill} />
      </g>
      <LogoWordmark fill={fill} textX={TEXT_X} textRef={textRef} split={animateChars} />
    </svg>
  )
}

export function LogoIcon({ className = '', fill = TEXT_GREEN }: { className?: string; fill?: string }) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 47 48"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d={IHS_LOGO_MARK} />
    </svg>
  )
}
