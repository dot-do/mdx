/**
 * mdxdb push - Sync database → filesystem
 *
 * Exports database entities to MDX files for version control and backup.
 */

import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { simpleGit, SimpleGit } from 'simple-git'

export interface PushOptions {
  /**
   * Namespace to export (e.g., 'payload', 'notes', 'services')
   */
  namespace: string

  /**
   * Output directory for MDX files
   */
  directory: string

  /**
   * Collection types to export (optional, exports all if not specified)
   */
  collections?: string[]

  /**
   * Force overwrite existing files without conflict check
   */
  force?: boolean

  /**
   * Create git commit after push
   */
  commit?: boolean

  /**
   * Git commit message (if commit=true)
   */
  commitMessage?: string

  /**
   * DB Worker RPC client
   */
  dbWorker: DbWorkerClient

  /**
   * Dry run - show what would be pushed without writing files
   */
  dryRun?: boolean
}

export interface DbWorkerClient {
  queryThings(params: {
    ns?: string
    type?: string
    limit?: number
    offset?: number
  }): Promise<{
    items: Array<{
      ns: string
      id: string
      type: string
      data: any
      content: string
      created_at: string
      updated_at: string
      embedding?: number[]
    }>
    total: number
    hasMore: boolean
  }>
}

export interface PushResult {
  pushed: number
  skipped: number
  errors: number
  files: string[]
  conflicts: Array<{
    file: string
    reason: string
  }>
}

/**
 * Push entities from database to filesystem as MDX files
 */
export async function push(options: PushOptions): Promise<PushResult> {
  const {
    namespace,
    directory,
    collections,
    force = false,
    commit = false,
    commitMessage,
    dbWorker,
    dryRun = false,
  } = options

  const result: PushResult = {
    pushed: 0,
    skipped: 0,
    errors: 0,
    files: [],
    conflicts: [],
  }

  console.log(`\n📤 Pushing entities from namespace '${namespace}' to ${directory}`)
  if (dryRun) {
    console.log('🔍 DRY RUN - No files will be written\n')
  }

  // Ensure output directory exists
  if (!dryRun) {
    await fs.mkdir(directory, { recursive: true })
  }

  let offset = 0
  const limit = 100
  let hasMore = true

  while (hasMore) {
    // Query database for entities
    const response = await dbWorker.queryThings({
      ns: namespace,
      type: collections?.join(','), // Filter by collection types if specified
      limit,
      offset,
    })

    for (const entity of response.items) {
      try {
        // Generate MDX content
        const mdx = generateMDX(entity)

        // Determine file path
        const fileName = `${entity.id}.mdx`
        const collectionDir = path.join(directory, entity.type)
        const filePath = path.join(collectionDir, fileName)

        // Check for conflicts (unless force mode)
        if (!force && !dryRun) {
          const conflict = await checkConflict(filePath, entity)
          if (conflict) {
            result.conflicts.push({
              file: filePath,
              reason: conflict,
            })
            result.skipped++
            continue
          }
        }

        // Write file
        if (!dryRun) {
          await fs.mkdir(collectionDir, { recursive: true })
          await fs.writeFile(filePath, mdx, 'utf-8')
        }

        result.pushed++
        result.files.push(filePath)

        console.log(`✅ ${filePath}`)
      } catch (error) {
        console.error(`❌ Error pushing ${entity.id}:`, error)
        result.errors++
      }
    }

    offset += limit
    hasMore = response.hasMore
  }

  // Summary
  console.log(`\n📊 Push Summary:`)
  console.log(`   Pushed: ${result.pushed}`)
  console.log(`   Skipped: ${result.skipped}`)
  console.log(`   Errors: ${result.errors}`)

  if (result.conflicts.length > 0) {
    console.log(`\n⚠️  ${result.conflicts.length} conflicts detected:`)
    for (const conflict of result.conflicts) {
      console.log(`   - ${conflict.file}: ${conflict.reason}`)
    }
    console.log(`\nRun with --force to overwrite conflicting files`)
  }

  // Git commit
  if (commit && !dryRun && result.pushed > 0) {
    await gitCommit(directory, commitMessage || `push: ${result.pushed} entities from ${namespace}`)
  }

  return result
}

/**
 * Generate MDX content from database entity
 */
function generateMDX(entity: any): string {
  // Extract frontmatter from entity data
  const frontmatter = {
    $id: `${entity.ns}/${entity.id}`,
    $type: entity.type,
    ...entity.data,
  }

  // Remove content field from frontmatter (goes in body)
  delete frontmatter.content

  // Generate MDX with frontmatter
  const mdx = matter.stringify(entity.content || '', frontmatter)

  return mdx
}

/**
 * Check if file has conflicts with database version
 */
async function checkConflict(filePath: string, entity: any): Promise<string | null> {
  try {
    // Check if file exists
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false)

    if (!exists) {
      return null // No conflict, file doesn't exist
    }

    // Read existing file
    const existing = await fs.readFile(filePath, 'utf-8')
    const { data: existingData } = matter(existing)

    // Compare timestamps (if available)
    if (existingData.updated_at && entity.updated_at) {
      const existingTime = new Date(existingData.updated_at).getTime()
      const entityTime = new Date(entity.updated_at).getTime()

      if (existingTime > entityTime) {
        return 'Filesystem version is newer than database'
      }
    }

    // Compare content hashes (simple check)
    const existingHash = hashContent(existing)
    const entityHash = hashContent(generateMDX(entity))

    if (existingHash !== entityHash) {
      return 'Content differs between filesystem and database'
    }

    return null // No conflict
  } catch (error) {
    console.error(`Error checking conflict for ${filePath}:`, error)
    return null // Assume no conflict on error
  }
}

/**
 * Simple content hash for conflict detection
 */
function hashContent(content: string): string {
  // Simple hash - could use crypto for production
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(36)
}

/**
 * Commit changes to git
 */
async function gitCommit(directory: string, message: string): Promise<void> {
  try {
    const git: SimpleGit = simpleGit(directory)

    // Check if git repo exists
    const isRepo = await git.checkIsRepo()
    if (!isRepo) {
      console.log('⚠️  Not a git repository, skipping commit')
      return
    }

    // Stage all changes
    await git.add('.')

    // Commit
    await git.commit(message)

    console.log(`✅ Git commit created: ${message}`)
  } catch (error) {
    console.error('❌ Git commit failed:', error)
  }
}
