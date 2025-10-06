/**
 * Cloudflare Tunnel Types for mdxe
 */

export interface TunnelConfig {
  /**
   * Tunnel ID
   */
  id: string

  /**
   * Tunnel name
   */
  name: string

  /**
   * Local port being tunneled
   */
  port: number

  /**
   * Public tunnel URL
   */
  url: string

  /**
   * Tunnel status
   */
  status: 'starting' | 'running' | 'stopped' | 'error'

  /**
   * Process ID (if running locally)
   */
  pid?: number

  /**
   * Created timestamp
   */
  createdAt: string

  /**
   * Last updated timestamp
   */
  updatedAt: string

  /**
   * Tunnel credentials file path
   */
  credentialsFile?: string

  /**
   * Tunnel configuration file path
   */
  configFile?: string

  /**
   * Error message (if status is error)
   */
  error?: string
}

export interface TunnelOptions {
  /**
   * Local port to tunnel
   */
  port: number

  /**
   * Custom subdomain (optional)
   */
  subdomain?: string

  /**
   * Custom domain (optional)
   */
  domain?: string

  /**
   * Tunnel name (defaults to generated name)
   */
  name?: string

  /**
   * Auto-start on dev command
   */
  autoStart?: boolean

  /**
   * Log output
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

export interface TunnelManager {
  /**
   * Start a new tunnel
   */
  start(options: TunnelOptions): Promise<TunnelConfig>

  /**
   * Stop a tunnel
   */
  stop(tunnelId: string): Promise<void>

  /**
   * List all tunnels
   */
  list(): Promise<TunnelConfig[]>

  /**
   * Get tunnel by ID
   */
  get(tunnelId: string): Promise<TunnelConfig | null>

  /**
   * Clean up stopped tunnels
   */
  cleanup(): Promise<void>
}

export interface CloudflareTunnelProcess {
  /**
   * Process ID
   */
  pid: number

  /**
   * Tunnel ID
   */
  tunnelId: string

  /**
   * Process handle
   */
  process: any

  /**
   * Start time
   */
  startedAt: Date
}
