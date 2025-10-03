/**
 * mdxdb Integration Module for mdxe
 *
 * Provides full access to mdxdb functionality within mdxe environment.
 * This module wraps mdxdb core functions and provides a convenient API
 * for MDX evaluation contexts.
 */

import type { MdxDbInterface, DocumentContent, CollectionInterface } from '@mdxdb/core'

/**
 * Database configuration for mdxe
 */
export interface MdxeDbConfig {
  /**
   * Root directory for MDX files (default: current working directory)
   */
  root?: string

  /**
   * Collections directory (default: .db)
   */
  collectionsDir?: string

  /**
   * Database implementation to use (fs, sqlite, or custom)
   */
  implementation?: 'fs' | 'sqlite' | 'custom'

  /**
   * Custom database instance
   */
  customDb?: MdxDbInterface
}

/**
 * Database context for Worker Loader execution
 */
export interface DbContext {
  /**
   * List documents from collection(s)
   */
  list: (collectionName?: string, pattern?: string) => any[]

  /**
   * Get a document by ID
   */
  get: (id: string, collectionName?: string, pattern?: string) => any | undefined

  /**
   * Set/update a document
   */
  set: (id: string, content: any, collectionName: string) => Promise<void>

  /**
   * Delete a document
   */
  delete: (id: string, collectionName: string) => Promise<boolean>

  /**
   * Get a collection interface
   */
  collection: (name: string) => CollectionInterface

  /**
   * The underlying database instance
   */
  db: MdxDbInterface
}

/**
 * Create a database context for Worker Loader execution
 *
 * This provides a sandboxed database interface that can be safely
 * passed to Worker Loader isolates with controlled access.
 *
 * @param config Database configuration
 * @returns Database context with core functions
 */
export async function createDbContext(config: MdxeDbConfig = {}): Promise<DbContext> {
  let db: MdxDbInterface

  // Determine which database implementation to use
  if (config.customDb) {
    db = config.customDb
  } else if (config.implementation === 'sqlite') {
    // Dynamically import SQLite implementation
    try {
      const { MdxDbSqlite } = await import('@mdxdb/sqlite')
      db = new MdxDbSqlite({
        root: config.root || process.cwd(),
        collectionsDir: config.collectionsDir || '.db',
      })
    } catch (error) {
      throw new Error('SQLite implementation not available. Install @mdxdb/sqlite or use a custom database.')
    }
  } else {
    // Default to filesystem implementation
    try {
      const { MdxDbFs } = await import('@mdxdb/fs')
      db = new MdxDbFs({
        root: config.root || process.cwd(),
        collectionsDir: config.collectionsDir || '.db',
      })
    } catch (error) {
      throw new Error('File system implementation not available. Install @mdxdb/fs or use a custom database.')
    }
  }

  // Build/load the database
  await db.build()

  // Create the context with bound functions
  const context: DbContext = {
    list: (collectionName?: string, pattern?: string) => db.list(collectionName, pattern),
    get: (id: string, collectionName?: string, pattern?: string) => db.get(id, collectionName, pattern),
    set: (id: string, content: any, collectionName: string) => db.set(id, content, collectionName),
    delete: (id: string, collectionName: string) => db.delete(id, collectionName),
    collection: async (name: string) => {
      try {
        const { Collection } = await import('@mdxdb/core')
        return new Collection(db, name)
      } catch (error) {
        throw new Error('Collection class not available. Install @mdxdb/core.')
      }
    },
    db,
  }

  return context
}

/**
 * Create a read-only database context for safer Worker Loader execution
 *
 * This variant only exposes read operations (list, get) to prevent
 * untrusted code from modifying the database.
 *
 * @param config Database configuration
 * @returns Read-only database context
 */
export async function createReadOnlyDbContext(config: MdxeDbConfig = {}): Promise<Pick<DbContext, 'list' | 'get' | 'db'>> {
  const fullContext = await createDbContext(config)

  return {
    list: fullContext.list,
    get: fullContext.get,
    db: fullContext.db,
  }
}

/**
 * Export mdxdb types for convenience
 */
export type { MdxDbInterface, DocumentContent, CollectionInterface }
