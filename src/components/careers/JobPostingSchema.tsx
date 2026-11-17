import {
  currentActivePeriod,
  formatIsoDate,
  formatValidThrough,
  jobClosingDate,
  jobPath,
  jobPostedDate,
  type Job,
} from '../../data/jobs'
import { SITE_NAME, SITE_URL } from '../../data/site'

const LONDON = {
  addressLocality: 'London',
  addressRegion: 'England',
  addressCountry: 'GB',
}

const OCCUPATION: Record<string, string> = {
  'research-assistant': '19-4061.00 Social Science Research Assistants',
  'student-research-assistant': '19-4061.00 Social Science Research Assistants',
  'research-scientist': '19-3099.00 Social Scientists and Related Workers, All Other',
  'competition-manager': '11-1021.00 General and Operations Managers',
  'product-manager': '15-1299.09 Information Technology Project Managers',
  'client-success-manager': '13-1199.00 Business Operations Specialists, All Other',
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function paragraph(text: string) {
  return `<p>${escapeHtml(text)}</p>`
}

function list(items: string[]) {
  if (items.length === 0) return ''
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}

function employmentType(job: Job) {
  const partTime = job.type.toLowerCase().includes('part')
  const contractor = /contractor/i.test(`${job.rolePurpose} ${job.requirements.experience}`)
  const temporary = /3-month|temporary/i.test(job.requirements.experience)
  const types = [
    partTime ? 'PART_TIME' : 'FULL_TIME',
    contractor ? 'CONTRACTOR' : null,
    temporary ? 'TEMPORARY' : null,
  ].filter((value): value is string => Boolean(value))
  return types.length === 1 ? types[0] : types
}

function hours(job: Job) {
  return job.type.toLowerCase().includes('part') ? 'Around 10 hours per week' : '40 hours per week'
}

function educationRequirements(job: Job) {
  if (job.id === 'student-research-assistant') return 'Studying for an undergraduate degree'
  if (job.id === 'research-scientist') return 'no requirements'
  return 'no requirements'
}

function experienceRequirements(job: Job) {
  if (job.id === 'research-scientist') {
    return {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: 36,
    }
  }
  if (job.id === 'research-assistant' || job.id === 'student-research-assistant') return 'no requirements'
  return job.requirements.experience
}

/** HTML description Google Jobs can read. Tags are limited to p, ul, li, and br. */
export function jobDescriptionHtml(job: Job) {
  const email = job.applicationContact?.email || 'careers@predictionscience.org'
  const education =
    job.id === 'student-research-assistant'
      ? 'Studying for an undergraduate degree.'
      : job.id === 'research-scientist'
        ? 'A postgraduate degree in a relevant field is preferred. A specific degree is not required.'
        : 'A specific degree is not required.'
  return [
    paragraph(job.aboutCompany),
    paragraph(job.rolePurpose),
    paragraph('Responsibilities'),
    list(job.keyResponsibilities),
    paragraph('Requirements'),
    list([job.requirements.experience, ...job.requirements.skills, job.requirements.qualifications]),
    job.desirable && job.desirable.length > 0 ? paragraph('Desirable') : '',
    job.desirable && job.desirable.length > 0 ? list(job.desirable) : '',
    paragraph(`Working hours: ${hours(job)}. ${job.remoteOptions}, ${job.location}.`),
    paragraph(`Education: ${education}`),
    paragraph(`Experience: ${job.requirements.experience}`),
    paragraph(job.benefits),
    paragraph(job.equalOpportunities),
    paragraph(
      `To apply, send a CV and a covering letter to ${email}. Include “${job.title}” in the subject line.`,
    ),
  ].join('')
}

export function jobPostingLd(job: Job, now = new Date()) {
  const posted = jobPostedDate(job, now)
  const closing = jobClosingDate(job, now)
  const email = job.applicationContact?.email || 'careers@predictionscience.org'
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: jobDescriptionHtml(job),
    identifier: {
      '@type': 'PropertyValue',
      name: SITE_NAME,
      value: job.id,
    },
    datePosted: posted ? formatIsoDate(posted) : formatIsoDate(now),
    employmentType: employmentType(job),
    hiringOrganization: {
      '@type': 'Organization',
      name: SITE_NAME,
      sameAs: SITE_URL,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon-96x96.png`,
      email,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...LONDON,
      },
    },
    url: `${SITE_URL}${jobPath(job)}`,
    directApply: true,
    industry: 'Scientific Research and Development',
    occupationalCategory: OCCUPATION[job.id] || '19-3099.00 Social Scientists and Related Workers, All Other',
    responsibilities: job.keyResponsibilities.join(' '),
    qualifications: [job.requirements.experience, job.requirements.qualifications, ...job.requirements.skills].join(' '),
    skills: job.requirements.skills.join(', '),
    educationRequirements: educationRequirements(job),
    experienceRequirements: experienceRequirements(job),
    jobBenefits: job.benefits,
    workHours: hours(job),
  }
  if (closing) schema.validThrough = formatValidThrough(closing)
  if (currentActivePeriod(job, now) == null) schema.validThrough = formatValidThrough(now)
  return schema
}

export function JobPostingSchema({ job }: { job: Job }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd(job)) }} />
  )
}
