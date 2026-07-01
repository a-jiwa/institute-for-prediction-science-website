import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { navLinks, footerLinks, featuredNavProject } from '../../data/navigation'
import { Logo, SITE_NAME } from '../icons/Logo'
import { useHeaderScroll } from '../../hooks/useHeaderScroll'
import { useLenis } from './CookieBanner'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isOff, isFixed, isScroll } = useHeaderScroll()
  const lenis = useLenis()
  const location = useLocation()
  const isHeaderWhite = location.pathname.startsWith('/privacy-policy')

  const isDarkHeader = !isHeaderWhite && !isFixed
  const logoVariant = isDarkHeader && !menuOpen ? 'white' : 'green'

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

  const headerClasses = [
    isOff && !isScroll && 'off',
    isFixed && 'fixed',
    isScroll && 'scroll',
    menuOpen && 'menu-open',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={headerClasses || undefined}>
      <div className="container">
        <div className="grid">
          <div className="col-10-xs col-4-sm">
            <Link to="/" className="logo" title={SITE_NAME} aria-label={SITE_NAME}>
              <Logo className="logo__svg" variant={logoVariant} />
            </Link>
          </div>

          <div className="col-2-xs col-8-sm">
            <button
              type="button"
              className="hamb"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            />

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

              <div className="projects">
                <Link to={featuredNavProject.href} onClick={() => setMenuOpen(false)}>
                  <div className="grid">
                    <div className="left">
                      <div className="thumb">
                        <img src={featuredNavProject.image} alt="" />
                      </div>
                    </div>
                    <div className="right">
                      <div className="f--subtitle">{featuredNavProject.type}</div>
                      <div className="title f--h3">{featuredNavProject.title}</div>
                    </div>
                  </div>
                </Link>
              </div>

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
