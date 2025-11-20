import type { ReactNode } from 'react'
import type { BaseComponentProps, SpacingProps, ColorProps } from '../../shared/common.js'
import type { MessageProps } from './message.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Complete chat interface component props
 * Integrates with Vercel AI SDK's useChat hook
 */
export interface ChatInterfaceProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** Chat messages */
  messages?: MessageProps[]
  /** Input value */
  input?: string
  /** Input change handler */
  onInputChange?: (value: string) => void
  /** Submit handler */
  onSubmit?: (message: string) => void
  /** Whether chat is loading */
  isLoading?: boolean
  /** Error state */
  error?: Error | null
  /** Placeholder text */
  placeholder?: string
  /** Whether to show header */
  showHeader?: boolean
  /** Header title */
  headerTitle?: string
  /** Header actions */
  headerActions?: ReactNode
  /** Whether to show footer */
  showFooter?: boolean
  /** Footer content */
  footer?: ReactNode
  /** Chat layout variant */
  variant?: 'default' | 'minimal' | 'sidebar'
  /** Height of chat container */
  height?: string | number
}

/**
 * Chat interface with dual API support
 */
export type ChatInterfaceDualProps = DualAPIProps<ChatInterfaceProps>

/**
 * Suggested prompts/actions
 */
export interface SuggestedPrompt {
  /** Prompt text */
  text: string
  /** Optional icon */
  icon?: string | React.ComponentType
  /** Click handler */
  onClick?: () => void
}

/**
 * Prompt suggestions component props
 */
export interface PromptSuggestionsProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** List of suggested prompts */
  suggestions?: SuggestedPrompt[]
  /** Layout variant */
  variant?: 'grid' | 'list' | 'chips'
  /** Title text */
  title?: string
}

/**
 * Prompt suggestions with dual API support
 */
export type PromptSuggestionsDualProps = DualAPIProps<PromptSuggestionsProps>
