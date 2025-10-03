import type { ReactNode } from 'react'
import type { BaseComponentProps, SpacingProps, ColorProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Individual tab item
 */
export interface TabItem {
  /** Tab label */
  label: string
  /** Tab value/key */
  value: string
  /** Tab content */
  content: ReactNode
  /** Icon for tab */
  icon?: string | React.ComponentType
  /** Whether tab is disabled */
  disabled?: boolean
}

/**
 * Tabs component props
 */
export interface TabsProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** List of tabs */
  items?: TabItem[]
  /** Default active tab value */
  defaultValue?: string
  /** Controlled active tab value */
  value?: string
  /** Change handler for controlled mode */
  onChange?: (value: string) => void
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Tab style variant */
  variant?: 'default' | 'pills' | 'underline'
  /** Whether to preserve content when switching tabs */
  keepMounted?: boolean
}

/**
 * Tabs with dual API support
 */
export type TabsDualProps = DualAPIProps<TabsProps>

/**
 * Code block component props
 */
export interface CodeBlockProps extends BaseComponentProps, SpacingProps {
  /** Programming language */
  language?: string
  /** Code content */
  code?: string
  /** Filename to display */
  filename?: string
  /** Line numbers to highlight */
  highlightLines?: number[] | string
  /** Whether to show line numbers */
  showLineNumbers?: boolean
  /** Whether to show copy button */
  showCopyButton?: boolean
  /** Maximum height before scrolling */
  maxHeight?: string | number
  /** Theme (for syntax highlighting) */
  theme?: 'light' | 'dark' | 'auto'
}

/**
 * Code block with dual API support
 */
export type CodeBlockDualProps = DualAPIProps<CodeBlockProps>
