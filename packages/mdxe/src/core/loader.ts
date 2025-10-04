/**
 * Worker Loader Integration for mdxe
 *
 * Provides a wrapper around Cloudflare's Worker Loader API for safe,
 * isolated execution of MDX/JS/TS code in Workers runtime.
 *
 * Note: Worker Loader is currently in closed beta. For production use,
 * you must sign up for the beta program.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/
 */

/**
 * Worker module definition for dynamic loading
 */
export interface WorkerModule {
  /**
   * Module path (e.g., "index.js", "handler.ts")
   */
  path: string

  /**
   * Module source code
   */
  source: string

  /**
   * Module type (default: "esm")
   */
  type?: 'esm' | 'commonjs'
}

/**
 * Worker configuration for dynamic loading
 */
export interface WorkerConfig {
  /**
   * Compatibility date for Workers runtime
   */
  compatibilityDate?: string

  /**
   * Main module path
   */
  mainModule?: string

  /**
   * Worker modules (source code)
   */
  modules: Record<string, string>

  /**
   * Environment bindings to pass to the worker
   */
  bindings?: Record<string, any>

  /**
   * Compatibility flags
   */
  compatibilityFlags?: string[]

  /**
   * Limits for the worker
   */
  limits?: {
    /**
     * CPU time limit in milliseconds
     */
    cpuMs?: number

    /**
     * Memory limit in MB
     */
    memoryMb?: number
  }
}

/**
 * Worker Loader binding interface (Cloudflare Workers runtime)
 */
export interface WorkerLoaderBinding {
  /**
   * Load a worker with the given configuration
   */
  get(
    id: string,
    loader: () => Promise<{
      compatibilityDate?: string
      mainModule?: string
      modules: Record<string, string>
      bindings?: Record<string, any>
      compatibilityFlags?: string[]
    }>,
  ): Promise<WorkerInstance>
}

/**
 * Worker instance returned by Worker Loader
 */
export interface WorkerInstance {
  /**
   * Fetch handler (if worker exports default with fetch method)
   */
  fetch?(request: Request, env?: any, ctx?: any): Promise<Response>

  /**
   * Custom RPC methods exposed by the worker
   */
  [key: string]: any
}

/**
 * Execution context for Worker Loader
 */
export interface WorkerExecutionContext {
  /**
   * Request context (for fetch handler)
   */
  request?: Request

  /**
   * Environment bindings
   */
  env?: Record<string, any>

  /**
   * Execution context
   */
  ctx?: any

  /**
   * Custom method to call on worker
   */
  method?: string

  /**
   * Arguments for custom method
   */
  args?: any[]
}

/**
 * Worker Loader wrapper for mdxe
 *
 * Provides a high-level API for loading and executing workers
 * with MDX/JS/TS code in isolated environments.
 */
export class WorkerLoader {
  private loader: WorkerLoaderBinding | null = null
  private workers = new Map<string, WorkerInstance>()

  /**
   * Initialize the Worker Loader
   *
   * Note: In actual Cloudflare Workers environment, the loader binding
   * is provided by the runtime via env.LOADER. This constructor accepts
   * it for testing/mocking purposes.
   *
   * @param loader Worker Loader binding from Workers runtime
   */
  constructor(loader?: WorkerLoaderBinding) {
    this.loader = loader || null
  }

  /**
   * Check if Worker Loader is available
   */
  isAvailable(): boolean {
    return this.loader !== null
  }

  /**
   * Get the underlying loader binding
   */
  getLoaderBinding(): WorkerLoaderBinding {
    if (!this.loader) {
      throw new Error('Worker Loader binding not available')
    }
    return this.loader
  }

  /**
   * Load a worker with the given configuration
   *
   * @param id Unique identifier for this worker
   * @param config Worker configuration
   * @returns Worker instance
   */
  async load(id: string, config: WorkerConfig): Promise<WorkerInstance> {
    if (!this.loader) {
      throw new Error('Worker Loader not available. Ensure you are running in Cloudflare Workers environment with Worker Loader binding.')
    }

    // Check if worker already loaded
    if (this.workers.has(id)) {
      return this.workers.get(id)!
    }

    // Load the worker
    const worker = await this.loader.get(id, async () => ({
      compatibilityDate: config.compatibilityDate || '2025-01-01',
      mainModule: config.mainModule || 'index.js',
      modules: config.modules,
      bindings: config.bindings,
      compatibilityFlags: config.compatibilityFlags,
    }))

    // Cache the worker instance
    this.workers.set(id, worker)

    return worker
  }

  /**
   * Execute a worker with the given context
   *
   * @param id Worker ID
   * @param context Execution context
   * @returns Execution result
   */
  async execute(id: string, context: WorkerExecutionContext = {}): Promise<any> {
    const worker = this.workers.get(id)
    if (!worker) {
      throw new Error(`Worker ${id} not loaded. Call load() first.`)
    }

    // If method specified, call custom RPC method
    if (context.method) {
      const method = worker[context.method]
      if (typeof method !== 'function') {
        throw new Error(`Worker ${id} does not export method ${context.method}`)
      }
      return method.apply(worker, context.args || [])
    }

    // Otherwise, call fetch handler
    if (!worker.fetch) {
      throw new Error(`Worker ${id} does not export a fetch handler`)
    }

    const request = context.request || new Request('https://example.com/')
    return worker.fetch(request, context.env, context.ctx)
  }

  /**
   * Unload a worker and free resources
   *
   * @param id Worker ID
   */
  unload(id: string): void {
    this.workers.delete(id)
  }

  /**
   * Unload all workers
   */
  unloadAll(): void {
    this.workers.clear()
  }
}

/**
 * Create a simple Worker Loader for MDX/JS/TS evaluation
 *
 * This is a convenience function for the common case of evaluating
 * a single module of code.
 *
 * @param loader Worker Loader binding
 * @param code Source code to evaluate
 * @param options Additional options
 * @returns Worker Loader instance
 */
export async function createCodeWorker(
  loader: WorkerLoaderBinding,
  code: string,
  options: {
    id?: string
    mainModule?: string
    bindings?: Record<string, any>
    compatibilityDate?: string
  } = {},
): Promise<{ loader: WorkerLoader; id: string }> {
  const id = options.id || `worker-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  const mainModule = options.mainModule || 'index.js'

  const loaderInstance = new WorkerLoader(loader)

  await loaderInstance.load(id, {
    compatibilityDate: options.compatibilityDate || '2025-01-01',
    mainModule,
    modules: {
      [mainModule]: code,
    },
    bindings: options.bindings,
  })

  return { loader: loaderInstance, id }
}

/**
 * Security options for Worker Loader
 */
export interface SecurityOptions {
  /**
   * Block all network requests
   */
  blockNetwork?: boolean

  /**
   * Allowed domains for network requests (if blockNetwork is false)
   */
  allowedDomains?: string[]

  /**
   * CPU time limit in milliseconds
   */
  cpuLimit?: number

  /**
   * Memory limit in MB
   */
  memoryLimit?: number

  /**
   * Bindings whitelist (only these bindings will be passed to worker)
   */
  bindingsWhitelist?: string[]
}

/**
 * Create a secure Worker Loader configuration with security controls
 *
 * @param code Source code to evaluate
 * @param security Security options
 * @returns Worker configuration with security controls
 */
export function createSecureWorkerConfig(code: string, security: SecurityOptions = {}): WorkerConfig {
  const config: WorkerConfig = {
    compatibilityDate: '2025-01-01',
    mainModule: 'index.js',
    modules: {
      'index.js': code,
    },
    bindings: {},
    limits: {},
  }

  // Apply CPU limit
  if (security.cpuLimit) {
    config.limits!.cpuMs = security.cpuLimit
  }

  // Apply memory limit
  if (security.memoryLimit) {
    config.limits!.memoryMb = security.memoryLimit
  }

  // Note: Network blocking and domain whitelisting would need to be
  // implemented via custom fetch handler in the worker code or via
  // Cloudflare Workers configuration. Worker Loader itself doesn't
  // provide these controls directly.

  return config
}
