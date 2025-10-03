/**
 * Tests for D1/SQLite unified adapter
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabaseAdapter, detectDatabaseConfig, isD1Environment } from './adapter.js'

describe('PayloadDatabaseAdapter', () => {
  describe('SQLite mode', () => {
    it('should create adapter with SQLite configuration', () => {
      const adapter = createDatabaseAdapter({
        url: 'file::memory:',
      })

      expect(adapter).toBeDefined()
      expect(adapter.getType()).toBe('sqlite')
      expect(adapter.isSqlite()).toBe(true)
      expect(adapter.isD1()).toBe(false)
    })

    it('should create adapter with in-memory database', () => {
      const adapter = createDatabaseAdapter({
        inMemory: true,
      })

      expect(adapter).toBeDefined()
      expect(adapter.getType()).toBe('sqlite')
    })

    it('should provide database instance', () => {
      const adapter = createDatabaseAdapter({
        inMemory: true,
      })

      const db = adapter.getDatabase()
      expect(db).toBeDefined()
    })
  })

  describe('D1 mode', () => {
    it('should detect D1 environment', () => {
      const mockD1 = {
        prepare: () => ({}),
        dump: () => ({}),
        batch: () => ({}),
        exec: () => ({}),
      }

      const env = { DB: mockD1 }
      expect(isD1Environment(env)).toBe(true)
    })

    it('should not detect non-D1 environment', () => {
      expect(isD1Environment({})).toBe(false)
      expect(isD1Environment(null as any)).toBe(false)
      expect(isD1Environment(undefined as any)).toBe(false)
    })
  })

  describe('Configuration detection', () => {
    it('should detect D1 from environment', () => {
      const mockD1 = {
        prepare: () => ({}),
        dump: () => ({}),
        batch: () => ({}),
        exec: () => ({}),
      }

      const env = { DB: mockD1 }
      const config = detectDatabaseConfig(env)

      expect(config.d1).toBeDefined()
      expect(config.d1).toBe(mockD1)
    })

    it('should fall back to SQLite config', () => {
      const config = detectDatabaseConfig()

      expect(config.url).toBeDefined()
      expect(config.d1).toBeUndefined()
    })

    it('should use environment variables for SQLite', () => {
      const originalUrl = process.env.DATABASE_URL
      const originalToken = process.env.DATABASE_AUTH_TOKEN

      process.env.DATABASE_URL = 'file:test.db'
      process.env.DATABASE_AUTH_TOKEN = 'test-token'

      const config = detectDatabaseConfig()

      expect(config.url).toBe('file:test.db')
      expect(config.authToken).toBe('test-token')

      // Restore
      if (originalUrl) process.env.DATABASE_URL = originalUrl
      else delete process.env.DATABASE_URL
      if (originalToken) process.env.DATABASE_AUTH_TOKEN = originalToken
      else delete process.env.DATABASE_AUTH_TOKEN
    })
  })
})
