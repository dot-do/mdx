/**
 * Tests for collection generation from YAML schemas
 */

import { describe, it, expect } from 'vitest'
import {
  generateCollection,
  generateCollections,
  getDefaultCollections,
  MDX_FILES_COLLECTION,
  EMBEDDINGS_COLLECTION,
  type SchemaCollection,
} from './collections.js'

describe('Collection Generation', () => {
  describe('generateCollection', () => {
    it('should generate collection from simple schema', () => {
      const schema: SchemaCollection = {
        name: 'Posts',
        slug: 'posts',
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
          {
            name: 'content',
            type: 'textarea',
            required: true,
          },
        ],
      }

      const collection = generateCollection(schema)

      expect(collection.slug).toBe('posts')
      expect(collection.fields).toHaveLength(2)
      expect(collection.fields[0].name).toBe('title')
      expect(collection.fields[0].type).toBe('text')
    })

    it('should handle all field types', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [
          { name: 'text', type: 'text' },
          { name: 'textarea', type: 'textarea' },
          { name: 'richText', type: 'richText' },
          { name: 'number', type: 'number' },
          { name: 'checkbox', type: 'checkbox' },
          { name: 'date', type: 'date' },
          { name: 'select', type: 'select', options: [{ label: 'A', value: 'a' }] },
          { name: 'relation', type: 'relationship', relationTo: 'files' },
          { name: 'json', type: 'json' },
          { name: 'email', type: 'email' },
        ],
      }

      const collection = generateCollection(schema)

      expect(collection.fields).toHaveLength(10)
      expect(collection.fields.find((f) => f.name === 'text')?.type).toBe('text')
      expect(collection.fields.find((f) => f.name === 'textarea')?.type).toBe('textarea')
      expect(collection.fields.find((f) => f.name === 'richText')?.type).toBe('richText')
      expect(collection.fields.find((f) => f.name === 'number')?.type).toBe('number')
      expect(collection.fields.find((f) => f.name === 'checkbox')?.type).toBe('checkbox')
      expect(collection.fields.find((f) => f.name === 'date')?.type).toBe('date')
      expect(collection.fields.find((f) => f.name === 'select')?.type).toBe('select')
      expect(collection.fields.find((f) => f.name === 'relation')?.type).toBe('relationship')
      expect(collection.fields.find((f) => f.name === 'json')?.type).toBe('json')
      expect(collection.fields.find((f) => f.name === 'email')?.type).toBe('email')
    })

    it('should handle field attributes', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [
          {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            label: 'URL Slug',
            description: 'Unique identifier',
          },
        ],
      }

      const collection = generateCollection(schema)
      const field = collection.fields[0]

      expect(field.required).toBe(true)
      expect((field as any).unique).toBe(true)
      expect(field.label).toBe('URL Slug')
    })

    it('should handle admin configuration', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [
          { name: 'title', type: 'text' },
          { name: 'slug', type: 'text' },
        ],
        admin: {
          useAsTitle: 'title',
          defaultColumns: ['title', 'slug', 'updatedAt'],
          group: 'Content',
        },
      }

      const collection = generateCollection(schema)

      expect(collection.admin?.useAsTitle).toBe('title')
      expect(collection.admin?.defaultColumns).toEqual(['title', 'slug', 'updatedAt'])
      expect(collection.admin?.group).toBe('Content')
    })

    it('should enable timestamps by default', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [{ name: 'title', type: 'text' }],
      }

      const collection = generateCollection(schema)

      expect(collection.timestamps).toBe(true)
    })

    it('should allow disabling timestamps', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [{ name: 'title', type: 'text' }],
        timestamps: false,
      }

      const collection = generateCollection(schema)

      expect(collection.timestamps).toBe(false)
    })

    it('should handle auth configuration', () => {
      const schema: SchemaCollection = {
        name: 'Users',
        slug: 'users',
        fields: [{ name: 'name', type: 'text' }],
        auth: true,
      }

      const collection = generateCollection(schema)

      expect(collection.auth).toBe(true)
    })
  })

  describe('generateCollections', () => {
    it('should generate multiple collections', () => {
      const schemas: SchemaCollection[] = [
        {
          name: 'Posts',
          slug: 'posts',
          fields: [{ name: 'title', type: 'text' }],
        },
        {
          name: 'Pages',
          slug: 'pages',
          fields: [{ name: 'title', type: 'text' }],
        },
      ]

      const collections = generateCollections(schemas)

      expect(collections).toHaveLength(2)
      expect(collections[0].slug).toBe('posts')
      expect(collections[1].slug).toBe('pages')
    })
  })

  describe('Default Collections', () => {
    it('should provide MDX files collection', () => {
      expect(MDX_FILES_COLLECTION).toBeDefined()
      expect(MDX_FILES_COLLECTION.slug).toBe('files')
      expect(MDX_FILES_COLLECTION.fields.length).toBeGreaterThan(0)
    })

    it('should provide embeddings collection', () => {
      expect(EMBEDDINGS_COLLECTION).toBeDefined()
      expect(EMBEDDINGS_COLLECTION.slug).toBe('embeddings')
      expect(EMBEDDINGS_COLLECTION.fields.length).toBeGreaterThan(0)
    })

    it('should generate default collections', () => {
      const collections = getDefaultCollections()

      expect(collections).toHaveLength(2)
      expect(collections[0].slug).toBe('files')
      expect(collections[1].slug).toBe('embeddings')
    })

    it('should have proper field structure in files collection', () => {
      const collection = generateCollection(MDX_FILES_COLLECTION)
      const fields = collection.fields

      expect(fields.find((f) => f.name === 'slug')).toBeDefined()
      expect(fields.find((f) => f.name === 'collection')).toBeDefined()
      expect(fields.find((f) => f.name === 'frontmatter')).toBeDefined()
      expect(fields.find((f) => f.name === 'mdx')).toBeDefined()
      expect(fields.find((f) => f.name === 'markdown')).toBeDefined()
      expect(fields.find((f) => f.name === 'html')).toBeDefined()
      expect(fields.find((f) => f.name === 'code')).toBeDefined()
    })

    it('should have proper field structure in embeddings collection', () => {
      const collection = generateCollection(EMBEDDINGS_COLLECTION)
      const fields = collection.fields

      expect(fields.find((f) => f.name === 'fileId')).toBeDefined()
      expect(fields.find((f) => f.name === 'content')).toBeDefined()
      expect(fields.find((f) => f.name === 'chunkType')).toBeDefined()
      expect(fields.find((f) => f.name === 'vector')).toBeDefined()
      expect(fields.find((f) => f.name === 'collection')).toBeDefined()
    })
  })

  describe('Field Type Conversions', () => {
    it('should convert string to text', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [{ name: 'field', type: 'string' }],
      }

      const collection = generateCollection(schema)
      expect(collection.fields[0].type).toBe('text')
    })

    it('should convert longText to textarea', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [{ name: 'field', type: 'longText' }],
      }

      const collection = generateCollection(schema)
      expect(collection.fields[0].type).toBe('textarea')
    })

    it('should convert markdown to richText', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [{ name: 'field', type: 'markdown' }],
      }

      const collection = generateCollection(schema)
      expect(collection.fields[0].type).toBe('richText')
    })

    it('should convert mdx to richText', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [{ name: 'field', type: 'mdx' }],
      }

      const collection = generateCollection(schema)
      expect(collection.fields[0].type).toBe('richText')
    })

    it('should convert boolean to checkbox', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [{ name: 'field', type: 'boolean' }],
      }

      const collection = generateCollection(schema)
      expect(collection.fields[0].type).toBe('checkbox')
    })

    it('should handle unknown types gracefully', () => {
      const schema: SchemaCollection = {
        name: 'Test',
        slug: 'test',
        fields: [{ name: 'field', type: 'unknown-type' as any }],
      }

      const collection = generateCollection(schema)
      expect(collection.fields[0].type).toBe('text') // Fallback
    })
  })
})
