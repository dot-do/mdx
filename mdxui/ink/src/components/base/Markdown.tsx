import React from 'react'
import { Text } from 'ink'

export interface MarkdownProps {
  children: string
}

/**
 * Markdown component for rendering markdown text
 */
export function Markdown({ children }: MarkdownProps) {
  return <Text>{children}</Text>
}
