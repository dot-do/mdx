import matter from 'gray-matter'
import {
  CollectionSchema,
  PayloadField,
  validateAgainstSchema,
  loadYamlSchema,
  loadYamlSchemas,
  parseYamlSchema,
} from '@mdxdb/core'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Validation options for Velite integration
 */
export interface ValidationOptions {
  /**
   * Whether to validate MDX files against schema
   * Default: true
   */
  enabled?: boolean

  /**
   * Path to schema definition file or directory
   * Can be a single YAML file or a directory containing multiple YAML files
   */
  schemaPath?: string

  /**
   * Whether to throw errors on validation failure
   * Default: false (only logs warnings)
   */
  strict?: boolean

  /**
   * Whether to log validation results
   * Default: true
   */
  verbose?: boolean

  /**
   * Custom schemas to use instead of loading from files
   */
  schemas?: CollectionSchema[]
}

/**
 * Validation result for a single file
 */
export interface FileValidationResult {
  filePath: string
  collection: string
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validation result for all files
 */
export interface ValidationResult {
  valid: boolean
  totalFiles: number
  validFiles: number
  invalidFiles: number
  fileResults: FileValidationResult[]
  schemasUsed: string[]
}

/**
 * Schema validator for Velite collections
 */
export class VeliteSchemaValidator {
  private schemas: Map<string, CollectionSchema> = new Map()
  private options: Required<ValidationOptions>

  constructor(options: ValidationOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      schemaPath: options.schemaPath || '.db',
      strict: options.strict ?? false,
      verbose: options.verbose ?? true,
      schemas: options.schemas || [],
    }
  }

  /**
   * Load schemas from configured path
   */
  async loadSchemas(): Promise<void> {
    this.schemas.clear()

    // Use provided schemas first
    for (const schema of this.options.schemas) {
      this.schemas.set(schema.slug || schema.name, schema)
    }

    // Load from filesystem if path is provided
    if (this.options.schemaPath) {
      try {
        const stats = await fs.stat(this.options.schemaPath)

        if (stats.isDirectory()) {
          // Load all schemas from directory
          const loadedSchemas = await loadYamlSchemas(this.options.schemaPath)
          for (const schema of loadedSchemas) {
            this.schemas.set(schema.slug || schema.name, schema)
          }
          if (this.options.verbose) {
            console.log(`Loaded ${loadedSchemas.length} schemas from ${this.options.schemaPath}`)
          }
        } else if (stats.isFile()) {
          // Load single schema file
          const schema = await loadYamlSchema(this.options.schemaPath)
          this.schemas.set(schema.slug || schema.name, schema)
          if (this.options.verbose) {
            console.log(`Loaded schema "${schema.name}" from ${this.options.schemaPath}`)
          }
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          console.warn(`Failed to load schemas from ${this.options.schemaPath}:`, error)
        }
      }
    }

    if (this.options.verbose && this.schemas.size > 0) {
      console.log(`Total schemas loaded: ${this.schemas.size}`)
      console.log(`Available collections: ${Array.from(this.schemas.keys()).join(', ')}`)
    }
  }

  /**
   * Get schema for a collection
   */
  getSchema(collectionName: string): CollectionSchema | undefined {
    return this.schemas.get(collectionName)
  }

  /**
   * Check if validation is enabled
   */
  isEnabled(): boolean {
    return this.options.enabled
  }

  /**
   * Validate MDX content against schema
   */
  validateContent(content: string, collectionName: string): FileValidationResult {
    const result: FileValidationResult = {
      filePath: '',
      collection: collectionName,
      valid: true,
      errors: [],
      warnings: [],
    }

    if (!this.options.enabled) {
      return result
    }

    const schema = this.getSchema(collectionName)
    if (!schema) {
      result.warnings.push(`No schema found for collection "${collectionName}"`)
      return result
    }

    // Parse frontmatter from MDX content
    let frontmatter: Record<string, any> = {}
    try {
      const parsed = this.parseFrontmatter(content)
      frontmatter = parsed || {}
    } catch (error) {
      result.errors.push(`Failed to parse frontmatter: ${(error as Error).message}`)
      result.valid = false
      return result
    }

    // Validate frontmatter against schema
    const validation = validateAgainstSchema(frontmatter, schema)
    result.valid = validation.valid
    result.errors = validation.errors

    return result
  }

  /**
   * Validate a single MDX file
   */
  async validateFile(filePath: string, collectionName: string): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      filePath,
      collection: collectionName,
      valid: true,
      errors: [],
      warnings: [],
    }

    if (!this.options.enabled) {
      return result
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const validationResult = this.validateContent(content, collectionName)
      return {
        ...validationResult,
        filePath,
      }
    } catch (error) {
      result.errors.push(`Failed to read file: ${(error as Error).message}`)
      result.valid = false
      return result
    }
  }

  /**
   * Validate all files in a collection
   */
  async validateCollection(
    collectionName: string,
    pattern: string,
    baseDir: string = '.',
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      fileResults: [],
      schemasUsed: [collectionName],
    }

    if (!this.options.enabled) {
      return result
    }

    const schema = this.getSchema(collectionName)
    if (!schema) {
      if (this.options.verbose) {
        console.warn(`No schema found for collection "${collectionName}", skipping validation`)
      }
      return result
    }

    // Find all files matching pattern
    const files = await this.findFiles(pattern, baseDir)
    result.totalFiles = files.length

    // Validate each file
    for (const file of files) {
      const fileResult = await this.validateFile(file, collectionName)
      result.fileResults.push(fileResult)

      if (fileResult.valid) {
        result.validFiles++
      } else {
        result.invalidFiles++
        result.valid = false
      }
    }

    // Log results if verbose
    if (this.options.verbose) {
      this.logValidationResult(result)
    }

    // Throw error if strict mode and validation failed
    if (this.options.strict && !result.valid) {
      throw new Error(
        `Validation failed for collection "${collectionName}": ${result.invalidFiles} of ${result.totalFiles} files have errors`,
      )
    }

    return result
  }

  /**
   * Validate multiple collections
   */
  async validateCollections(
    collections: Array<{ name: string; pattern: string; baseDir?: string }>,
  ): Promise<ValidationResult> {
    const combinedResult: ValidationResult = {
      valid: true,
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      fileResults: [],
      schemasUsed: [],
    }

    for (const collection of collections) {
      const result = await this.validateCollection(collection.name, collection.pattern, collection.baseDir)

      combinedResult.totalFiles += result.totalFiles
      combinedResult.validFiles += result.validFiles
      combinedResult.invalidFiles += result.invalidFiles
      combinedResult.fileResults.push(...result.fileResults)
      combinedResult.schemasUsed.push(...result.schemasUsed)

      if (!result.valid) {
        combinedResult.valid = false
      }
    }

    // Remove duplicate schema names
    combinedResult.schemasUsed = Array.from(new Set(combinedResult.schemasUsed))

    return combinedResult
  }

  /**
   * Parse frontmatter from MDX content
   */
  private parseFrontmatter(content: string): Record<string, any> | null {
    const frontmatterRegex = /^\s*---([\s\S]*?)---/
    const match = content.match(frontmatterRegex)

    if (!match) {
      return {}
    }

    const yamlContent = match[1]

    try {
      const { parse } = require('yaml')
      const frontmatter = parse(yamlContent)
      if (frontmatter === null || frontmatter === undefined) {
        return {}
      }
      if (typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
        throw new Error('Frontmatter must be a YAML object (key-value pairs)')
      }
      return frontmatter as Record<string, any>
    } catch (e: any) {
      throw new Error(`YAML parsing error: ${e.message}`)
    }
  }

  /**
   * Find files matching a glob pattern
   */
  private async findFiles(pattern: string, baseDir: string): Promise<string[]> {
    const micromatch = require('micromatch')
    const files: string[] = []

    const walk = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.relative(baseDir, fullPath)

        if (entry.isDirectory()) {
          await walk(fullPath)
        } else if (entry.isFile()) {
          if (micromatch.isMatch(relativePath, pattern)) {
            files.push(fullPath)
          }
        }
      }
    }

    // Extract base directory from pattern
    const patternParts = pattern.split('/')
    let searchDir = baseDir
    for (const part of patternParts) {
      if (part.includes('*') || part.includes('.')) {
        break
      }
      searchDir = path.join(searchDir, part)
    }

    try {
      await walk(searchDir)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn(`Error walking directory ${searchDir}:`, error)
      }
    }

    return files
  }

  /**
   * Log validation result
   */
  private logValidationResult(result: ValidationResult): void {
    console.log('\n' + '='.repeat(60))
    console.log('Schema Validation Results')
    console.log('='.repeat(60))
    console.log(`Total files: ${result.totalFiles}`)
    console.log(`Valid files: ${result.validFiles}`)
    console.log(`Invalid files: ${result.invalidFiles}`)
    console.log(`Schemas used: ${result.schemasUsed.join(', ')}`)

    if (result.invalidFiles > 0) {
      console.log('\nErrors:')
      for (const fileResult of result.fileResults) {
        if (!fileResult.valid) {
          console.log(`\n  ${fileResult.filePath}:`)
          for (const error of fileResult.errors) {
            console.log(`    - ${error}`)
          }
        }
      }
    }

    if (result.valid) {
      console.log('\n✓ All files passed validation')
    } else {
      console.log('\n✗ Validation failed')
    }
    console.log('='.repeat(60) + '\n')
  }
}

/**
 * Create a Velite plugin for schema validation
 * This can be used in velite.config.ts
 */
export function createValidationPlugin(options: ValidationOptions = {}) {
  const validator = new VeliteSchemaValidator(options)

  return {
    name: 'mdxdb-validation',
    async setup() {
      await validator.loadSchemas()
    },
    async transform(data: any, collection: string) {
      if (!validator.isEnabled()) {
        return data
      }

      // Validate the data
      const schema = validator.getSchema(collection)
      if (!schema) {
        return data
      }

      const validation = validateAgainstSchema(data, schema)
      if (!validation.valid) {
        const errorMsg = `Validation failed for ${collection}:\n${validation.errors.join('\n')}`
        if (options.strict) {
          throw new Error(errorMsg)
        } else if (options.verbose) {
          console.warn(errorMsg)
        }
      }

      return data
    },
  }
}

/**
 * Convenience function to validate a Velite config
 */
export async function validateVeliteConfig(config: {
  collections: Record<string, { name: string; pattern: string }>
  root?: string
  schemaPath?: string
  strict?: boolean
}): Promise<ValidationResult> {
  const validator = new VeliteSchemaValidator({
    enabled: true,
    schemaPath: config.schemaPath || '.db',
    strict: config.strict || false,
    verbose: true,
  })

  await validator.loadSchemas()

  const collections = Object.values(config.collections).map((col) => ({
    name: col.name,
    pattern: col.pattern,
    baseDir: config.root || '.',
  }))

  return validator.validateCollections(collections)
}
