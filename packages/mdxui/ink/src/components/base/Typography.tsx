import React from 'react'
import { Text, Box } from 'ink'

/**
 * Heading components
 */
export function H1({ children }: { children: React.ReactNode }) {
  return <Text bold color='blue'>{children}</Text>
}

export function H2({ children }: { children: React.ReactNode }) {
  return <Text bold color='green'>{children}</Text>
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <Box marginY={1}>
      <Text bold color='yellow'>{children}</Text>
    </Box>
  )
}

export function H4({ children }: { children: React.ReactNode }) {
  return <Text bold color='magenta'>{children}</Text>
}

export function H5({ children }: { children: React.ReactNode }) {
  return (
    <Box marginY={1}>
      <Text bold color='cyan'>{children}</Text>
    </Box>
  )
}

export function H6({ children }: { children: React.ReactNode }) {
  return (
    <Box marginY={1}>
      <Text bold color='gray'>{children}</Text>
    </Box>
  )
}

/**
 * Text formatting components
 */
export function Strong({ children }: { children: React.ReactNode }) {
  return <Text bold>{children}</Text>
}

export function Em({ children }: { children: React.ReactNode }) {
  return <Text italic>{children}</Text>
}

export function Del({ children }: { children: React.ReactNode }) {
  return <Text strikethrough>{children}</Text>
}

/**
 * Blockquote component
 */
export function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <Box borderStyle='round' borderColor='gray' paddingX={1}>
      {children}
    </Box>
  )
}

/**
 * Horizontal rule component
 */
export function Hr() {
  return <Text color='gray'>{'─'.repeat(50)}</Text>
} 
