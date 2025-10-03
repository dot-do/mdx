import type { BaseComponentProps, SpacingProps, ColorProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Callout/admonition types
 */
export type CalloutType = 'info' | 'warning' | 'error' | 'success' | 'tip' | 'note'

/**
 * Callout component props
 */
export interface CalloutProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** Callout type/severity */
  type?: CalloutType
  /** Callout title */
  title?: string
  /** Icon to display */
  icon?: string | React.ComponentType
  /** Whether to show icon */
  showIcon?: boolean
  /** Whether the callout is collapsible */
  collapsible?: boolean
  /** Default collapsed state */
  defaultCollapsed?: boolean
}

/**
 * Callout with dual API support
 * Usage:
 *   <Callout type="warning" title="Important">...</Callout>
 * OR:
 *   <Callout type="warning">
 *     **Important:** This is a warning message
 *   </Callout>
 */
export type CalloutDualProps = DualAPIProps<CalloutProps>
