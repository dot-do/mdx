import React from 'react'
import { Box, Text, Newline } from 'ink'

/**
 * Heading components with ANSI styling
 */
export const H1: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box marginY={1}>
    <Text bold color="cyan" underline>
      {children}
    </Text>
  </Box>
)

export const H2: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box marginY={1}>
    <Text bold color="blue">
      {children}
    </Text>
  </Box>
)

export const H3: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box marginY={1}>
    <Text bold color="green">
      {children}
    </Text>
  </Box>
)

export const H4: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box>
    <Text bold color="yellow">
      {children}
    </Text>
  </Box>
)

export const H5: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box>
    <Text bold color="magenta">
      {children}
    </Text>
  </Box>
)

export const H6: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box>
    <Text bold dimColor>
      {children}
    </Text>
  </Box>
)

/**
 * Paragraph component
 */
export const P: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box marginY={0} flexDirection="column">
    <Text>{children}</Text>
  </Box>
)

/**
 * Code block component with syntax highlighting
 */
export const Pre: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box marginY={1} paddingX={2} borderStyle="round" borderColor="gray">
    <Text>{children}</Text>
  </Box>
)

export const Code: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
  const isInline = !className || !className.startsWith('language-')

  if (isInline) {
    return (
      <Text backgroundColor="gray" color="white">
        {' '}
        {children}{' '}
      </Text>
    )
  }

  return <Text color="green">{children}</Text>
}

/**
 * List components
 */
export const Ul: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box marginY={0} flexDirection="column" paddingLeft={2}>
    {children}
  </Box>
)

export const Ol: React.FC<{ children?: React.ReactNode; start?: number }> = ({ children, start = 1 }) => (
  <Box marginY={0} flexDirection="column" paddingLeft={2}>
    {children}
  </Box>
)

export const Li: React.FC<{ children?: React.ReactNode; ordered?: boolean; index?: number }> = ({
  children,
  ordered = false,
  index = 0,
}) => (
  <Box>
    <Text color="yellow">{ordered ? `${index + 1}.` : '•'} </Text>
    <Text>{children}</Text>
  </Box>
)

/**
 * Blockquote component
 */
export const Blockquote: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box marginY={1} paddingLeft={2} borderStyle="single" borderColor="cyan" borderLeft={true}>
    <Text italic color="cyan">
      {children}
    </Text>
  </Box>
)

/**
 * Horizontal rule
 */
export const Hr: React.FC = () => (
  <Box marginY={1}>
    <Text color="gray">{'─'.repeat(80)}</Text>
  </Box>
)

/**
 * Link component
 */
export const A: React.FC<{ children?: React.ReactNode; href?: string }> = ({ children, href }) => (
  <Text color="blue" underline>
    {children}
    {href && (
      <Text dimColor> ({href})</Text>
    )}
  </Text>
)

/**
 * Emphasis components
 */
export const Strong: React.FC<{ children?: React.ReactNode }> = ({ children }) => <Text bold>{children}</Text>

export const Em: React.FC<{ children?: React.ReactNode }> = ({ children }) => <Text italic>{children}</Text>

export const Del: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Text strikethrough>{children}</Text>
)

/**
 * Table components
 */
export const Table: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box marginY={1} flexDirection="column" borderStyle="single" borderColor="gray">
    {children}
  </Box>
)

export const Thead: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box borderStyle="single" borderBottom={true} borderColor="gray">
    {children}
  </Box>
)

export const Tbody: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box flexDirection="column">{children}</Box>
)

export const Tr: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box borderStyle="single" borderBottom={true} borderColor="gray">
    {children}
  </Box>
)

export const Th: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box paddingX={1} width={20}>
    <Text bold>{children}</Text>
  </Box>
)

export const Td: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box paddingX={1} width={20}>
    <Text>{children}</Text>
  </Box>
)

/**
 * Image component (shows alt text and path)
 */
export const Img: React.FC<{ alt?: string; src?: string }> = ({ alt, src }) => (
  <Box marginY={1}>
    <Text color="magenta">
      [Image: {alt || 'No alt text'}]
      {src && <Text dimColor> ({src})</Text>}
    </Text>
  </Box>
)

/**
 * Break component
 */
export const Br: React.FC = () => <Newline />

/**
 * Default MDX component mapping for Ink
 */
export const defaultInkComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  pre: Pre,
  code: Code,
  ul: Ul,
  ol: Ol,
  li: Li,
  blockquote: Blockquote,
  hr: Hr,
  a: A,
  strong: Strong,
  em: Em,
  del: Del,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  img: Img,
  br: Br,
}

/**
 * Specialized components for CLI rendering
 */

/**
 * Loading spinner
 */
export const Spinner: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => {
  const [frame, setFrame] = React.useState(0)
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

  React.useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length)
    }, 80)

    return () => clearInterval(timer)
  }, [])

  return (
    <Box>
      <Text color="cyan">{frames[frame]}</Text>
      <Text> {label}</Text>
    </Box>
  )
}

/**
 * Progress bar
 */
export const ProgressBar: React.FC<{ value: number; total: number; label?: string }> = ({
  value,
  total,
  label,
}) => {
  const percentage = Math.round((value / total) * 100)
  const barWidth = 40
  const filled = Math.round((percentage / 100) * barWidth)

  return (
    <Box flexDirection="column">
      {label && <Text>{label}</Text>}
      <Box>
        <Text color="green">{'█'.repeat(filled)}</Text>
        <Text color="gray">{'░'.repeat(barWidth - filled)}</Text>
        <Text> {percentage}%</Text>
      </Box>
    </Box>
  )
}

/**
 * Status indicator
 */
export const Status: React.FC<{ type: 'success' | 'error' | 'warning' | 'info'; children?: React.ReactNode }> = ({
  type,
  children,
}) => {
  const icons = {
    success: '✔',
    error: '✖',
    warning: '⚠',
    info: 'ℹ',
  }

  const colors = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
  } as const

  return (
    <Box>
      <Text color={colors[type]}>{icons[type]} </Text>
      <Text>{children}</Text>
    </Box>
  )
}

/**
 * Alert box
 */
export const Alert: React.FC<{ type: 'success' | 'error' | 'warning' | 'info'; children?: React.ReactNode }> = ({
  type,
  children,
}) => {
  const colors = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
  } as const

  return (
    <Box marginY={1} paddingX={2} borderStyle="round" borderColor={colors[type]}>
      <Text color={colors[type]}>{children}</Text>
    </Box>
  )
}

/**
 * Badge component
 */
export const Badge: React.FC<{ color?: string; children?: React.ReactNode }> = ({ color = 'blue', children }) => (
  <Text backgroundColor={color as any} color="white">
    {' '}
    {children}{' '}
  </Text>
)
