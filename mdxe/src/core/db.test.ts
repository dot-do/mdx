/**
 * Tests for mdxdb integration module
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createDbContext, createReadOnlyDbContext } from './db.js'

describe('createDbContext', () => {
  it('should create a database context with all functions', async () => {
    const context = await createDbContext({
      implementation: 'custom',
      customDb: {
        build: async () => ({ docs: [] }),
        watch: async () => {},
        stopWatch: () => {},
        list: () => [],
        get: () => undefined,
        set: async () => {},
        delete: async () => false,
      },
    })

    expect(context).toBeDefined()
    expect(typeof context.list).toBe('function')
    expect(typeof context.get).toBe('function')
    expect(typeof context.set).toBe('function')
    expect(typeof context.delete).toBe('function')
    expect(typeof context.collection).toBe('function')
    expect(context.db).toBeDefined()
  })

  it('should provide list function', async () => {
    const mockData = [
      { slug: 'doc1', title: 'Document 1' },
      { slug: 'doc2', title: 'Document 2' },
    ]

    const context = await createDbContext({
      implementation: 'custom',
      customDb: {
        build: async () => ({ docs: mockData }),
        watch: async () => {},
        stopWatch: () => {},
        list: () => mockData,
        get: () => undefined,
        set: async () => {},
        delete: async () => false,
      },
    })

    const result = context.list()
    expect(result).toEqual(mockData)
  })

  it('should provide get function', async () => {
    const mockDoc = { slug: 'doc1', title: 'Document 1' }

    const context = await createDbContext({
      implementation: 'custom',
      customDb: {
        build: async () => ({ docs: [mockDoc] }),
        watch: async () => {},
        stopWatch: () => {},
        list: () => [mockDoc],
        get: (id) => (id === 'doc1' ? mockDoc : undefined),
        set: async () => {},
        delete: async () => false,
      },
    })

    const result = context.get('doc1')
    expect(result).toEqual(mockDoc)
  })

  it('should provide collection function', async () => {
    const context = await createDbContext({
      implementation: 'custom',
      customDb: {
        build: async () => ({ posts: [] }),
        watch: async () => {},
        stopWatch: () => {},
        list: () => [],
        get: () => undefined,
        set: async () => {},
        delete: async () => false,
      },
    })

    const collection = context.collection('posts')
    expect(collection).toBeDefined()
    expect(typeof collection.list).toBe('function')
    expect(typeof collection.get).toBe('function')
  })
})

describe('createReadOnlyDbContext', () => {
  it('should create a read-only database context', async () => {
    const context = await createReadOnlyDbContext({
      implementation: 'custom',
      customDb: {
        build: async () => ({ docs: [] }),
        watch: async () => {},
        stopWatch: () => {},
        list: () => [],
        get: () => undefined,
        set: async () => {},
        delete: async () => false,
      },
    })

    expect(context).toBeDefined()
    expect(typeof context.list).toBe('function')
    expect(typeof context.get).toBe('function')
    expect(context.db).toBeDefined()

    // Should not have write functions
    expect((context as any).set).toBeUndefined()
    expect((context as any).delete).toBeUndefined()
    expect((context as any).collection).toBeUndefined()
  })

  it('should provide read operations', async () => {
    const mockData = [
      { slug: 'doc1', title: 'Document 1' },
      { slug: 'doc2', title: 'Document 2' },
    ]

    const context = await createReadOnlyDbContext({
      implementation: 'custom',
      customDb: {
        build: async () => ({ docs: mockData }),
        watch: async () => {},
        stopWatch: () => {},
        list: () => mockData,
        get: (id) => mockData.find((d) => d.slug === id),
        set: async () => {},
        delete: async () => false,
      },
    })

    expect(context.list()).toEqual(mockData)
    expect(context.get('doc1')).toEqual(mockData[0])
  })
})
