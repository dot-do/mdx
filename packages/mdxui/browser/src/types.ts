export type BrowserMode = 'browse' | 'edit' | 'preview'

export interface TestResult {
  blocks: {
    passed: number
    failed: number
    total: number
  }
  assertions: {
    passed: number
    failed: number
    total: number
  }
  failures: Array<{
    line: number
    message: string
    expected: any
    actual: any
  }>
  successes: Array<{
    line: number
    message: string
  }>
}

export interface BrowserComponentProps {
  mode: BrowserMode
  content: string
  language?: string
  theme?: string
  onContentChange?: (content: string) => void
  onNavigate?: (url: string) => void
  onSave?: (content: string) => Promise<void>
  saveEndpoint?: {
    url: string
    method: 'POST' | 'PUT' | 'PATCH'
    headers?: Record<string, string>
    auth?: {
      type: 'bearer' | 'basic' | 'api-key'
      token?: string
      username?: string
      password?: string
      apiKey?: string
      apiKeyHeader?: string
    }
    transformRequest?: (content: string) => string
    onSuccess?: (response: Response) => void
    onError?: (error: Error) => void
  }
  readOnly?: boolean
  className?: string
  style?: React.CSSProperties
  navigationMode?: 'client' | 'external' | 'auto'
  baseUrl?: string
  // Test runner props
  enableTesting?: boolean
  onTestResults?: (results: TestResult) => void
  showTestButton?: boolean
}

export interface SimplifiedBrowserOptions {
  mode?: BrowserMode
  content: string
  language?: string
  theme?: string
  onContentChange?: (content: string) => void
  onNavigate?: (url: string) => void
  onSave?: (content: string) => Promise<void>
  readOnly?: boolean
  className?: string
  style?: React.CSSProperties
  // Test runner props
  enableTesting?: boolean
  onTestResults?: (results: TestResult) => void
  showTestButton?: boolean
}
