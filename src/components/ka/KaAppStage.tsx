import { useEffect, useRef, type ReactNode } from 'react'
import { animate, eases, stagger, type JSAnimation } from 'animejs'
import { assetUrl } from '../../utils/assetUrl'

export type KaAppStageVariant = 'forecast' | 'brief' | 'board' | 'result'

type KaAppStageProps = {
  /** White shell SVG (chrome). */
  shell?: string
  /** Demo overlay preset. */
  variant?: KaAppStageVariant
  className?: string
  children?: ReactNode
}

const SLOT_LABELS = [
  'Will Trump win the Nobel Peace Prize?',
  'Will Russia and Ukraine sign a peace treaty?',
  'Will India launch a strike against Pakistan?',
  'Will the price of gold exceed $5000?',
  'Will BYD sell more cars than Ford?',
  'Will Taylor Swift announce she is pregnant?',
]

function SlotRow({ label }: { label: string }) {
  return (
    <div className="ka-app-stage__slot">
      <div className="ka-app-stage__slot-face" />
      <span className="ka-app-stage__slot-label" data-label={label} />
    </div>
  )
}

function SlotSets({ count }: { count: number }) {
  // Every set is identical so the infinite loop can wrap without a text jump.
  return (
    <>
      {Array.from({ length: count }, (_, setIndex) => (
        <div className="ka-app-stage__slots-set" key={setIndex}>
          {SLOT_LABELS.map((label, rowIndex) => (
            <SlotRow key={rowIndex} label={label} />
          ))}
        </div>
      ))}
    </>
  )
}

const VARIANTS: Record<KaAppStageVariant, ReactNode> = {
  forecast: null,
  brief: (
    <div className="ka-app-stage__slots">
      <div className="ka-app-stage__slots-track">
        <SlotSets count={8} />
      </div>
    </div>
  ),
  board: null,
  result: null,
}

/**
 * Option 2: SVG chrome as an image + HTML stage on top.
 * Style/animate `.ka-app-stage__*` nodes with CSS and anime.js.
 */
export function KaAppStage({
  shell = '/assets/placeholders/khan/panel-white.svg',
  variant = 'forecast',
  className = '',
  children,
}: KaAppStageProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const viewport = root.querySelector<HTMLElement>('.ka-app-stage__slots')
    const track = root.querySelector<HTMLElement>('.ka-app-stage__slots-track')
    const set = root.querySelector<HTMLElement>('.ka-app-stage__slots-set')
    const shellImg = root.querySelector<HTMLImageElement>('.ka-app-stage__shell')

    if (!viewport || !track || !set) {
      if (reduceMotion) return
      const bits = root.querySelectorAll('.ka-app-stage__bit')
      if (!bits.length) return
      const animation = animate(bits, {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(80),
        duration: 480,
        ease: 'out(2)',
      })
      return () => {
        animation.revert()
      }
    }

    const slot = set.querySelector<HTMLElement>('.ka-app-stage__slot')
    if (!slot) return

    let slots: HTMLElement[] = []
    let cancelled = false
    let lastViewHeight = 0
    let active: JSAnimation | null = null
    let pauseTimer = 0
    const motion = { y: 0 }

    const clearSlotStyles = () => {
      for (const row of slots) {
        row.style.transform = ''
        const face = row.querySelector<HTMLElement>('.ka-app-stage__slot-face')
        const label = row.querySelector<HTMLElement>('.ka-app-stage__slot-label')
        if (face) {
          face.style.top = ''
          face.style.left = ''
          face.style.width = ''
          face.style.height = ''
          face.style.opacity = ''
          face.style.backgroundColor = ''
        }
        if (label) {
          label.style.left = ''
          label.style.width = ''
          label.style.fontSize = ''
          label.style.color = ''
          label.style.opacity = ''
          label.textContent = ''
        }
      }
      track.style.transform = ''
    }

    const stopMotion = () => {
      window.clearTimeout(pauseTimer)
      active?.pause()
      active = null
    }

    const setup = () => {
      if (cancelled) return

      const setHeight = set.offsetHeight
      const viewHeight = viewport.clientHeight
      const slotHeight = slot.offsetHeight
      if (!setHeight || !viewHeight || !slotHeight) return
      if (Math.abs(viewHeight - lastViewHeight) < 1 && active) return
      lastViewHeight = viewHeight

      stopMotion()

      const gap = parseFloat(getComputedStyle(set).rowGap || getComputedStyle(set).gap) || 0
      const step = slotHeight + gap
      const rowsPerSet = set.querySelectorAll('.ka-app-stage__slot').length
      const centerY = (viewHeight - slotHeight) / 2
      const startIndex = Math.ceil(viewHeight / step) + rowsPerSet

      const rowsNeeded = startIndex + rowsPerSet + Math.ceil(viewHeight / step) + 2
      const copies = Math.max(track.children.length, Math.ceil(rowsNeeded / rowsPerSet))
      while (track.children.length < copies) {
        track.appendChild(set.cloneNode(true))
      }

      slots = [...track.querySelectorAll<HTMLElement>('.ka-app-stage__slot')]
      const faces = slots.map((row) => row.querySelector<HTMLElement>('.ka-app-stage__slot-face'))
      const labels = slots.map((row) => row.querySelector<HTMLElement>('.ka-app-stage__slot-label'))
      const slotWidth = slot.offsetWidth
      const scaleFocus = 1.42
      const scaleAbove = 1.3
      const scaleNear = 1.28
      const scaleRest = 0.96
      const open = (scaleFocus - 1) * slotHeight * 0.28
      let index = startIndex

      const clearLabels = () => {
        for (const label of labels) {
          if (label) label.textContent = ''
        }
      }

      const smoothstep = (t: number) => {
        const x = Math.min(1, Math.max(0, t))
        return x * x * (3 - 2 * x)
      }

      const applyTrack = (y: number) => {
        motion.y = y
        // Keep subpixel Y for fluid motion (rounding makes the scroll feel stepped).
        track.style.transform = `translateY(${y}px)`
      }

      const fontRest = 0.875
      const fontFocus = 0.98
      const fontAbove = 0.92

      const applyFaceScale = (i: number, scale: number, fontSizeRem: number) => {
        const face = faces[i]
        const label = labels[i]
        const width = slotWidth * scale
        const height = slotHeight * scale
        const left = -((scale - 1) * slotWidth) / 2
        const top = -((scale - 1) * slotHeight) / 2
        if (face) {
          face.style.left = `${left}px`
          face.style.top = `${top}px`
          face.style.width = `${width}px`
          face.style.height = `${height}px`
        }
        if (label) {
          label.style.left = `${left}px`
          label.style.width = `${width}px`
          label.style.fontSize = `${fontSizeRem}rem`
        }
      }

      const syncScales = (trackY: number) => {
        const viewMid = viewHeight / 2
        for (let i = 0; i < slots.length; i += 1) {
          const slotMid = trackY + i * step + slotHeight / 2
          const signed = slotMid - viewMid
          const dist = Math.abs(signed)
          const label = labels[i]

          const focus = smoothstep(1 - dist / (step * 0.95))
          const near = smoothstep(1 - dist / (step * 2.1))
          // Rise in smoothly; above centre ease to a slightly smaller held size.
          let scale: number
          let fontSizeRem: number
          if (signed < 0) {
            const aboveT = smoothstep(Math.min(1, -signed / (step * 0.45)))
            scale = scaleFocus + (scaleAbove - scaleFocus) * aboveT
            fontSizeRem = fontFocus + (fontAbove - fontFocus) * aboveT
          } else {
            scale =
              scaleRest +
              (scaleNear - scaleRest) * Math.pow(near, 0.7) +
              (scaleFocus - scaleNear) * focus
            fontSizeRem = fontRest + (fontFocus - fontRest) * focus
          }

          const band = smoothstep(1 - dist / (step * 1.25))
          const pushAmt = open * (signed < 0 ? 1.1 : 0.85)
          const pushY = Math.sign(signed || 1) * pushAmt * band * (1 - focus)

          slots[i].style.transform = pushY ? `translateY(${pushY}px)` : ''
          applyFaceScale(i, scale, fontSizeRem)

          // Two solid boxes above centre; the uppermost fades only as it keeps rising.
          const face = faces[i]
          let boxOpacity = 1
          if (signed < 0) {
            const solidAbove = step * 2
            if (-signed > solidAbove) {
              const fadeSpan = step * 0.7
              boxOpacity = 1 - Math.min(1, (-signed - solidAbove) / fadeSpan)
            }
          } else if (signed > 0) {
            const bottomSpan = Math.max(1, viewHeight - viewMid - slotHeight * 0.35)
            const fromBottom = 1 - Math.min(1, signed / bottomSpan)
            boxOpacity = 0.2 + fromBottom * 0.8
          }
          if (face) {
            face.style.opacity = String(boxOpacity)
            // Soft ice → calm focus blue (#4A86E0), held while ascending.
            if (signed < 0 || focus > 0.55) {
              face.style.backgroundColor = '#4A86E0'
            } else {
              const t = focus
              const r = Math.round(0xd4 + (0x4a - 0xd4) * t)
              const g = Math.round(0xe5 + (0x86 - 0xe5) * t)
              const b = Math.round(0xf8 + (0xe0 - 0xf8) * t)
              face.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
            }
          }
          if (label) label.style.opacity = String(boxOpacity)

          if (!label) continue
          // Incoming feed from below stays empty — continuous blank boxes.
          if (signed > step * 0.2) {
            label.textContent = ''
            label.style.color = ''
            continue
          }
          // Soft off-white type; eases cooler as it rises.
          if (signed >= -step * 0.2) {
            label.style.color = '#f4f8fc'
          } else {
            const fade = Math.min(1, dist / (step * 2.4))
            const alpha = 0.95 - fade * 0.3
            label.style.color = `rgb(244 248 252 / ${alpha})`
          }
        }
      }

      const paint = (y: number) => {
        applyTrack(y)
        syncScales(y)
      }

      const fillAboveLabels = () => {
        // Prefill / restore every row currently above centre so the feed looks mid-stream.
        const trackY = motion.y
        const viewMid = viewHeight / 2
        for (let i = 0; i < slots.length; i += 1) {
          const label = labels[i]
          if (!label) continue
          const slotMid = trackY + i * step + slotHeight / 2
          const signed = slotMid - viewMid
          if (signed < -step * 0.15) {
            label.textContent = label.dataset.label ?? ''
          } else if (signed > step * 0.2) {
            label.textContent = ''
          }
        }
      }

      /** Keep text continuous when the track wraps to an earlier identical set. */
      const copyLabelsAcrossWrap = () => {
        for (let i = 0; i < slots.length - rowsPerSet; i += 1) {
          const from = labels[i + rowsPerSet]
          const to = labels[i]
          if (!from || !to) continue
          to.textContent = from.textContent
          to.style.color = from.style.color
          to.style.opacity = from.style.opacity
        }
      }

      paint(centerY - index * step)
      clearLabels()
      fillAboveLabels()
      paint(centerY - index * step)

      if (reduceMotion) {
        const label = labels[index]
        if (label) label.textContent = label.dataset.label ?? ''
        return
      }

      const typeCenterThenContinue = () => {
        if (cancelled) return
        const label = labels[index]
        const full = label?.dataset.label ?? ''
        if (!label || !full) {
          pauseTimer = window.setTimeout(advance, 1000)
          return
        }

        // Only the centred row types in; rows above keep text, rows below stay empty.
        label.textContent = ''
        label.style.color = '#f4f8fc'
        const typed = { n: 0 }
        active = animate(typed, {
          n: full.length,
          duration: Math.max(560, full.length * 28),
          ease: eases.outSine,
          onUpdate: () => {
            label.textContent = full.slice(0, Math.round(typed.n))
            label.style.color = '#f4f8fc'
          },
          onComplete: () => {
            if (cancelled) return
            label.textContent = full
            label.style.color = '#f4f8fc'
            pauseTimer = window.setTimeout(advance, 900)
          },
        })
      }

      const advance = () => {
        if (cancelled) return
        index += 1
        const target = centerY - index * step

        active = animate(motion, {
          y: target,
          duration: 1100,
          ease: eases.inOutCubic,
          onUpdate: () => {
            paint(motion.y)
          },
          onComplete: () => {
            if (cancelled) return
            paint(target)
            if (index >= startIndex + rowsPerSet) {
              copyLabelsAcrossWrap()
              index -= rowsPerSet
              paint(centerY - index * step)
            }
            typeCenterThenContinue()
          },
        })
      }

      typeCenterThenContinue()
    }

    setup()

    let resizeTimer = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(setup, 80)
    })
    ro.observe(viewport)
    if (shellImg && !shellImg.complete) {
      shellImg.addEventListener('load', setup)
    }

    return () => {
      cancelled = true
      window.clearTimeout(resizeTimer)
      ro.disconnect()
      shellImg?.removeEventListener('load', setup)
      stopMotion()
      clearSlotStyles()
    }
  }, [variant, shell])

  return (
    <div className={`ka-app-stage ${className}`.trim()} ref={rootRef}>
      <img alt="" className="ka-app-stage__shell" src={assetUrl(shell)} />
      <div className="ka-app-stage__stage" aria-hidden>
        {children ?? VARIANTS[variant]}
      </div>
    </div>
  )
}
