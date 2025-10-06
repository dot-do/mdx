/**
 * Code Block Execution Engine for MDXE
 * Uses esbuild for TypeScript transpilation and provides secure code execution
 */

import * as esbuild from 'esbuild'
import { createExecutionContext, ExecutionContextType } from './execution-context'
import type { CodeBlock } from './mdx-parser'
import { extractExecutionContext } from './mdx-parser'
import { $, ai, db, on, send, list, research, extract } from './globals'
import { parseStatements, type CapturedStatement } from './output-injector'

const sharedBlockState = new Map<string, Map<string, any>>()

export interface CapturedOutput {
  type: 'log' | 'error' | 'warn' | 'info'
  args: any[]
  timestamp: number
}

export interface ExecutionResult {
  success: boolean
  result?: any
  error?: string
  duration: number
  outputs?: CapturedOutput[]
  statementCaptures?: CapturedStatement[]
}

export interface ExecutionOptions {
  context?: Record<string, any>
  timeout?: number
  executionContext?: ExecutionContextType
  fileId?: string
}

/**
 * Capture console outputs during code execution
 */
function captureConsoleOutputs(fn: () => Promise<any>): Promise<{ result: any; outputs: CapturedOutput[] }> {
  const outputs: CapturedOutput[] = []
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

  return fn()
    .finally(() => {
      Object.assign(console, originalConsole)
    })
    .then((result) => ({ result, outputs }))
}

/**
 * Execute a single TypeScript code block using esbuild transpilation
 */
export async function executeCodeBlock(codeBlock: CodeBlock, options: ExecutionOptions = {}): Promise<ExecutionResult> {
  const startTime = Date.now()
  const fileId = options.fileId || 'default'
  const captureStatements = codeBlock.meta?.includes('assert') || codeBlock.meta?.includes('doc')

  if (!sharedBlockState.has(fileId)) {
    sharedBlockState.set(fileId, new Map())
  }
  const fileState = sharedBlockState.get(fileId)!

  try {
    // Only execute TypeScript/JavaScript code blocks
    if (!['typescript', 'ts', 'javascript', 'js'].includes(codeBlock.lang)) {
      return {
        success: false,
        error: `Unsupported language: ${codeBlock.lang}`,
        duration: Date.now() - startTime,
        outputs: [],
      }
    }

    const contextType = options.executionContext || extractExecutionContext(codeBlock.meta)

    // Parse statements from original code for line mapping
    let statements: Array<{ line: number; column: number; text: string }> = []
    if (captureStatements) {
      try {
        statements = parseStatements(codeBlock.value)
      } catch (error) {
        console.warn('[mdxe] Failed to parse statements for output capture:', error)
      }
    }

    // Create execution context with global objects
    const executionContext = createExecutionContext(contextType)
    const customContext = options.context || {}

    const { EXECUTION_CONTEXTS } = await import('./execution-context.js')
    const contextEnv = EXECUTION_CONTEXTS[contextType]?.env || {}

    // Statement capture state
    const statementCaptures: CapturedStatement[] = []
    let currentStatementLine = 0

    // Create assertion tracking helpers
    const assertionResults: Array<{ line: number; passed: boolean; message: string }> = []

    // Create full context with environment variables, shared state, and SDK globals
    // Don't modify global process.env, instead provide context env in the execution context
    const fullContext = {
      ...executionContext,
      ...customContext,
      // SDK.do globals
      $,
      ai,
      db,
      on,
      send,
      list,
      research,
      extract,
      // Testing utilities (for assert blocks)
      expect: createExpectFunction(assertionResults, () => currentStatementLine),
      // Environment and state
      env: contextEnv,
      process: {
        env: {
          ...process.env,
          ...contextEnv, // Make context env available in process.env within execution context
        },
      },
      __state: fileState,
      exportVar: (key: string, value: any) => fileState.set(key, value),
      importVar: (key: string) => fileState.get(key),
      __captureOutput: (line: number, output: any) => {
        if (captureStatements) {
          statementCaptures.push({
            line,
            column: 0,
            output,
            type: 'result'
          })
        }
        return output
      }
    }

    // ALWAYS transpile TypeScript code with esbuild, regardless of await
    // This ensures type annotations and TypeScript syntax are properly handled
    const isTypeScript = ['typescript', 'ts'].includes(codeBlock.lang)

    try {
      let codeToExecute: string

      if (isTypeScript) {
        // Use esbuild to transpile TypeScript to JavaScript
        const result = await esbuild.transform(codeBlock.value, {
          loader: 'ts',
          target: 'es2022', // ES2022 supports top-level await
          format: 'esm',
        })
        codeToExecute = result.code
      } else {
        // JavaScript code can be executed directly
        codeToExecute = codeBlock.value
      }

      // Execute the transpiled/raw code with console capture
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      const contextKeys = Object.keys(fullContext)
      const contextValues = Object.values(fullContext)

      const execFunction = new AsyncFunction(...contextKeys, codeToExecute)

      // Capture console outputs during execution
      const { result: execResult, outputs } = await captureConsoleOutputs(async () => {
        return await execFunction(...contextValues)
      })

      // Add assertion results to captures
      for (const assertion of assertionResults) {
        statementCaptures.push({
          line: assertion.line,
          column: 0,
          output: assertion.message,
          type: 'assertion',
          assertionPassed: assertion.passed,
          assertionMessage: assertion.message
        })
      }

      return {
        success: true,
        result: execResult,
        duration: Date.now() - startTime,
        outputs,
        statementCaptures: captureStatements ? statementCaptures : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        outputs: [],
      }
    }
  } catch (error) {
    // Handle execution errors
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
      outputs: [],
    }
  }
}

/**
 * Create expect function for assertions (vitest-compatible API)
 */
function createExpectFunction(
  results: Array<{ line: number; passed: boolean; message: string }>,
  getCurrentLine: () => number
) {
  return function expect(actual: any) {
    const line = getCurrentLine()

    return {
      toBe(expected: any) {
        const passed = actual === expected
        results.push({
          line,
          passed,
          message: passed
            ? `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`
            : `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}, but it was ${JSON.stringify(actual)}`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
        }
      },
      toEqual(expected: any) {
        const passed = JSON.stringify(actual) === JSON.stringify(expected)
        results.push({
          line,
          passed,
          message: passed
            ? `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`
            : `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
        }
      },
      toContain(substring: string) {
        const passed = String(actual).includes(substring)
        results.push({
          line,
          passed,
          message: passed
            ? `Expected "${actual}" to contain "${substring}"`
            : `Expected "${actual}" to contain "${substring}"`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected to contain "${substring}"`)
        }
      },
      toBeGreaterThan(expected: number) {
        const passed = actual > expected
        results.push({
          line,
          passed,
          message: passed
            ? `Expected ${actual} to be greater than ${expected}`
            : `Expected ${actual} to be greater than ${expected}`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected ${actual} to be greater than ${expected}`)
        }
      },
      toBeLessThan(expected: number) {
        const passed = actual < expected
        results.push({
          line,
          passed,
          message: passed
            ? `Expected ${actual} to be less than ${expected}`
            : `Expected ${actual} to be less than ${expected}`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected ${actual} to be less than ${expected}`)
        }
      },
      toBeTruthy() {
        const passed = !!actual
        results.push({
          line,
          passed,
          message: passed
            ? `Expected ${JSON.stringify(actual)} to be truthy`
            : `Expected ${JSON.stringify(actual)} to be truthy`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected ${JSON.stringify(actual)} to be truthy`)
        }
      },
      toBeFalsy() {
        const passed = !actual
        results.push({
          line,
          passed,
          message: passed
            ? `Expected ${JSON.stringify(actual)} to be falsy`
            : `Expected ${JSON.stringify(actual)} to be falsy`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected ${JSON.stringify(actual)} to be falsy`)
        }
      },
      toBeDefined() {
        const passed = actual !== undefined
        results.push({
          line,
          passed,
          message: passed
            ? `Expected value to be defined`
            : `Expected value to be defined`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected value to be defined`)
        }
      },
      toBeUndefined() {
        const passed = actual === undefined
        results.push({
          line,
          passed,
          message: passed
            ? `Expected value to be undefined`
            : `Expected value to be undefined`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected value to be undefined`)
        }
      },
      toBeNull() {
        const passed = actual === null
        results.push({
          line,
          passed,
          message: passed
            ? `Expected value to be null`
            : `Expected value to be null`
        })
        if (!passed) {
          throw new Error(`Assertion failed: expected value to be null`)
        }
      }
    }
  }
}

/**
 * Execute multiple code blocks in sequence
 */
export async function executeCodeBlocks(codeBlocks: CodeBlock[], options: ExecutionOptions = {}): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = []

  for (const codeBlock of codeBlocks) {
    const result = await executeCodeBlock(codeBlock, options)
    results.push(result)

    // Continue execution even if a block fails
    // This allows us to execute all blocks and report all errors
  }

  return results
}

/**
 * Execute all TypeScript code blocks from MDX content
 */
export async function executeMdxCodeBlocks(mdxContent: string, options: ExecutionOptions = {}): Promise<ExecutionResult[]> {
  const { extractCodeBlocks } = await import('./mdx-parser')
  const codeBlocks = extractCodeBlocks(mdxContent)

  // Filter executable blocks based on context
  const executableBlocks = codeBlocks.filter((block) => {
    if (!['typescript', 'ts', 'javascript', 'js'].includes(block.lang)) return false

    const blockContext = extractExecutionContext(block.meta)
    if (blockContext === 'test' && options.executionContext !== 'test') return false

    return true
  })

  return executeCodeBlocks(executableBlocks, options)
}
