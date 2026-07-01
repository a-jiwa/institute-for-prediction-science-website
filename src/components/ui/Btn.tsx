import { SmartLink } from './SmartLink'

const ARROW = (
  <svg width="7" height="9" viewBox="0 0 7 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M0.000156283 8.60806L4.22416 4.33606V4.24006L0.000156283 6.10352e-05H1.80816L6.06416 4.28806L1.80816 8.60806H0.000156283Z"
      fill="#102B23"
    />
  </svg>
)

const ARROW_HOVER = (
  <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M0.601719 8.85794L4.82572 4.58594V4.48994L0.601719 0.249939H2.40972L6.66572 4.53794L2.40972 8.85794H0.601719Z"
      fill="#102B23"
    />
  </svg>
)

const ARROW_ORANGE = (
  <svg width="7" height="9" viewBox="0 0 7 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M0 8.608L4.224 4.336V4.24L0 0H1.808L6.064 4.288L1.808 8.608H0Z" fill="#E96B26" />
  </svg>
)

const ARROW_ORANGE_HOVER = (
  <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M0.601719 8.85794L4.82572 4.58594V4.48994L0.601719 0.249939H2.40972L6.66572 4.53794L2.40972 8.85794H0.601719Z"
      fill="#E96B26"
    />
  </svg>
)

type BtnProps = {
  href: string
  children: React.ReactNode
  orange?: boolean
  external?: boolean
  className?: string
}

export function Btn({ href, children, orange = false, external, className = '' }: BtnProps) {
  const classes = `btn${orange ? ' orange' : ''}${className ? ` ${className}` : ''}`

  if (external || href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
        {orange ? ARROW_ORANGE : ARROW}
        {orange ? ARROW_ORANGE_HOVER : ARROW_HOVER}
      </a>
    )
  }

  return (
    <SmartLink href={href} className={classes}>
      {children}
      {orange ? ARROW_ORANGE : ARROW}
      {orange ? ARROW_ORANGE_HOVER : ARROW_HOVER}
    </SmartLink>
  )
}
