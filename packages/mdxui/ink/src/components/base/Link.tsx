import React from 'react'
import { Text } from 'ink'

// Dynamic import for optional dependency
let Link: any

try {
  Link = require('ink-link').default || require('ink-link')
} catch {
  Link = ({ url, children }: { url: string; children: React.ReactNode }) => (
    <Text color='blue'>
      {children} ({url})
    </Text>
  )
}

/**
 * Link component
 */
export function A({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <Text>{children}</Text>
  return <Link url={href}>{children}</Link>
}
