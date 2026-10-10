import { useEffect, type RefObject } from 'react'
import type Lenis from 'lenis'

/** Scroll distance over which the bar eases into its compact size. */
const COMPACT_RANGE = 72

function compactProgress(scrollY: number) {
  const t = Math.min(1, Math.max(0, scrollY / COMPACT_RANGE))
  return t * t * (3 - 2 * t)
}

/**
 * Keeps the header fixed and drives a scroll-linked compact size.
 * Transparent over the hero; white once the hero has scrolled away.
 */
export function useHeaderScroll(
  headerRef: RefObject<HTMLElement | null>,
  lenis?: Lenis | null,
) {
  useEffect(() => {
    let raf = 0

    const update = () => {
      raf = 0
      const header = headerRef.current
      if (!header) return

      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = Math.max(0, Math.min(window.scrollY, max))
      header.style.setProperty('--header-compact', compactProgress(y).toFixed(4))
      header.style.transform = ''

      const headerHeight = Math.round(header.getBoundingClientRect().height) || 80
      const hero = document.querySelector('section.main')
      const overHero = hero
        ? hero.getBoundingClientRect().bottom > headerHeight
        : y < headerHeight
      header.toggleAttribute('data-scrolled', !overHero)
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    lenis?.on('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      lenis?.off('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [headerRef, lenis])
}
