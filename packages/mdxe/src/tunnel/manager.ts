/**
 * Cloudflare Tunnel Manager
 *
 * Manages Cloudflare tunnels for local development
 */

import { spawn, ChildProcess } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { TunnelConfig, TunnelOptions, TunnelManager as ITunnelManager, CloudflareTunnelProcess } from './types'

export class TunnelManager implements ITunnelManager {
  private configDir: string
  private tunnelsFile: string
  private processes: Map<string, CloudflareTunnelProcess> = new Map()

  constructor(configDir?: string) {
    this.configDir = configDir || path.join(os.homedir(), '.mdxe', 'tunnels')
    this.tunnelsFile = path.join(this.configDir, 'tunnels.json')
  }

  /**
   * Ensure config directory exists
   */
  private async ensureConfigDir(): Promise<void> {
    await fs.mkdir(this.configDir, { recursive: true })
  }

  /**
   * Load tunnels from file
   */
  private async loadTunnels(): Promise<TunnelConfig[]> {
    try {
      const data = await fs.readFile(this.tunnelsFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  /**
   * Save tunnels to file
   */
  private async saveTunnels(tunnels: TunnelConfig[]): Promise<void> {
    await this.ensureConfigDir()
    await fs.writeFile(this.tunnelsFile, JSON.stringify(tunnels, null, 2))
  }

  /**
   * Generate tunnel ID
   */
  private generateTunnelId(): string {
    return `tunnel-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  /**
   * Start a new tunnel
   */
  async start(options: TunnelOptions): Promise<TunnelConfig> {
    const tunnelId = this.generateTunnelId()
    const name = options.name || `mdxe-${options.port}`

    console.log(`[Tunnel] Starting tunnel for port ${options.port}`)

    // Check if cloudflared is installed
    const cloudflaredPath = await this.findCloudflared()
    if (!cloudflaredPath) {
      throw new Error('cloudflared not found. Install with: npm install -g cloudflared')
    }

    // Start cloudflared process
    const args = [
      'tunnel',
      '--url', `http://localhost:${options.port}`,
      '--no-autoupdate',
    ]

    // Add subdomain if specified
    if (options.subdomain) {
      args.push('--hostname', `${options.subdomain}.${options.domain || 'mdxe.do'}`)
    }

    const process = spawn(cloudflaredPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    })

    // Create tunnel config
    const tunnel: TunnelConfig = {
      id: tunnelId,
      name,
      port: options.port,
      url: '', // Will be extracted from cloudflared output
      status: 'starting',
      pid: process.pid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store process
    this.processes.set(tunnelId, {
      pid: process.pid!,
      tunnelId,
      process,
      startedAt: new Date(),
    })

    // Parse cloudflared output to get tunnel URL
    let urlResolved = false
    const urlPromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!urlResolved) {
          reject(new Error('Timeout waiting for tunnel URL'))
        }
      }, 30000) // 30 second timeout

      process.stdout?.on('data', (data: Buffer) => {
        const output = data.toString()
        console.log(`[Tunnel] ${output.trim()}`)

        // Extract URL from cloudflared output
        // Format: "Your quick Tunnel has been created! Visit it at: https://..."
        const urlMatch = output.match(/https:\/\/[^\s]+\.trycloudflare\.com/)
        if (urlMatch && !urlResolved) {
          urlResolved = true
          clearTimeout(timeout)
          resolve(urlMatch[0])
        }
      })

      process.stderr?.on('data', (data: Buffer) => {
        const error = data.toString()
        console.error(`[Tunnel] Error: ${error.trim()}`)
      })

      process.on('error', (error) => {
        if (!urlResolved) {
          urlResolved = true
          clearTimeout(timeout)
          reject(error)
        }
      })

      process.on('exit', (code) => {
        if (!urlResolved && code !== 0) {
          urlResolved = true
          clearTimeout(timeout)
          reject(new Error(`Tunnel process exited with code ${code}`))
        }
      })
    })

    try {
      // Wait for tunnel URL
      tunnel.url = await urlPromise
      tunnel.status = 'running'
      tunnel.updatedAt = new Date().toISOString()

      console.log(`[Tunnel] Tunnel started: ${tunnel.url}`)

      // Save tunnel config
      const tunnels = await this.loadTunnels()
      tunnels.push(tunnel)
      await this.saveTunnels(tunnels)

      return tunnel
    } catch (error) {
      tunnel.status = 'error'
      tunnel.error = error instanceof Error ? error.message : 'Unknown error'
      tunnel.updatedAt = new Date().toISOString()

      // Kill process if started
      if (process.pid) {
        process.kill()
      }

      throw error
    }
  }

  /**
   * Stop a tunnel
   */
  async stop(tunnelId: string): Promise<void> {
    console.log(`[Tunnel] Stopping tunnel: ${tunnelId}`)

    const processInfo = this.processes.get(tunnelId)
    if (processInfo) {
      processInfo.process.kill()
      this.processes.delete(tunnelId)
    }

    // Update tunnel status
    const tunnels = await this.loadTunnels()
    const tunnel = tunnels.find((t) => t.id === tunnelId)
    if (tunnel) {
      tunnel.status = 'stopped'
      tunnel.updatedAt = new Date().toISOString()
      await this.saveTunnels(tunnels)
    }
  }

  /**
   * List all tunnels
   */
  async list(): Promise<TunnelConfig[]> {
    return await this.loadTunnels()
  }

  /**
   * Get tunnel by ID
   */
  async get(tunnelId: string): Promise<TunnelConfig | null> {
    const tunnels = await this.loadTunnels()
    return tunnels.find((t) => t.id === tunnelId) || null
  }

  /**
   * Clean up stopped tunnels
   */
  async cleanup(): Promise<void> {
    const tunnels = await this.loadTunnels()
    const activeTunnels = tunnels.filter((t) => t.status === 'running')
    await this.saveTunnels(activeTunnels)

    // Kill any orphaned processes
    for (const [tunnelId, processInfo] of this.processes.entries()) {
      const tunnel = activeTunnels.find((t) => t.id === tunnelId)
      if (!tunnel) {
        processInfo.process.kill()
        this.processes.delete(tunnelId)
      }
    }
  }

  /**
   * Find cloudflared executable
   */
  private async findCloudflared(): Promise<string | null> {
    // Try common paths
    const paths = [
      'cloudflared', // In PATH
      '/usr/local/bin/cloudflared',
      '/usr/bin/cloudflared',
      path.join(os.homedir(), '.local', 'bin', 'cloudflared'),
      'C:\\Program Files\\cloudflared\\cloudflared.exe', // Windows
    ]

    for (const cloudflaredPath of paths) {
      try {
        await fs.access(cloudflaredPath)
        return cloudflaredPath
      } catch {
        continue
      }
    }

    return null
  }

  /**
   * Stop all tunnels on shutdown
   */
  async shutdown(): Promise<void> {
    console.log('[Tunnel] Shutting down all tunnels')

    for (const [tunnelId] of this.processes) {
      await this.stop(tunnelId)
    }
  }
}

/**
 * Global tunnel manager instance
 */
let tunnelManager: TunnelManager | null = null

export function getTunnelManager(configDir?: string): TunnelManager {
  if (!tunnelManager) {
    tunnelManager = new TunnelManager(configDir)

    // Cleanup on process exit
    process.on('SIGINT', async () => {
      await tunnelManager?.shutdown()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      await tunnelManager?.shutdown()
      process.exit(0)
    })
  }

  return tunnelManager
}
