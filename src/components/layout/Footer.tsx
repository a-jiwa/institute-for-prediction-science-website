import { useLocation } from 'react-router-dom'
import { footerNavLinks, legalLinks } from '../../data/navigation'
import { SmartLink } from '../ui/SmartLink'
import { BLOG_SUBSCRIBE_URL, CONTACT_EMAIL, Logo, SITE_NAME } from '../icons/Logo'
import { assetUrl } from '../../utils/assetUrl'

function FooterIcon() {
  return <Logo variant="white" />
}

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
                href={BLOG_SUBSCRIBE_URL}
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
                {footerNavLinks.map((link) => (
                  <li key={link.href}>
                    <FooterNavLink {...link} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden-md">
              <div className="grid">
                {[footerNavLinks.slice(0, 3), footerNavLinks.slice(3)].map((column) => (
                  <ul className="menu" key={column[0]?.href}>
                    {column.map((link) => (
                      <li key={link.href}>
                        <FooterNavLink {...link} />
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="col-12-sm">
            <div className="copy">
            <div className="footer-meta">
              <div className="logo">
                <FooterIcon />
              </div>
              <div className="text">© 2026 {SITE_NAME}</div>
              <ul className="footer-links">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <SmartLink href={link.href}>{link.label}</SmartLink>
                  </li>
                ))}
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </li>
              </ul>
            </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
