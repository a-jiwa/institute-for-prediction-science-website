import { BLOG_URL, LINKEDIN_URL, X_URL } from '../components/icons/Logo'

export type NavLink = {
  label: string
  href: string
  external?: boolean
}

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  // { label: 'Research', href: '/research' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  // { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: BLOG_URL, external: true },
]

/** Pages listed in the footer, including the legal links. */
export const footerPageLinks: NavLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: BLOG_URL, external: true },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/privacy-policy#cookies' },
]

/** How to reach the institute. Shown after the pages. */
export const footerReachLinks: NavLink[] = []

export const footerNavLinks: NavLink[] = [...footerPageLinks, ...footerReachLinks]

export const footerLinks: NavLink[] = [
  { label: 'Contact', href: '/about#contact-us' },
  { label: 'LinkedIn', href: LINKEDIN_URL, external: true },
  { label: 'X (Twitter)', href: X_URL, external: true },
]

export const legalLinks: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/privacy-policy#cookies' },
]
