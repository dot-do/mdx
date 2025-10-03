import type { ReactNode } from 'react'
import type { BaseComponentProps, ActionProps, SpacingProps, ColorProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Stat/KPI card component props
 */
export interface StatCardProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** Stat label */
  label?: string
  /** Stat value */
  value?: string | number
  /** Change/delta value */
  change?: string | number
  /** Change direction */
  changeType?: 'positive' | 'negative' | 'neutral'
  /** Icon to display */
  icon?: string | React.ComponentType
  /** Trend data for sparkline */
  trend?: number[]
  /** Additional context/help text */
  helpText?: string
}

/**
 * Stat card with dual API support
 */
export type StatCardDualProps = DualAPIProps<StatCardProps>

/**
 * Generic card component props
 */
export interface CardProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** Card title */
  title?: string
  /** Card description */
  description?: string
  /** Header content */
  header?: ReactNode
  /** Footer content */
  footer?: ReactNode
  /** Primary action */
  action?: ActionProps
  /** Card variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  /** Whether card is clickable */
  clickable?: boolean
  /** Click handler */
  onClick?: () => void
}

/**
 * Card with dual API support
 */
export type CardDualProps = DualAPIProps<CardProps>
