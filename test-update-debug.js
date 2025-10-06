#!/usr/bin/env node

/**
 * Debug script to test output injection
 */

import fs from 'fs/promises'
import { extractCodeBlocks } from './packages/mdxe/src/cli/utils/mdx-parser.ts'
import { executeCodeBlock } from './packages/mdxe/src/cli/utils/execution-engine.ts'
import { injectOutputs } from './packages/mdxe/src/cli/utils/output-injector.ts'

const filePath = 'tests/runtime/update-test.mdx'

// Read MDX file
const mdxContent = await fs.readFile(filePath, 'utf-8')
const codeBlocks = extractCodeBlocks(mdxContent)

// Find first test block
const testBlock = codeBlocks.find(block => block.meta?.includes('assert'))

console.log('Original code:')
console.log(testBlock.value)
console.log('\n---\n')

// Execute block
const result = await executeCodeBlock(testBlock, {
  fileId: filePath,
  executionContext: 'test'
})

console.log('Execution result:')
console.log('- Success:', result.success)
console.log('- Statement captures:', result.statementCaptures?.length || 0)

if (result.statementCaptures) {
  console.log('\nCaptures:')
  for (const capture of result.statementCaptures) {
    console.log(`  - Line ${capture.line}: ${capture.type} =`, JSON.stringify(capture.output))
  }
}

if (result.statementCaptures && result.statementCaptures.length > 0) {
  console.log('\n---\n')
  console.log('Injected code:')
  const injected = injectOutputs(testBlock.value, result.statementCaptures, {
    compact: true,
    maxLength: 80
  })
  console.log(injected)
}
