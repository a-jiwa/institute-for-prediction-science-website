import { assetUrl } from '../../utils/assetUrl'

export type MediaFrame = 'screen' | 'cover' | 'square' | 'shot' | 'bleed' | 'avatar'

type PlaceholderProps = {
  label: string
  ratio?: string
  src?: string
  frame?: MediaFrame
  tone?: string
}

export function Placeholder({ label, ratio = '16 / 9', src = '', frame, tone }: PlaceholderProps) {
  if (src) {
    return (
      <div
        className={`ps-ph ps-ph--photo${frame ? ` ps-ph--${frame}` : ''}`}
        style={tone ? { background: tone } : undefined}
      >
        <img alt="" src={assetUrl(src)} />
      </div>
    )
  }

  return (
    <div className="ps-ph" style={{ aspectRatio: ratio }}>
      <span>{label}</span>
    </div>
  )
}
