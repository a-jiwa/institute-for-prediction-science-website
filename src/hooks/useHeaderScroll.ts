import { useEffect, useState } from 'react'

export type HeaderScrollState = {
  isOff: boolean
  isFixed: boolean
  isScroll: boolean
}

export function useHeaderScroll() {
  const [state, setState] = useState<HeaderScrollState>({
    isOff: false,
    isFixed: false,
    isScroll: false,
  })

  useEffect(() => {
    const update = () => {
      const y = window.scrollY
      const vh = window.innerHeight

      setState({
        isOff: y > 100,
        isFixed: y > vh / 4,
        isScroll: y > vh / 3.8,
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return state
}
