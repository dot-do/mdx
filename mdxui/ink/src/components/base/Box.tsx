import React from 'react'
import { Box } from 'ink'
import type { BoxProps } from 'ink'

/**
 * Box component with chalk styling
 */
export function PastelBox({ borderColor, ...props }: BoxProps & { borderColor?: string }) {
  if (borderColor) {
    return <Box {...props} borderColor={borderColor} />
  }

  return <Box {...props} />
}
