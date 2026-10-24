import { SmartLink } from '../ui/SmartLink'
import { assetUrl } from '../../utils/assetUrl'
import { SERVICE_STEPS } from './defaults'
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

type ServiceStepsProps = {
  kicker?: string
  title?: string
  items?: Step[]
  /** Floating Labs shapes behind the step copy (intersection blend). */
  shapes?: boolean
}

function StepMedia({ step }: { step: Step }) {
  if (step.art === 'labs-frame') {
    return (
      <div className="ps-step__media ps-step__media--frame" data-scheme={step.scheme}>
        <LabsFrameShapes className="ps-step__frame" />
      </div>
    )
  }

  if (step.art === 'balance') {
    return (
      <div className="ps-step__media ps-step__media--balance" data-scheme={step.scheme}>
        <LabsBalanceScene className="ps-step__balance" />
      </div>
    )
  }

  if (step.art === 'hex') {
    return (
      <div className="ps-step__media ps-step__media--hex" data-scheme={step.scheme}>
        <LabsHexScene className="ps-step__hex" />
      </div>
    )
  }

  if (step.layers?.length && step.scheme) {
    return (
      <div
        className="ps-step__media"
        data-scheme={step.scheme}
        style={step.tone ? { background: step.tone } : undefined}
      >
        <span className="ps-step__art">
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
    <Tag className={['ps-wash-type', className].filter(Boolean).join(' ')}>
      <span className="ps-wash-type__base">{text}</span>
      <span aria-hidden="true" className="ps-wash-type__wash">
        {text}
      </span>
    </Tag>
  )
}

export function ServiceSteps({
  kicker = SERVICE_STEPS.kicker,
  title = SERVICE_STEPS.title,
  items = SERVICE_STEPS.items,
  shapes = false,
}: ServiceStepsProps) {
  const showHead = Boolean(kicker || title)

  return (
    <section className={`ps-steps${shapes ? ' ps-steps--shapes' : ''}`}>
      {shapes ? (
        <LabsHeroShapes
          className="ps-steps__shapes"
          colors={LABS_SHAPE_COLORS_WARM}
          only={['hexagon', 'square']}
        />
      ) : null}
      <div className="ps-contain">
        {showHead ? (
          <div className="ps-steps__head">
            {kicker ? <p className="ps-kicker">{kicker}</p> : null}
            {title ? <h2>{title}</h2> : null}
          </div>
        ) : null}
        {items.map((step) => (
          <div
            className="ps-split ps-step"
            data-scheme={step.scheme}
            key={step.title}
            style={step.tone ? ({ '--ps-step-tone': step.tone } as React.CSSProperties) : undefined}
          >
            {step.imageFirst ? <StepMedia step={step} /> : null}
            <div className="ps-step__copy">
              <WashType as="p" className="ps-kicker" text={step.kicker} />
              <WashType as="h3" text={step.title} />
              {(typeof step.body === 'string' ? [step.body] : step.body).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {step.cta ? (
                <SmartLink className="ps-btn" href={step.cta.href}>
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
