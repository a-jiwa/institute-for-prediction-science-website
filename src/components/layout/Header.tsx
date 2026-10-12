import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { navLinks } from '../../data/navigation'
import { Logo, WORDMARK_NAME } from '../icons/Logo'
import { useHeaderScroll } from '../../hooks/useHeaderScroll'
import { useLenis } from './CookieBanner'

export function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const menuWasOpen = useRef(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPresent, setMenuPresent] = useState(false)
  const [menuShown, setMenuShown] = useState(false)
  const lenis = useLenis()
  useHeaderScroll(headerRef, lenis)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (menuOpen) {
      setMenuPresent(true)
      setMenuShown(true)
      return
    }
    setMenuShown(false)
  }, [menuOpen])

  useEffect(() => {
    if (menuOpen || !menuPresent) return
    const nav = headerRef.current?.querySelector('nav')
    if (!nav) {
      setMenuPresent(false)
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      setMenuPresent(false)
    }
    const onEnd = (event: Event) => {
      const transition = event as TransitionEvent
      if (transition.target !== nav || transition.propertyName !== 'opacity') return
      finish()
    }
    nav.addEventListener('transitionend', onEnd)
    const timer = window.setTimeout(finish, reduce ? 0 : 500)
    return () => {
      nav.removeEventListener('transitionend', onEnd)
      window.clearTimeout(timer)
    }
  }, [menuOpen, menuPresent])

  useEffect(() => {
    if (!menuPresent) return
    const block = (event: TouchEvent) => {
      const nav = headerRef.current?.querySelector('nav')
      if (nav?.contains(event.target as Node)) return
      event.preventDefault()
    }
    document.addEventListener('touchmove', block, { passive: false })
    return () => document.removeEventListener('touchmove', block)
  }, [menuPresent])

  useEffect(() => {
    if (!lenis) return
    if (menuPresent) lenis.stop()
    else lenis.start()
  }, [menuPresent, lenis])

  useEffect(() => {
    if (menuOpen) {
      menuWasOpen.current = true
      return
    }
    if (!menuWasOpen.current) return
    const y = window.scrollY
    requestAnimationFrame(() => {
      window.scrollTo(0, y + 1)
      window.scrollTo(0, y)
    })
  }, [menuOpen])

  return (
    <header ref={headerRef} className={menuOpen ? 'menu-open' : undefined}>
      <div className="container">
        <div className="grid">
          <div className="col-10-xs col-4-sm">
            <Link to="/" className="logo" title={WORDMARK_NAME} aria-label={WORDMARK_NAME}>
              <Logo className="logo__svg" variant="white" animateChars />
            </Link>
          </div>

          <div className="col-2-xs col-8-sm">
            <button
              type="button"
              className="hamb"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg className="hamb__icon" viewBox="0 0 22 18" width="22" height="18" aria-hidden="true">
                <rect className="hamb__bar hamb__bar--top" x="0" y="8" width="22" height="2" rx="0" />
                <rect className="hamb__bar hamb__bar--middle" x="0" y="8" width="22" height="2" rx="0" />
                <rect className="hamb__bar hamb__bar--bottom" x="0" y="8" width="22" height="2" rx="0" />
              </svg>
            </button>

            <nav className={menuPresent ? (menuShown ? 'present shown' : 'present') : undefined}>
              <ul className="grid hend-sm">
                {navLinks.map((link) => (
                  <NavItem
                    key={link.href}
                    link={link}
                    location={location}
                    onNavigate={() => setMenuOpen(false)}
                  />
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavItem({
  link,
  location,
  onNavigate,
}: {
  link: (typeof navLinks)[number]
  location: ReturnType<typeof useLocation>
  onNavigate?: () => void
}) {
  const active =
    !link.external &&
    (link.href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(link.href.split('#')[0]))

  if (link.external) {
    return (
      <li>
        <a
          href={link.href}
          className={active ? 'active' : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
        >
          {link.label}
        </a>
      </li>
    )
  }

  return (
    <li>
      <Link to={link.href} className={active ? 'active' : undefined} onClick={onNavigate}>
        {link.label}
      </Link>
    </li>
  )
}
