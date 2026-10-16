import { KA_COURSES } from './defaults'

type CourseRow = {
  label: string
  columns: string[][]
}

type KaCoursesProps = {
  title?: string
  body?: string
  rows?: CourseRow[]
}

export function KaCourses({
  title = KA_COURSES.title,
  body = KA_COURSES.body,
  rows = KA_COURSES.rows,
}: KaCoursesProps) {
  return (
    <section className="ka-courses-wrap">
      <div className="ka-contain">
        <h2>{title}</h2>
        <p>{body}</p>
        {rows.map((row) => (
          <div className="ka-courses" key={row.label}>
            <p className="ka-courses__label">{row.label}</p>
            {row.columns.map((items) => (
              <ul key={items.join()}>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
