import type { ReactNode } from 'react'
import type { BaseComponentProps, MediaProps, SpacingProps, ColorProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Chat message role
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'function'

/**
 * Chat message component props
 */
export interface MessageProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** Message role */
  role?: MessageRole
  /** Message content */
  content?: string | ReactNode
  /** Message timestamp */
  timestamp?: Date | string
  /** Sender name */
  senderName?: string
  /** Sender avatar */
  avatar?: MediaProps
  /** Whether message is loading/streaming */
  isLoading?: boolean
  /** Whether message has error */
  hasError?: boolean
  /** Error message */
  errorMessage?: string
  /** Custom metadata */
  metadata?: Record<string, any>
}

/**
 * Message with dual API support
 */
export type MessageDualProps = DualAPIProps<MessageProps>

/**
 * Chat input component props
 */
export interface ChatInputProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** Input placeholder */
  placeholder?: string
  /** Current input value (controlled) */
  value?: string
  /** Change handler */
  onChange?: (value: string) => void
  /** Submit handler */
  onSubmit?: (value: string) => void
  /** Whether input is disabled */
  disabled?: boolean
  /** Whether input is loading */
  isLoading?: boolean
  /** Maximum length */
  maxLength?: number
  /** Whether to show character count */
  showCharCount?: boolean
  /** Whether to allow multiline */
  multiline?: boolean
  /** Number of rows (for multiline) */
  rows?: number
}

/**
 * Chat input with dual API support
 */
export type ChatInputDualProps = DualAPIProps<ChatInputProps>

/**
 * Message list component props
 */
export interface MessageListProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** List of messages */
  messages?: MessageProps[]
  /** Whether to show avatars */
  showAvatars?: boolean
  /** Whether to show timestamps */
  showTimestamps?: boolean
  /** Whether to group messages by sender */
  groupMessages?: boolean
  /** Whether to auto-scroll to bottom */
  autoScroll?: boolean
}

/**
 * Message list with dual API support
 */
export type MessageListDualProps = DualAPIProps<MessageListProps>
