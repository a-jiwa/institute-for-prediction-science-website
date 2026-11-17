import jobsData from './jobs.json'

export type ActivePeriod = {
  startWeek: number
  duration: number
}

export type Job = {
  id: string
  title: string
  location: string
  type: string
  department: string
  remoteOptions: string
  aboutCompany: string
  rolePurpose: string
  keyResponsibilities: string[]
  requirements: {
    experience: string
    skills: string[]
    qualifications: string
  }
  desirable?: string[]
  salary?: {
    currency: string
    min: number
    max: number
    period: string
  }
  benefits: string
  equalOpportunities: string
  activePeriods?: ActivePeriod[]
  applicationContact?: {
    email: string
  }
}

export type ExperienceLevel = 'Entry Level' | 'Senior Level' | 'Management' | 'Mid Level'

export const jobs: Job[] = jobsData

const CURRENCY: Record<string, { symbol: string; position: 'before' | 'after'; space: boolean }> = {
  GBP: { symbol: '£', position: 'before', space: false },
  USD: { symbol: '$', position: 'before', space: false },
  EUR: { symbol: '€', position: 'before', space: false },
  SGD: { symbol: 'S$', position: 'before', space: false },
  AED: { symbol: 'AED', position: 'before', space: true },
  CAD: { symbol: 'C$', position: 'before', space: false },
  AUD: { symbol: 'A$', position: 'before', space: false },
  JPY: { symbol: '¥', position: 'before', space: false },
  CHF: { symbol: 'CHF', position: 'before', space: true },
  TWD: { symbol: 'NT$', position: 'before', space: false },
  SEK: { symbol: 'kr', position: 'after', space: true },
  NOK: { symbol: 'kr', position: 'after', space: true },
  DKK: { symbol: 'kr', position: 'after', space: true },
}

export function formatMoney(currency: string, amount: number) {
  const info = CURRENCY[currency]
  const formatted = amount.toLocaleString()
  if (!info) return `${currency} ${formatted}`
  if (info.position === 'before') {
    return info.space ? `${info.symbol} ${formatted}` : `${info.symbol}${formatted}`
  }
  return info.space ? `${formatted} ${info.symbol}` : `${formatted}${info.symbol}`
}

/** Monday 00:00 UTC of an ISO week. Week 1 is the week containing 4 January. */
export function isoWeekMonday(year: number, week: number) {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = (jan4.getUTCDay() + 6) % 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + (week - 1) * 7)
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

/**
 * ISO week number (1–52/53). Jobs are scheduled against this.
 *
 * Cycling: each role lists `activePeriods` (startWeek + duration). A role
 * only appears when the current ISO week falls in one of those windows.
 * Windows are staggered so at most three roles are open in any week, with
 * start dates offset so closings are spread out (one often nearing its end
 * while others still have weeks left). Every four weeks the oldest drops
 * out and the next role in the roster opens, rotating through the catalogue.
 */
export function isoWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function periodIncludesWeek(period: ActivePeriod, currentWeek: number) {
  const endWeek = period.startWeek + period.duration - 1
  if (endWeek > 52) {
    if (currentWeek >= period.startWeek && currentWeek <= 52) return true
    return currentWeek >= 1 && currentWeek <= endWeek - 52
  }
  return currentWeek >= period.startWeek && currentWeek <= endWeek
}

export function isJobActive(job: Job, currentWeek: number) {
  if (!job.activePeriods || job.activePeriods.length === 0) return true
  return job.activePeriods.some((period) => periodIncludesWeek(period, currentWeek))
}

export function findJob(id: string) {
  return jobs.find((job) => job.id === id) ?? null
}

export function jobPath(job: Job) {
  return `/careers/${job.id}`
}

/** The window open on `now`, if any. */
export function currentActivePeriod(job: Job, now = new Date()) {
  if (!job.activePeriods || job.activePeriods.length === 0) return null
  const week = isoWeek(now)
  return job.activePeriods.find((period) => periodIncludesWeek(period, week)) ?? null
}

/** Monday the current window opened. Year follows the ISO week that contains `now`. */
export function jobPostedDate(job: Job, now = new Date()) {
  const period = currentActivePeriod(job, now)
  if (!period) return null
  const week = isoWeek(now)
  const endWeek = period.startWeek + period.duration - 1
  const spills = endWeek > 52
  const year = now.getFullYear() - (spills && week < period.startWeek ? 1 : 0)
  return isoWeekMonday(year, period.startWeek)
}

function londonOffsetMinutes(instant: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const asUtc = Date.UTC(
    Number(value.year),
    Number(value.month) - 1,
    Number(value.day),
    Number(value.hour),
    Number(value.minute),
    Number(value.second),
  )
  return Math.round((asUtc - instant.getTime()) / 60000)
}

/** 23:59:59 Europe/London on an ISO week’s Sunday, as an absolute instant. */
function londonEndOfIsoWeek(year: number, week: number) {
  const monday = isoWeekMonday(year, week)
  const sundayUtc = Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6, 23, 59, 59)
  const offset = londonOffsetMinutes(new Date(sundayUtc))
  return new Date(sundayUtc - offset * 60 * 1000)
}

/** End of the Sunday that closes the window open now. */
export function jobClosingDate(job: Job, now = new Date()) {
  const period = currentActivePeriod(job, now)
  if (!period) return null
  const week = isoWeek(now)
  const endWeek = period.startWeek + period.duration - 1
  const spills = endWeek > 52
  const year = now.getFullYear() + (spills && week >= period.startWeek ? 1 : 0)
  const weekNumber = spills ? endWeek - 52 : endWeek
  return londonEndOfIsoWeek(year, weekNumber)
}

/** ISO 8601 with a numeric offset, for Google’s `validThrough`. */
export function formatValidThrough(date: Date) {
  const offset = londonOffsetMinutes(date)
  const wall = new Date(date.getTime() + offset * 60 * 1000)
  const pad = (value: number) => String(value).padStart(2, '0')
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}T${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}:${pad(wall.getUTCSeconds())}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

export function formatIsoDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function formatClosingDate(date: Date | null, now = new Date()) {
  if (!date) return null
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'Closed'
  if (diffDays === 0) return 'Closes today'
  if (diffDays === 1) return 'Closes tomorrow'
  if (diffDays <= 7) return `Closes in ${diffDays} days`
  return `Closes ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' })}`
}

export function closingTone(label: string | null) {
  if (!label || label === 'No closing date') return 'muted'
  if (label === 'Closed') return 'closed'
  if (label.includes('today') || label.includes('tomorrow')) return 'soon'
  const days = label.match(/\d+/)
  if (label.includes('days') && days && Number(days[0]) <= 7) return 'soon'
  return 'muted'
}

export function experienceLevel(title: string): ExperienceLevel {
  const name = title.toLowerCase()
  if (name.includes('junior') || name.includes('assistant')) return 'Entry Level'
  if (name.includes('senior') || name.includes('lead') || name.includes('specialist')) return 'Senior Level'
  if (name.includes('manager') || name.includes('director')) return 'Management'
  return 'Mid Level'
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}
