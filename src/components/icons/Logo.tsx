const LOGO_ICON_PATH =
  'M21.2415 11.0174C20.8179 11.6775 20.4418 12.3674 20.1306 13.0956C26.0526 13.2873 30.8119 18.0869 30.8119 23.9682C30.8119 26.8514 29.6664 29.4748 27.799 31.4253C28.5252 31.7234 29.286 31.9576 30.0684 32.1323C31.8969 29.8964 32.9948 27.0558 32.9948 23.9682C32.9948 17.2735 27.8422 11.7414 21.2415 11.0174ZM33.2153 0.00851931C25.3653 0.00851931 18.6306 4.77832 15.8296 11.5284C11.8786 12.7464 8.71447 15.7403 7.31825 19.5604C3.09934 20.31 0 23.9086 0 28.2057C0 33.0564 4.00278 37 8.92628 37C10.6726 37 12.3412 36.5102 13.7849 35.5861C15.5832 36.4889 17.6148 37 19.7718 37C21.9288 37 24.0383 36.4591 25.8668 35.5222C28.1275 36.4719 30.6087 37 33.2196 37C43.5723 37 51.9972 28.704 51.9972 18.5C51.9972 8.29604 43.5767 0 33.2196 0L33.2153 0.00851931ZM8.92628 34.8493C5.2088 34.8493 2.18726 31.8682 2.18726 28.21C2.18726 25.3183 4.046 22.8482 6.70443 21.9411C6.60069 22.6012 6.54017 23.2783 6.54017 23.9682C6.54017 28.1546 8.55885 31.8852 11.6798 34.2701C10.8239 34.6492 9.89023 34.8493 8.92628 34.8493ZM19.7675 34.8493C13.6769 34.8493 8.72311 29.9688 8.72311 23.9682C8.72311 19.6669 11.2735 15.949 14.9607 14.1859C14.6235 15.5742 14.4377 17.018 14.4377 18.5043C14.4377 25.1522 18.0168 30.9867 23.3726 34.2489C22.24 34.6364 21.0297 34.8493 19.7675 34.8493ZM33.2153 34.8493C24.0685 34.8493 16.6249 27.5158 16.6249 18.5043C16.6249 9.49275 24.0685 2.15919 33.2153 2.15919C42.362 2.15919 49.8056 9.49275 49.8056 18.5043C49.8056 27.5158 42.362 34.8493 33.2153 34.8493Z'

/** Matches forecastingresearch.org logo.svg metrics (Season Sans, outlined wordmark). */
export const LOGO_WIDTH = 161
const TEXT_X = 62.2851
const LINE1_Y = 12.95
const LINE2_Y = 32.6746
const FONT_SIZE = 16.6
const STROKE_WIDTH = 1.35
const FONT_FAMILY = "'Sans', Helvetica, Arial, sans-serif"

export const SITE_NAME = 'The Foresight Institute'

type LogoProps = {
  className?: string
  variant?: 'white' | 'green'
}

function LogoWordmark({ fill }: { fill: string }) {
  const textProps = {
    fill: 'none',
    stroke: fill,
    strokeWidth: STROKE_WIDTH,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE,
    letterSpacing: '0.01em',
  }

  return (
    <>
      <text x={TEXT_X} y={LINE1_Y} {...textProps}>
        The Foresight
      </text>
      <text x={TEXT_X} y={LINE2_Y} {...textProps}>
        Institute
      </text>
    </>
  )
}

export function Logo({ className = '', variant = 'green' }: LogoProps) {
  const fill = variant === 'white' ? '#ffffff' : '#102B23'

  return (
    <svg
      className={className}
      width={LOGO_WIDTH}
      height="37"
      viewBox={`0 0 ${LOGO_WIDTH} 37`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d={LOGO_ICON_PATH} fill={fill} />
      <LogoWordmark fill={fill} />
    </svg>
  )
}

export function LogoIcon({ className = '', fill = '#102B23' }: { className?: string; fill?: string }) {
  return (
    <svg
      className={className}
      width="42"
      height="30"
      viewBox="0 0 52 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d={LOGO_ICON_PATH} fill={fill} />
    </svg>
  )
}
