import type { BaseComponentProps, ActionProps, SpacingProps, ColorProps, BackgroundProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Individual pricing tier/plan
 */
export interface PricingTier {
  /** Plan name */
  name: string
  /** Plan description */
  description?: string
  /** Price amount */
  price: string | number
  /** Price period (e.g., "per month") */
  period?: string
  /** Currency symbol */
  currency?: string
  /** List of features included */
  features: string[]
  /** Call-to-action button */
  action?: ActionProps
  /** Whether this is the highlighted/recommended plan */
  highlighted?: boolean
  /** Additional badge text (e.g., "Popular", "Best Value") */
  badge?: string
}

/**
 * Pricing section component props
 */
export interface PricingSectionProps extends BaseComponentProps, SpacingProps, ColorProps, BackgroundProps {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Pricing tiers/plans */
  tiers?: PricingTier[]
  /** Layout variant */
  layout?: 'cards' | 'table' | 'toggle'
  /** Billing period toggle options */
  billingPeriods?: { monthly: string; yearly: string }
  /** Show comparison table */
  showComparison?: boolean
}

/**
 * Pricing section with dual API support
 */
export type PricingProps = DualAPIProps<PricingSectionProps>

/**
 * Call-to-action section component props
 */
export interface CTASectionProps extends BaseComponentProps, SpacingProps, ColorProps, BackgroundProps {
  /** CTA headline */
  headline?: string
  /** CTA description */
  description?: string
  /** Primary action */
  primaryAction?: ActionProps
  /** Secondary action */
  secondaryAction?: ActionProps
  /** Layout variant */
  layout?: 'centered' | 'split' | 'banner'
  /** Background style */
  backgroundStyle?: 'solid' | 'gradient' | 'pattern'
}

/**
 * CTA section with dual API support
 */
export type CTAProps = DualAPIProps<CTASectionProps>
