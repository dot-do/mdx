import { describe, it, expect, vi } from 'vitest'
import {
  createCollectionResourceProvider,
  createSchemaResourceProvider,
  combineResourceProviders,
  CollectionAdapter,
} from './resources'

describe('MCP Resources', () => {
  describe('createCollectionResourceProvider', () => {
    it('should create collection resources', async () => {
      const mockAdapter: CollectionAdapter = {
        listCollections: vi.fn().mockResolvedValue([
          {
            name: 'posts',
            description: 'Blog posts',
            items: [
              { id: 'hello', title: 'Hello', content: '# Hello' },
              { id: 'world', title: 'World', content: '# World' },
            ],
          },
        ]),
        getCollection: vi.fn(),
        getItem: vi.fn(),
      }

      const { provider } = createCollectionResourceProvider(mockAdapter)
      const resources = await provider()

      expect(resources.length).toBeGreaterThan(0)
      expect(resources.some((r) => r.uri === 'collection://posts')).toBe(true)
      expect(resources.some((r) => r.uri === 'collection://posts/hello')).toBe(true)
      expect(resources.some((r) => r.uri === 'collection://posts/world')).toBe(true)
    })

    it('should read entire collection', async () => {
      const mockAdapter: CollectionAdapter = {
        listCollections: vi.fn(),
        getCollection: vi.fn().mockResolvedValue({
          name: 'posts',
          items: [{ id: 'hello', title: 'Hello' }],
        }),
        getItem: vi.fn(),
      }

      const { reader } = createCollectionResourceProvider(mockAdapter)
      const result = await reader('collection://posts')

      expect(mockAdapter.getCollection).toHaveBeenCalledWith('posts')
      expect(result.contents[0].text).toContain('posts')
    })

    it('should read specific item', async () => {
      const mockAdapter: CollectionAdapter = {
        listCollections: vi.fn(),
        getCollection: vi.fn(),
        getItem: vi.fn().mockResolvedValue({
          id: 'hello',
          title: 'Hello',
          content: '# Hello World',
        }),
      }

      const { reader } = createCollectionResourceProvider(mockAdapter)
      const result = await reader('collection://posts/hello')

      expect(mockAdapter.getItem).toHaveBeenCalledWith('posts', 'hello')
      expect(result.contents[0].text).toContain('Hello World')
    })
  })

  describe('createSchemaResourceProvider', () => {
    it('should create schema resources', async () => {
      const schemas = {
        post: {
          fields: {
            title: { type: 'string' },
            content: { type: 'string' },
          },
        },
        page: {
          fields: {
            title: { type: 'string' },
          },
        },
      }

      const { provider } = createSchemaResourceProvider(schemas)
      const resources = await provider()

      expect(resources.length).toBe(2)
      expect(resources.some((r) => r.uri === 'schema:///post')).toBe(true)
      expect(resources.some((r) => r.uri === 'schema:///page')).toBe(true)
    })

    it('should read schema', async () => {
      const schemas = {
        post: {
          fields: {
            title: { type: 'string', required: true },
          },
        },
      }

      const { reader } = createSchemaResourceProvider(schemas)
      const result = await reader('schema:///post')

      expect(result.contents[0].text).toContain('title')
      expect(result.contents[0].text).toContain('required')
    })

    it('should throw for missing schema', async () => {
      const schemas = {
        post: { fields: {} },
      }

      const { reader } = createSchemaResourceProvider(schemas)

      await expect(reader('schema:///missing')).rejects.toThrow('Schema not found')
    })
  })

  describe('combineResourceProviders', () => {
    it('should combine multiple providers', async () => {
      const provider1 = async () => [
        { uri: 'test1://resource', name: 'Resource 1' },
      ]

      const provider2 = async () => [
        { uri: 'test2://resource', name: 'Resource 2' },
      ]

      const reader1 = async (uri: string) => ({
        contents: [{ uri, mimeType: 'text/plain', text: 'Content 1' }],
      })

      const reader2 = async (uri: string) => ({
        contents: [{ uri, mimeType: 'text/plain', text: 'Content 2' }],
      })

      const { provider, reader } = combineResourceProviders([
        { provider: provider1, reader: reader1 },
        { provider: provider2, reader: reader2 },
      ])

      const resources = await provider()
      expect(resources.length).toBe(2)
      expect(resources[0].uri).toBe('test1://resource')
      expect(resources[1].uri).toBe('test2://resource')

      const result1 = await reader('test1://resource')
      expect(result1.contents[0].text).toBe('Content 1')

      const result2 = await reader('test2://resource')
      expect(result2.contents[0].text).toBe('Content 2')
    })

    it('should try readers in order', async () => {
      const reader1 = async (uri: string) => {
        if (uri.startsWith('test1://')) {
          return {
            contents: [{ uri, mimeType: 'text/plain', text: 'From reader 1' }],
          }
        }
        throw new Error('Not handled')
      }

      const reader2 = async (uri: string) => ({
        contents: [{ uri, mimeType: 'text/plain', text: 'From reader 2' }],
      })

      const { reader } = combineResourceProviders([
        { provider: async () => [], reader: reader1 },
        { provider: async () => [], reader: reader2 },
      ])

      const result1 = await reader('test1://resource')
      expect(result1.contents[0].text).toBe('From reader 1')

      const result2 = await reader('other://resource')
      expect(result2.contents[0].text).toBe('From reader 2')
    })
  })
})
