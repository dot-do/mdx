/**
 * Output Injector for Literate Testing
 * Injects captured outputs as inline comments in MDX code blocks
 */

import * as ts from 'typescript'

export interface CapturedStatement {
  line: number
  column: number
  output: any
  type: 'result' | 'assertion' | 'error'
  assertionPassed?: boolean
  assertionMessage?: string
}

export interface InjectOptions {
  compact?: boolean
  maxLength?: number
  indentSize?: number
}

/**
 * Format a value for display as a comment
 */
export function formatOutput(value: any, options: InjectOptions = {}): string {
  const { compact = false, maxLength = 80 } = options

  if (value === undefined) return 'undefined'
  if (value === null) return 'null'

  const type = typeof value

  if (type === 'string') {
    const str = JSON.stringify(value)
    if (compact && str.length > maxLength) {
      return str.slice(0, maxLength - 3) + '..."'
    }
    return str
  }

  if (type === 'number' || type === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'

    if (compact) {
      const preview = value.slice(0, 3).map(v => formatOutput(v, { compact: true, maxLength: 20 }))
      const suffix = value.length > 3 ? `, ... ${value.length - 3} more` : ''
      return `[${preview.join(', ')}${suffix}]`
    }

    return JSON.stringify(value, null, 2)
  }

  if (type === 'object') {
    if (value instanceof Date) {
      return value.toISOString()
    }

    if (value instanceof Error) {
      return `Error: ${value.message}`
    }

    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'

    if (compact) {
      const preview = keys.slice(0, 3).map(k => `${k}: ${formatOutput(value[k], { compact: true, maxLength: 20 })}`)
      const suffix = keys.length > 3 ? `, ... ${keys.length - 3} more` : ''
      return `{ ${preview.join(', ')}${suffix} }`
    }

    return JSON.stringify(value, null, 2)
  }

  if (type === 'function') {
    return '[Function]'
  }

  return String(value)
}

/**
 * Parse TypeScript/JavaScript code and identify statement boundaries
 */
export function parseStatements(code: string): Array<{ line: number; column: number; text: string }> {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  )

  const statements: Array<{ line: number; column: number; text: string }> = []

  function visit(node: ts.Node) {
    // Track expression statements, variable declarations, and assignments
    if (
      ts.isExpressionStatement(node) ||
      ts.isVariableStatement(node) ||
      ts.isReturnStatement(node)
    ) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart())
      statements.push({
        line: line + 1, // 1-indexed
        column: character,
        text: node.getText(sourceFile)
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return statements
}

/**
 * Inject outputs as inline comments into code
 */
export function injectOutputs(
  code: string,
  captures: CapturedStatement[],
  options: InjectOptions = {}
): string {
  const { indentSize = 2 } = options
  const lines = code.split('\n')
  const capturesByLine = new Map<number, CapturedStatement[]>()

  // Group captures by line
  for (const capture of captures) {
    const existing = capturesByLine.get(capture.line) || []
    existing.push(capture)
    capturesByLine.set(capture.line, existing)
  }

  // Insert comments after each line with captures
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1
    result.push(lines[i])

    const lineCaptures = capturesByLine.get(lineNum)
    if (lineCaptures && lineCaptures.length > 0) {
      const indent = ' '.repeat((lines[i].match(/^\s*/)?.[0].length || 0) + indentSize)

      for (const capture of lineCaptures) {
        if (capture.type === 'result') {
          const formatted = formatOutput(capture.output, options)
          // For multi-line outputs, indent each line
          const outputLines = formatted.split('\n')
          if (outputLines.length === 1) {
            result.push(`${indent}// => ${formatted}`)
          } else {
            result.push(`${indent}// =>`)
            for (const line of outputLines) {
              result.push(`${indent}//   ${line}`)
            }
          }
        } else if (capture.type === 'assertion') {
          if (capture.assertionPassed) {
            result.push(`${indent}// ✅ ${capture.assertionMessage || 'Assertion passed'}`)
          } else {
            result.push(`${indent}// ❌ ${capture.assertionMessage || 'Assertion failed'}`)
          }
        } else if (capture.type === 'error') {
          result.push(`${indent}// ❌ Error: ${capture.output}`)
        }
      }
    }
  }

  return result.join('\n')
}

/**
 * Update MDX file with injected outputs
 */
export function updateMdxWithOutputs(
  mdxContent: string,
  codeBlockIndex: number,
  updatedCode: string
): string {
  // Match code blocks with language tags
  const codeBlockRegex = /```(\w+)(?:\s+([^\n]*))?\n([\s\S]*?)```/g
  const blocks: Array<{ match: string; lang: string; meta: string; code: string; start: number; end: number }> = []

  let match
  while ((match = codeBlockRegex.exec(mdxContent)) !== null) {
    blocks.push({
      match: match[0],
      lang: match[1],
      meta: match[2] || '',
      code: match[3],
      start: match.index,
      end: match.index + match[0].length
    })
  }

  if (codeBlockIndex < 0 || codeBlockIndex >= blocks.length) {
    throw new Error(`Code block index ${codeBlockIndex} out of range (0-${blocks.length - 1})`)
  }

  const block = blocks[codeBlockIndex]
  const newBlock = `\`\`\`${block.lang}${block.meta ? ' ' + block.meta : ''}\n${updatedCode}\n\`\`\``

  // Replace the block in the original content
  const before = mdxContent.slice(0, block.start)
  const after = mdxContent.slice(block.end)

  return before + newBlock + after
}
