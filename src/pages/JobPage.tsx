import { Link, useParams } from 'react-router-dom'
import { JobDetails } from '../components/careers/JobDetails'
import { JobPostingSchema } from '../components/careers/JobPostingSchema'
import { closingTone, findJob, formatClosingDate, isoWeek, isJobActive, jobClosingDate } from '../data/jobs'
import { NotFoundPage } from './NotFoundPage'
import './careers.css'

export function JobPage() {
  const { jobId = '' } = useParams()
  const job = findJob(jobId)
  if (!job) return <NotFoundPage />

  const open = isJobActive(job, isoWeek(new Date()))
  const closing = open ? formatClosingDate(jobClosingDate(job)) : 'Closed'
  const tone = closingTone(closing)

  return (
    <div className="ps ps-about-page ps-lab-page ps-careers ps-job">
      {open ? <JobPostingSchema job={job} /> : null}
      <section className="ps-about-hero ps-about-hero--with-lead">
        <div className="ps-about-hero__copy">
          <p className="ps-kicker">
            <Link to="/careers">Careers</Link>
          </p>
          <h1>{job.title}</h1>
          <p className="ps-about-hero__lead">
            <span>{job.type}</span>
            <span>{job.location}</span>
            <span>{job.department}</span>
            <span>{job.remoteOptions}</span>
            <span className={`ps-careers__close ps-careers__close--${tone}`}>{closing || 'No closing date'}</span>
          </p>
        </div>
      </section>
      {open ? (
        <section className="ps-lab-index ps-job__body">
          <div className="ps-contain">
            <JobDetails job={job} />
          </div>
        </section>
      ) : (
        <section className="ps-lab-index ps-job__body">
          <div className="ps-careers__empty">
            <h2>This role is closed</h2>
            <p>It is not open for applications this week. Open roles change through the year.</p>
            <p>
              <Link to="/careers">See current roles</Link>
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
