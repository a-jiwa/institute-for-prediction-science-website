import { useEffect, type RefObject } from 'react'
import type Lenis from 'lenis'

/**
 * Keeps the header fixed at full height.
 * The bottom border appears once the hero has scrolled away.
 */
export function useHeaderScroll(
  headerRef: RefObject<HTMLElement | null>,
  lenis?: Lenis | null,
) {
  useEffect(() => {
    let raf = 0
    let fullHeight = 0

    const measureFullHeight = () => {
      const header = headerRef.current
      if (!header) return
      fullHeight = header.getBoundingClientRect().height
    }

    const update = () => {
      raf = 0
      const header = headerRef.current
      if (!header) return

      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = Math.max(0, Math.min(window.scrollY, max))
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

      header.style.removeProperty('--header-compact')
      header.style.transform = ''
      header.toggleAttribute('data-scrolled', !overHero)
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const onResize = () => {
      measureFullHeight()
      onScroll()
    }

    measureFullHeight()
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    lenis?.on('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      lenis?.off('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [headerRef, lenis])
}
