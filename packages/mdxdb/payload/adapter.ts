/**
 * Unified D1/SQLite adapter for Payload CMS using Drizzle ORM
 *
 * This adapter supports both:
 * - Cloudflare D1 (Workers environment)
 * - SQLite with libSQL (local development)
 *
 * Key Differences:
 * - D1: Accessed via Workers bindings, returns D1Result objects
 * - SQLite: Accessed via libSQL client, returns standard SQLite results
 *
 * The adapter normalizes these differences to provide a consistent interface
 */

import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { drizzle as drizzleSqlite } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import type { D1Database } from '@cloudflare/workers-types'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

/**
 * Database configuration for unified adapter
 */
export interface DatabaseConfig {
  // For D1 (Workers environment)
  d1?: D1Database

  // For SQLite (local development)
  url?: string
  authToken?: string

  // Additional options
  inMemory?: boolean
  logger?: boolean
}

/**
 * Unified database type that works with both D1 and SQLite
 */
export type UnifiedDatabase = LibSQLDatabase<any> | DrizzleD1Database<any>

/**
 * Database adapter that supports both D1 and SQLite
 */
export class PayloadDatabaseAdapter {
  private db: UnifiedDatabase
  private type: 'd1' | 'sqlite'

  constructor(config: DatabaseConfig) {
    if (config.d1) {
      // D1 configuration (Cloudflare Workers)
      this.db = drizzleD1(config.d1)
      this.type = 'd1'
    } else {
      // SQLite configuration (local development)
      const url = config.inMemory ? ':memory:' : (config.url || 'file:mdxdb.db')
      const client = createClient({
        url,
        authToken: config.authToken,
      })
      this.db = drizzleSqlite(client)
      this.type = 'sqlite'
    }
  }

  /**
   * Get the underlying Drizzle database instance
   */
  getDatabase(): UnifiedDatabase {
    return this.db
  }

  /**
   * Get the database type
   */
  getType(): 'd1' | 'sqlite' {
    return this.type
  }

  /**
   * Check if running in D1 mode
   */
  isD1(): boolean {
    return this.type === 'd1'
  }

  /**
   * Check if running in SQLite mode
   */
  isSqlite(): boolean {
    return this.type === 'sqlite'
  }
}

/**
 * Create a unified database adapter
 */
export function createDatabaseAdapter(config: DatabaseConfig): PayloadDatabaseAdapter {
  return new PayloadDatabaseAdapter(config)
}

/**
 * Helper to detect D1 environment
 */
export function isD1Environment(env: any): env is { DB: D1Database } {
  return !!env && typeof env.DB !== 'undefined' && typeof env.DB.prepare === 'function'
}

/**
 * Auto-detect database configuration from environment
 */
export function detectDatabaseConfig(env?: any): DatabaseConfig {
  // Check for D1 binding in Workers environment
  if (env && isD1Environment(env)) {
    return { d1: env.DB }
  }

  // Fall back to SQLite with environment variables or default
  return {
    url: process.env.DATABASE_URL || 'file:mdxdb.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  }
}
