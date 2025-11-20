import type { ReactNode } from 'react'
import type { BaseComponentProps, SpacingProps, ColorProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Individual step item
 */
export interface StepItem {
  /** Step title */
  title: string
  /** Step description */
  description?: string
  /** Step content */
  content?: ReactNode
  /** Whether step is completed */
  completed?: boolean
  /** Icon for step */
  icon?: string | React.ComponentType
}

/**
 * Steps component props (for tutorials/guides)
 */
export interface StepsProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** List of steps */
  items?: StepItem[]
  /** Current active step (0-indexed) */
  currentStep?: number
  /** Layout variant */
  variant?: 'default' | 'circles' | 'arrows'
  /** Orientation */
  orientation?: 'vertical' | 'horizontal'
  /** Whether to show step numbers */
  showNumbers?: boolean
  /** Whether steps are clickable */
  clickable?: boolean
  /** Click handler */
  onStepClick?: (index: number) => void
}

/**
 * Steps with dual API support
 */
export type StepsDualProps = DualAPIProps<StepsProps>

/**
 * File tree node
 */
export interface FileTreeNode {
  /** File/folder name */
  name: string
  /** Node type */
  type: 'file' | 'folder'
  /** Child nodes (for folders) */
  children?: FileTreeNode[]
  /** Whether to highlight this node */
  highlight?: boolean
  /** Icon override */
  icon?: string | React.ComponentType
}

/**
 * File tree component props
 */
export interface FileTreeProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** Tree structure */
  tree?: FileTreeNode[]
  /** Whether folders are collapsible */
  collapsible?: boolean
  /** Default expanded state */
  defaultExpanded?: boolean
  /** Whether to show icons */
  showIcons?: boolean
}

/**
 * File tree with dual API support
 */
export type FileTreeDualProps = DualAPIProps<FileTreeProps>
