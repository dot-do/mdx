#!/usr/bin/env tsx
/**
 * Batch Enrichment Script
 *
 * Enrich mdxdb collections with semantic or AI-powered enrichment.
 *
 * Usage:
 *   pnpm tsx enrich.ts --collection Apps --type semantic
 *   pnpm tsx enrich.ts --collection Verbs --type ai --limit 10
 *   pnpm tsx enrich.ts --collection Apps --type ai --force
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { semanticEnricher, createAIEnricher, type EnrichmentOptions } from './src/enrichment/index.js'
import type { CollectionEntity } from './src/schemas.js'
import { ensureAuthenticated } from './src/utils/auth.js'

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options: any = {
    collection: 'Apps',
    type: 'semantic',
    limit: undefined,
    force: false,
    dryRun: false,
    verbose: false,
    skipEnriched: true,
    skipAuth: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--collection':
      case '-c':
        options.collection = args[++i]
        break

      case '--type':
      case '-t':
        options.type = args[++i]
        break

      case '--limit':
      case '-l':
        options.limit = parseInt(args[++i], 10)
        break

      case '--force':
      case '-f':
        options.force = true
        options.skipEnriched = false
        break

      case '--dry-run':
      case '-d':
        options.dryRun = true
        break

      case '--verbose':
      case '-v':
        options.verbose = true
        break

      case '--skip-auth':
        options.skipAuth = true
        break

      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
    }
  }

  return options
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Batch Enrichment Script

Usage:
  pnpm tsx enrich.ts [options]

Options:
  -c, --collection <name>   Collection to enrich (default: Apps)
                            Available: Apps, Verbs, Dispositions, EventTypes
  -t, --type <type>         Enrichment type (default: semantic)
                            Available: semantic, ai
  -l, --limit <number>      Maximum entities to process
  -f, --force               Force re-enrichment of already enriched entities
  -d, --dry-run             Don't save changes, just show what would be done
  -v, --verbose             Verbose logging
      --skip-auth           Skip OAuth authentication (uses API key fallback)
  -h, --help                Show this help message

Examples:
  # Semantic enrichment of first 10 Apps
  pnpm tsx enrich.ts -c Apps -t semantic -l 10 -v

  # AI enrichment of all Verbs (uses OAuth via cli.do)
  pnpm tsx enrich.ts -c Verbs -t ai -v

  # Force re-enrichment of Apps with AI
  pnpm tsx enrich.ts -c Apps -t ai -f -v

  # Dry run to see what would be changed
  pnpm tsx enrich.ts -c Apps -t semantic -d -v

  # AI enrichment with API key fallback
  OPENAI_API_KEY=sk-... pnpm tsx enrich.ts -c Apps -t ai --skip-auth

Authentication:
  AI enrichment uses OAuth via cli.do for secure authentication.
  Run 'cli.do login' before using AI enrichment.
  Use --skip-auth to bypass OAuth and use OPENAI_API_KEY instead.

AI Service:
  AI enrichment uses GPT-5 (o1 model) via https://ai.do
  Background mode enabled by default for 50% discount (flex tier)
  `)
}

/**
 * Load entities from collection directory
 */
async function loadEntities(collection: string, dbDir: string): Promise<CollectionEntity[]> {
  const collectionDir = path.join(dbDir, collection)
  const entities: CollectionEntity[] = []

  try {
    const subdirs = await fs.readdir(collectionDir, { withFileTypes: true })

    for (const dirent of subdirs) {
      if (!dirent.isDirectory()) continue

      const readmePath = path.join(collectionDir, dirent.name, 'readme.mdx')

      try {
        const content = await fs.readFile(readmePath, 'utf-8')
        const { data: frontmatter, content: markdown } = matter(content)

        // Ensure collection field is set
        if (!frontmatter.collection) {
          frontmatter.collection = collection
        }

        entities.push(frontmatter as CollectionEntity)
      } catch (error) {
        console.warn(`  ⚠️  Failed to read ${readmePath}:`, error)
      }
    }
  } catch (error) {
    console.error(`❌ Failed to read collection directory: ${collectionDir}`)
    throw error
  }

  return entities
}

/**
 * Save enriched entity to file
 */
async function saveEntity(entity: CollectionEntity, dbDir: string): Promise<void> {
  const collectionDir = path.join(dbDir, entity.collection)
  const entityDir = path.join(collectionDir, entity.id)
  const readmePath = path.join(entityDir, 'readme.mdx')

  try {
    // Read existing file to preserve content
    const existingContent = await fs.readFile(readmePath, 'utf-8')
    const { content: markdown } = matter(existingContent)

    // Create new MDX with enriched frontmatter
    const mdxContent = matter.stringify(markdown, entity)

    // Write back to file
    await fs.writeFile(readmePath, mdxContent, 'utf-8')
  } catch (error) {
    console.error(`❌ Failed to save ${readmePath}:`, error)
    throw error
  }
}

/**
 * Main enrichment function
 */
async function main() {
  const options = parseArgs()

  console.log('🚀 Batch Enrichment Pipeline')
  console.log(`   Collection: ${options.collection}`)
  console.log(`   Type: ${options.type}`)
  console.log(`   Limit: ${options.limit || 'None'}`)
  console.log(`   Force: ${options.force}`)
  console.log(`   Dry Run: ${options.dryRun}`)
  console.log()

  // Get enricher
  let enricher
  if (options.type === 'semantic') {
    enricher = semanticEnricher
    console.log('📝 Using Semantic Enrichment (automated, no API calls)')
  } else if (options.type === 'ai') {
    // Check authentication for AI enrichment
    const authenticated = await ensureAuthenticated(options.skipAuth)
    if (!authenticated) {
      console.error('❌ Authentication failed')
      process.exit(1)
    }

    enricher = createAIEnricher()
    console.log('🤖 Using AI Enrichment (o1 model via https://ai.do)')
    console.log('   Background mode enabled for 50% discount (flex tier)')
  } else {
    console.error(`❌ Unknown enrichment type: ${options.type}`)
    process.exit(1)
  }

  console.log()

  // Load entities
  const dbDir = path.join(process.cwd(), 'db')
  console.log(`📥 Loading entities from ${dbDir}...`)

  const entities = await loadEntities(options.collection, dbDir)
  console.log(`   Found ${entities.length} entities`)

  if (entities.length === 0) {
    console.log('✅ No entities to process')
    return
  }

  // Enrich entities
  console.log()
  console.log(`🔄 Enriching entities...`)
  console.log()

  const enrichmentOptions: EnrichmentOptions = {
    skipEnriched: options.skipEnriched,
    dryRun: options.dryRun,
    verbose: options.verbose,
    limit: options.limit,
    force: options.force,
  }

  const { results, summary } = await enricher.enrichBatch(entities, enrichmentOptions)

  // Save enriched entities (unless dry run)
  if (!options.dryRun) {
    console.log()
    console.log(`💾 Saving enriched entities...`)

    let saved = 0
    for (const result of results) {
      if (result.enriched) {
        try {
          await saveEntity(result.entity, dbDir)
          saved++

          if (options.verbose && saved % 10 === 0) {
            console.log(`   Saved ${saved}/${summary.enriched}`)
          }
        } catch (error) {
          console.error(`   ❌ Failed to save ${result.entity.id}`)
        }
      }
    }

    console.log(`   ✅ Saved ${saved} entities`)
  }

  // Print summary
  console.log()
  console.log('📊 Enrichment Summary')
  console.log(`   Total: ${summary.total}`)
  console.log(`   Enriched: ${summary.enriched}`)
  console.log(`   Skipped: ${summary.skipped}`)
  console.log(`   Errors: ${summary.errors}`)
  console.log(`   Total Changes: ${summary.totalChanges}`)
  console.log(`   Duration: ${summary.duration}ms`)
  console.log(`   Avg Duration: ${Math.round(summary.avgDuration)}ms per entity`)

  // Print sample changes
  if (options.verbose) {
    console.log()
    console.log('📝 Sample Changes:')
    const samplesWithChanges = results.filter(r => r.changes.length > 0).slice(0, 5)

    for (const result of samplesWithChanges) {
      console.log(`   ${result.entity.id}:`)
      for (const change of result.changes) {
        console.log(`     - ${change}`)
      }
    }
  }

  // Print errors
  if (summary.errors > 0) {
    console.log()
    console.log('❌ Errors:')
    const errorsResults = results.filter(r => r.errors.length > 0).slice(0, 10)

    for (const result of errorsResults) {
      console.log(`   ${result.entity.id}:`)
      for (const error of result.errors) {
        console.log(`     - ${error}`)
      }
    }
  }

  console.log()
  console.log('✅ Enrichment complete!')

  // Exit with error code if there were errors
  process.exit(summary.errors > 0 ? 1 : 0)
}

// Run main
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
