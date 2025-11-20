/**
 * Document Test Runner - Execute literate tests and update MDX with outputs
 */

import fs from 'fs/promises'
import path from 'path'
import { extractCodeBlocks } from '../utils/mdx-parser'
import { executeCodeBlock } from '../utils/execution-engine'
import { injectOutputs, updateMdxWithOutputs } from '../utils/output-injector'

export interface TestDocOptions {
  update?: boolean
  verbose?: boolean
  skipAuth?: boolean
}

export interface TestResult {
  file: string
  blocks: number
  passed: number
  failed: number
  assertions: number
  assertionsPassed: number
  assertionsFailed: number
}

/**
 * Run document tests on MDX files
 */
export async function runDocumentTests(
  files: string[],
  options: TestDocOptions = {}
): Promise<TestResult[]> {
  const results: TestResult[] = []

  for (const file of files) {
    const result = await runDocumentTest(file, options)
    results.push(result)
  }

  return results
}

/**
 * Run document test on a single MDX file
 */
export async function runDocumentTest(
  filePath: string,
  options: TestDocOptions = {}
): Promise<TestResult> {
  const { update = false, verbose = false } = options

  // Read MDX file
  const mdxContent = await fs.readFile(filePath, 'utf-8')
  const codeBlocks = extractCodeBlocks(mdxContent)

  // Filter blocks with doc or assert meta tags
  const testBlocks = codeBlocks.filter(
    block => block.meta?.includes('doc') || block.meta?.includes('assert')
  )

  const result: TestResult = {
    file: filePath,
    blocks: testBlocks.length,
    passed: 0,
    failed: 0,
    assertions: 0,
    assertionsPassed: 0,
    assertionsFailed: 0
  }

  let updatedContent = mdxContent

  // Execute each test block
  for (let i = 0; i < testBlocks.length; i++) {
    const block = testBlocks[i]

    if (verbose) {
      console.log(`\n[${i + 1}/${testBlocks.length}] Executing block with meta: ${block.meta}`)
    }

    try {
      const execResult = await executeCodeBlock(block, {
        fileId: filePath,
        executionContext: 'test'
      })

      if (execResult.success) {
        result.passed++

        // Count assertions
        if (execResult.statementCaptures) {
          for (const capture of execResult.statementCaptures) {
            if (capture.type === 'assertion') {
              result.assertions++
              if (capture.assertionPassed) {
                result.assertionsPassed++
              } else {
                result.assertionsFailed++
              }
            }
          }
        }

        // Inject outputs back into code if update flag is set
        if (update && execResult.statementCaptures && execResult.statementCaptures.length > 0) {
          const updatedCode = injectOutputs(block.value, execResult.statementCaptures, {
            compact: true,
            maxLength: 80
          })

          // Find the block index in the original MDX
          const blockIndex = codeBlocks.indexOf(block)
          updatedContent = updateMdxWithOutputs(updatedContent, blockIndex, updatedCode)

          if (verbose) {
            console.log('  ✅ Outputs injected')
          }
        }
      } else {
        result.failed++
        if (verbose) {
          console.log(`  ❌ Execution failed: ${execResult.error}`)
        }
      }
    } catch (error) {
      result.failed++
      if (verbose) {
        console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  // Write updated content back to file if update flag is set
  if (update && updatedContent !== mdxContent) {
    await fs.writeFile(filePath, updatedContent, 'utf-8')
    if (verbose) {
      console.log(`\n✅ Updated ${filePath}`)
    }
  }

  return result
}

/**
 * Format test results for display
 */
export function formatTestResults(results: TestResult[]): string {
  const lines: string[] = []

  lines.push('\n📊 Document Test Results\n')

  for (const result of results) {
    const fileName = path.basename(result.file)
    const passRate = result.blocks > 0 ? Math.round((result.passed / result.blocks) * 100) : 0
    const assertionRate = result.assertions > 0
      ? Math.round((result.assertionsPassed / result.assertions) * 100)
      : 100

    lines.push(`📄 ${fileName}`)
    lines.push(`   Blocks: ${result.passed}/${result.blocks} passed (${passRate}%)`)

    if (result.assertions > 0) {
      lines.push(`   Assertions: ${result.assertionsPassed}/${result.assertions} passed (${assertionRate}%)`)
    }

    if (result.failed > 0) {
      lines.push(`   ❌ ${result.failed} block(s) failed`)
    }

    lines.push('')
  }

  // Summary
  const totalBlocks = results.reduce((sum, r) => sum + r.blocks, 0)
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0)
  const totalAssertions = results.reduce((sum, r) => sum + r.assertions, 0)
  const totalAssertionsPassed = results.reduce((sum, r) => sum + r.assertionsPassed, 0)

  if (totalBlocks > 0) {
    const overallRate = Math.round((totalPassed / totalBlocks) * 100)
    lines.push(`\n📊 Overall: ${totalPassed}/${totalBlocks} blocks passed (${overallRate}%)`)

    if (totalAssertions > 0) {
      const assertionRate = Math.round((totalAssertionsPassed / totalAssertions) * 100)
      lines.push(`📊 Assertions: ${totalAssertionsPassed}/${totalAssertions} passed (${assertionRate}%)`)
    }
  }

  return lines.join('\n')
}

/**
 * CLI command handler
 */
export async function runTestDocCommand(args: {
  files: string[]
  update?: boolean
  verbose?: boolean
  skipAuth?: boolean
}) {
  const { files, update, verbose, skipAuth } = args

  if (files.length === 0) {
    console.error('❌ No files specified')
    console.log('\nUsage: mdxe test:doc <file.mdx> [options]')
    console.log('\nOptions:')
    console.log('  --update    Update MDX files with captured outputs')
    console.log('  --verbose   Show detailed execution logs')
    console.log('  --skip-auth Skip authentication')
    process.exit(1)
  }

  console.log('🧪 Running document tests...\n')

  const results = await runDocumentTests(files, {
    update,
    verbose,
    skipAuth
  })

  console.log(formatTestResults(results))

  // Exit with error code if any tests failed
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
  if (totalFailed > 0) {
    process.exit(1)
  }
}
