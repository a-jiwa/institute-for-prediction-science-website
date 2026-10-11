import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { navLinks, footerLinks } from '../../data/navigation'
import { Logo, WORDMARK_NAME } from '../icons/Logo'
import { useHeaderScroll } from '../../hooks/useHeaderScroll'
import { useLenis } from './CookieBanner'

export function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const lenis = useLenis()
  useHeaderScroll(headerRef, lenis)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!lenis) return
    if (menuOpen) lenis.stop()
    else lenis.start()
  }, [menuOpen, lenis])

  return (
    <header ref={headerRef} className={menuOpen ? 'menu-open' : undefined}>
      <div className="container">
        <div className="grid">
          <div className="col-10-xs col-4-sm">
            <Link to="/" className="logo" title={WORDMARK_NAME} aria-label={WORDMARK_NAME}>
              <Logo className="logo__svg" variant="white" />
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
              <svg className="hamb__icon" viewBox="0 0 22 10" width="22" height="10" aria-hidden="true">
                <rect className="hamb__bar hamb__bar--top" x="0" y="0" width="22" height="2" rx="0" />
                <rect className="hamb__bar hamb__bar--bottom" x="0" y="8" width="22" height="2" rx="0" />
              </svg>
            </button>

            <nav className={menuOpen ? 'show' : ''}>
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

              <div className="links grid hspace-between-xs">
                {footerLinks.map((link) =>
                  link.external ? (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
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
