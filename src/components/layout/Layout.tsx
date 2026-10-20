import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { toneForPath, type PageTone } from '../../data/pageTones'
import { toRouterPath } from '../../utils/assetUrl'

function applyTone(tone: PageTone | null) {
  if (tone) document.documentElement.dataset.tone = tone
  else delete document.documentElement.dataset.tone
}

export function Layout() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    applyTone(toneForPath(pathname))
  }, [pathname])

  useEffect(() => {
    const isHeaderWhite = pathname.startsWith('/privacy-policy')
    document.body.classList.toggle('header-white', isHeaderWhite)
    return () => {
      document.body.classList.remove('header-white')
    }
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
    if (hash) {
      const scrollToHash = () => {
        const el = document.querySelector(hash)
        if (!el) return false
        el.scrollIntoView({ behavior: 'smooth' })
        return true
      }
      if (scrollToHash()) return
      const frame = requestAnimationFrame(() => {
        if (!scrollToHash()) window.scrollTo(0, 0)
      })
      return () => cancelAnimationFrame(frame)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

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
