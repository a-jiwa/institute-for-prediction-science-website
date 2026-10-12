import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { toRouterPath } from '../../utils/assetUrl'

export function Layout() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()

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

      event.preventDefault()
      document.body.classList.add('animate-out')
      window.setTimeout(() => {
        navigate(routerPath)
      }, 250)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [navigate, pathname])

  useEffect(() => {
    document.body.classList.remove('animate-out')
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="wrapper min-h-[100lvh] w-full bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
