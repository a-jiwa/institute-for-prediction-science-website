import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { assetUrl } from '../../utils/assetUrl'
import './DotsDayTimeline.css'

type ReactionImage = { imageUrl: string; size: number }

type Moment = {
  time: string
  context: string
  heading: string
  description: string
  message: string
  reactions?: string[]
  reactionImages?: ReactionImage[]
}

type Character = {
  id: string
  color: string
  src: string
}

const HANDLE_WIDTH = 116
const BUBBLE_WIDTH = 280
const MOBILE_STEP = 176
const TICK_BASE = 18
const AUTO_ADVANCE_SECONDS = 5
const INITIAL_MOMENT_INDEX = 2

const CHARACTERS: Character[] = [
  { id: 'Alfred', color: '#ffd529', src: '/assets/dots-day/poster-alfred.webp' },
  { id: 'Todd', color: '#b5ea4e', src: '/assets/dots-day/poster-todd.webp' },
  { id: 'Felipe', color: '#7ec8ff', src: '/assets/dots-day/poster-felipe.webp' },
  { id: 'Iggy', color: '#ff9ecd', src: '/assets/dots-day/poster-iggy.webp' },
  { id: 'O', color: '#bac1d3', src: '/assets/dots-day/dots-o.svg' },
]

const MOMENTS: Moment[] = [
  {
    time: '8:30 AM',
    context: 'At work',
    heading: 'Start your day with clarity',
    description:
      'Before your launch meeting, your dot notices the draft customer email still promises a feature that’s no longer in scope. It checks the latest product decisions and suggests what to revise.',
    message:
      'The launch email still promises a feature that’s moved out of scope. I’ve prepared the changes. Want to review them?',
    reactions: ['🔥', '❤️'],
    reactionImages: [{ imageUrl: '/assets/dots-day/reaction-heart.png', size: 20 }],
  },
  {
    time: '10:00 AM',
    context: 'At work',
    heading: 'Keep work and life in sync',
    description:
      'Tomorrow’s finance review now overlaps with your daughter’s recital. Your dot finds another time that works for everyone. With your go-ahead, it moves the meeting and prepares your notes, leaving you free to be there for her.',
    message:
      'The finance review overlaps with your daughter’s recital. Everyone’s available earlier in the day. Want me to move it?',
    reactions: ['👍'],
    reactionImages: [{ imageUrl: '/assets/dots-day/reaction-heart.png', size: 20 }],
  },
  {
    time: '12:30 PM',
    context: 'At work',
    heading: 'Nail your next presentation',
    description:
      'Sales are up, but fewer customers are coming back. Your dot checks the numbers against customer feedback, looks into what’s changed, and updates your leadership deck. As new figures arrive, it keeps everything current.',
    message:
      'I’ve updated your deck with what might explain the drop in returning customers. I’ve flagged what we still need to figure out and added a few options for you to consider.',
    reactions: ['❤️'],
    reactionImages: [{ imageUrl: '/assets/dots-day/reaction-check.png', size: 20 }],
  },
  {
    time: '3:30 PM',
    context: 'At work',
    heading: 'Turn feedback into improvements',
    description:
      'A customer request keeps coming up. Your dot has checked it against product data, built a small improvement, and tested it. You have working changes and trade-offs to review with Engineering.',
    message: 'Customers keep asking for saved filters. I’ve built and tested an update and noted the trade-offs.',
    reactions: ['🙌'],
    reactionImages: [{ imageUrl: '/assets/dots-day/reaction-eyes.png', size: 21 }],
  },
  {
    time: '6:30 PM',
    context: 'In life',
    heading: 'Take dinner off your plate',
    description:
      'Your dot brings you dinner options with delivery times and full totals. Choose a meal, approve the order, and let your dot follow it to your door.',
    message:
      'Working late? Your DoorDash favorites are here, with full totals and delivery times. Pick one, and I’ll place the order once you approve.',
    reactions: ['😋', '🩷'],
    reactionImages: [{ imageUrl: '/assets/dots-day/reaction-heart.png', size: 20 }],
  },
]

const DATA = {
  heading: 'A day with your dot',
  description: 'From your first meeting to dinner at your door, find out how your dot fits into your day.',
  timelineLabel: 'Explore a day with dots',
  previousLabel: 'Previous moment',
  nextLabel: 'Next moment',
  timelineHelp: 'Drag to explore your day',
  autoAdvanceSeconds: AUTO_ADVANCE_SECONDS,
  initialMomentIndex: INITIAL_MOMENT_INDEX,
  exciteOnToggle: true,
  moments: MOMENTS,
}

function clampIndex(index: number, length: number) {
  return Math.max(0, Math.min(Math.max(0, length - 1), Number.isFinite(index) ? index : 0))
}

function autoAdvanceMs(seconds: number | undefined) {
  const value = seconds ?? 5
  return Number.isFinite(value) && value > 0 ? Math.min(value * 1000, 2147483647) : 0
}

function tickDivisionsForTravel(travel: number, momentCount: number) {
  return Math.max(1, Math.floor(travel / (Math.max(1, momentCount - 1) * TICK_BASE)))
}

/** Major-tick scaleX: idle/far = 1 (disc), near handle while moving → thin line. */
function majorTickScaleX(distance: number, animate: boolean) {
  if (!animate) return 1
  return 1 - (1 - 2 / 18) * ((1 + Math.cos(Math.min(1, Math.abs(distance) / 90) * Math.PI)) / 2)
}

/** Minor-tick scaleY: always ≥1 so lines stay visible; grow taller near handle while dragging. */
function minorTickScaleY(distance: number, dragGrowth: number, animate: boolean) {
  if (!animate) return 1
  const t = Math.min(1, Math.abs(distance) / 90)
  return 1 + (5 / 9) * ((1 + Math.cos(t * Math.PI)) / 2) * dragGrowth
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useContinuousMotion() {
  const [enabled, setEnabled] = useState(() => !prefersReducedMotion())
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setEnabled(!mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return enabled
}

function ThumbBg() {
  return (
    <svg
      aria-hidden="true"
      className="ps-dots-day__thumb-bg"
      fill="none"
      height="72"
      overflow="visible"
      preserveAspectRatio="none"
      viewBox="0 0 116 72"
      width="116"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M116 24c0 6.627-5.373 12-12 12H72c-6.627 0-12 5.373-12 12v22a2 2 0 1 1-4 0V48c0-6.627-5.373-12-12-12H12C5.373 36 0 30.627 0 24V12C0 5.373 5.373 0 12 0h92c6.627 0 12 5.373 12 12z"
        fill="currentColor"
      />
    </svg>
  )
}

function FlipDigit({ value, moving }: { value: string; moving: boolean }) {
  const prevRef = useRef(value)
  const directionRef = useRef(1)
  if (prevRef.current !== value) {
    directionRef.current = Number(value) > Number(prevRef.current) ? 1 : -1
    prevRef.current = value
  }
  const direction = directionRef.current
  const duration = moving ? 0.18 : 0
  const ease: [number, number, number, number] = [0.19, 1, 0.22, 1]
  const enterY = moving ? `${direction * 100}%` : 0
  const leaveY = moving ? `${direction * -100}%` : 0

  return (
    <span className="ps-dots-day__digit-wrap">
      {Array.from(value).map((digit, i) => (
        <span className="ps-dots-day__digit-cell" key={i}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              animate={{ y: 0, opacity: 1 }}
              className="ps-dots-day__digit"
              exit={{ y: leaveY, opacity: moving ? 0 : 1 }}
              initial={{ y: enterY, opacity: moving ? 0 : 1 }}
              key={`${value}-${digit}`}
              transition={{ duration, ease }}
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

function TimeDisplay({
  time,
  moving,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  atStart,
  atEnd,
}: {
  time: string
  moving: boolean
  onPrev: () => void
  onNext: () => void
  prevLabel: string
  nextLabel: string
  atStart: boolean
  atEnd: boolean
}) {
  const parts = time.split(/(\d+)/)
  const stopDrag = (e: React.SyntheticEvent) => {
    e.stopPropagation()
  }
  return (
    <div className="ps-dots-day__thumb-content">
      <button
        aria-disabled={atStart}
        aria-label={prevLabel}
        className="ps-dots-day__step"
        disabled={atStart}
        onClick={(e) => {
          e.stopPropagation()
          if (!atStart) onPrev()
        }}
        onPointerDown={stopDrag}
        onPointerUp={stopDrag}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16">
          <path d="m10 3-5 5 5 5" />
        </svg>
      </button>
      <span aria-hidden="true" className="ps-dots-day__time">
        {parts.map((part, i) =>
          /^\d+$/.test(part) ? <FlipDigit key={`${i}-${part}`} moving={moving} value={part} /> : <span key={i}>{part}</span>,
        )}
      </span>
      <button
        aria-disabled={atEnd}
        aria-label={nextLabel}
        className="ps-dots-day__step"
        disabled={atEnd}
        onClick={(e) => {
          e.stopPropagation()
          if (!atEnd) onNext()
        }}
        onPointerDown={stopDrag}
        onPointerUp={stopDrag}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16">
          <path d="m6 3 5 5-5 5" />
        </svg>
      </button>
    </div>
  )
}

function MessageBubble({
  moment,
  animate,
}: {
  moment: Moment
  animate: boolean
}) {
  const reactions = moment.reactionImages ?? moment.reactions ?? []
  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="ps-dots-day__bubble"
      exit={{ opacity: 0, transition: { duration: animate ? 0.14 : 0, ease: 'easeOut' } }}
      initial={{ opacity: 0, y: animate ? 8 : 0, scale: animate ? 0.98 : 1 }}
      key={moment.heading}
      style={{ zIndex: 1 }}
      transition={{ duration: animate ? 0.22 : 0, ease: [0.19, 1, 0.22, 1] }}
    >
      <p>{moment.message}</p>
      {reactions.length > 0 && (
        <div aria-hidden="true" className="ps-dots-day__reactions">
          {reactions.map((reaction, i) => (
            <span className="ps-dots-day__reaction" key={i}>
              {typeof reaction === 'string' ? (
                reaction
              ) : (
                <img
                  alt=""
                  draggable={false}
                  height={reaction.size}
                  src={assetUrl(reaction.imageUrl)}
                  width={reaction.size}
                />
              )}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function CaptionBlock({ moment }: { moment: Moment }) {
  return (
    <>
      <p className="ps-dots-day__context">{moment.context}</p>
      <h3>{moment.heading}</h3>
      <p className="ps-dots-day__caption-body">{moment.description}</p>
    </>
  )
}

function MajorTick({
  position,
  x,
  travel,
  animate,
}: {
  position: number
  x: MotionValue<number>
  travel: MotionValue<number>
  animate: boolean
}) {
  const scaleX = useTransform([x, travel], ([xv, tv]) =>
    majorTickScaleX(position * (tv as number) - (xv as number), animate),
  )
  const borderRadius = useTransform(scaleX, (g) => `9px / ${9 * g}px`)
  return (
    <motion.span
      aria-hidden="true"
      className="ps-dots-day__major-tick"
      style={{ left: `${position * 100}%`, x: '-50%', scaleX, borderRadius }}
    />
  )
}

function MinorTick({
  position,
  x,
  travel,
  growth,
  animate,
}: {
  position: number
  x: MotionValue<number>
  travel: MotionValue<number>
  growth: MotionValue<number>
  animate: boolean
}) {
  const scaleY = useTransform([x, travel, growth], ([xv, tv, g]) => {
    const dist = position * (tv as number) - (xv as number)
    return minorTickScaleY(dist, g as number, animate)
  })
  return (
    <motion.span
      aria-hidden="true"
      className="ps-dots-day__minor-tick"
      style={{ left: `${position * 100}%`, x: '-50%', scaleY }}
    />
  )
}

type DragState = {
  id: number
  left: number
  travel: number
  grabOffset: number
  startX: number
  startY: number
  moved: boolean
  fromDragTarget: boolean
}

export function DotsDayTimeline() {
  const uid = useId()
  const continuous = useContinuousMotion()
  const reducedMotion = !continuous
  const momentCount = DATA.moments.length
  const delay = autoAdvanceMs(DATA.autoAdvanceSeconds)

  const [index, setIndex] = useState(() =>
    Math.round(clampIndex(DATA.initialMomentIndex ?? 0, momentCount)),
  )
  const [characterIndex, setCharacterIndex] = useState(0)
  const [moving, setMoving] = useState(true)
  const [pausedByUser, setPausedByUser] = useState(false)
  const [tickDivisions, setTickDivisions] = useState(1)

  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const scheduleAutoplayRef = useRef<(() => void) | null>(null)
  const syncingMobileScroll = useRef(false)
  const indexRef = useRef(index)
  indexRef.current = index

  const progress = useMotionValue(momentCount > 1 ? index / (momentCount - 1) : 0)
  const progressSpring = useSpring(progress, { stiffness: 400, damping: 34, mass: 0.65 })
  const tickGrowthValue = useMotionValue(0)
  const tickGrowthSpring = useSpring(tickGrowthValue, { stiffness: 500, damping: 36, mass: 0.6 })
  const stageWidth = useMotionValue(0)
  const bubbleWidth = useMotionValue(BUBBLE_WIDTH)
  const handleWidth = useMotionValue(HANDLE_WIDTH)
  const travel = useMotionValue(0)
  const rotation = useMotionValue(0)
  const rotationSpring = useSpring(rotation, { stiffness: 260, damping: 19, mass: 0.65 })

  const animateMotion = continuous && moving
  const x = useTransform(
    () => (animateMotion ? progressSpring.get() : progress.get()) * travel.get(),
  )
  const characterX = useTransform(() => {
    const raw = x.get() + handleWidth.get() / 2
    const width = stageWidth.get()
    const edge = width <= 600 ? Math.min(100, width / 2) : 0
    return width > 0 ? Math.max(edge, Math.min(width - edge, raw)) : raw
  })
  const bubbleX = useTransform(() => {
    const width = stageWidth.get()
    const bw = bubbleWidth.get()
    const gap = 12
    const cx = characterX.get()
    const preferRight = cx > width / 2 && cx + bw + gap > width
    return Math.max(0, Math.min(width - bw, cx + (preferRight ? -bw - gap : gap)))
  })

  useMotionValueEvent(x, 'change', () => {
    if (!dragRef.current || !animateMotion) rotation.set(0)
  })

  const character = CHARACTERS[characterIndex % CHARACTERS.length]
  const moment = DATA.moments[Math.min(index, momentCount - 1)]
  const rangeId = `${uid}-range`
  const momentId = `${uid}-moment`
  const ariaValueText = `${moment.time}, ${moment.context}: ${moment.heading}`

  const select = useCallback(
    (next: number, animate = true, resumeAutoplay = true) => {
      setPausedByUser(!resumeAutoplay)
      if (resumeAutoplay) scheduleAutoplayRef.current?.()
      const clamped = clampIndex(Math.round(next), momentCount)
      tickGrowthValue.set(0)
      rotation.set(0)
      setMoving(animate)
      progress.set(momentCount > 1 ? clamped / (momentCount - 1) : 0)
      if (!continuous || !animate) {
        progressSpring.jump(progress.get())
        tickGrowthSpring.jump(0)
        rotationSpring.jump(0)
      }

      // Keep native mobile scroll in lockstep before React paints, and ignore
      // scroll events so they cannot immediately overwrite this selection.
      const scroller = mobileScrollRef.current
      if (scroller) {
        const target = clamped * MOBILE_STEP
        if (Math.abs(scroller.scrollLeft - target) >= 1) {
          syncingMobileScroll.current = true
          scroller.scrollTo({ left: target, behavior: 'instant' })
          requestAnimationFrame(() => {
            syncingMobileScroll.current = false
          })
        }
      }

      indexRef.current = clamped
      setIndex(clamped)
    },
    [
      continuous,
      momentCount,
      progress,
      progressSpring,
      rotation,
      rotationSpring,
      tickGrowthSpring,
      tickGrowthValue,
    ],
  )

  const stepBy = useCallback(
    (delta: number) => {
      select(indexRef.current + delta, true, true)
    },
    [select],
  )

  const advance = useEffectEvent(() => {
    select((index + 1) % momentCount, true, false)
  })

  // Measure layout
  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current?.clientWidth ?? 0
      const bubble = bubbleRef.current?.clientWidth ?? BUBBLE_WIDTH
      const thumb = thumbRef.current?.offsetWidth ?? HANDLE_WIDTH
      const nextTravel = Math.max(0, (sliderRef.current?.clientWidth ?? 0) - thumb)
      setTickDivisions(tickDivisionsForTravel(nextTravel, momentCount))
      if (
        stage !== stageWidth.get() ||
        bubble !== bubbleWidth.get() ||
        thumb !== handleWidth.get() ||
        nextTravel !== travel.get()
      ) {
        stageWidth.set(stage)
        bubbleWidth.set(bubble)
        handleWidth.set(thumb)
        travel.set(nextTravel)
        progressSpring.jump(progress.get())
      }
    }
    const ro = new ResizeObserver(measure)
    for (const ref of [stageRef, sliderRef, bubbleRef, thumbRef]) {
      if (ref.current) ro.observe(ref.current)
    }
    measure()
    return () => ro.disconnect()
  }, [bubbleWidth, handleWidth, momentCount, progress, progressSpring, stageWidth, travel])

  // Autoplay with ChatGPT-style pause rules
  useEffect(() => {
    const root = rootRef.current
    if (!root || momentCount < 2 || !delay || reducedMotion) return

    const group =
      (root.closest('[data-dots-day-interactions]') as HTMLElement | null) ?? root
    const nativeScroll = root.querySelector<HTMLElement>('[data-dots-day-native-scroll]')
    let touching = false
    let scrolling = false
    let scrollTimer: number | undefined
    let intersecting = false
    let activePointer: number | null = null
    let hoverPause =
      window.matchMedia('(hover: hover)').matches &&
      Array.from(group.querySelectorAll('[data-dots-day-autoplay-pause], button, input')).some((el) =>
        (el as HTMLElement).matches(':hover'),
      )
    let focusPause =
      document.activeElement instanceof HTMLElement &&
      group.contains(document.activeElement) &&
      document.activeElement.dataset.pointerFocus !== 'true' &&
      document.activeElement.matches(':focus-visible')

    let timer: number | undefined
    const canRun = () =>
      intersecting &&
      !document.hidden &&
      activePointer == null &&
      !touching &&
      !scrolling &&
      !hoverPause &&
      !focusPause &&
      !pausedByUser

    const schedule = () => {
      window.clearTimeout(timer)
      timer = undefined
      if (canRun()) {
        timer = window.setTimeout(() => {
          if (canRun()) advance()
          schedule()
        }, delay)
      }
    }
    scheduleAutoplayRef.current = schedule

    const onPointerDown = (e: Event) => {
      const pe = e as PointerEvent
      if (!pe.isPrimary || pe.button !== 0) return
      activePointer = pe.pointerId
      focusPause = false
      schedule()
    }
    const onPointerUp = (e: Event) => {
      const pe = e as PointerEvent
      if (pe.pointerId === activePointer) {
        activePointer = null
        schedule()
      }
    }
    const onTouchStart = () => {
      touching = true
      focusPause = false
      schedule()
    }
    const onTouchEnd = (e: Event) => {
      const te = e as TouchEvent
      if (touching) {
        touching = te.touches.length > 0
        schedule()
      }
    }
    const clearScroll = () => {
      window.clearTimeout(scrollTimer)
      scrolling = false
      schedule()
    }
    const onScroll = () => {
      if (!nativeScroll?.clientWidth) return
      scrolling = true
      window.clearTimeout(scrollTimer)
      schedule()
      scrollTimer = window.setTimeout(clearScroll, 200)
    }
    const onHover = (e: Event) => {
      const pe = e as PointerEvent
      if (pe.pointerType !== 'mouse') return
      const target = (pe.type === 'pointerout' ? pe.relatedTarget : pe.target) as Node | null
      const next =
        target instanceof Element &&
        group.contains(target) &&
        target.closest('[data-dots-day-autoplay-pause], button, input') != null
      if (hoverPause !== next) {
        hoverPause = next
        schedule()
      }
    }
    const onFocusIn = (e: Event) => {
      const fe = e as FocusEvent
      focusPause =
        activePointer == null &&
        fe.target instanceof HTMLElement &&
        fe.target.dataset.pointerFocus !== 'true' &&
        fe.target.matches(':focus-visible')
      schedule()
    }
    const onFocusOut = (e: Event) => {
      const fe = e as FocusEvent
      if (fe.relatedTarget instanceof Node && group.contains(fe.relatedTarget)) return
      focusPause = false
      schedule()
    }
    const onKeyDown = () => {
      focusPause = true
      schedule()
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting && entry.intersectionRatio >= 0.15
        schedule()
      },
      { threshold: [0, 0.15] },
    )
    io.observe(root)

    group.addEventListener('pointerdown', onPointerDown, true)
    group.addEventListener('pointerover', onHover)
    group.addEventListener('pointerout', onHover)
    group.addEventListener('lostpointercapture', onPointerUp)
    group.addEventListener('focusin', onFocusIn)
    group.addEventListener('focusout', onFocusOut)
    group.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerup', onPointerUp, true)
    window.addEventListener('pointercancel', onPointerUp, true)
    nativeScroll?.addEventListener('touchstart', onTouchStart, { passive: true })
    nativeScroll?.addEventListener('scroll', onScroll, { passive: true })
    nativeScroll?.addEventListener('scrollend', clearScroll)
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    document.addEventListener('visibilitychange', schedule)

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(scrollTimer)
      scheduleAutoplayRef.current = null
      io.disconnect()
      group.removeEventListener('pointerdown', onPointerDown, true)
      group.removeEventListener('pointerover', onHover)
      group.removeEventListener('pointerout', onHover)
      group.removeEventListener('lostpointercapture', onPointerUp)
      group.removeEventListener('focusin', onFocusIn)
      group.removeEventListener('focusout', onFocusOut)
      group.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerup', onPointerUp, true)
      window.removeEventListener('pointercancel', onPointerUp, true)
      nativeScroll?.removeEventListener('touchstart', onTouchStart)
      nativeScroll?.removeEventListener('scroll', onScroll)
      nativeScroll?.removeEventListener('scrollend', clearScroll)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [delay, momentCount, pausedByUser, reducedMotion])

  const endDrag = (e: PointerEvent | ReactPointerEvent, cancel = false) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    const target = e.currentTarget as HTMLElement
    try {
      target.releasePointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
    if (!cancel && drag.moved) {
      const next = Math.round(progress.get() * Math.max(0, momentCount - 1))
      select(next, true, true)
    } else if (!drag.moved) {
      setMoving(true)
    }
    tickGrowthValue.set(0)
    rotation.set(0)
    dragRef.current = null
  }

  const startDrag = (e: ReactPointerEvent, fromDragTarget: boolean) => {
    if (!e.isPrimary || e.button !== 0 || momentCount < 2) return
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    target.dataset.pointerFocus = 'true'
    target.focus({ preventScroll: true })
    const rect = sliderRef.current?.getBoundingClientRect()
    if (!rect) return
    const nextTravel = travel.get()
    const currentX = progress.get() * nextTravel
    dragRef.current = {
      id: e.pointerId,
      left: rect.left + HANDLE_WIDTH / 2,
      travel: nextTravel,
      grabOffset: fromDragTarget ? e.clientX - (rect.left + currentX) : HANDLE_WIDTH / 2,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      fromDragTarget,
    }
    target.setPointerCapture?.(e.pointerId)
  }

  const moveDrag = (e: ReactPointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId || drag.travel <= 0) return
    const dx = Math.abs(e.clientX - drag.startX)
    const dy = Math.abs(e.clientY - drag.startY)
    if (!drag.moved) {
      if (drag.fromDragTarget && dy > 6 && dy >= dx) {
        endDrag(e, true)
        return
      }
      if (drag.fromDragTarget ? dx <= 6 || dx <= dy : dx < 3) return
    }
    drag.moved = true
    tickGrowthValue.set(continuous ? 1 : 0)
    const next = Math.max(0, Math.min(1, (e.clientX - drag.left - drag.grabOffset) / drag.travel))
    progress.set(next)
    progressSpring.jump(next)
    const velocityLean = Math.max(-22, Math.min(22, -(e.movementX || 0) * 0.9))
    rotation.set(continuous ? velocityLean : 0)
    setIndex(Math.round(next * (momentCount - 1)))
    setMoving(true)
  }

  const onRangeChange = (value: number) => {
    if (dragRef.current) return
    select(value, false)
  }

  const onMobileScroll = () => {
    const el = mobileScrollRef.current
    if (!el || syncingMobileScroll.current) return
    const next = clampIndex(Math.round(el.scrollLeft / MOBILE_STEP), momentCount)
    if (next !== indexRef.current) select(next, true, true)
  }

  const cycleCharacter = () => {
    setCharacterIndex((i) => (i + 1) % CHARACTERS.length)
  }

  const facing = -12 + (index / Math.max(1, momentCount - 1)) * 24
  const live = pausedByUser || !delay || reducedMotion ? 'polite' : 'off'
  const minorCount = tickDivisions * Math.max(0, momentCount - 1)
  const dayTravel = MOBILE_STEP * Math.max(0, momentCount - 1)

  const sectionStyle = {
    '--timeline-color': character.color,
  } as CSSProperties

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className="ps-dots-day"
      id="day"
      style={sectionStyle}
    >
      <div className="ps-dots-day__inner">
      <header className="ps-dots-day__header">
        <h2 className="ps-dots-day__title" id={`${uid}-title`}>
          {DATA.heading}
        </h2>
      </header>

      <div
        aria-label={DATA.heading}
        className="ps-dots-day__body"
        data-dots-day-interactions="true"
        ref={rootRef}
        role="group"
      >
        <div className="ps-dots-day__stage-wrap">
          {/* Desktop */}
          <div className="ps-dots-day__desktop">
            <div className="ps-dots-day__stage" ref={stageRef}>
              <motion.div className="ps-dots-day__character-rail" style={{ x: characterX }}>
                <motion.div
                  className="ps-dots-day__character"
                  data-dots-day-autoplay-pause="true"
                  onPointerCancel={(e) => endDrag(e)}
                  onPointerDown={(e) => startDrag(e, true)}
                  onPointerMove={moveDrag}
                  onPointerUp={(e) => endDrag(e)}
                  style={{ rotate: rotationSpring }}
                >
                  <img
                    alt=""
                    className="ps-dots-day__character-img"
                    draggable={false}
                    src={assetUrl(character.src)}
                    style={{ transform: `scaleX(${facing >= 0 ? 1 : -1})` }}
                  />
                  <button
                    aria-label="Change character across the page"
                    className="ps-dots-day__character-hit"
                    onClick={(e) => {
                      e.stopPropagation()
                      cycleCharacter()
                    }}
                    type="button"
                  />
                </motion.div>
              </motion.div>

              <div aria-hidden="true" className="ps-dots-day__bubbles" ref={bubbleRef}>
                {DATA.moments.map((m) => (
                  <div className="ps-dots-day__bubble-measure" key={`measure-${m.heading}`}>
                    <p>{m.message}</p>
                  </div>
                ))}
                <motion.div className="ps-dots-day__bubble-slot" style={{ x: bubbleX }}>
                  <AnimatePresence custom={animateMotion} initial={false} mode="sync">
                    <MessageBubble animate={animateMotion} moment={moment} />
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            <div
              className="ps-dots-day__slider"
              data-dots-day-autoplay-pause="true"
              ref={sliderRef}
              style={sectionStyle}
            >
              <div aria-hidden="true" className="ps-dots-day__ticks">
                <div className="ps-dots-day__minor-row">
                  {Array.from({ length: minorCount + 1 }, (_, i) =>
                    i % tickDivisions === 0 ? null : (
                      <MinorTick
                        animate={animateMotion}
                        growth={tickGrowthSpring}
                        key={i}
                        position={i / minorCount}
                        travel={travel}
                        x={x}
                      />
                    ),
                  )}
                </div>
                {DATA.moments.map((_, i) => (
                  <MajorTick
                    animate={animateMotion}
                    key={i}
                    position={i / Math.max(1, momentCount - 1)}
                    travel={travel}
                    x={x}
                  />
                ))}
              </div>

              <label className="ps-dots-day__sr-only" htmlFor={rangeId}>
                {DATA.timelineLabel}
              </label>
              <input
                aria-controls={momentId}
                aria-valuetext={ariaValueText}
                className="ps-dots-day__input"
                disabled={momentCount < 2}
                id={rangeId}
                max={Math.max(0, momentCount - 1)}
                min={0}
                name="dots-day"
                onBlur={(e) => {
                  delete e.currentTarget.dataset.pointerFocus
                }}
                onChange={(e) => onRangeChange(Number(e.currentTarget.value))}
                onKeyDown={(e) => {
                  delete e.currentTarget.dataset.pointerFocus
                  if (e.key === 'PageUp' || e.key === 'PageDown') {
                    e.preventDefault()
                    select(index + (e.key === 'PageUp' ? 1 : -1), false)
                  } else {
                    tickGrowthValue.set(0)
                    tickGrowthSpring.jump(0)
                    rotation.set(0)
                    rotationSpring.jump(0)
                    setMoving(false)
                  }
                }}
                onLostPointerCapture={(e) => endDrag(e, true)}
                onPointerCancel={(e) => endDrag(e)}
                onPointerDown={(e) => startDrag(e, false)}
                onPointerMove={moveDrag}
                onPointerUp={(e) => endDrag(e)}
                step={1}
                title={DATA.timelineHelp}
                type="range"
                value={index}
              />

              <motion.div
                className="ps-dots-day__thumb"
                onPointerCancel={(e) => endDrag(e)}
                onPointerDown={(e) => startDrag(e, true)}
                onPointerMove={moveDrag}
                onPointerUp={(e) => endDrag(e)}
                ref={thumbRef}
                style={{ x }}
              >
                <ThumbBg />
                <TimeDisplay
                  atEnd={index >= momentCount - 1}
                  atStart={index <= 0}
                  moving={animateMotion}
                  nextLabel={DATA.nextLabel}
                  onNext={() => stepBy(1)}
                  onPrev={() => stepBy(-1)}
                  prevLabel={DATA.previousLabel}
                  time={moment.time}
                />
              </motion.div>
            </div>
          </div>

          {/* Mobile */}
          <div className="ps-dots-day__mobile" data-day-interaction="mobile">
            <div
              className="ps-dots-day__mobile-scroll"
              data-dots-day-autoplay-pause="true"
              data-dots-day-native-scroll="true"
              onScroll={onMobileScroll}
              ref={mobileScrollRef}
              style={{ '--day-travel': `${dayTravel}px` } as CSSProperties}
            >
              <div className="ps-dots-day__mobile-track">
                {DATA.moments.map((_, i) => (
                  <span
                    aria-hidden="true"
                    className="ps-dots-day__mobile-snap"
                    key={i}
                    style={{ left: i * MOBILE_STEP }}
                  />
                ))}

                <div className="ps-dots-day__mobile-pinned">
                  <div className="ps-dots-day__mobile-message">
                    <div
                      className="ps-dots-day__mobile-character"
                      data-selected-character={character.id}
                    >
                      <div className="ps-dots-day__mobile-character-inner">
                        <img
                          alt=""
                          className="ps-dots-day__character-img"
                          draggable={false}
                          src={assetUrl(character.src)}
                        />
                      </div>
                      <button
                        aria-label="Change character across the page"
                        className="ps-dots-day__character-hit"
                        onClick={cycleCharacter}
                        type="button"
                      />
                    </div>

                    <div className="ps-dots-day__mobile-bubbles">
                      {DATA.moments.map((m) => (
                        <div className="ps-dots-day__mobile-reserved" key={`m-${m.heading}`}>
                          <p>{m.message}</p>
                        </div>
                      ))}
                      <AnimatePresence custom={animateMotion} initial={false} mode="sync">
                        <MessageBubble animate={animateMotion} moment={moment} />
                      </AnimatePresence>
                    </div>
                  </div>

                  <div
                    className="ps-dots-day__slider ps-dots-day__mobile-slider"
                    data-dots-day-autoplay-pause="true"
                    style={sectionStyle}
                  >
                    <div aria-hidden="true" className="ps-dots-day__mobile-ruler-viewport">
                      <div
                        className="ps-dots-day__mobile-ruler"
                        style={{
                          width: dayTravel,
                          transform: `translateX(${-index * MOBILE_STEP}px)`,
                        }}
                      >
                        {DATA.moments.map((_, i) => (
                          <span
                            className="ps-dots-day__major-tick"
                            key={`maj-${i}`}
                            style={{
                              left: `${(i / Math.max(1, momentCount - 1)) * 100}%`,
                              transform: 'translateX(-50%) scaleX(1)',
                              borderRadius: '9px / 9px',
                            }}
                          />
                        ))}
                        {Array.from({ length: Math.max(0, momentCount - 1) * 8 }, (_, i) => {
                          const segment = Math.floor(i / 8)
                          const within = (i % 8) + 1
                          const left = segment * MOBILE_STEP + within * (MOBILE_STEP / 9)
                          return (
                            <span
                              className="ps-dots-day__minor-tick"
                              key={`min-${i}`}
                              style={{ left }}
                            />
                          )
                        })}
                      </div>
                    </div>

                    <label className="ps-dots-day__sr-only" htmlFor={`${uid}-mobile-range`}>
                      {DATA.timelineLabel}
                    </label>
                    <input
                      aria-controls={momentId}
                      aria-valuetext={ariaValueText}
                      className="ps-dots-day__input ps-dots-day__mobile-input"
                      disabled={momentCount < 2}
                      id={`${uid}-mobile-range`}
                      max={Math.max(0, momentCount - 1)}
                      min={0}
                      name="dots-day-mobile"
                      onChange={(e) => select(Number(e.currentTarget.value), true)}
                      onKeyDown={(e) => {
                        if (e.key === 'PageUp' || e.key === 'PageDown') {
                          e.preventDefault()
                          select(index + (e.key === 'PageUp' ? 1 : -1), false)
                        }
                      }}
                      step={1}
                      type="range"
                      value={index}
                    />
                    <div
                      aria-hidden="true"
                      className="ps-dots-day__mobile-drag"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const offset = e.clientX - rect.left - rect.width / 2
                        select(Math.round(clampIndex(index + offset / MOBILE_STEP, momentCount)), true)
                      }}
                    />
                    <div className="ps-dots-day__mobile-flag">
                      <ThumbBg />
                      <TimeDisplay
                        atEnd={index >= momentCount - 1}
                        atStart={index <= 0}
                        moving={animateMotion}
                        nextLabel={DATA.nextLabel}
                        onNext={() => stepBy(1)}
                        onPrev={() => stepBy(-1)}
                        prevLabel={DATA.previousLabel}
                        time={moment.time}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          aria-atomic="true"
          aria-live={live}
          className="ps-dots-day__caption"
          data-dots-day-autoplay-pause="true"
          id={momentId}
        >
          <div className="ps-dots-day__caption-stack">
            {DATA.moments.map((m) => (
              <div aria-hidden="true" className="ps-dots-day__caption-measure" key={`cap-${m.heading}`}>
                <CaptionBlock moment={m} />
              </div>
            ))}
            <AnimatePresence custom={animateMotion} initial={false} mode="sync">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="ps-dots-day__caption-active"
                exit={{ opacity: 0, transition: { duration: animateMotion ? 0.14 : 0, ease: 'easeOut' } }}
                initial={{ opacity: 0, y: animateMotion ? 6 : 0 }}
                key={moment.heading}
                transition={{ duration: animateMotion ? 0.22 : 0, ease: [0.19, 1, 0.22, 1] }}
              >
                <CaptionBlock moment={moment} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
