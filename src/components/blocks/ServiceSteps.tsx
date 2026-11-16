import { SmartLink } from '../ui/SmartLink'
import { assetUrl } from '../../utils/assetUrl'
import { SERVICE_STEPS } from './defaults'
import { AssetLottie } from './AssetLottie'
import { LabsBalanceScene } from './LabsBalanceScene'
import { LabsFrameShapes } from './LabsFrameShapes'
import { LabsHexScene } from './LabsHexScene'
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
  art?: 'labs-frame' | 'balance' | 'hex' | 'lottie'
  lottieSrc?: string
  layers?: ArtLayer[]
  cta?: { label: string; href: string }
}

type ServiceStepsProps = {
  kicker?: string
  title?: string
  items?: Step[]
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

  if (step.art === 'lottie' && step.lottieSrc) {
    return (
      <div aria-hidden="true" className="ps-step__media ps-step__media--lottie" data-scheme={step.scheme}>
        <AssetLottie className="ps-step__lottie" src={assetUrl(step.lottieSrc)} />
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

export function ServiceSteps({
  kicker = SERVICE_STEPS.kicker,
  title = SERVICE_STEPS.title,
  items = SERVICE_STEPS.items,
}: ServiceStepsProps) {
  const showHead = Boolean(kicker || title)

  return (
    <section className="ps-steps">
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
              <p className="ps-kicker">{step.kicker}</p>
              <h3>{step.title}</h3>
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
