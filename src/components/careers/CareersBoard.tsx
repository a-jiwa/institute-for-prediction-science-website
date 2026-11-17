import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CAREERS_EMAIL } from '../icons/Logo'
import { useLenis } from '../layout/CookieBanner'
import { JobDetails } from './JobDetails'
import {
  closingTone,
  experienceLevel,
  formatClosingDate,
  formatMoney,
  isoWeek,
  isJobActive,
  jobClosingDate,
  jobPath,
  jobs,
  uniqueSorted,
  type ExperienceLevel,
} from '../../data/jobs'

type Filters = {
  location: string
  department: string
  experienceLevel: '' | ExperienceLevel
}

const EMPTY_FILTERS: Filters = { location: '', department: '', experienceLevel: '' }

function headerOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--layout-scroll-offset')
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 72
}

export function CareersBoard() {
  const lenis = useLenis()
  const [expandedJob, setExpandedJob] = useState<number | null>(null)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const currentWeek = useMemo(() => isoWeek(new Date()), [])
  const activeJobs = useMemo(() => jobs.filter((job) => isJobActive(job, currentWeek)), [currentWeek])

  const filterOptions = useMemo(
    () => ({
      locations: uniqueSorted(jobs.map((job) => job.location)),
      departments: uniqueSorted(jobs.map((job) => job.department)),
      experienceLevels: uniqueSorted(jobs.map((job) => experienceLevel(job.title))) as ExperienceLevel[],
    }),
    [],
  )

  const opportunities = useMemo(() => {
    return activeJobs.filter((job) => {
      if (filters.location && job.location !== filters.location) return false
      if (filters.department && job.department !== filters.department) return false
      if (filters.experienceLevel && experienceLevel(job.title) !== filters.experienceLevel) return false
      return true
    })
  }, [activeJobs, filters])

  useEffect(() => {
    setExpandedJob(null)
  }, [filters])

  const filtersActive = Boolean(filters.location || filters.department || filters.experienceLevel)

  const toggleJob = (index: number) => {
    const opening = expandedJob !== index
    setExpandedJob(opening ? index : null)
    if (!opening) return
    window.setTimeout(() => {
      const node = document.getElementById(`job-${index}`)
      if (!node) return
      const offset = -headerOffset()
      if (lenis) lenis.scrollTo(node, { offset, force: true })
      else {
        const top = node.getBoundingClientRect().top + window.scrollY + offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <>
      <section className="ps-lab-index ps-careers__roles" aria-label="Open roles">
      <div className="ps-contain">
        <div className="ps-careers__filters">
          <div className="ps-careers__selects">
            <label>
              <span className="ps-careers__sr">Location</span>
              <select
                value={filters.location}
                onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
              >
                <option value="">All locations</option>
                {filterOptions.locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="ps-careers__sr">Department</span>
              <select
                value={filters.department}
                onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
              >
                <option value="">All departments</option>
                {filterOptions.departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="ps-careers__sr">Experience level</span>
              <select
                value={filters.experienceLevel}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    experienceLevel: event.target.value as Filters['experienceLevel'],
                  }))
                }
              >
                <option value="">All levels</option>
                {filterOptions.experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="ps-careers__filter-meta">
            {filtersActive ? (
              <button type="button" className="ps-careers__clear" onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear all
              </button>
            ) : null}
            <span>
              {opportunities.length} of {activeJobs.length} opportunities
            </span>
          </div>
        </div>

        <div className="ps-careers__list">
          {opportunities.length === 0 ? (
            <div className="ps-careers__empty">
              <h3>{filtersActive ? 'No matching roles' : 'No active opportunities'}</h3>
              <p>
                {filtersActive
                  ? 'Nothing open this week matches these filters.'
                  : 'There are currently no open positions for this week. New opportunities are posted through the year.'}
              </p>
              <p>
                Send a CV and a short note to <a href={`mailto:${CAREERS_EMAIL}`}>{CAREERS_EMAIL}</a> if you would like
                to be considered later.
              </p>
            </div>
          ) : (
            opportunities.map((job, index) => {
              const open = expandedJob === index
              const closing = formatClosingDate(jobClosingDate(job))
              const tone = closingTone(closing)
              return (
                <article key={job.id} id={`job-${index}`} className={open ? 'ps-careers__card is-open' : 'ps-careers__card'}>
                  <div className="ps-careers__heading">
                    <Link className="ps-careers__title" to={jobPath(job)}>
                      {job.title}
                    </Link>
                    <span className="ps-careers__meta">
                      <span>{job.type}</span>
                      <span className={`ps-careers__close ps-careers__close--${tone}`}>
                        {closing || 'No closing date'}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ps-careers__toggle"
                    aria-expanded={open}
                    onClick={() => toggleJob(index)}
                  >
                    <span className="ps-careers__facts">
                      <span>{job.location}</span>
                      <span>{job.department}</span>
                      <span>{job.remoteOptions}</span>
                      {job.salary ? (
                        <span className="ps-careers__salary">
                          {formatMoney(job.salary.currency, job.salary.min)} – {formatMoney(job.salary.currency, job.salary.max)}{' '}
                          per year
                        </span>
                      ) : null}
                    </span>
                    <span className="ps-careers__action">{open ? 'Hide details' : 'View details'}</span>
                  </button>

                  {open ? (
                    <>
                      <JobDetails job={job} />
                      <p className="ps-careers__permalink">
                        <Link to={jobPath(job)}>Open full role page</Link>
                      </p>
                    </>
                  ) : null}
                </article>
              )
            })
          )}
        </div>

      </div>
      </section>
    </>
  )
}
