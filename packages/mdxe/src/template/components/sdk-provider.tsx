'use client'

import * as React from 'react'
import { createSDK } from 'sdk.do'

/**
 * SDK Context for accessing .do platform capabilities in MDX
 */
const SDKContext = React.createContext<ReturnType<typeof createSDK> | null>(null)

/**
 * SDKProvider - Provides .do platform SDK to all MDX files
 *
 * Exposes these objects:
 * - ai - AI capabilities (LLM, embeddings, models)
 * - $ - Business runtime containing:
 *   - $.api - API client infrastructure
 *   - $.db - Database operations
 *   - $.every - Event scheduling
 *   - $.on - Event handlers
 *   - $.send - Messaging and notifications
 */
export function SDKProvider({ children }: { children: React.ReactNode }) {
  // Create SDK instance with auto-authentication
  const sdk = React.useMemo(() => createSDK({ autoAuth: true }), [])

  return (
    <SDKContext.Provider value={sdk}>
      {children}
    </SDKContext.Provider>
  )
}

/**
 * Hook to access .do platform SDK
 *
 * @example
 * ```tsx
 * const { ai, $ } = useSDK()
 *
 * // AI capabilities
 * const result = await ai.llm.post('/generate', {
 *   prompt: 'Write a haiku'
 * })
 *
 * // Business runtime operations
 * const data = await $.api.get('/endpoint')
 * const record = await $.db.query('SELECT * FROM table')
 * ```
 */
export function useSDK() {
  const context = React.useContext(SDKContext)
  if (!context) {
    throw new Error('useSDK must be used within SDKProvider')
  }
  return context
}

/**
 * Hook to access Business-as-Code runtime directly
 *
 * Uses CapnWeb - operations queue until awaited, so you only await when you need results.
 *
 * @example
 * ```tsx
 * const $ = use$()
 *
 * // Queue operations (no await needed)
 * $.api.post('/endpoint', { data })
 * $.db.insert('table', { data })
 * $.every('1h').do(() => console.log('hourly'))
 * $.on('event', (data) => console.log(data))
 * $.send('channel', { message: 'hello' })
 *
 * // Only await when you need results
 * const data = await $.api.get('/endpoint')
 * const records = await $.db.query('SELECT * FROM table')
 * ```
 */
export function use$() {
  const sdk = useSDK()
  return sdk.$
}

/**
 * Hook to access AI capabilities directly
 *
 * @example
 * ```tsx
 * const ai = useAI()
 *
 * // AI operations
 * const result = await ai.llm.post('/generate', { prompt: 'Hello' })
 * const embedding = await ai.embeddings.post('/embed', { text: 'Hello' })
 * ```
 */
export function useAI() {
  const sdk = useSDK()
  return sdk.ai
}

/**
 * HOC to inject SDK into component props
 */
export function withSDK<P extends object>(
  Component: React.ComponentType<P & { sdk: ReturnType<typeof createSDK> }>
) {
  return function SDKComponent(props: P) {
    const sdk = useSDK()
    return <Component {...props} sdk={sdk} />
  }
}
