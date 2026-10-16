import { useState } from 'react'
import { KA_ACCORDION } from './defaults'
import { Placeholder } from './Placeholder'

type AccordionItem = {
  title: string
  body: string
  src: string
  tone?: string
}

type KaAccordionProps = {
  title?: string
  items?: AccordionItem[]
  defaultOpen?: number
}

export function KaAccordion({
  title = KA_ACCORDION.title,
  items = KA_ACCORDION.items,
  defaultOpen = 0,
}: KaAccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const active = items[Math.max(open, 0)] ?? items[0]

  return (
    <section className="ka-band ka-band--split">
      <div className="ka-contain">
        <div className="ka-acc">
          <div className="ka-acc__copy">
            <h2>{title}</h2>
            <div className="ka-acc__list">
              {items.map((item, index) => {
                const expanded = open === index
                return (
                  <div key={item.title}>
                    <button
                      aria-expanded={expanded}
                      onClick={() => setOpen(expanded ? -1 : index)}
                      type="button"
                    >
                      <span>{item.title}</span>
                      <svg aria-hidden="true" className="ka-acc__chevron" viewBox="0 0 66 70">
                        <path d="M17 2L50 35L17 68" />
                      </svg>
                    </button>
                    {expanded && <p>{item.body}</p>}
                  </div>
                )
              })}
            </div>
          </div>
          {active && (
            <Placeholder
              frame="square"
              label={`Image ${Math.max(open, 0) + 1}`}
              src={active.src}
              tone={active.tone}
            />
          )}
        </div>
      </div>
    </section>
  )
}
