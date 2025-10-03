import type { ReactNode } from 'react'

/**
 * Base props that all components support
 */
export interface BaseComponentProps {
  /** Custom CSS class names */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
  /** Unique identifier */
  id?: string
  /** Accessibility label */
  'aria-label'?: string
  /** Data attributes for testing/tracking */
  [key: `data-${string}`]: string | number | boolean | undefined
}

/**
 * Props for components that can render MDX children
 */
export interface MDXChildrenProps {
  /** MDX/React children content */
  children?: ReactNode
}

/**
 * Common spacing/layout props
 */
export interface SpacingProps {
  /** Padding size (using Tailwind scale) */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Margin size (using Tailwind scale) */
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Gap between child elements */
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

/**
 * Common color/theme props
 */
export interface ColorProps {
  /** Color variant */
  colorVariant?: 'default' | 'primary' | 'secondary' | 'accent' | 'muted'
  /** Color scheme */
  colorScheme?: 'light' | 'dark' | 'auto'
}

/**
 * Common size props
 */
export interface SizeProps {
  /** Component size */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Media props for images/videos
 */
export interface MediaProps {
  /** Media URL */
  src?: string
  /** Alt text for accessibility */
  alt?: string
  /** Media type */
  type?: 'image' | 'video'
  /** Width (px or %) */
  width?: string | number
  /** Height (px or %) */
  height?: string | number
  /** Aspect ratio */
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2' | '21/9'
}

/**
 * Link/action props
 */
export interface LinkProps {
  /** URL href */
  href?: string
  /** Link target */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** Rel attribute for security */
  rel?: string
}

/**
 * Action button props
 */
export interface ActionProps extends LinkProps {
  /** Button/link text */
  text?: string
  /** Click handler */
  onClick?: () => void
  /** Disabled state */
  disabled?: boolean
}

/**
 * Background props (for MagicUI backgrounds)
 */
export interface BackgroundProps {
  /** Background type */
  backgroundType?: 'none' | 'warp' | 'particles' | 'grid' | 'shine' | 'aurora' | 'ripple' | 'waves' | 'dots' | 'meteors'
  /** Background configuration */
  backgroundConfig?: Record<string, any>
  /** Background opacity */
  backgroundOpacity?: number
  /** Reduce motion for accessibility */
  reduceMotion?: boolean
}
