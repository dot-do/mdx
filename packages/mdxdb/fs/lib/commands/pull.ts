/**
 * mdxdb pull - Sync filesystem → database
 *
 * Imports MDX files into the database for deployment and synchronization.
 */

import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import micromatch from 'micromatch'

export interface PullOptions {
  /**
   * Namespace to import into (e.g., 'payload', 'notes', 'services')
   */
  namespace: string

  /**
   * Directory containing MDX files
   */
  directory: string

  /**
   * Collection types to import (optional, imports all if not specified)
   */
  collections?: string[]

  /**
   * Overwrite existing database entries
   */
  overwrite?: boolean

  /**
   * DB Worker RPC client
   */
  dbWorker: DbWorkerClient

  /**
   * Dry run - show what would be pulled without writing to database
   */
  dryRun?: boolean

  /**
   * File pattern to match (default: **/*.mdx)
   */
  pattern?: string
}

export interface DbWorkerClient {
  getThing(params: { ns: string; id: string }): Promise<any | null>

  createThing(params: {
    ns: string
    id: string
    type: string
    content: string
    data: any
    visibility?: 'public' | 'private' | 'unlisted'
  }): Promise<any>

  updateThing(params: {
    ns: string
    id: string
    data?: any
    content?: string
    visibility?: 'public' | 'private' | 'unlisted'
  }): Promise<any>
}

export interface PullResult {
  pulled: number
  created: number
  updated: number
  skipped: number
  errors: number
  files: string[]
}

/**
 * Pull MDX files from filesystem into database
 */
export async function pull(options: PullOptions): Promise<PullResult> {
  const {
    namespace,
    directory,
    collections,
    overwrite = false,
    dbWorker,
    dryRun = false,
    pattern = '**/*.mdx',
  } = options

  const result: PullResult = {
    pulled: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    files: [],
  }

  console.log(`\n📥 Pulling MDX files from ${directory} into namespace '${namespace}'`)
  if (dryRun) {
    console.log('🔍 DRY RUN - No database changes will be made\n')
  }

  // Find all MDX files
  const files = await findMDXFiles(directory, pattern, collections)
  console.log(`Found ${files.length} MDX files\n`)

  for (const filePath of files) {
    try {
      // Read and parse MDX file
      const content = await fs.readFile(filePath, 'utf-8')
      const { data: frontmatter, content: body } = matter(content)

      // Extract entity metadata
      const id = frontmatter.$id || extractIdFromPath(filePath, directory)
      const type = frontmatter.$type || extractTypeFromPath(filePath, directory)

      // Validate required fields
      if (!id || !type) {
        console.error(`❌ ${filePath}: Missing $id or $type in frontmatter`)
        result.errors++
        continue
      }

      // Check if entity exists
      let existing = null
      if (!dryRun) {
        existing = await dbWorker.getThing({ ns: namespace, id })
      }

      // Determine action
      if (existing) {
        if (!overwrite) {
          console.log(`⏭️  ${filePath}: Entity already exists (use --overwrite to update)`)
          result.skipped++
          continue
        }

        // Update existing entity
        if (!dryRun) {
          await dbWorker.updateThing({
            ns: namespace,
            id,
            data: frontmatter,
            content: body,
          })
        }

        result.updated++
        console.log(`🔄 ${filePath} → ${namespace}/${id} (updated)`)
      } else {
        // Create new entity
        if (!dryRun) {
          await dbWorker.createThing({
            ns: namespace,
            id,
            type,
            content: body,
            data: frontmatter,
            visibility: frontmatter.visibility || 'public',
          })
        }

        result.created++
        console.log(`✅ ${filePath} → ${namespace}/${id} (created)`)
      }

      result.pulled++
      result.files.push(filePath)
    } catch (error) {
      console.error(`❌ Error pulling ${filePath}:`, error)
      result.errors++
    }
  }

  // Summary
  console.log(`\n📊 Pull Summary:`)
  console.log(`   Pulled: ${result.pulled}`)
  console.log(`   Created: ${result.created}`)
  console.log(`   Updated: ${result.updated}`)
  console.log(`   Skipped: ${result.skipped}`)
  console.log(`   Errors: ${result.errors}`)

  return result
}

/**
 * Find all MDX files matching pattern
 */
async function findMDXFiles(
  directory: string,
  pattern: string,
  collections?: string[]
): Promise<string[]> {
  const files: string[] = []

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Filter by collection if specified
        if (collections && collections.length > 0) {
          if (!collections.includes(entry.name)) {
            continue
          }
        }
        await walk(fullPath)
      } else if (entry.isFile() && micromatch.isMatch(fullPath, pattern)) {
        files.push(fullPath)
      }
    }
  }

  await walk(directory)
  return files
}

/**
 * Extract entity ID from file path
 */
function extractIdFromPath(filePath: string, baseDir: string): string {
  const relativePath = path.relative(baseDir, filePath)
  const parsed = path.parse(relativePath)

  // Remove extension and use filename as ID
  return parsed.name
}

/**
 * Extract entity type (collection) from file path
 */
function extractTypeFromPath(filePath: string, baseDir: string): string {
  const relativePath = path.relative(baseDir, filePath)
  const parts = relativePath.split(path.sep)

  // First directory is the collection type
  return parts[0] || 'default'
}
