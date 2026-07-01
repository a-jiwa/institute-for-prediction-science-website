import { Btn } from '../ui/Btn'

type CtaSectionProps = {
  id?: string
  title: string
  children: React.ReactNode
  action?: { label: string; href: string }
}

export function CtaSection({ id, title, children, action }: CtaSectionProps) {
  return (
    <section className="cta" id={id}>
      <div className="container">
        <div className="grid hcenter-xs">
          <div className="col-8-md text-center">
            <h4>{title}</h4>
            <div className="text f--h2">{children}</div>
            {action && (
              <div className="cta">
                <Btn href={action.href} orange>
                  {action.label}
                </Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
