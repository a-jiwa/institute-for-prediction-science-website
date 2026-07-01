export type NavLink = {
  label: string
  href: string
  external?: boolean
}

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Research', href: '/research' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: 'https://forecastingresearch.substack.com/', external: true },
]

export const footerLinks: NavLink[] = [
  { label: 'Contact', href: '/about/#contact-us' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/forecasting-research-institute',
    external: true,
  },
  { label: 'X (Twitter)', href: 'https://x.com/Research_FRI', external: true },
]

export const legalLinks: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/privacy-policy#cookies' },
]

export const featuredNavProject = {
  href: '/research/economic-effects-of-ai',
  type: 'Featured Working paper',
  title: 'Forecasting the Economic Effects of AI',
  image:
    'https://forecastingresearch.org/wp-content/uploads/2025/09/FRI-illustration-library-1-350x264.jpg',
}
