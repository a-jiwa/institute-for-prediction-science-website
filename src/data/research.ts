import researchAll from './research-all.json'
import { SITE_NAME } from '../components/icons/Logo'

export type ResearchItem = {
  href: string
  external?: boolean
  type: string
  title: string
  image: string
  excerpt: string
  date: string
  size: string
}

export type ResearchAuthor = {
  name: string
  role: string
  bio?: string
}

export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

export type ArticleSection = {
  id: string
  heading: string
  blocks: ArticleBlock[]
}

export type ArticleContent = {
  lead: string
  intro: string[]
  sections: ArticleSection[]
  authors: ResearchAuthor[]
}

export const researchItems = researchAll as ResearchItem[]

/** Short DeepMind-style feed shown on /research. Full catalogue stays in researchItems. */
const FEED: Array<{
  slug: string
  title: string
  excerpt: string
  image: string
  authors?: string[]
}> = [
  {
    slug: 'inkling',
    title: 'Introducing the Institute for Predictive Sciences',
    excerpt:
      'We apply the science of forecasting to help people and organisations make better decisions under uncertainty.',
    image: '/assets/img/research/dmi-01.webp',
  },
  {
    slug: 'forecastbench-a-dynamic-benchmark-of-ai-forecasting-capabilities',
    title: 'ForecastBench: A Dynamic Benchmark of AI Forecasting Capabilities',
    excerpt:
      'A dynamic, contamination-free benchmark of LLM forecasting accuracy with human comparison baselines.',
    image: '/assets/img/research/dmi-02.webp',
  },
  {
    slug: 'longitudinal-expert-ai-panel-leap-working-paper',
    title:
      'The Longitudinal Expert AI Panel: Understanding Expert Views on AI Capabilities, Adoption, and Impact',
    excerpt:
      'LEAP tracks leading experts over three years on AI capabilities, adoption, and impact, summarising findings from the first waves.',
    image: '/assets/img/research/dmi-03.webp',
  },
  {
    slug: 'economic-effects-of-ai',
    title: 'Forecasting the Economic Effects of AI',
    excerpt:
      'We surveyed academic economists, AI experts, and superforecasters to produce comparable forecasts of AI’s economic effects.',
    image: '/assets/img/research/dmi-05.webp',
  },
  {
    slug: 'theyearahead',
    title: 'TheYearAhead: Annual Forecasting Challenge',
    excerpt:
      'Each January, participants predict 100 events across politics, economics, and world affairs — and are scored on accuracy.',
    image: '/assets/img/research/dmi-08.webp',
  },
]

function itemBySlug(slug: string) {
  return researchItems.find((item) => researchSlug(item.href) === slug) ?? null
}

export function researchFeed(): ResearchItem[] {
  return FEED.flatMap((entry) => {
    const base = itemBySlug(entry.slug)
    if (!base) return []
    const placeholder =
      /placeholder/i.test(entry.title) || /goes here/i.test(entry.excerpt)
    return [
      {
        ...base,
        title: placeholder ? base.title : entry.title,
        excerpt: placeholder ? base.excerpt : entry.excerpt,
        image: entry.image || base.image,
      },
    ]
  })
}

export function feedAuthors(item: ResearchItem): ResearchAuthor[] {
  const entry = FEED.find((row) => row.slug === researchSlug(item.href))
  if (!entry?.authors?.length) return articleAuthors(item)
  return entry.authors.map((name) => {
    const known = DEFAULT_AUTHORS.find((author) => author.name === name)
    return known ?? { name, role: SITE_NAME }
  })
}

const DEFAULT_AUTHORS: ResearchAuthor[] = [
  {
    name: 'Ezra Karger',
    role: 'Director of Research',
    bio: 'Ezra leads the institute’s research programme on forecasting, judgment, and the use of prediction in high-stakes decisions.',
  },
  {
    name: 'Philip Tetlock',
    role: 'President, Chief Scientist',
    bio: 'Philip’s work on forecasting tournaments and expert judgment underpins much of the institute’s approach to measuring and improving prediction.',
  },
  {
    name: 'Josh Rosenberg',
    role: 'CEO',
    bio: 'Josh oversees the institute’s strategy and partnerships, connecting research on prediction science to organisations and public audiences.',
  },
  {
    name: 'Bridget Williams',
    role: 'Associate Director of Research & Strategy',
    bio: 'Bridget works across research design, strategy, and applications of forecasting methods to organisational and policy questions.',
  },
  {
    name: 'Jessie Barker',
    role: 'Senior Researcher',
    bio: 'Jessie studies forecasting methods, tournament design, and how people update beliefs when faced with evidence and opposing views.',
  },
]

export function researchSlug(href: string) {
  return href.split('/').filter(Boolean).pop() ?? ''
}

export function findResearch(slug: string) {
  const base = researchItems.find((item) => !item.external && researchSlug(item.href) === slug)
  if (!base) return null
  const entry = FEED.find((row) => row.slug === slug)
  if (!entry) return base
  return {
    ...base,
    title: entry.title,
    excerpt: entry.excerpt,
    image: entry.image,
  }
}

function timestamp(date: string) {
  if (date === 'Ongoing') return Number.POSITIVE_INFINITY
  const value = Date.parse(date)
  return Number.isNaN(value) ? 0 : value
}

export function sortResearch(items: ResearchItem[]) {
  return [...items].sort((a, b) => timestamp(b.date) - timestamp(a.date))
}

function sentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function hashSlug(value: string) {
  let total = 0
  for (const char of value) total += char.charCodeAt(0)
  return total
}

export function articleAuthors(item: ResearchItem): ResearchAuthor[] {
  const slug = researchSlug(item.href)
  const start = hashSlug(slug) % DEFAULT_AUTHORS.length
  const count = item.type === 'Editorial' || item.type === 'Project' ? 1 : 2
  return Array.from({ length: count }, (_, index) => DEFAULT_AUTHORS[(start + index) % DEFAULT_AUTHORS.length])
}

export function authorByline(authors: ResearchAuthor[]) {
  if (authors.length === 0) return SITE_NAME
  if (authors.length === 1) return authors[0].name
  if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`
  return `${authors.slice(0, -1).map((author) => author.name).join(', ')}, and ${authors.at(-1)?.name}`
}

export function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function slugify(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const LOREM = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.',
  'Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse id sem consectetuer libero luctus adipiscing. Mauris tincidunt sem sed arcu. Nunc posuere. Nullam lectus justo, vulputate eget, mollis sed.',
  'Phasellus rhoncus. Aenean viverra rhoncus pede. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet.',
]

function lorem(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => LOREM[(start + index) % LOREM.length])
}

export function articleLead(item: ResearchItem) {
  const fromExcerpt = sentences(item.excerpt)[0]
  if (fromExcerpt && fromExcerpt.length > 40) return fromExcerpt
  return `${item.title} explores how forecasting can be measured, improved, and applied to decisions under uncertainty.`
}

export function articleContent(item: ResearchItem): ArticleContent {
  const authors = feedAuthors(item)
  const seed = hashSlug(researchSlug(item.href))
  const lead = articleLead(item)

  const intro = [
    ...lorem(seed, 2),
    item.excerpt && item.excerpt.length > 60
      ? item.excerpt
      : `${item.title} is ${item.type === 'Project' ? 'an ongoing project' : `a ${item.type.toLowerCase()}`} from ${SITE_NAME}. It forms part of a broader programme of competitions, training, and lab work on prediction.`,
  ]

  const sections: ArticleSection[] = [
    {
      id: 'overview',
      heading: 'Overview',
      blocks: [
        { type: 'p', text: lead },
        ...lorem(seed + 1, 3).map((text) => ({ type: 'p' as const, text })),
        {
          type: 'ul',
          items: [
            'Clear questions and scoring rules make predictions comparable over time.',
            'Tournaments and panels surface where experts and methods disagree.',
            'Applied tools carry those lessons into day-to-day decisions.',
            'Open reporting helps others reuse methods and check results.',
          ],
        },
      ],
    },
    {
      id: 'approach',
      heading: 'Approach',
      blocks: [
        ...lorem(seed + 2, 3).map((text) => ({ type: 'p' as const, text })),
        {
          type: 'p',
          text: 'The work combines structured elicitation, careful scoring, and iterative feedback. Participants make probabilistic forecasts, receive updates as evidence arrives, and review how their judgment performed against outcomes.',
        },
        ...lorem(seed + 3, 2).map((text) => ({ type: 'p' as const, text })),
      ],
    },
    {
      id: 'findings',
      heading: 'Findings',
      blocks: [
        ...lorem(seed + 4, 3).map((text) => ({ type: 'p' as const, text })),
        {
          type: 'ol',
          items: [
            'Measured forecasts reveal where people are overconfident or underconfident.',
            'Training and feedback can improve calibration when practice is repeated.',
            'Aggregating diverse judgments often outperforms any single expert view.',
            'Practical tools help organisations use forecasts without hiding uncertainty.',
          ],
        },
        ...lorem(seed + 5, 2).map((text) => ({ type: 'p' as const, text })),
      ],
    },
    {
      id: 'looking-ahead',
      heading: 'Looking ahead',
      blocks: [
        ...lorem(seed + 6, 3).map((text) => ({ type: 'p' as const, text })),
        {
          type: 'p',
          text:
            item.date === 'Ongoing'
              ? `This ${item.type.toLowerCase()} is ongoing work from ${SITE_NAME}. We continue to refine the methods, gather feedback, and share what we learn.`
              : `This ${item.type.toLowerCase()} was published on ${item.date}. Follow-on work will test the ideas in new settings and with new participants.`,
        },
        ...lorem(seed + 1, 2).map((text) => ({ type: 'p' as const, text })),
      ],
    },
  ]

  return { lead, intro, sections, authors }
}

export function articleSections(item: ResearchItem) {
  return articleContent(item).sections.map(({ id, heading }) => ({ id, heading }))
}

export function sectionIdFromHeading(heading: string) {
  return slugify(heading)
}
