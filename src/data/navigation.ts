import { BLOG_URL } from '../components/icons/Logo'

export type NavLink = {
  label: string
  href: string
  external?: boolean
}

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Research', href: '/services/lab' },
  { label: 'Blog', href: BLOG_URL, external: true },
]

/** First column of footer links. */
export const footerPageLinks: NavLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Research', href: '/services/lab' },
  { label: 'Blog', href: BLOG_URL, external: true },
]

/** Second column of footer links. */
export const footerReachLinks: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
]

export const footerNavLinks: NavLink[] = [...footerPageLinks, ...footerReachLinks]
