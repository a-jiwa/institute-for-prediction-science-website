import { CAREERS_EMAIL } from '../icons/Logo'
import { formatMoney, type Job } from '../../data/jobs'

function applyMailto(job: Job) {
  const email = job.applicationContact?.email || CAREERS_EMAIL
  const subject = encodeURIComponent(job.title)
  return `mailto:${email}?subject=${subject}`
}

export function JobDetails({ job }: { job: Job }) {
  return (
    <div className="ps-careers__detail">
      <section>
        <h2>About the Institute</h2>
        <p>{job.aboutCompany}</p>
      </section>
      <section>
        <h2>What we are looking for</h2>
        <p>{job.rolePurpose}</p>
      </section>
      <section>
        <h2>Key responsibilities</h2>
        <ul>
          {job.keyResponsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Requirements</h2>
        <ul>
          <li>{job.requirements.experience}</li>
          {job.requirements.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
          <li>{job.requirements.qualifications}</li>
        </ul>
      </section>
      {job.desirable && job.desirable.length > 0 ? (
        <section>
          <h2>Desirable</h2>
          <ul>
            {job.desirable.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <h2>Benefits</h2>
        <p>
          {job.salary
            ? `We offer a salary of ${formatMoney(job.salary.currency, job.salary.min)} to ${formatMoney(job.salary.currency, job.salary.max)} per year, along with ${job.benefits.replace(/^We offer a competitive salary along with /i, '').replace(/\.$/, '')}.`
            : job.benefits}
        </p>
      </section>
      <section>
        <h2>Equal opportunities</h2>
        <p>{job.equalOpportunities}</p>
      </section>
      <section className="ps-careers__apply">
        <h2>How to apply</h2>
        <p>
          Send your CV and a covering letter to{' '}
          <a href={applyMailto(job)}>{job.applicationContact?.email || CAREERS_EMAIL}</a>. Include the job title in
          the subject line.
        </p>
      </section>
    </div>
  )
}
