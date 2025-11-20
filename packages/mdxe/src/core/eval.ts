/**
 * Safe MDX Evaluation Engine for mdxe
 *
 * Provides secure evaluation of MDX/JS/TS code using Worker Loader isolates.
 * Combines mdxdb access with Worker Loader sandboxing for safe execution.
 */

import { compile } from '@mdx-js/mdx'
import * as esbuild from 'esbuild'
import { promises as fs } from 'fs'
import * as path from 'path'
import * as os from 'os'
import type { DbContext } from './db.js'
import { WorkerLoader, createCodeWorker, createSecureWorkerConfig, type WorkerLoaderBinding, type SecurityOptions } from './loader.js'

/**
 * Evaluation result
 */
export interface EvalResult {
  /**
   * Whether evaluation succeeded
   */
  success: boolean

  /**
   * Result value (if successful)
   */
  result?: any

  /**
   * Error message (if failed)
   */
  error?: string

  /**
   * Execution duration in milliseconds
   */
  duration: number

  /**
   * Console outputs captured during execution
   */
  outputs?: Array<{
    type: 'log' | 'error' | 'warn' | 'info'
    args: any[]
    timestamp: number
  }>
}

/**
 * MDX evaluation options
 */
export interface MdxEvalOptions {
  /**
   * Database context to provide to evaluated code
   */
  db?: DbContext

  /**
   * Additional environment bindings
   */
  bindings?: Record<string, any>

  /**
   * Security options
   */
  security?: SecurityOptions

  /**
   * Custom Worker Loader ID (for caching)
   */
  workerId?: string

  /**
   * Whether to compile MDX to JSX (default: true)
   */
  compileMdx?: boolean

  /**
   * Timeout in milliseconds (default: 5000)
   */
  timeout?: number
}

/**
 * TypeScript/JavaScript evaluation options
 */
export interface CodeEvalOptions extends Omit<MdxEvalOptions, 'compileMdx'> {
  /**
   * Language of the code (default: detected from content)
   */
  language?: 'typescript' | 'javascript'
}

/**
 * MDX Evaluation Engine
 *
 * Provides safe evaluation of MDX/JS/TS code with Worker Loader isolation.
 */
export class MdxEvaluator {
  private workerLoader: WorkerLoader | null = null

  /**
   * Initialize the evaluator
   *
   * @param loader Worker Loader binding (optional, for Cloudflare Workers)
   */
  constructor(loader?: WorkerLoaderBinding) {
    if (loader) {
      this.workerLoader = new WorkerLoader(loader)
    }
  }

  /**
   * Check if Worker Loader is available for secure evaluation
   */
  isWorkerLoaderAvailable(): boolean {
    return this.workerLoader?.isAvailable() ?? false
  }

  /**
   * Evaluate MDX content
   *
   * @param mdx MDX source code
   * @param options Evaluation options
   * @returns Evaluation result
   */
  async evaluateMdx(mdx: string, options: MdxEvalOptions = {}): Promise<EvalResult> {
    const startTime = Date.now()

    try {
      // Compile MDX to JSX if requested
      let jsCode: string

      if (options.compileMdx !== false) {
        const compiled = await compile(mdx, {
          outputFormat: 'function-body',
          development: false,
        })
        jsCode = String(compiled)
      } else {
        jsCode = mdx
      }

      // If Worker Loader available, use it for secure execution
      if (this.workerLoader && this.workerLoader.isAvailable()) {
        return await this.evaluateWithWorkerLoader(jsCode, options, startTime)
      }

      // Fallback to local execution (less secure)
      return await this.evaluateLocally(jsCode, options, startTime)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Bundle TypeScript code with esbuild
   *
   * @param code TypeScript source code
   * @returns Bundled JavaScript code
   */
  private async bundleTypeScript(code: string): Promise<string> {
    // Create temporary directory
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mdxe-'))
    const entryFile = path.join(tmpDir, 'entry.ts')
    const outFile = path.join(tmpDir, 'bundle.js')

    try {
      // Write code to temporary file
      await fs.writeFile(entryFile, code, 'utf-8')

      // Bundle with esbuild
      // Mark all external packages as external so they're imported at runtime
      await esbuild.build({
        entryPoints: [entryFile],
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'es2022',
        outfile: outFile,
        write: true,
        // Mark all npm packages as external
        packages: 'external',
        absWorkingDir: process.cwd(), // Set working directory for resolution
      })

      // Read bundled output
      const bundled = await fs.readFile(outFile, 'utf-8')

      return bundled
    } finally {
      // Clean up temporary files
      try {
        await fs.rm(tmpDir, { recursive: true, force: true })
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Evaluate TypeScript code
   *
   * @param code TypeScript source code
   * @param options Evaluation options
   * @returns Evaluation result
   */
  async evaluateTypeScript(code: string, options: CodeEvalOptions = {}): Promise<EvalResult> {
    const startTime = Date.now()

    try {
      // Bundle TypeScript code (resolves imports)
      const jsCode = await this.bundleTypeScript(code)

      // If Worker Loader available, use it for secure execution
      if (this.workerLoader && this.workerLoader.isAvailable()) {
        return await this.evaluateWithWorkerLoader(jsCode, options, startTime)
      }

      // Fallback to local execution
      return await this.evaluateLocally(jsCode, options, startTime)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Evaluate JavaScript code
   *
   * @param code JavaScript source code
   * @param options Evaluation options
   * @returns Evaluation result
   */
  async evaluateJavaScript(code: string, options: CodeEvalOptions = {}): Promise<EvalResult> {
    const startTime = Date.now()

    try {
      // If Worker Loader available, use it for secure execution
      if (this.workerLoader && this.workerLoader.isAvailable()) {
        return await this.evaluateWithWorkerLoader(code, options, startTime)
      }

      // Fallback to local execution
      return await this.evaluateLocally(code, options, startTime)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Evaluate code using Worker Loader (secure)
   */
  private async evaluateWithWorkerLoader(code: string, options: MdxEvalOptions, startTime: number): Promise<EvalResult> {
    if (!this.workerLoader) {
      throw new Error('Worker Loader not available')
    }

    try {
      // Prepare bindings
      const bindings: Record<string, any> = {
        ...(options.bindings || {}),
      }

      // Add database context if provided
      if (options.db) {
        bindings.db = options.db
      }

      // Wrap code to capture outputs and return result
      const wrappedCode = `
        const outputs = [];
        const originalConsole = {
          log: console.log,
          error: console.error,
          warn: console.warn,
          info: console.info,
        };

        console.log = (...args) => {
          outputs.push({ type: 'log', args, timestamp: Date.now() });
          originalConsole.log(...args);
        };
        console.error = (...args) => {
          outputs.push({ type: 'error', args, timestamp: Date.now() });
          originalConsole.error(...args);
        };
        console.warn = (...args) => {
          outputs.push({ type: 'warn', args, timestamp: Date.now() });
          originalConsole.warn(...args);
        };
        console.info = (...args) => {
          outputs.push({ type: 'info', args, timestamp: Date.now() });
          originalConsole.info(...args);
        };

        async function run() {
          ${code}
        }

        export default {
          async fetch(request) {
            try {
              const result = await run();
              return new Response(JSON.stringify({ success: true, result, outputs }), {
                headers: { 'Content-Type': 'application/json' }
              });
            } catch (error) {
              return new Response(JSON.stringify({
                success: false,
                error: error.message,
                outputs
              }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        };
      `

      // Create worker
      const workerId = options.workerId || `mdx-eval-${Date.now()}`
      const { loader, id } = await createCodeWorker(this.workerLoader.getLoaderBinding(), wrappedCode, {
        id: workerId,
        bindings,
      })

      // Execute worker with timeout
      const timeoutMs = options.timeout || 5000
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Execution timeout after ${timeoutMs}ms`)), timeoutMs)
      })

      const executionPromise = loader.execute(id, {
        request: new Request('https://eval.mdxe.local/'),
      })

      const response = (await Promise.race([executionPromise, timeoutPromise])) as Response
      const resultData = await response.json()

      // Cleanup
      loader.unload(id)

      return {
        ...resultData,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Evaluate code locally (fallback, less secure)
   */
  private async evaluateLocally(code: string, options: MdxEvalOptions, startTime: number): Promise<EvalResult> {
    // Create temporary file for ESM imports in current working directory
    // This ensures npm packages can be resolved from node_modules
    const tmpDir = await fs.mkdtemp(path.join(process.cwd(), '.mdxe-eval-'))
    const tmpFile = path.join(tmpDir, 'eval.mjs')

    try {
      const outputs: any[] = []

      // Capture console outputs
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
      }

      console.log = (...args: any[]) => {
        outputs.push({ type: 'log', args, timestamp: Date.now() })
        originalConsole.log(...args)
      }
      console.error = (...args: any[]) => {
        outputs.push({ type: 'error', args, timestamp: Date.now() })
        originalConsole.error(...args)
      }
      console.warn = (...args: any[]) => {
        outputs.push({ type: 'warn', args, timestamp: Date.now() })
        originalConsole.warn(...args)
      }
      console.info = (...args: any[]) => {
        outputs.push({ type: 'info', args, timestamp: Date.now() })
        originalConsole.info(...args)
      }

      // Create execution context
      const context = {
        ...(options.bindings || {}),
        db: options.db,
      }

      // Inject context into global scope for the module
      const globalContext = globalThis as any
      const originalValues: Record<string, any> = {}

      for (const [key, value] of Object.entries(context)) {
        originalValues[key] = globalContext[key]
        globalContext[key] = value
      }

      try {
        // Write code to temporary file
        await fs.writeFile(tmpFile, code, 'utf-8')

        // Dynamically import the module
        const module = await import(`file://${tmpFile}`)

        // Get the default export or the module itself
        const result = module.default || module

        // Restore console
        Object.assign(console, originalConsole)

        // Restore global context
        for (const [key, value] of Object.entries(originalValues)) {
          if (value === undefined) {
            delete globalContext[key]
          } else {
            globalContext[key] = value
          }
        }

        return {
          success: true,
          result,
          duration: Date.now() - startTime,
          outputs,
        }
      } finally {
        // Clean up temporary files
        try {
          await fs.rm(tmpDir, { recursive: true, force: true })
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      }
    }
  }
}

/**
 * Convenience function to evaluate MDX content
 *
 * @param mdx MDX source code
 * @param options Evaluation options
 * @returns Evaluation result
 */
export async function evaluateMdx(mdx: string, options: MdxEvalOptions = {}): Promise<EvalResult> {
  const evaluator = new MdxEvaluator()
  return evaluator.evaluateMdx(mdx, options)
}

/**
 * Convenience function to evaluate TypeScript code
 *
 * @param code TypeScript source code
 * @param options Evaluation options
 * @returns Evaluation result
 */
export async function evaluateTypeScript(code: string, options: CodeEvalOptions = {}): Promise<EvalResult> {
  const evaluator = new MdxEvaluator()
  return evaluator.evaluateTypeScript(code, options)
}

/**
 * Convenience function to evaluate JavaScript code
 *
 * @param code JavaScript source code
 * @param options Evaluation options
 * @returns Evaluation result
 */
export async function evaluateJavaScript(code: string, options: CodeEvalOptions = {}): Promise<EvalResult> {
  const evaluator = new MdxEvaluator()
  return evaluator.evaluateJavaScript(code, options)
}
