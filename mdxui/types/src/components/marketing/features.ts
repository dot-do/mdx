import type { BaseComponentProps, MediaProps, SpacingProps, ColorProps, BackgroundProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Individual feature item
 */
export interface Feature {
  /** Feature title */
  title: string
  /** Feature description */
  description: string
  /** Icon name or component */
  icon?: string | React.ComponentType
  /** Feature image */
  image?: MediaProps
  /** Link to learn more */
  href?: string
}

/**
 * Features section component props
 */
export interface FeaturesSectionProps extends BaseComponentProps, SpacingProps, ColorProps, BackgroundProps {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** List of features */
  features?: Feature[]
  /** Layout variant */
  layout?: 'grid' | 'list' | 'alternating' | 'bento'
  /** Number of columns (for grid layout) */
  columns?: 2 | 3 | 4
  /** Whether to show icons */
  showIcons?: boolean
  /** Icon style */
  iconStyle?: 'outlined' | 'filled' | 'duotone'
}

/**
 * Features section with dual API support
 * Usage:
 *   <Features features={[...]} />
 * OR:
 *   <Features>
 *     ## Our Key Features
 *
 *     ### Fast Performance
 *     Lightning-fast load times
 *
 *     ### Easy to Use
 *     Intuitive interface
 *   </Features>
 */
export type FeaturesProps = DualAPIProps<FeaturesSectionProps>
