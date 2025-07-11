import React from 'react'
import { Text } from 'ink'

// Dynamic imports for optional dependencies
let SyntaxHighlight: any

try {
  SyntaxHighlight = require('ink-syntax-highlight').default || require('ink-syntax-highlight')
} catch {
  SyntaxHighlight = ({ code }: { code: string }) => <Text backgroundColor='gray'>{code}</Text>
}

/**
 * Code components
 */
export function Code({ children, className }: { children: React.ReactNode; className?: string }) {
  const isCodeBlock = className && className.startsWith('language-')

  if (isCodeBlock) {
    const language = className.replace('language-', '')
    return <SyntaxHighlight code={String(children)} language={language} />
  }

  return (
    <Text backgroundColor='gray' color='black'>
      {children}
    </Text>
  )
}

export function Pre({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
