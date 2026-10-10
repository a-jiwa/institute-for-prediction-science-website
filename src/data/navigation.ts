import { BLOG_URL, LINKEDIN_URL, X_URL } from '../components/icons/Logo'

export type NavLink = {
  label: string
  href: string
  external?: boolean
}

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Research', href: '/research' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: BLOG_URL, external: true },
]

export const footerLinks: NavLink[] = [
  { label: 'Contact', href: '/about#contact-us' },
  {
    label: 'LinkedIn',
    href: LINKEDIN_URL,
    external: true,
  },
  { label: 'X (Twitter)', href: X_URL, external: true },
]

export const legalLinks: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/privacy-policy#cookies' },
]
