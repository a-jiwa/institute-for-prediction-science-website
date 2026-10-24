import { SmartLink } from '../ui/SmartLink'

export function CareersList({
  jobs,
}: {
  jobs: { href: string; title: string; tags: string[] }[]
}) {
  return (
    <section className="careers">
      <div className="container">
        <div className="grid">
          <div className="col-6-md">
            <h4 className="editorial-kicker">open positions</h4>
          </div>
          <div className="col-6-md">
            <div className="list">
              {jobs.map((job) => (
                <div key={job.href} className="item">
                  <SmartLink href={job.href} aria-label={job.title} />
                  <div className="title">{job.title}</div>
                  <ul className="tags">
                    {job.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <div className="apply">Apply</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PageHero({
  label,
  title,
  bg = 'text',
}: {
  label?: string
  title: string
  bg?: 'text' | 'research' | 'careers'
}) {
  return (
    <section className="main min">
      <div className="bg">
        <div className="parallax">
          <div className="svg" data-bg={bg} aria-hidden />
        </div>
      </div>
      <div className="bottom">
        <div className="container">
          <div className="max">
            {label && <h1 className="f--subtitle-500">{label}</h1>}
            <h2 className="f--h2">{title}</h2>
          </div>
        </div>
      </div>
    </section>
  )
}
