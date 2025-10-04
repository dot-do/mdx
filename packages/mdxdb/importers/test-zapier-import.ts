import { createPipelineConfig } from './src/mappings.js'
import { runImportPipeline } from './src/pipeline.js'

// Create config with Zapier Apps only
const config = createPipelineConfig('./db')

// Filter to just Zapier Apps mapping
config.mappings = config.mappings.filter(m => m.id === 'zapier-apps')

console.log('Testing Zapier Apps import (limited to first page)...')

const result = await runImportPipeline(config)

console.log('\n📊 Results:')
console.log(`  Total Processed: ${result.totalProcessed}`)
console.log(`  Total Created: ${result.totalCreated}`)
console.log(`  Total Updated: ${result.totalUpdated}`)
console.log(`  Total Errors: ${result.totalErrors}`)
console.log(`  Duration: ${result.duration}ms`)

process.exit(result.success ? 0 : 1)
