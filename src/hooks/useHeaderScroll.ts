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
      const fullHeight =
        Number.parseFloat(getComputedStyle(header).getPropertyValue('--header-height')) || 88
      // Sticky hero stays in view; compact only once the section below reaches the bar.
      const cover = document.querySelector('.home-cover')
      const hero = document.querySelector('section.main.statement-hero, section.main')
      const coverTop = cover?.getBoundingClientRect().top
      const heroBottom = hero?.getBoundingClientRect().bottom
      const overHero =
        coverTop != null
          ? coverTop > fullHeight
          : heroBottom != null
            ? heroBottom > fullHeight
            : y < fullHeight

      const pastHero =
        coverTop != null
          ? Math.max(0, fullHeight - coverTop)
          : heroBottom != null
            ? Math.max(0, fullHeight - heroBottom)
            : y

      header.style.setProperty('--header-compact', compactProgress(pastHero).toFixed(4))
      header.style.transform = ''
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
