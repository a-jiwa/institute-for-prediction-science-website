import { SITE_NAME, SITE_URL } from './site.ts'

/** Homepage lead. Share text stays in step with the landing headline. */
export const HOME_OG_DESCRIPTION =
  'We study how people forecast uncertain events and build practical tools to improve real-world decisions.'

export const OG_IMAGE_ALT = `${SITE_NAME}. Advancing the science of prediction.`
export const OG_IMAGE_TYPE = 'image/jpeg'

/** Same card, one file per share ratio. First entry is the primary Open Graph image. */
export const OG_IMAGES = [
  { path: '/assets/img/og/default.jpg', width: 1200, height: 630 },
  { path: '/assets/img/og/wide.jpg', width: 1200, height: 600 },
  { path: '/assets/img/og/square.jpg', width: 1200, height: 1200 },
] as const

export const OG_IMAGE_PATH = OG_IMAGES[0].path
export const DEFAULT_OG_IMAGE = `${SITE_URL}${OG_IMAGE_PATH}`
export const OG_IMAGE_WIDTH = OG_IMAGES[0].width
export const OG_IMAGE_HEIGHT = OG_IMAGES[0].height
/** 2:1 card for X, which prefers that ratio. */
export const TWITTER_IMAGE = `${SITE_URL}${OG_IMAGES[1].path}`
export const OG_LOCALE = 'en_GB'
/** @PredictionSci */
export const TWITTER_SITE = '@PredictionSci'

export const SOCIAL_SHARE_SPEC = {
  imageWidth: OG_IMAGE_WIDTH,
  imageHeight: OG_IMAGE_HEIGHT,
  imageType: OG_IMAGE_TYPE,
  imageAlt: OG_IMAGE_ALT,
  locale: OG_LOCALE,
  twitterCard: 'summary_large_image' as const,
  twitterSite: TWITTER_SITE,
  siteName: SITE_NAME,
  homeOgDescription: HOME_OG_DESCRIPTION,
}

export type SocialShareMeta = {
  title: string
  description: string
  ogDescription: string
  url: string
  image: string
  imageAlt: string
  type: 'website' | 'article'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  robots: string
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

/** Static tags for the document head. Crawlers read these and do not run the app. */
export function shareBlock(share: SocialShareMeta) {
  const lines = [
    `<meta property="og:locale" content="${OG_LOCALE}" />`,
    `<meta property="og:title" content="${escapeAttr(share.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(share.ogDescription)}" />`,
  ]
  for (const image of OG_IMAGES) {
    const url = `${SITE_URL}${image.path}`
    lines.push(
      `<meta property="og:image" content="${url}" />`,
      `<meta property="og:image:secure_url" content="${url}" />`,
      `<meta property="og:image:type" content="${OG_IMAGE_TYPE}" />`,
      `<meta property="og:image:width" content="${image.width}" />`,
      `<meta property="og:image:height" content="${image.height}" />`,
      `<meta property="og:image:alt" content="${escapeAttr(share.imageAlt)}" />`,
    )
  }
  lines.push(
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    ...(share.url ? [`<meta property="og:url" content="${share.url}" />`] : []),
    `<meta property="og:type" content="${share.type}" />`,
  )
  if (share.type === 'article' && share.author) {
    lines.push(`<meta property="article:author" content="${escapeAttr(share.author)}" />`)
  }
  if (share.type === 'article' && share.publishedTime) {
    lines.push(`<meta property="article:published_time" content="${escapeAttr(share.publishedTime)}" />`)
  }
  if (share.type === 'article' && share.section) {
    lines.push(`<meta property="article:section" content="${escapeAttr(share.section)}" />`)
  }
  lines.push(
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="${TWITTER_SITE}" />`,
    `<meta name="twitter:title" content="${escapeAttr(share.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(share.ogDescription)}" />`,
    `<meta name="twitter:image" content="${TWITTER_IMAGE}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttr(share.imageAlt)}" />`,
  )
  if (share.author) lines.push(`<meta name="author" content="${escapeAttr(share.author)}" />`)
  return lines.join('\n    ')
}

export function homeShareHead() {
  return `<!--share-start-->\n    ${shareBlock({
    title: SITE_NAME,
    description: HOME_OG_DESCRIPTION,
    ogDescription: HOME_OG_DESCRIPTION,
    url: `${SITE_URL}/`,
    image: DEFAULT_OG_IMAGE,
    imageAlt: OG_IMAGE_ALT,
    type: 'website',
    robots: 'index, follow',
  })}\n    <!--share-end-->`
}

