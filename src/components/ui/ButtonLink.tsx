import { Link } from 'react-router-dom'
import { ArrowIcon, ArrowIconHover } from '../icons/ArrowIcon'

type ButtonLinkProps = {
  to: string
  children: React.ReactNode
  variant?: 'default' | 'orange'
  external?: boolean
  className?: string
}

export function ButtonLink({
  to,
  children,
  variant = 'default',
  external,
  className = '',
}: ButtonLinkProps) {
  const classes = `btn inline-flex items-center font-mono text-sm uppercase tracking-wide ${variant === 'orange' ? 'text-orange' : ''} ${className}`

  const content = (
    <>
      {children}
      <ArrowIcon className="ml-2.5 group-hover:hidden" />
      <ArrowIconHover className="ml-3.5 hidden group-hover:block" />
    </>
  )

  if (external || to.startsWith('http') || to.startsWith('mailto:')) {
    return (
      <a href={to} className={`group ${classes}`} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return (
    <Link to={to} className={`group ${classes}`}>
      {content}
    </Link>
  )
}
