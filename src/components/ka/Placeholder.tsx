import { assetUrl } from '../../utils/assetUrl'

export type KaFrame = 'screen' | 'cover' | 'square' | 'shot' | 'bleed' | 'avatar'

type PlaceholderProps = {
  label: string
  ratio?: string
  src?: string
  frame?: KaFrame
  tone?: string
}

export function Placeholder({ label, ratio = '16 / 9', src = '', frame, tone }: PlaceholderProps) {
  if (src) {
    return (
      <div
        className={`ka-ph ka-ph--photo${frame ? ` ka-ph--${frame}` : ''}`}
        style={tone ? { background: tone } : undefined}
      >
        <img alt="" src={assetUrl(src)} />
      </div>
    )
  }

  return (
    <div className="ka-ph" style={{ aspectRatio: ratio }}>
      <span>{label}</span>
    </div>
  )
}
