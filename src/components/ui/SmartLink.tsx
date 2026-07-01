import { Link, type LinkProps } from 'react-router-dom'

type SmartLinkProps = Omit<LinkProps, 'to'> & {
  href: string
  children?: React.ReactNode
  className?: string
}

export function SmartLink({ href, children, className, ...props }: SmartLinkProps) {
  const overlay = !children

  if (href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} className={className} {...props}>
        {overlay ? null : children}
      </a>
    )
  }

  if (href.includes('#')) {
    return (
      <Link to={href} className={className} {...props}>
        {overlay ? null : children}
      </Link>
    )
  }

  return (
    <Link to={href} className={className} {...props}>
      {overlay ? null : children}
    </Link>
  )
}
