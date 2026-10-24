import { SmartLink } from '../ui/SmartLink'
import { assetUrl } from '../../utils/assetUrl'
import { KA_STEPS } from './defaults'
import { LabsBalanceScene } from './LabsBalanceScene'
import { LabsFrameShapes } from './LabsFrameShapes'
import { LabsHexScene } from './LabsHexScene'
import { LABS_SHAPE_COLORS_WARM } from './labsBlend'
import { LabsHeroShapes } from './LabsHeroShapes'
import { Placeholder } from './Placeholder'

type ArtLayer = {
  src: string
  role: string
}

type Step = {
  kicker: string
  title: string
  body: string | readonly string[]
  bullets: string[]
  imageFirst: boolean
  src?: string
  scheme?: 'blue' | 'green' | 'red'
  tone?: string
  /** Labs media art instead of PNG layers. */
  art?: 'labs-frame' | 'balance' | 'hex'
  layers?: ArtLayer[]
  cta?: { label: string; href: string }
}

type KaStepsProps = {
  kicker?: string
  title?: string
  items?: Step[]
  /** Floating Labs shapes behind the step copy (intersection blend). */
  shapes?: boolean
}

function StepMedia({ step }: { step: Step }) {
  if (step.art === 'labs-frame') {
    return (
      <div className="ka-step__media ka-step__media--frame" data-scheme={step.scheme}>
        <LabsFrameShapes className="ka-step__frame" />
      </div>
    )
  }

  if (step.art === 'balance') {
    return (
      <div className="ka-step__media ka-step__media--balance" data-scheme={step.scheme}>
        <LabsBalanceScene className="ka-step__balance" />
      </div>
    )
  }

  if (step.art === 'hex') {
    return (
      <div className="ka-step__media ka-step__media--hex" data-scheme={step.scheme}>
        <LabsHexScene className="ka-step__hex" />
      </div>
    )
  }

  if (step.layers?.length && step.scheme) {
    return (
      <div
        className="ka-step__media"
        data-scheme={step.scheme}
        style={step.tone ? { background: step.tone } : undefined}
      >
        <span className="ka-step__art">
          {step.layers.map((layer) => (
            <img alt="" className={layer.role} key={layer.src} src={assetUrl(layer.src)} />
          ))}
        </span>
      </div>
    )
  }

  return <Placeholder frame="shot" label="Image" src={step.src ?? ''} />
}

/** Dual label: base ink + wash ink clipped to the Labs yellow circle. */
function WashType({
  as: Tag,
  className,
  text,
}: {
  as: 'p' | 'h3'
  className?: string
  text: string
}) {
  return (
    <Tag className={['ka-wash-type', className].filter(Boolean).join(' ')}>
      <span className="ka-wash-type__base">{text}</span>
      <span aria-hidden="true" className="ka-wash-type__wash">
        {text}
      </span>
    </Tag>
  )
}

export function KaSteps({
  kicker = KA_STEPS.kicker,
  title = KA_STEPS.title,
  items = KA_STEPS.items,
  shapes = false,
}: KaStepsProps) {
  const showHead = Boolean(kicker || title)

  return (
    <section className={`ka-steps${shapes ? ' ka-steps--shapes' : ''}`}>
      {shapes ? (
        <LabsHeroShapes
          className="ka-steps__shapes"
          colors={LABS_SHAPE_COLORS_WARM}
          only={['hexagon', 'square']}
        />
      ) : null}
      <div className="ka-contain">
        {showHead ? (
          <div className="ka-steps__head">
            {kicker ? <p className="ka-kicker">{kicker}</p> : null}
            {title ? <h2>{title}</h2> : null}
          </div>
        ) : null}
        {items.map((step) => (
          <div
            className="ka-split ka-step"
            data-scheme={step.scheme}
            key={step.title}
            style={step.tone ? ({ '--ka-step-tone': step.tone } as React.CSSProperties) : undefined}
          >
            {step.imageFirst ? <StepMedia step={step} /> : null}
            <div className="ka-step__copy">
              <WashType as="p" className="ka-kicker" text={step.kicker} />
              <WashType as="h3" text={step.title} />
              {(typeof step.body === 'string' ? [step.body] : step.body).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {step.cta ? (
                <SmartLink className="ka-btn" href={step.cta.href}>
                  {step.cta.label}
                </SmartLink>
              ) : null}
            </div>
            {!step.imageFirst ? <StepMedia step={step} /> : null}
          </div>
        ))}
      </div>
    </section>
  )
}
