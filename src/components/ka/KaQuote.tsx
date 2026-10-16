import { assetUrl } from '../../utils/assetUrl'
import { KA_QUOTE } from './defaults'

type Author = {
  name: string
  role: string
  org: string
  image: string
}

type KaQuoteProps = {
  title?: string
  quote?: string
  author?: Author
}

export function KaQuote({
  title = KA_QUOTE.title,
  quote = KA_QUOTE.quote,
  author = KA_QUOTE.author,
}: KaQuoteProps) {
  return (
    <section className="ka-quote">
      <div className="ka-contain">
        <h2>{title}</h2>
        <blockquote>
          <p>{quote}</p>
          <div className="ka-quote__author">
            <img alt="" src={assetUrl(author.image)} />
            <div>
              <strong>{author.name}</strong>
              <span>{author.role}</span>
              <span>{author.org}</span>
            </div>
          </div>
        </blockquote>
      </div>
    </section>
  )
}
