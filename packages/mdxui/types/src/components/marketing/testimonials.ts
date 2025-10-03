import type { BaseComponentProps, MediaProps, SpacingProps, ColorProps, BackgroundProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Individual testimonial
 */
export interface Testimonial {
  /** Testimonial quote/content */
  quote: string
  /** Author name */
  author: string
  /** Author title/role */
  authorTitle?: string
  /** Author company */
  authorCompany?: string
  /** Author avatar */
  avatar?: MediaProps
  /** Rating (1-5 stars) */
  rating?: number
}

/**
 * Testimonials section component props
 */
export interface TestimonialsSectionProps extends BaseComponentProps, SpacingProps, ColorProps, BackgroundProps {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** List of testimonials */
  testimonials?: Testimonial[]
  /** Layout variant */
  layout?: 'grid' | 'carousel' | 'wall' | 'single'
  /** Number of columns (for grid layout) */
  columns?: 2 | 3 | 4
  /** Show ratings */
  showRatings?: boolean
  /** Show avatars */
  showAvatars?: boolean
}

/**
 * Testimonials section with dual API support
 */
export type TestimonialsProps = DualAPIProps<TestimonialsSectionProps>

/**
 * Individual FAQ item
 */
export interface FAQItem {
  /** Question text */
  question: string
  /** Answer text */
  answer: string
}

/**
 * FAQ section component props
 */
export interface FAQSectionProps extends BaseComponentProps, SpacingProps, ColorProps, BackgroundProps {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** List of FAQ items */
  items?: FAQItem[]
  /** Layout variant */
  layout?: 'accordion' | 'grid' | 'two-column'
  /** Default expanded state */
  defaultExpanded?: boolean
  /** Allow multiple items open */
  allowMultiple?: boolean
}

/**
 * FAQ section with dual API support
 */
export type FAQProps = DualAPIProps<FAQSectionProps>
