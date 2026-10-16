import { assetUrl } from '../../utils/assetUrl'
import { KA_CHIPS } from './defaults'

type Chip = {
  label: string
  icon: string
  href?: string
}

type KaSubjectChipsProps = {
  title?: string
  subtitle?: string
  chips?: Chip[]
}

export function KaSubjectChips({
  title = 'Sets across every major subject area',
  subtitle = 'Built with our partners',
  chips = KA_CHIPS,
}: KaSubjectChipsProps) {
  return (
    <section className="ka-subjects">
      <div className="ka-contain">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <ul>
          {chips.map((chip) => (
            <li key={chip.label}>
              <a href={chip.href ?? '#ka-close'}>
                <img alt="" src={assetUrl(chip.icon)} />
                {chip.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
