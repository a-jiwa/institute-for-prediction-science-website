import { KA_FEATURE_CARDS } from './defaults'
import { Placeholder } from './Placeholder'

type Card = {
  title: string
  body: string
  src: string
  cta: { label: string; href: string }
}

type KaFeatureCardsProps = {
  title?: string
  body?: string
  cards?: Card[]
}

export function KaFeatureCards({
  title = KA_FEATURE_CARDS.title,
  body = KA_FEATURE_CARDS.body,
  cards = KA_FEATURE_CARDS.cards,
}: KaFeatureCardsProps) {
  return (
    <section className="ka-band">
      <div className="ka-contain">
        <div className="ka-band__intro">
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <div className="ka-cards">
          {cards.map((card) => (
            <article key={card.title}>
              <Placeholder frame="cover" label="Image" src={card.src} />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <a className="ka-btn" href={card.cta.href}>
                {card.cta.label}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
