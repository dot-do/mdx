/**
 * Thing Mapping Types
 *
 * Defines the mapping layer between data sources and database collections.
 * Sources define where data comes from, Things define how to transform it.
 */

/**
 * Source Definition
 *
 * Describes a data source (API, file, database) that provides raw data.
 */
export interface SourceDefinition {
  /** Unique source identifier (e.g., 'onet', 'naics', 'schema-org') */
  id: string

  /** Human-readable name */
  name: string

  /** Where the data comes from */
  endpoint: string

  /** Data format (TSV, JSON, MDX, etc.) */
  format: 'TSV' | 'CSV' | 'JSON' | 'JSON-LD' | 'MDX' | 'XML'

  /** How often data updates */
  updateFrequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'

  /** Authentication requirements (if any) */
  authentication?: 'none' | 'api-key' | 'oauth' | 'basic'

  /** Source metadata */
  metadata?: {
    version?: string
    license?: string
    authority?: string
  }
}

/**
 * Collection Configuration
 *
 * Defines a target collection where data will be stored.
 */
export interface CollectionConfig {
  /** Collection name (e.g., 'Occupations', 'Tasks', 'Industries') */
  name: string

  /** Output directory path */
  path: string

  /** Expected number of items (for progress tracking) */
  expectedCount?: number

  /** Collection description */
  description?: string
}

/**
 * Transform Function
 *
 * Converts source data into collection format.
 */
export interface TransformFunction<TSource = any, TTarget = any> {
  /** Transform source row/record to target format */
  (sourceData: TSource, context?: TransformContext): TTarget | Promise<TTarget>
}

/**
 * Transform Context
 *
 * Additional data available during transformation.
 */
export interface TransformContext {
  /** Source definition */
  source: SourceDefinition

  /** Target collection */
  collection: CollectionConfig

  /** All source data (for lookups) */
  allData?: Map<string, any>

  /** Progress callback */
  onProgress?: (current: number, total: number) => void
}

/**
 * Thing Mapping
 *
 * Maps a data source to one or more collections with transform logic.
 */
export interface ThingMapping<TSource = any, TTarget = any> {
  /** Unique mapping identifier */
  id: string

  /** Source identifier (references SourceDefinition.id) */
  sourceId: string

  /** Target collection name */
  collection: string

  /** Filter function (which source records to process) */
  filter?: (data: TSource) => boolean

  /** Transform function (how to convert data) */
  transform: TransformFunction<TSource, TTarget>

  /** Relationships to other collections */
  relationships?: RelationshipDefinition[]

  /** Post-processing hooks */
  hooks?: {
    beforeTransform?: (data: TSource) => TSource | Promise<TSource>
    afterTransform?: (data: TTarget) => TTarget | Promise<TTarget>
    onError?: (error: Error, data: TSource) => void
  }
}

/**
 * Relationship Definition
 *
 * Defines how collections relate to each other.
 */
export interface RelationshipDefinition {
  /** Relationship type */
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'

  /** Target collection name */
  targetCollection: string

  /** Foreign key field */
  foreignKey: string

  /** How to resolve the relationship */
  resolve?: (sourceData: any, targetData: any) => boolean
}

/**
 * Collection Item
 *
 * Standard structure for items in collections.
 */
export interface CollectionItem {
  /** URL-friendly identifier */
  slug: string

  /** Frontmatter (YAML metadata) */
  frontmatter: Record<string, any>

  /** Markdown content */
  content: string

  /** Collection name */
  collection: string

  /** Source identifier */
  source: string
}

/**
 * Import Pipeline Configuration
 *
 * Complete configuration for import pipeline.
 */
export interface ImportPipelineConfig {
  /** All source definitions */
  sources: SourceDefinition[]

  /** All collection configurations */
  collections: CollectionConfig[]

  /** All thing mappings */
  mappings: ThingMapping[]

  /** Output directory (root for all collections) */
  outputDir: string

  /** Import options */
  options?: {
    /** Parallel processing */
    parallel?: boolean

    /** Maximum concurrent operations */
    concurrency?: number

    /** Skip existing files */
    skipExisting?: boolean

    /** Dry run (don't write files) */
    dryRun?: boolean

    /** Verbose logging */
    verbose?: boolean
  }
}

/**
 * Import Result
 *
 * Result of an import operation.
 */
export interface ImportResult {
  /** Mapping that was executed */
  mappingId: string

  /** Collection name */
  collection: string

  /** Number of items processed */
  processed: number

  /** Number of items created */
  created: number

  /** Number of items updated */
  updated: number

  /** Number of items skipped */
  skipped: number

  /** Number of errors */
  errors: number

  /** Error details */
  errorDetails?: Array<{
    item: string
    error: string
  }>

  /** Duration in milliseconds */
  duration: number
}

/**
 * Pipeline Result
 *
 * Result of entire pipeline execution.
 */
export interface PipelineResult {
  /** Start time */
  startTime: Date

  /** End time */
  endTime: Date

  /** Total duration in milliseconds */
  duration: number

  /** Results for each mapping */
  results: ImportResult[]

  /** Total items processed */
  totalProcessed: number

  /** Total items created */
  totalCreated: number

  /** Total items updated */
  totalUpdated: number

  /** Total errors */
  totalErrors: number

  /** Success status */
  success: boolean
}

/**
 * Slug Generator
 *
 * Generates URL-friendly slugs from titles/names.
 */
export interface SlugGenerator {
  /** Generate slug from text */
  generate(text: string, options?: SlugOptions): string

  /** Check if slug is valid */
  isValid(slug: string): boolean
}

/**
 * Slug Options
 */
export interface SlugOptions {
  /** Maximum length */
  maxLength?: number

  /** Separator character */
  separator?: string

  /** Allow Unicode characters */
  allowUnicode?: boolean
}

/**
 * Frontmatter Generator
 *
 * Generates YAML frontmatter for MDX files.
 */
export interface FrontmatterGenerator {
  /** Generate frontmatter from data */
  generate(data: Record<string, any>): string

  /** Parse frontmatter from string */
  parse(frontmatter: string): Record<string, any>
}

/**
 * Content Generator
 *
 * Generates markdown content.
 */
export interface ContentGenerator {
  /** Generate content from data */
  generate(data: Record<string, any>, template?: string): string
}

/**
 * File Writer
 *
 * Writes MDX files to filesystem.
 */
export interface FileWriter {
  /** Write collection item to file */
  write(item: CollectionItem, outputPath: string): Promise<void>

  /** Check if file exists */
  exists(outputPath: string): Promise<boolean>

  /** Read existing file */
  read(outputPath: string): Promise<CollectionItem>
}
