import { useLocation } from 'react-router-dom'
import { navLinks, footerLinks, legalLinks } from '../../data/navigation'
import { SmartLink } from '../ui/SmartLink'
import { LogoIcon, SITE_NAME } from '../icons/Logo'
import { assetUrl } from '../../utils/assetUrl'

function FooterIcon() {
  return <LogoIcon fill="white" />
}

const allFooterNav = [...navLinks, ...footerLinks]
const mobileMenuPrimary = allFooterNav.slice(0, 4)
const mobileMenuSecondary = allFooterNav.slice(4)

function normalizePath(path: string) {
  if (!path || path === '/') return '/'
  return path.replace(/\/$/, '')
}

function isFooterLinkActive(href: string, pathname: string, hash: string) {
  if (href.startsWith('http') || href.startsWith('mailto:')) return false
  const [path, linkHash] = href.split('#')
  const normalizedPath = normalizePath(path)
  const normalizedPathname = normalizePath(pathname)
  if (linkHash) return normalizedPathname === normalizedPath && hash === `#${linkHash}`
  if (normalizedPath === '/') return normalizedPathname === '/'
  return normalizedPathname === normalizedPath || normalizedPathname.startsWith(`${normalizedPath}/`)
}

function FooterNavLink({
  href,
  label,
  external,
}: {
  href: string
  label: string
  external?: boolean
}) {
  const { pathname, hash } = useLocation()
  const active = isFooterLinkActive(href, pathname, hash)

  if (external || href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={active ? 'active' : undefined}>
        {label}
      </a>
    )
  }

  return (
    <SmartLink href={href} className={active ? 'active' : undefined}>
      {label}
    </SmartLink>
  )
}

export function Footer() {
  return (
    <footer>
      <img src={assetUrl('/assets/img/footer-mobile2.svg')} alt="" aria-hidden />
      <div className="container">
        <div className="grid vend-xs">
          <div className="col-5-md">
            <div className="f--subtitle">Our blog</div>
            <div className="f--h2">
              Sign up to our Substack to receive the latest research and updates direct to your
              mailbox
            </div>
            <div className="newsletter">
              <a
                href="https://forecastingresearch.substack.com/subscribe?utm_source=menu&simple=true&next=https%3A%2F%2Fforecastingresearch.substack.com%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                Subscribe
              </a>
            </div>
          </div>
          <div className="col-7-md">
            <div className="visible-md">
              <ul className="grid hspace-between-xs menu">
                {allFooterNav.map((link) => (
                  <li key={link.href}>
                    <FooterNavLink {...link} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden-md">
              <div className="grid">
                <ul className="menu">
                  {mobileMenuPrimary.map((link) => (
                    <li key={link.href}>
                      <FooterNavLink {...link} />
                    </li>
                  ))}
                </ul>
                <ul className="menu">
                  {mobileMenuSecondary.map((link) => (
                    <li key={link.href}>
                      <FooterNavLink {...link} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="col-12-sm">
            <div className="copy">
              <div className="grid">
                <div className="col-1-sm">
                  <div className="logo">
                    <FooterIcon />
                  </div>
                </div>
                <div className="col-5-md">
                  <div className="text">
                    You can view any relevant public access files electronically by emailing
                    info@forecastingresearch.org
                    <br />© 2026 {SITE_NAME}
                  </div>
                </div>
                <div className="col-3-md" />
                <div className="col-1-md col-5-xs">
                  <ul>
                    {legalLinks.map((link) => (
                      <li key={link.href}>
                        <SmartLink href={link.href}>{link.label}</SmartLink>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-2-md col-7-xs">
                  <ul>
                    <li>
                      <a href="mailto:info@forecastingresearch.org">info@forecastingresearch.org</a>
                    </li>
                    <li>
                      <a href="https://www.atc.studio/" target="_blank" rel="noopener noreferrer">
                        Designed by All Things Considered
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
