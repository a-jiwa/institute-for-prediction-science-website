import { KA_STEPS } from './defaults'
import { Placeholder } from './Placeholder'

type Step = {
  kicker: string
  title: string
  body: string
  bullets: string[]
  imageFirst: boolean
  src: string
}

type KaStepsProps = {
  kicker?: string
  title?: string
  items?: Step[]
}

export function KaSteps({
  kicker = KA_STEPS.kicker,
  title = KA_STEPS.title,
  items = KA_STEPS.items,
}: KaStepsProps) {
  return (
    <section className="ka-steps">
      <div className="ka-contain">
        <div className="ka-steps__head">
          <p className="ka-kicker">{kicker}</p>
          <h2>{title}</h2>
        </div>
        {items.map((step) => (
          <div className="ka-split ka-step" key={step.title}>
            {step.imageFirst && <Placeholder frame="shot" label="Image" src={step.src} />}
            <div>
              <p className="ka-kicker">{step.kicker}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <ul>
                {step.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
            {!step.imageFirst && <Placeholder frame="shot" label="Image" src={step.src} />}
          </div>
        ))}
      </div>
    </section>
  )
}
