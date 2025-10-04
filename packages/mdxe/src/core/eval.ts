/**
 * Safe MDX Evaluation Engine for mdxe
 *
 * Provides secure evaluation of MDX/JS/TS code using Worker Loader isolates.
 * Combines mdxdb access with Worker Loader sandboxing for safe execution.
 */

import { compile } from '@mdx-js/mdx'
import * as esbuild from 'esbuild'
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
   * Evaluate TypeScript code
   *
   * @param code TypeScript source code
   * @param options Evaluation options
   * @returns Evaluation result
   */
  async evaluateTypeScript(code: string, options: CodeEvalOptions = {}): Promise<EvalResult> {
    const startTime = Date.now()

    try {
      // Transpile TypeScript to JavaScript
      const result = await esbuild.transform(code, {
        loader: 'ts',
        target: 'es2022', // Support top-level await
        format: 'esm',
      })

      const jsCode = result.code

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
      const { loader, id } = await createCodeWorker(this.workerLoader['loader'], wrappedCode, {
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

      // Execute code
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      const contextKeys = Object.keys(context)
      const contextValues = Object.values(context)

      const fn = new AsyncFunction(...contextKeys, code)
      const result = await fn(...contextValues)

      // Restore console
      Object.assign(console, originalConsole)

      return {
        success: true,
        result,
        duration: Date.now() - startTime,
        outputs,
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
