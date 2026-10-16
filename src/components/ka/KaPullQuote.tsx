import { assetUrl } from '../../utils/assetUrl'
import { KA_PULL_QUOTE } from './defaults'

type Author = {
  name: string
  role: string
  org: string
  image: string
}

type KaPullQuoteProps = {
  title?: string
  quote?: string
  author?: Author
}

export function KaPullQuote({
  title = KA_PULL_QUOTE.title,
  quote = KA_PULL_QUOTE.quote,
  author = KA_PULL_QUOTE.author,
}: KaPullQuoteProps) {
  return (
    <section className="ka-visible">
      <div className="ka-contain">
        <h2>{title}</h2>
        <blockquote className="ka-pull">
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
