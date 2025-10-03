import type { BaseComponentProps, MediaProps, ActionProps, BackgroundProps, SpacingProps, ColorProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Hero section component props
 * Supports both explicit props and MDX children with semantic extraction
 */
export interface HeroSectionProps extends BaseComponentProps, SpacingProps, ColorProps, BackgroundProps {
  /** Main headline text */
  headline?: string
  /** Supporting description/tagline */
  description?: string
  /** Primary call-to-action */
  primaryAction?: ActionProps
  /** Secondary call-to-action (optional) */
  secondaryAction?: ActionProps
  /** Hero media (image or video) */
  media?: MediaProps
  /** Media position */
  mediaPosition?: 'left' | 'right' | 'background' | 'center'
  /** Layout variant */
  layout?: 'centered' | 'split' | 'minimal' | 'full-screen'
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right'
  /** Maximum width for content */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

/**
 * Hero section with dual API support
 * Usage:
 *   <Hero headline="..." description="..." />
 * OR:
 *   <Hero>
 *     # Welcome to Our Platform
 *     The best solution for your needs
 *     ![Hero Image](...)
 *   </Hero>
 */
export type HeroProps = DualAPIProps<HeroSectionProps>
