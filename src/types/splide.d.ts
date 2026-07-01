declare module '@splidejs/react-splide' {
  import type { ComponentType, HTMLAttributes, Ref } from 'react'
  import type { Options, Splide as SplideCore } from '@splidejs/splide'

  export type SplideProps = HTMLAttributes<HTMLDivElement> & {
    options?: Options
    ref?: Ref<{ splide: SplideCore }>
    hasTrack?: boolean
    tag?: 'div' | 'section' | 'header' | 'footer' | 'nav'
    children?: React.ReactNode
  }

  export const Splide: ComponentType<SplideProps>
  export const SplideSlide: ComponentType<HTMLAttributes<HTMLLIElement> & { children?: React.ReactNode }>
}
