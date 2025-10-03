/**
 * Payload CMS configuration generator for mdxdb
 *
 * Supports both D1 (Cloudflare Workers) and SQLite (local development)
 * Auto-generates collections from YAML schema definitions
 */

import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import type { Config, CollectionConfig } from 'payload'
import { createDatabaseAdapter, detectDatabaseConfig, type DatabaseConfig } from './adapter.js'
import { getDefaultCollections, generateCollections, type SchemaCollection } from './collections.js'
import { customType, index } from '@payloadcms/db-sqlite/drizzle/sqlite-core'

/**
 * Payload configuration options for mdxdb
 */
export interface PayloadConfigOptions {
  // Database configuration
  database?: DatabaseConfig

  // Additional collections beyond default files/embeddings
  collections?: SchemaCollection[]

  // Payload secret for JWT
  secret?: string

  // Admin panel configuration
  admin?: {
    disable?: boolean
    user?: string
    bundler?: 'webpack' | 'vite'
  }

  // Editor configuration
  editor?: 'lexical' | 'slate'

  // TypeScript output
  typescript?: {
    outputFile?: string
  }

  // Enable/disable vector embeddings
  embeddings?: boolean
}

/**
 * Custom Drizzle type for vector storage
 * Stores embeddings as JSON strings in SQLite/D1
 */
const vectorType = customType<{
  data: number[]
  config: { dimensions: number }
  configRequired: true
  driverData: string
}>({
  dataType(config) {
    return `TEXT` // Store as JSON string in SQLite/D1
  },
  fromDriver(value: string) {
    return JSON.parse(value)
  },
  toDriver(value: number[]) {
    return JSON.stringify(value)
  },
})

/**
 * Create Payload configuration for mdxdb
 */
export function createPayloadConfig(options: PayloadConfigOptions = {}): any {
  // Detect or use provided database config
  const dbConfig = options.database || detectDatabaseConfig()

  // Generate collections
  const customCollections = options.collections
    ? generateCollections(options.collections)
    : []

  const defaultCollections = getDefaultCollections()
  const allCollections = [...defaultCollections, ...customCollections]

  // Build base config
  const config: Config = {
    collections: allCollections as any,
    secret: options.secret || process.env.PAYLOAD_SECRET || 'mdxdb-payload-secret-change-me',
    typescript: {
      outputFile: options.typescript?.outputFile || './payload-types.ts',
    },
    db: sqliteAdapter({
      client: {
        url: dbConfig.url || process.env.DATABASE_URL || 'file:mdxdb.db',
        authToken: dbConfig.authToken || process.env.DATABASE_AUTH_TOKEN,
      },
      // Extend schema to add vector column for embeddings
      afterSchemaInit: options.embeddings !== false
        ? [
            ({ schema, extendTable }) => {
              extendTable({
                table: schema.tables.embeddings,
                columns: {
                  vector: vectorType('vector', { dimensions: 1536 }),
                },
                extraConfig: (table) => ({
                  vector_idx: index('vector_idx').on(table.vector),
                }),
              })
              return schema
            },
          ]
        : undefined,
    }),
  }

  // Add admin configuration if not disabled
  if (!options.admin?.disable) {
    config.admin = {
      user: options.admin?.user || 'users',
    }

    // Add users collection for admin auth
    const usersCollection: CollectionConfig = {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
            { label: 'Viewer', value: 'viewer' },
          ],
          defaultValue: 'viewer',
        },
      ],
    }

    config.collections = [...(config.collections || []), usersCollection] as any
  }

  // Add editor configuration
  if (options.editor === 'lexical') {
    // Lexical editor will be imported dynamically
    // to avoid bundle size issues in Workers
  }

  return config
}

/**
 * Initialize Payload CMS with mdxdb configuration
 */
export async function initializePayload(options: PayloadConfigOptions = {}) {
  try {
    const { getPayload } = await import('payload')
    const config = createPayloadConfig(options)

    const payload = await getPayload({
      config,
    })

    return payload
  } catch (error) {
    console.error('Error initializing Payload:', error)
    throw new Error(`Failed to initialize Payload: ${(error as Error).message}`)
  }
}

/**
 * Get Payload client (cached)
 */
let payloadInstance: any = null

export async function getPayloadClient(options: PayloadConfigOptions = {}) {
  if (payloadInstance) {
    return payloadInstance
  }

  payloadInstance = await initializePayload(options)
  return payloadInstance
}

/**
 * Reset Payload client (useful for testing)
 */
export function resetPayloadClient() {
  payloadInstance = null
}
