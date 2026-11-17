import { articleAuthors, authorByline, findResearch } from './research'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site'
import { DEFAULT_OG_IMAGE, SOCIAL_SHARE_SPEC, TWITTER_IMAGE, type SocialShareMeta } from './socialShare'

type PageMeta = {
  title?: string
  description: string
  /** Optional longer/punchier line for OG + Twitter (DMI pattern). */
  ogDescription?: string
  robots: string
  type?: 'website' | 'article'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  image?: string
}

const INDEXABLE = 'index, follow'
const HIDDEN = 'noindex, follow'

const PAGES: Record<string, Omit<PageMeta, 'robots'>> = {
  '/': {
    description: SITE_DESCRIPTION,
    ogDescription: SOCIAL_SHARE_SPEC.homeOgDescription,
    type: 'website',
  },
  '/about': {
    title: 'About',
    description: 'Our mission, team, and approach to advancing empirical forecasting and decision science.',
    type: 'website',
  },
  '/services/lab': {
    title: 'Research',
    description: 'Academic papers, experiments, and ongoing projects on measuring and improving prediction.',
    type: 'website',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect personal information on this website.',
    type: 'website',
  },
  '/cookie-policy': {
    title: 'Cookie Policy',
    description: 'Information about cookies and tracking on this site. We do not use cookies.',
    type: 'website',
  },
}

function normalize(pathname: string) {
  if (!pathname || pathname === '/') return '/'
  const path = pathname.split('?')[0].split('#')[0]
  return path.replace(/\/+$/, '') || '/'
}

function shortBlurb(text: string, max = 160) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const slice = clean.slice(0, max)
  const cut = slice.lastIndexOf(' ')
  return `${(cut > 60 ? slice.slice(0, cut) : slice).replace(/[.,;:]+$/, '')}…`
}

function hidden(title: string, description: string): PageMeta {
  return { title, description, robots: HIDDEN, type: 'website' }
}

export function metaForPath(pathname: string): PageMeta {
  const path = normalize(pathname)
  const known = PAGES[path]
  if (known) return { ...known, robots: INDEXABLE }

  if (path.startsWith('/research/')) {
    const slug = path.slice('/research/'.length)
    const item = slug && !slug.includes('/') ? findResearch(slug) : null
    if (!item) return hidden('Page not found', 'This page could not be found.')
    const description = item.excerpt
      ? shortBlurb(item.excerpt)
      : `A publication from ${SITE_NAME}.`
    const authors = articleAuthors(item)
    const published =
      item.date && item.date !== 'Ongoing' && !Number.isNaN(Date.parse(item.date))
        ? new Date(item.date).toISOString()
        : undefined
    return {
      title: item.title,
      description,
      ogDescription: description,
      robots: INDEXABLE,
      type: 'article',
      section: item.type || 'Research',
      author: authorByline(authors),
      publishedTime: published,
      image: DEFAULT_OG_IMAGE,
    }
  }

  return hidden('Page not found', 'This page could not be found.')
}

export function canonicalUrl(pathname: string) {
  const path = normalize(pathname)
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

export function socialShareForPath(pathname: string): SocialShareMeta {
  const meta = metaForPath(pathname)
  const url = canonicalUrl(pathname)
  const title = meta.title ? `${meta.title}` : SITE_NAME
  const ogDescription = meta.ogDescription || meta.description
  return {
    title,
    description: meta.description,
    ogDescription,
    url,
    image: meta.image || DEFAULT_OG_IMAGE,
    imageAlt: SOCIAL_SHARE_SPEC.imageAlt,
    type: meta.type || 'website',
    author: meta.author,
    publishedTime: meta.publishedTime,
    modifiedTime: meta.modifiedTime,
    section: meta.section,
    robots: meta.robots,
  }
}

function upsertNamedMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertPropertyMeta(property: string, content: string | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

export function applyPageMeta(pathname: string) {
  const share = socialShareForPath(pathname)
  const displayTitle = share.title === SITE_NAME ? SITE_NAME : `${share.title} — ${SITE_NAME}`

  document.title = displayTitle
  upsertNamedMeta('description', share.description)
  upsertNamedMeta('robots', share.robots)
  if (share.author) upsertNamedMeta('author', share.author)
  else document.head.querySelector('meta[name="author"]')?.remove()

  upsertCanonical(share.url)

  upsertPropertyMeta('og:locale', SOCIAL_SHARE_SPEC.locale)
  upsertPropertyMeta('og:title', share.title)
  upsertPropertyMeta('og:description', share.ogDescription)
  upsertPropertyMeta('og:image', share.image)
  upsertPropertyMeta('og:image:secure_url', share.image)
  upsertPropertyMeta('og:image:type', SOCIAL_SHARE_SPEC.imageType)
  upsertPropertyMeta('og:image:width', String(SOCIAL_SHARE_SPEC.imageWidth))
  upsertPropertyMeta('og:image:height', String(SOCIAL_SHARE_SPEC.imageHeight))
  upsertPropertyMeta('og:image:alt', share.imageAlt)
  upsertPropertyMeta('og:site_name', SITE_NAME)
  upsertPropertyMeta('og:url', share.url)
  upsertPropertyMeta('og:type', share.type)
  upsertPropertyMeta('article:author', share.type === 'article' ? share.author : undefined)
  upsertPropertyMeta('article:published_time', share.type === 'article' ? share.publishedTime : undefined)
  upsertPropertyMeta('article:modified_time', share.type === 'article' ? share.modifiedTime : undefined)
  upsertPropertyMeta('article:section', share.type === 'article' ? share.section : undefined)

  upsertNamedMeta('twitter:card', SOCIAL_SHARE_SPEC.twitterCard)
  upsertNamedMeta('twitter:site', SOCIAL_SHARE_SPEC.twitterSite)
  upsertNamedMeta('twitter:title', share.title)
  upsertNamedMeta('twitter:description', share.ogDescription)
  upsertNamedMeta('twitter:image', TWITTER_IMAGE)
  upsertNamedMeta('twitter:image:alt', share.imageAlt)
}
