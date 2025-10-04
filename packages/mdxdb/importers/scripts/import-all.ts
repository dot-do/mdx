#!/usr/bin/env tsx
/**
 * Import All Collections
 *
 * Executable script to import data from all sources into collections.
 */

import { createPipelineConfig, runImportPipeline } from '../src/index.js'
import path from 'node:path'

/**
 * Main import function
 */
async function main() {
  console.log('🚀 mdxdb Import Pipeline')
  console.log('=' .repeat(50))
  console.log()

  // Parse command line arguments
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const skipExisting = args.includes('--skip-existing')
  const verbose = args.includes('--verbose') || args.includes('-v')
  const mapping = args.find(arg => arg.startsWith('--mapping='))?.split('=')[1]

  // Determine output directory
  const outputDir = process.env.OUTPUT_DIR || path.join(process.cwd(), '../../../db')

  console.log('Configuration:')
  console.log(`  Output Directory: ${outputDir}`)
  console.log(`  Dry Run: ${dryRun ? 'Yes' : 'No'}`)
  console.log(`  Skip Existing: ${skipExisting ? 'Yes' : 'No'}`)
  console.log(`  Verbose: ${verbose ? 'Yes' : 'No'}`)
  if (mapping) {
    console.log(`  Mapping Filter: ${mapping}`)
  }
  console.log()

  // Create pipeline configuration
  const config = createPipelineConfig(outputDir)

  // Update options from CLI args
  config.options = {
    ...config.options,
    dryRun,
    skipExisting,
    verbose,
  }

  // Filter mappings if requested
  if (mapping) {
    config.mappings = config.mappings.filter(m => m.id === mapping)

    if (config.mappings.length === 0) {
      console.error(`❌ No mapping found with id: ${mapping}`)
      console.log('\nAvailable mappings:')
      createPipelineConfig(outputDir).mappings.forEach(m => {
        console.log(`  - ${m.id}`)
      })
      process.exit(1)
    }
  }

  try {
    // Execute pipeline
    const result = await runImportPipeline(config)

    // Print summary
    console.log()
    console.log('=' .repeat(50))
    console.log('📊 Import Summary')
    console.log('=' .repeat(50))
    console.log()
    console.log(`Total Duration: ${(result.duration / 1000).toFixed(2)}s`)
    console.log()
    console.log('Results by Mapping:')
    result.results.forEach(r => {
      console.log(`\n  ${r.mappingId} → ${r.collection}`)
      console.log(`    Processed: ${r.processed}`)
      console.log(`    Created: ${r.created}`)
      console.log(`    Updated: ${r.updated}`)
      console.log(`    Skipped: ${r.skipped}`)
      console.log(`    Errors: ${r.errors}`)
      console.log(`    Duration: ${(r.duration / 1000).toFixed(2)}s`)

      if (r.errors > 0 && r.errorDetails && r.errorDetails.length > 0) {
        console.log('\n    Error Details:')
        r.errorDetails.slice(0, 5).forEach(e => {
          console.log(`      - ${e.error}`)
        })
        if (r.errorDetails.length > 5) {
          console.log(`      ... and ${r.errorDetails.length - 5} more errors`)
        }
      }
    })

    console.log()
    console.log('Overall Totals:')
    console.log(`  Total Processed: ${result.totalProcessed}`)
    console.log(`  Total Created: ${result.totalCreated}`)
    console.log(`  Total Updated: ${result.totalUpdated}`)
    console.log(`  Total Errors: ${result.totalErrors}`)
    console.log()

    if (result.success) {
      console.log('✅ Import completed successfully!')
    } else {
      console.log('❌ Import completed with errors')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { main }
