import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { applyPageMeta } from '../../data/pageMeta'
import { toneForPath, type PageTone } from '../../data/pageTones'
import { toRouterPath } from '../../utils/assetUrl'
import { useLenis } from './CookieBanner'
import type Lenis from 'lenis'

function applyTone(tone: PageTone | null) {
  if (tone) document.documentElement.dataset.tone = tone
  else delete document.documentElement.dataset.tone
}

function scrollToTop(lenis: Lenis | null) {
  lenis?.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

export function Layout() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const lenis = useLenis()
  const previousPath = useRef(pathname)

  useLayoutEffect(() => {
    applyTone(toneForPath(pathname))
    applyPageMeta(pathname)
  }, [pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null
      if (!target) return
      if (target.target === '_blank') return
      if (target.href.startsWith('mailto:') || target.href.startsWith('tel:')) return
      if (target.getAttribute('href')?.startsWith('#')) return
      const url = new URL(target.href)
      if (url.origin !== window.location.origin) return

      const routerPath = toRouterPath(url.pathname, url.search, url.hash)
      const routerPathname = routerPath.split('#')[0].split('?')[0]
      if (routerPathname === pathname && !url.hash) return

      // Capture phase so React Router <Link> sees defaultPrevented and does not
      // also push — otherwise Back needs two presses to leave the page.
      event.preventDefault()
      navigate(routerPath)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [navigate, pathname])

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  useLayoutEffect(() => {
    const pathChanged = previousPath.current !== pathname
    previousPath.current = pathname
    // Same-page hash links, such as the article contents, keep the browser jump.
    if (!pathChanged) return

    if (hash) {
      const el = document.querySelector(hash)
      if (el instanceof HTMLElement) {
        if (lenis) lenis.scrollTo(el, { immediate: true, force: true, offset: -24 })
        else el.scrollIntoView({ behavior: 'auto', block: 'start' })
        return
      }
    }

    scrollToTop(lenis)
    // The mobile menu restores the previous offset on the next frame, and
    // iOS can do the same when that fixed panel closes. Pin the top again
    // after those so a new page never opens mid-scroll.
    let second = 0
    const first = requestAnimationFrame(() => {
      scrollToTop(lenis)
      second = requestAnimationFrame(() => scrollToTop(lenis))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [pathname, hash, lenis])

  return (
    <div className="wrapper min-h-[100lvh] w-full">
      <div className="tone-field" aria-hidden="true" />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
