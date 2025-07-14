import React from 'react'
import { Text as InkText } from 'ink'
import type { TextProps } from 'ink'

/**
 * Text component with chalk styling
 */
export function Text({ color, ...props }: TextProps & { color?: string }) {
  if (color) {
    return <InkText {...props} color={color} />
  }

  return <InkText {...props} />
}
