import { assetUrl } from '../../utils/assetUrl'
import { KA_SERVICES } from './defaults'
import { Placeholder } from './Placeholder'

type ServiceItem = {
  title: string
  body: string
  icon: string
}

type KaServicesProps = {
  title?: string
  body?: string
  cta?: { label: string; href: string }
  image?: string
  items?: ServiceItem[]
}

export function KaServices({
  title = KA_SERVICES.title,
  body = KA_SERVICES.body,
  cta = KA_SERVICES.cta,
  image = KA_SERVICES.image,
  items = KA_SERVICES.items,
}: KaServicesProps) {
  return (
    <section className="ka-services">
      <div className="ka-contain">
        <div className="ka-services__lead">
          <div>
            <h2>{title}</h2>
            <p>{body}</p>
            <a className="ka-btn" href={cta.href}>
              {cta.label}
            </a>
          </div>
          <Placeholder frame="cover" label="Image" src={image} />
        </div>
        <ul className="ka-services__grid">
          {items.map((item) => (
            <li key={item.title}>
              <span className="ka-service-icon">
                <img alt="" src={assetUrl(item.icon)} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
