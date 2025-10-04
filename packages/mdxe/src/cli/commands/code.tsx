/**
 * MDXE Code Command
 * Execute TypeScript code using DO worker (Code Mode)
 */

import * as React from 'react'
import { useState, useEffect } from 'react'
import { render, Text, Box, useInput } from 'ink'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface CodeOptions {
  bindings?: string[]
  timeout?: number
  cache?: boolean
  output?: 'json' | 'text'
}

/**
 * Code execution result display component
 */
const CodeResult: React.FC<{
  result: any
  logs: string[]
  error?: { message: string; stack?: string }
  executionTime: number
}> = ({ result, logs, error, executionTime }) => {
  if (error) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="red">❌ Execution failed</Text>
        </Box>
        <Box flexDirection="column" paddingLeft={2}>
          <Text color="red">{error.message}</Text>
          {error.stack && (
            <Text dimColor>{error.stack.split('\n').slice(0, 5).join('\n')}</Text>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="green">✓ Execution completed</Text>
        <Text dimColor> ({executionTime}ms)</Text>
      </Box>

      {logs.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Text color="blue">Console Output:</Text>
          {logs.map((log, i) => (
            <Text key={i} dimColor>  {log}</Text>
          ))}
        </Box>
      )}

      {result !== undefined && (
        <Box flexDirection="column">
          <Text color="blue">Result:</Text>
          <Text>  {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}</Text>
        </Box>
      )}
    </Box>
  )
}

/**
 * REPL component for interactive code execution
 */
const CodeREPL: React.FC<{ executeCode: (code: string) => Promise<any> }> = ({ executeCode }) => {
  const [history, setHistory] = useState<Array<{ code: string; result: any }>>([])
  const [input, setInput] = useState('')
  const [executing, setExecuting] = useState(false)

  useInput(async (inputChar, key) => {
    if (executing) return

    if (key.return) {
      if (input.trim() === '') return
      if (input.trim() === 'exit' || input.trim() === '.exit') {
        process.exit(0)
      }

      setExecuting(true)
      const code = input
      setInput('')

      try {
        const result = await executeCode(code)
        setHistory([...history, { code, result }])
      } catch (error: any) {
        setHistory([...history, { code, result: { error: error.message } }])
      } finally {
        setExecuting(false)
      }
    } else if (key.delete || key.backspace) {
      setInput(input.slice(0, -1))
    } else if (!key.ctrl && !key.meta) {
      setInput(input + inputChar)
    }
  })

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan" bold>Code Mode REPL</Text>
        <Text dimColor> (type .exit to quit)</Text>
      </Box>

      {history.map((item, i) => (
        <Box key={i} flexDirection="column" marginBottom={1}>
          <Box>
            <Text color="green">&gt; </Text>
            <Text>{item.code}</Text>
          </Box>
          {item.result && (
            <Box paddingLeft={2}>
              {item.result.error ? (
                <Text color="red">{item.result.error}</Text>
              ) : (
                <Text>{typeof item.result.result === 'object'
                  ? JSON.stringify(item.result.result, null, 2)
                  : String(item.result.result)}</Text>
              )}
            </Box>
          )}
        </Box>
      ))}

      <Box>
        <Text color="green">&gt; </Text>
        <Text>{input}</Text>
        {executing && <Text dimColor>...</Text>}
      </Box>
    </Box>
  )
}

/**
 * Execute code via DO worker
 */
async function executeCodeViaWorker(
  code: string,
  options: CodeOptions = {}
): Promise<any> {
  // In production, this would call the DO worker via HTTP or RPC
  // For now, return mock response
  const DO_WORKER_URL = process.env.DO_WORKER_URL || 'https://do.do'

  try {
    const response = await fetch(`${DO_WORKER_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        bindings: options.bindings || [],
        timeout: options.timeout || 30000,
        captureConsole: true,
        captureFetch: false,
        cacheKey: options.cache ? `code-${Buffer.from(code).toString('base64')}` : undefined
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error: any) {
    // Fallback to local execution for development
    console.warn('DO worker not available, using local execution')

    // Simple eval-based execution (insecure, dev only)
    try {
      const result = eval(`(async () => { ${code} })()`)
      return {
        success: true,
        result: await result,
        logs: [],
        executionTime: 0
      }
    } catch (execError: any) {
      return {
        success: false,
        error: {
          message: execError.message,
          stack: execError.stack
        },
        logs: [],
        executionTime: 0
      }
    }
  }
}

/**
 * Run code from file
 */
export async function runCodeFile(filePath: string, options: CodeOptions = {}) {
  let unmount = () => {}

  try {
    // Read file
    const code = await fs.readFile(filePath, 'utf-8')

    // Show executing status
    const renderResult = render(
      <Box>
        <Text>Executing </Text>
        <Text color="green">{path.basename(filePath)}</Text>
        <Text>...</Text>
      </Box>
    )
    unmount = renderResult.unmount

    // Execute code
    const result = await executeCodeViaWorker(code, options)

    // Unmount status, render result
    unmount()
    const resultRender = render(
      <CodeResult
        result={result.result}
        logs={result.logs || []}
        error={result.error}
        executionTime={result.executionTime || 0}
      />
    )

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1)
  } catch (error: any) {
    unmount()
    console.error('Error executing file:', error.message)
    process.exit(1)
  }
}

/**
 * Run inline code
 */
export async function runCodeInline(code: string, options: CodeOptions = {}) {
  let unmount = () => {}

  try {
    // Show executing status
    const renderResult = render(
      <Box>
        <Text>Executing code...</Text>
      </Box>
    )
    unmount = renderResult.unmount

    // Execute code
    const result = await executeCodeViaWorker(code, options)

    // Unmount status, render result
    unmount()

    if (options.output === 'json') {
      console.log(JSON.stringify(result, null, 2))
    } else {
      const resultRender = render(
        <CodeResult
          result={result.result}
          logs={result.logs || []}
          error={result.error}
          executionTime={result.executionTime || 0}
        />
      )
    }

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1)
  } catch (error: any) {
    unmount()
    console.error('Error executing code:', error.message)
    process.exit(1)
  }
}

/**
 * Run REPL mode
 */
export async function runCodeREPL(options: CodeOptions = {}) {
  const executeCode = async (code: string) => {
    return await executeCodeViaWorker(code, options)
  }

  render(<CodeREPL executeCode={executeCode} />)

  // Keep running
  await new Promise(() => {})
}

/**
 * Main code command handler
 */
export async function runCodeCommand(args: string[], options: CodeOptions = {}) {
  const subcommand = args[0]

  if (!subcommand || subcommand === 'repl') {
    // REPL mode
    return runCodeREPL(options)
  } else if (subcommand === 'exec') {
    // Inline execution
    const code = args.slice(1).join(' ')
    if (!code) {
      console.error('Error: No code provided')
      console.log('Usage: mdxe code exec "return 2 + 2"')
      process.exit(1)
    }
    return runCodeInline(code, options)
  } else {
    // File execution
    const filePath = subcommand
    try {
      await fs.access(filePath)
    } catch {
      console.error(`Error: File not found: ${filePath}`)
      process.exit(1)
    }
    return runCodeFile(filePath, options)
  }
}
