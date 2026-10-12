import { SmartLink } from './SmartLink'

const ARROW = (
  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden>
    <path d="M0 4.15h11.2V1.15L18 5l-6.8 3.85V5.85H0V4.15Z" fill="currentColor" />
  </svg>
)

type BtnProps = {
  href?: string
  children: React.ReactNode
  orange?: boolean
  external?: boolean
  className?: string
  /** Visual only. Use when a parent link already owns the click. */
  decorative?: boolean
}

export function Btn({ href = '', children, orange = false, external, className = '', decorative = false }: BtnProps) {
  const classes = `btn${orange ? ' orange' : ''}${className ? ` ${className}` : ''}`
  const arrows = ARROW

  if (decorative) {
    return (
      <span className={classes}>
        {children}
        {arrows}
      </span>
    )
  }

  if (external || href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
        {arrows}
      </a>
    )
  }

  return (
    <SmartLink href={href} className={classes}>
      {children}
      {arrows}
    </SmartLink>
  )
}
