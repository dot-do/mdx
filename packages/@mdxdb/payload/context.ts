/**
 * Context switching between file system and Payload CMS backends
 *
 * This module provides a unified interface that can switch between:
 * - File system backend (Velite + fs operations)
 * - Payload CMS backend (D1 or SQLite)
 *
 * This enables seamless migration from file-based to database-backed MDX storage
 */

import type { Payload } from 'payload'
import type { MdxDbInterface, VeliteData, DocumentContent } from '@mdxdb/core'
import { getPayloadClient, type PayloadConfigOptions } from './config.js'
import matter from 'gray-matter'

/**
 * Context mode for mdxdb operations
 */
export type ContextMode = 'filesystem' | 'payload'

/**
 * Configuration for Payload context
 */
export interface PayloadContextOptions extends PayloadConfigOptions {
  mode?: ContextMode
  fallback?: boolean // Fall back to filesystem if Payload unavailable
}

/**
 * Payload-backed implementation of MdxDbInterface
 */
export class PayloadContext implements Partial<MdxDbInterface> {
  private payload: Payload | null = null
  private mode: ContextMode
  private fallback: boolean
  private initialized: boolean = false

  constructor(private options: PayloadContextOptions = {}) {
    this.mode = options.mode || 'payload'
    this.fallback = options.fallback !== false
  }

  /**
   * Initialize Payload CMS connection
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      this.payload = await getPayloadClient(this.options)
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Payload:', error)

      if (this.fallback) {
        console.warn('Falling back to filesystem mode')
        this.mode = 'filesystem'
      } else {
        throw error
      }
    }
  }

  /**
   * Ensure Payload is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    if (this.mode === 'payload' && !this.payload) {
      throw new Error('Payload not initialized')
    }
  }

  /**
   * Build the database
   */
  async build(): Promise<VeliteData> {
    await this.ensureInitialized()

    if (this.mode === 'filesystem') {
      throw new Error('Filesystem mode not implemented in PayloadContext')
    }

    // For Payload mode, just return empty data
    // Actual data is in the database
    return {}
  }

  /**
   * Watch for changes
   */
  async watch(): Promise<void> {
    await this.ensureInitialized()
    console.warn('Watch mode not implemented for Payload backend')
  }

  /**
   * Stop watching
   */
  stopWatch(): void {
    // No-op for Payload backend
  }

  /**
   * Create or update a document
   */
  async set(id: string, content: DocumentContent, collectionName: string): Promise<void> {
    await this.ensureInitialized()

    if (!this.payload) {
      throw new Error('Payload not initialized')
    }

    try {
      const mdxContent = matter.stringify(content.body, content.frontmatter)

      // Check if document exists
      const existingFile = await this.payload.find({
        collection: 'files',
        where: {
          slug: { equals: id },
          collection: { equals: collectionName },
        },
      })

      const fileData = {
        slug: id,
        collection: collectionName,
        frontmatter: content.frontmatter,
        mdx: mdxContent,
        markdown: content.body,
        html: `<div>${content.body}</div>`, // TODO: Proper HTML rendering
        code: `export default function() { return <div>${content.body}</div> }`, // TODO: Proper MDX compilation
      }

      if (existingFile.docs.length > 0) {
        // Update existing document
        await this.payload.update({
          collection: 'files',
          id: existingFile.docs[0].id as string,
          data: fileData,
        })
      } else {
        // Create new document
        await this.payload.create({
          collection: 'files',
          data: fileData,
        })
      }
    } catch (error) {
      console.error(`Error setting document '${id}' in collection '${collectionName}':`, error)
      throw new Error(`Failed to set document: ${(error as Error).message}`)
    }
  }

  /**
   * Get a document by ID
   */
  async get(id: string, collectionName?: string): Promise<any | undefined> {
    await this.ensureInitialized()

    if (!this.payload) {
      throw new Error('Payload not initialized')
    }

    try {
      const where: any = collectionName
        ? {
            slug: { equals: id },
            collection: { equals: collectionName },
          }
        : { slug: { equals: id } }

      const result = await this.payload.find({
        collection: 'files',
        where,
      })

      if (result.docs.length === 0) {
        return undefined
      }

      const doc = result.docs[0]
      return {
        slug: doc.slug,
        collection: doc.collection,
        ...doc.frontmatter,
        body: doc.markdown,
      }
    } catch (error) {
      console.error(`Error getting document '${id}':`, error)
      throw new Error(`Failed to get document: ${(error as Error).message}`)
    }
  }

  /**
   * List documents
   */
  list(collectionName?: string): any[] {
    throw new Error('Synchronous list() not supported in PayloadContext. Use listAsync() instead.')
  }

  /**
   * List documents (async)
   */
  async listAsync(collectionName?: string): Promise<any[]> {
    await this.ensureInitialized()

    if (!this.payload) {
      throw new Error('Payload not initialized')
    }

    try {
      const where = collectionName ? { collection: { equals: collectionName } } : undefined

      const result = await this.payload.find({
        collection: 'files',
        where,
        limit: 1000,
      })

      return result.docs.map((doc: any) => ({
        slug: doc.slug,
        collection: doc.collection,
        ...doc.frontmatter,
        body: doc.markdown,
      }))
    } catch (error) {
      console.error('Error listing documents:', error)
      throw new Error(`Failed to list documents: ${(error as Error).message}`)
    }
  }

  /**
   * Delete a document
   */
  async delete(id: string, collectionName: string): Promise<boolean> {
    await this.ensureInitialized()

    if (!this.payload) {
      throw new Error('Payload not initialized')
    }

    try {
      const existingFile = await this.payload.find({
        collection: 'files',
        where: {
          slug: { equals: id },
          collection: { equals: collectionName },
        },
      })

      if (existingFile.docs.length === 0) {
        return false
      }

      const fileId = existingFile.docs[0].id as string

      // Delete associated embeddings first
      await this.payload.delete({
        collection: 'embeddings',
        where: { fileId: { equals: fileId } },
      })

      // Delete the file
      await this.payload.delete({
        collection: 'files',
        id: fileId,
      })

      return true
    } catch (error) {
      console.error(`Error deleting document '${id}':`, error)
      throw new Error(`Failed to delete document: ${(error as Error).message}`)
    }
  }

  /**
   * Get database data (not applicable for Payload backend)
   */
  getData(): VeliteData | null {
    return null
  }

  /**
   * Get a collection (not applicable for Payload backend)
   */
  getCollection<T extends keyof VeliteData>(name: T): VeliteData[T] | undefined {
    return undefined
  }

  /**
   * Search using vector embeddings
   */
  async search(query: string, collectionName?: string): Promise<any[]> {
    await this.ensureInitialized()

    if (!this.payload) {
      throw new Error('Payload not initialized')
    }

    // TODO: Implement actual vector search
    // For now, just do a text search
    console.warn('Vector search not yet implemented, falling back to text search')

    try {
      const where: any = collectionName
        ? {
            collection: { equals: collectionName },
            markdown: { contains: query },
          }
        : { markdown: { contains: query } }

      const result = await this.payload.find({
        collection: 'files',
        where,
        limit: 10,
      })

      return result.docs.map((doc: any) => ({
        slug: doc.slug,
        collection: doc.collection,
        ...doc.frontmatter,
        body: doc.markdown,
      }))
    } catch (error) {
      console.error('Error searching documents:', error)
      throw new Error(`Failed to search documents: ${(error as Error).message}`)
    }
  }

  /**
   * Get current mode
   */
  getMode(): ContextMode {
    return this.mode
  }

  /**
   * Check if using Payload backend
   */
  isPayload(): boolean {
    return this.mode === 'payload'
  }

  /**
   * Check if using filesystem backend
   */
  isFilesystem(): boolean {
    return this.mode === 'filesystem'
  }
}

/**
 * Create a Payload context
 */
export function createPayloadContext(options: PayloadContextOptions = {}): PayloadContext {
  return new PayloadContext(options)
}
