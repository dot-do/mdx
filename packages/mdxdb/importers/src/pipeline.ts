/**
 * Import Pipeline
 *
 * Orchestrates data import from sources to collections.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import type {
  ImportPipelineConfig,
  ThingMapping,
  SourceDefinition,
  CollectionConfig,
  CollectionItem,
  ImportResult,
  PipelineResult,
  SlugOptions,
} from './types.js'

/**
 * Import Pipeline
 *
 * Main class for orchestrating imports.
 */
export class ImportPipeline {
  constructor(private config: ImportPipelineConfig) {}

  /**
   * Execute the entire pipeline
   */
  async execute(): Promise<PipelineResult> {
    const startTime = new Date()
    const results: ImportResult[] = []

    console.log('🚀 Starting import pipeline...')
    console.log(`   Sources: ${this.config.sources.length}`)
    console.log(`   Collections: ${this.config.collections.length}`)
    console.log(`   Mappings: ${this.config.mappings.length}`)
    console.log()

    // Create output directory
    await fs.mkdir(this.config.outputDir, { recursive: true })

    // Execute each mapping
    for (const mapping of this.config.mappings) {
      const result = await this.executeMapping(mapping)
      results.push(result)
    }

    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()

    // Calculate totals
    const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0)
    const totalCreated = results.reduce((sum, r) => sum + r.created, 0)
    const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0)

    return {
      startTime,
      endTime,
      duration,
      results,
      totalProcessed,
      totalCreated,
      totalUpdated,
      totalErrors,
      success: totalErrors === 0,
    }
  }

  /**
   * Execute a single mapping
   */
  private async executeMapping(mapping: ThingMapping): Promise<ImportResult> {
    const startTime = Date.now()
    const result: ImportResult = {
      mappingId: mapping.id,
      collection: mapping.collection,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [],
      duration: 0,
    }

    console.log(`📦 Processing mapping: ${mapping.id} → ${mapping.collection}`)

    try {
      // Get source definition
      const source = this.config.sources.find(s => s.id === mapping.sourceId)
      if (!source) {
        throw new Error(`Source not found: ${mapping.sourceId}`)
      }

      // Get collection config
      const collection = this.config.collections.find(c => c.name === mapping.collection)
      if (!collection) {
        throw new Error(`Collection not found: ${mapping.collection}`)
      }

      // Load source data (pass collection name for O*NET to select correct dataset)
      const sourceData = await this.loadSourceData(source, mapping.collection)

      // Filter data if filter function provided
      const filteredData = mapping.filter ? sourceData.filter(mapping.filter) : sourceData

      console.log(`   Found ${filteredData.length} items to process`)

      // Transform and write each item
      for (const item of filteredData) {
        result.processed++

        try {
          // Before transform hook
          let processedItem = item
          if (mapping.hooks?.beforeTransform) {
            processedItem = await mapping.hooks.beforeTransform(item)
          }

          // Transform
          const transformed = await mapping.transform(processedItem, {
            source,
            collection,
          })

          // After transform hook
          let finalItem = transformed
          if (mapping.hooks?.afterTransform) {
            finalItem = await mapping.hooks.afterTransform(transformed)
          }

          // Write to file
          const collectionItem = this.toCollectionItem(finalItem, mapping)
          const written = await this.writeCollectionItem(collectionItem, collection)

          if (written === 'created') {
            result.created++
          } else if (written === 'updated') {
            result.updated++
          } else {
            result.skipped++
          }
        } catch (error) {
          result.errors++
          const errorMessage = error instanceof Error ? error.message : String(error)
          result.errorDetails?.push({
            item: JSON.stringify(item).substring(0, 100),
            error: errorMessage,
          })

          if (mapping.hooks?.onError) {
            mapping.hooks.onError(error as Error, item)
          }

          if (this.config.options?.verbose) {
            console.error(`   ❌ Error processing item:`, errorMessage)
          }
        }

        // Progress logging
        if (result.processed % 100 === 0) {
          console.log(
            `   Progress: ${result.processed}/${filteredData.length} (${result.created} created, ${result.updated} updated, ${result.errors} errors)`
          )
        }
      }

      console.log(
        `   ✅ Complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`
      )
    } catch (error) {
      console.error(`   ❌ Mapping failed:`, error)
      result.errors++
    }

    result.duration = Date.now() - startTime
    console.log()

    return result
  }

  /**
   * Load data from a source
   */
  private async loadSourceData(source: SourceDefinition, collection?: string): Promise<any[]> {
    // Import loaders dynamically
    const { loadSourceData } = await import('./loaders.js')

    // Load with default paths
    return await loadSourceData(source, {
      dataDir: source.id === 'onet' ? './data/onet' :
               source.id === 'schema-org' ? '/Users/nathanclevenger/Projects/.do/mdx/schema.org' :
               undefined,
      filePath: source.id === 'naics' ? '/Users/nathanclevenger/Projects/.do/mdx/config/datasets/naics.tsv' : undefined,
      collection,
    })
  }

  /**
   * Convert transformed data to CollectionItem
   */
  private toCollectionItem(data: any, mapping: ThingMapping): CollectionItem {
    return {
      slug: data.slug || this.generateSlug(data.title || data.name),
      frontmatter: data.frontmatter || data,
      content: data.content || '',
      collection: mapping.collection,
      source: mapping.sourceId,
    }
  }

  /**
   * Write collection item to file
   */
  private async writeCollectionItem(
    item: CollectionItem,
    collection: CollectionConfig
  ): Promise<'created' | 'updated' | 'skipped'> {
    const outputPath = path.join(
      this.config.outputDir,
      collection.name,
      item.slug,
      'readme.mdx'
    )

    // Check if file exists
    const exists = await this.fileExists(outputPath)

    // Skip if exists and skipExisting is true
    if (exists && this.config.options?.skipExisting) {
      return 'skipped'
    }

    // Dry run - don't write
    if (this.config.options?.dryRun) {
      return exists ? 'updated' : 'created'
    }

    // Create directory
    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    // Generate MDX content
    const mdxContent = matter.stringify(item.content, item.frontmatter)

    // Write file
    await fs.writeFile(outputPath, mdxContent, 'utf-8')

    return exists ? 'updated' : 'created'
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Generate URL-friendly slug (Wikipedia-style)
   *
   * Preserves Title Case and replaces spaces with underscores
   * Example: "Software Developers, Applications" -> "Software_Developers_Applications"
   */
  private generateSlug(text: string, options?: SlugOptions): string {
    // Replace spaces with underscores
    let slug = text.replace(/\s+/g, '_')

    // Remove or replace other URL-unsafe characters
    slug = slug.replace(/[,\/\\]/g, '') // Remove commas, slashes
    slug = slug.replace(/[()]/g, '') // Remove parentheses
    slug = slug.replace(/&/g, 'and') // Replace ampersand
    slug = slug.replace(/_+/g, '_') // Collapse multiple underscores
    slug = slug.replace(/^_|_$/g, '') // Remove leading/trailing underscores

    if (options?.maxLength) {
      slug = slug.substring(0, options.maxLength)
    }

    return slug
  }
}

/**
 * Create and execute an import pipeline
 */
export async function runImportPipeline(config: ImportPipelineConfig): Promise<PipelineResult> {
  const pipeline = new ImportPipeline(config)
  return await pipeline.execute()
}

/**
 * Helper: Create collection directory with index
 */
export async function createCollectionIndex(
  collectionName: string,
  outputDir: string,
  items: Array<{ slug: string; title: string }>
): Promise<void> {
  const indexPath = path.join(outputDir, collectionName, 'readme.mdx')

  const frontmatter = {
    title: collectionName,
    description: `Collection of ${items.length} ${collectionName.toLowerCase()}`,
    collection: collectionName,
    count: items.length,
  }

  const content = `
# ${collectionName}

This collection contains **${items.length} ${collectionName.toLowerCase()}**.

## Items

${items.map(item => `- [[${item.slug}|${item.title}]]`).join('\n')}
`.trim()

  const mdxContent = matter.stringify(content, frontmatter)

  await fs.mkdir(path.dirname(indexPath), { recursive: true })
  await fs.writeFile(indexPath, mdxContent, 'utf-8')
}
