/**
 * mdxdb Payload CMS integration
 *
 * Provides a unified interface for working with MDX files via Payload CMS
 * Supports both D1 (Cloudflare Workers) and SQLite (local development)
 */

export {
  createDatabaseAdapter,
  detectDatabaseConfig,
  isD1Environment,
  PayloadDatabaseAdapter,
  type DatabaseConfig,
  type UnifiedDatabase,
} from './adapter.js'

export {
  generateCollection,
  generateCollections,
  getDefaultCollections,
  MDX_FILES_COLLECTION,
  EMBEDDINGS_COLLECTION,
  type SchemaCollection,
  type SchemaField,
} from './collections.js'

export {
  createPayloadConfig,
  initializePayload,
  getPayloadClient,
  resetPayloadClient,
  type PayloadConfigOptions,
} from './config.js'

export { PayloadContext, createPayloadContext, type PayloadContextOptions } from './context.js'
