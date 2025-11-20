import React from 'react'
import { Text } from 'ink'

export interface AsciiProps {
  children: string
  font?: string
}

/**
 * ASCII text component
 */
export function Ascii({ children, font }: AsciiProps) {
  return <Text>{children}</Text>
}
