#!/usr/bin/env node

/**
 * Simple test script for literate testing
 */

import { runDocumentTests, formatTestResults } from './packages/mdxe/src/cli/commands/test-doc.ts'

const args = process.argv.slice(2)
const files = args.filter(arg => !arg.startsWith('--'))
const update = args.includes('--update')
const verbose = args.includes('--verbose')
const skipAuth = args.includes('--skip-auth')

if (files.length === 0) {
  console.log('Usage: node test-literate.js <file.mdx> [--update] [--verbose] [--skip-auth]')
  process.exit(1)
}

console.log('🧪 Running document tests...\n')

runDocumentTests(files, { update, verbose, skipAuth })
  .then(results => {
    console.log(formatTestResults(results))

    // Exit with error code if any tests failed
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
    if (totalFailed > 0) {
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
