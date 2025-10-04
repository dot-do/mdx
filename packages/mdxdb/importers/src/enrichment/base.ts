/**
 * Base Enrichment Service
 *
 * Foundation for all enrichment operations on mdxdb collections.
 */

import type { CollectionEntity } from '../schemas.js'

/**
 * Enrichment result
 */
export interface EnrichmentResult {
  entity: CollectionEntity
  enriched: boolean
  changes: string[]
  errors: string[]
  duration: number
}

/**
 * Enrichment options
 */
export interface EnrichmentOptions {
  /**
   * Skip entities that are already enriched
   */
  skipEnriched?: boolean

  /**
   * Dry run - don't save changes
   */
  dryRun?: boolean

  /**
   * Verbose logging
   */
  verbose?: boolean

  /**
   * Maximum entities to process
   */
  limit?: number

  /**
   * Force re-enrichment even if already enriched
   */
  force?: boolean
}

/**
 * Base enrichment service
 */
export abstract class EnrichmentService {
  /**
   * Service name
   */
  abstract name: string

  /**
   * Service version
   */
  abstract version: string

  /**
   * Enrich a single entity
   */
  abstract enrichEntity(entity: CollectionEntity, options?: EnrichmentOptions): Promise<EnrichmentResult>

  /**
   * Check if entity needs enrichment
   */
  protected needsEnrichment(entity: CollectionEntity, options?: EnrichmentOptions): boolean {
    // Force re-enrichment
    if (options?.force) return true

    // Skip if already enriched and not forcing
    if (options?.skipEnriched && entity.aiEnriched) return false

    // Check if version changed
    if (entity.enrichmentVersion && entity.enrichmentVersion !== this.version) {
      return true
    }

    // Not enriched yet
    return !entity.aiEnriched
  }

  /**
   * Mark entity as enriched
   */
  protected markEnriched(entity: CollectionEntity): CollectionEntity {
    return {
      ...entity,
      aiEnriched: true,
      lastEnriched: new Date().toISOString(),
      enrichmentVersion: this.version,
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Log enrichment progress
   */
  protected log(message: string, verbose?: boolean): void {
    if (verbose) {
      console.log(`[${this.name}] ${message}`)
    }
  }

  /**
   * Batch enrich entities
   */
  async enrichBatch(
    entities: CollectionEntity[],
    options?: EnrichmentOptions
  ): Promise<{ results: EnrichmentResult[]; summary: EnrichmentSummary }> {
    const startTime = Date.now()
    const results: EnrichmentResult[] = []

    // Apply limit if specified
    const toProcess = options?.limit ? entities.slice(0, options.limit) : entities

    this.log(`Processing ${toProcess.length} entities...`, options?.verbose)

    for (const entity of toProcess) {
      try {
        const result = await this.enrichEntity(entity, options)
        results.push(result)

        if (options?.verbose && results.length % 10 === 0) {
          this.log(`Progress: ${results.length}/${toProcess.length}`, options?.verbose)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        results.push({
          entity,
          enriched: false,
          changes: [],
          errors: [errorMessage],
          duration: 0,
        })
      }
    }

    const duration = Date.now() - startTime
    const summary = this.summarize(results, duration)

    return { results, summary }
  }

  /**
   * Summarize enrichment results
   */
  protected summarize(results: EnrichmentResult[], duration: number): EnrichmentSummary {
    const enriched = results.filter(r => r.enriched).length
    const skipped = results.filter(r => !r.enriched && r.errors.length === 0).length
    const errors = results.filter(r => r.errors.length > 0).length
    const totalChanges = results.reduce((sum, r) => sum + r.changes.length, 0)

    return {
      total: results.length,
      enriched,
      skipped,
      errors,
      totalChanges,
      duration,
      avgDuration: results.length > 0 ? duration / results.length : 0,
    }
  }
}

/**
 * Enrichment summary
 */
export interface EnrichmentSummary {
  total: number
  enriched: number
  skipped: number
  errors: number
  totalChanges: number
  duration: number
  avgDuration: number
}

/**
 * Helper: Extract keywords from text
 */
export function extractKeywords(text: string, options?: { minLength?: number; maxKeywords?: number }): string[] {
  const minLength = options?.minLength || 3
  const maxKeywords = options?.maxKeywords || 10

  // Common stop words to exclude
  const stopWords = new Set([
    'the',
    'and',
    'for',
    'with',
    'that',
    'this',
    'from',
    'are',
    'has',
    'have',
    'can',
    'will',
    'more',
    'about',
    'into',
    'through',
    'between',
    'when',
    'where',
    'which',
    'what',
    'who',
    'how',
    'all',
    'each',
    'other',
    'some',
    'their',
    'than',
    'them',
    'these',
    'those',
    'such',
    'very',
    'also',
    'been',
    'being',
    'were',
    'your',
  ])

  // Extract words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
    .split(/\s+/)
    .filter(word => word.length >= minLength && !stopWords.has(word))

  // Count frequencies
  const frequencies = new Map<string, number>()
  for (const word of words) {
    frequencies.set(word, (frequencies.get(word) || 0) + 1)
  }

  // Sort by frequency and take top N
  const keywords = Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)

  return keywords
}

/**
 * Helper: Normalize category/tag text
 */
export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Helper: Calculate text complexity score
 */
export function calculateComplexity(text: string): 'simple' | 'moderate' | 'complex' {
  const words = text.split(/\s+/).length
  const sentences = text.split(/[.!?]+/).length

  // Average words per sentence
  const avgWordsPerSentence = words / Math.max(sentences, 1)

  // Simple: short sentences, < 200 words
  if (words < 200 && avgWordsPerSentence < 15) return 'simple'

  // Complex: long text, long sentences
  if (words > 500 || avgWordsPerSentence > 25) return 'complex'

  // Moderate: everything else
  return 'moderate'
}

/**
 * Helper: Infer frequency from text
 */
export function inferFrequency(text: string): 'rare' | 'occasional' | 'frequent' | 'continuous' | undefined {
  const lower = text.toLowerCase()

  if (lower.includes('continuous') || lower.includes('always') || lower.includes('constant')) {
    return 'continuous'
  }

  if (lower.includes('frequent') || lower.includes('often') || lower.includes('regular')) {
    return 'frequent'
  }

  if (lower.includes('occasional') || lower.includes('sometimes') || lower.includes('periodic')) {
    return 'occasional'
  }

  if (lower.includes('rare') || lower.includes('seldom') || lower.includes('infrequent')) {
    return 'rare'
  }

  return undefined
}
