import { createPipelineConfig } from './src/mappings.js'
import { runImportPipeline } from './src/pipeline.js'

// Create config with GS1 sources only
const config = createPipelineConfig('./db')

// Filter to just GS1 mappings
config.mappings = config.mappings.filter(m => m.id.startsWith('gs1-'))

console.log('Testing GS1 imports...')
console.log('Mappings:', config.mappings.map(m => m.id))

const result = await runImportPipeline(config)

console.log('\n📊 Results:')
console.log(`  Total Processed: ${result.totalProcessed}`)
console.log(`  Total Created: ${result.totalCreated}`)
console.log(`  Total Updated: ${result.totalUpdated}`)
console.log(`  Total Errors: ${result.totalErrors}`)
console.log(`  Duration: ${result.duration}ms`)

process.exit(result.success ? 0 : 1)
