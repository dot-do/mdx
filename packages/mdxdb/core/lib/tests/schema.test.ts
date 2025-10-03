import { describe, it, expect } from 'vitest'
import {
  parseYamlSchema,
  validateAgainstSchema,
  payloadToVeliteSchema,
  type CollectionSchema,
  type PayloadField,
} from '../schema.js'

describe('parseYamlSchema', () => {
  it('should parse a simple schema with text fields', () => {
    const yaml = `
name: Post
slug: posts
fields:
  title: "Post title (text)"
  description: "Post description (textarea)"
  author: "Author name"
`

    const schema = parseYamlSchema(yaml)

    expect(schema.name).toBe('Post')
    expect(schema.slug).toBe('posts')
    expect(schema.fields).toHaveLength(3)
    expect(schema.fields[0].name).toBe('title')
    expect(schema.fields[0].type).toBe('text')
    expect(schema.fields[1].name).toBe('description')
    expect(schema.fields[1].type).toBe('textarea')
    expect(schema.fields[2].name).toBe('author')
    expect(schema.fields[2].type).toBe('text')
  })

  it('should parse schema with various field types', () => {
    const yaml = `
name: Article
fields:
  title: "Article title (text)"
  published: "Is published (checkbox)"
  views: "View count (number)"
  publishedAt: "Publish date (date)"
  content: "Article content (richText)"
  email: "Contact email (email)"
`

    const schema = parseYamlSchema(yaml)

    expect(schema.fields).toHaveLength(6)
    expect(schema.fields.find((f) => f.name === 'title')?.type).toBe('text')
    expect(schema.fields.find((f) => f.name === 'published')?.type).toBe('checkbox')
    expect(schema.fields.find((f) => f.name === 'views')?.type).toBe('number')
    expect(schema.fields.find((f) => f.name === 'publishedAt')?.type).toBe('date')
    expect(schema.fields.find((f) => f.name === 'content')?.type).toBe('richText')
    expect(schema.fields.find((f) => f.name === 'email')?.type).toBe('email')
  })

  it('should parse enum/select fields from pipe-separated values', () => {
    const yaml = `
name: Post
fields:
  status: "Post status (draft|published|archived)"
  priority: "Priority (low|medium|high)"
`

    const schema = parseYamlSchema(yaml)

    const statusField = schema.fields.find((f) => f.name === 'status')
    expect(statusField?.type).toBe('select')
    expect((statusField as any).options).toHaveLength(3)
    expect((statusField as any).options[0].value).toBe('draft')
    expect((statusField as any).options[1].value).toBe('published')
    expect((statusField as any).options[2].value).toBe('archived')

    const priorityField = schema.fields.find((f) => f.name === 'priority')
    expect(priorityField?.type).toBe('select')
    expect((priorityField as any).options).toHaveLength(3)
  })

  it('should parse complex field definitions', () => {
    const yaml = `
name: Product
fields:
  name:
    type: text
    label: Product Name
    required: true
    description: The name of the product
    minLength: 3
    maxLength: 100
  price:
    type: number
    label: Price
    required: true
    min: 0
    max: 10000
  inStock:
    type: checkbox
    label: In Stock
    defaultValue: true
  category:
    type: select
    label: Category
    required: true
    options:
      - label: Electronics
        value: electronics
      - label: Clothing
        value: clothing
      - label: Books
        value: books
`

    const schema = parseYamlSchema(yaml)

    const nameField = schema.fields.find((f) => f.name === 'name')
    expect(nameField?.type).toBe('text')
    expect(nameField?.required).toBe(true)
    expect((nameField as any).minLength).toBe(3)
    expect((nameField as any).maxLength).toBe(100)

    const priceField = schema.fields.find((f) => f.name === 'price')
    expect(priceField?.type).toBe('number')
    expect((priceField as any).min).toBe(0)
    expect((priceField as any).max).toBe(10000)

    const inStockField = schema.fields.find((f) => f.name === 'inStock')
    expect(inStockField?.type).toBe('checkbox')
    expect(inStockField?.defaultValue).toBe(true)

    const categoryField = schema.fields.find((f) => f.name === 'category')
    expect(categoryField?.type).toBe('select')
    expect((categoryField as any).options).toHaveLength(3)
    expect((categoryField as any).options[0].label).toBe('Electronics')
  })

  it('should parse relationship fields', () => {
    const yaml = `
name: BlogPost
fields:
  author:
    type: relationship
    label: Author
    relationTo: users
    required: true
  tags:
    type: relationship
    label: Tags
    relationTo: tags
    hasMany: true
    max: 5
`

    const schema = parseYamlSchema(yaml)

    const authorField = schema.fields.find((f) => f.name === 'author')
    expect(authorField?.type).toBe('relationship')
    expect((authorField as any).relationTo).toBe('users')
    expect(authorField?.required).toBe(true)

    const tagsField = schema.fields.find((f) => f.name === 'tags')
    expect(tagsField?.type).toBe('relationship')
    expect((tagsField as any).relationTo).toBe('tags')
    expect((tagsField as any).hasMany).toBe(true)
    expect((tagsField as any).max).toBe(5)
  })

  it('should parse array and group fields', () => {
    const yaml = `
name: Page
fields:
  sections:
    type: array
    label: Page Sections
    min: 1
    max: 10
    fields:
      title: "Section title (text)"
      content: "Section content (richText)"
  metadata:
    type: group
    label: Page Metadata
    fields:
      seoTitle: "SEO Title (text)"
      seoDescription: "SEO Description (textarea)"
`

    const schema = parseYamlSchema(yaml)

    const sectionsField = schema.fields.find((f) => f.name === 'sections')
    expect(sectionsField?.type).toBe('array')
    expect((sectionsField as any).minRows).toBe(1)
    expect((sectionsField as any).maxRows).toBe(10)
    expect((sectionsField as any).fields).toHaveLength(2)

    const metadataField = schema.fields.find((f) => f.name === 'metadata')
    expect(metadataField?.type).toBe('group')
    expect((metadataField as any).fields).toHaveLength(2)
  })

  it('should include labels and admin config', () => {
    const yaml = `
name: Product
slug: products
labels:
  singular: Product
  plural: Products
admin:
  useAsTitle: name
  defaultColumns:
    - name
    - price
    - inStock
  description: Product catalog management
fields:
  name: "Product name (text)"
`

    const schema = parseYamlSchema(yaml)

    expect(schema.labels?.singular).toBe('Product')
    expect(schema.labels?.plural).toBe('Products')
    expect(schema.admin?.useAsTitle).toBe('name')
    expect(schema.admin?.defaultColumns).toEqual(['name', 'price', 'inStock'])
    expect(schema.admin?.description).toBe('Product catalog management')
  })

  it('should throw error for invalid YAML', () => {
    const yaml = 'invalid: yaml: content:'

    expect(() => parseYamlSchema(yaml)).toThrow()
  })

  it('should throw error for missing name field', () => {
    const yaml = `
fields:
  title: "Title"
`

    expect(() => parseYamlSchema(yaml)).toThrow('missing required field "name"')
  })

  it('should throw error for missing fields', () => {
    const yaml = `
name: Test
`

    expect(() => parseYamlSchema(yaml)).toThrow('missing required field "fields"')
  })

  it('should default slug to lowercase name', () => {
    const yaml = `
name: Blog Post
fields:
  title: "Title"
`

    const schema = parseYamlSchema(yaml)
    expect(schema.slug).toBe('blog-post')
  })
})

describe('validateAgainstSchema', () => {
  const createTestSchema = (): CollectionSchema => ({
    name: 'Test',
    slug: 'test',
    fields: [
      { name: 'title', type: 'text', required: true, minLength: 3, maxLength: 100 } as PayloadField,
      { name: 'count', type: 'number', min: 0, max: 100 } as PayloadField,
      { name: 'published', type: 'checkbox' } as PayloadField,
      { name: 'email', type: 'email', required: true } as PayloadField,
      { name: 'date', type: 'date' } as PayloadField,
      {
        name: 'status',
        type: 'select',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      } as PayloadField,
    ],
    timestamps: true,
  })

  it('should validate valid data', () => {
    const schema = createTestSchema()
    const data = {
      title: 'Test Title',
      count: 50,
      published: true,
      email: 'test@example.com',
      date: '2024-01-01',
      status: 'draft',
    }

    const result = validateAgainstSchema(data, schema)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should detect missing required fields', () => {
    const schema = createTestSchema()
    const data = {
      count: 50,
    }

    const result = validateAgainstSchema(data, schema)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Field "title" is required')
    expect(result.errors).toContain('Field "email" is required')
  })

  it('should validate text field length constraints', () => {
    const schema = createTestSchema()
    const data1 = {
      title: 'ab', // Too short
      email: 'test@example.com',
    }

    const result1 = validateAgainstSchema(data1, schema)
    expect(result1.valid).toBe(false)
    expect(result1.errors).toContain('Field "title" must be at least 3 characters')

    const data2 = {
      title: 'a'.repeat(101), // Too long
      email: 'test@example.com',
    }

    const result2 = validateAgainstSchema(data2, schema)
    expect(result2.valid).toBe(false)
    expect(result2.errors).toContain('Field "title" must be at most 100 characters')
  })

  it('should validate number field constraints', () => {
    const schema = createTestSchema()
    const data1 = {
      title: 'Test',
      email: 'test@example.com',
      count: -1, // Below minimum
    }

    const result1 = validateAgainstSchema(data1, schema)
    expect(result1.valid).toBe(false)
    expect(result1.errors).toContain('Field "count" must be at least 0')

    const data2 = {
      title: 'Test',
      email: 'test@example.com',
      count: 101, // Above maximum
    }

    const result2 = validateAgainstSchema(data2, schema)
    expect(result2.valid).toBe(false)
    expect(result2.errors).toContain('Field "count" must be at most 100')
  })

  it('should validate email format', () => {
    const schema = createTestSchema()
    const data = {
      title: 'Test',
      email: 'invalid-email',
    }

    const result = validateAgainstSchema(data, schema)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Field "email" must be a valid email address')
  })

  it('should validate checkbox as boolean', () => {
    const schema = createTestSchema()
    const data = {
      title: 'Test',
      email: 'test@example.com',
      published: 'yes', // Wrong type
    }

    const result = validateAgainstSchema(data, schema)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Field "published" must be a boolean')
  })

  it('should validate date fields', () => {
    const schema = createTestSchema()
    const data1 = {
      title: 'Test',
      email: 'test@example.com',
      date: '2024-01-01',
    }

    const result1 = validateAgainstSchema(data1, schema)
    expect(result1.valid).toBe(true)

    const data2 = {
      title: 'Test',
      email: 'test@example.com',
      date: 'invalid-date',
    }

    const result2 = validateAgainstSchema(data2, schema)
    expect(result2.valid).toBe(false)
    expect(result2.errors).toContain('Field "date" must be a valid date')
  })

  it('should validate select field options', () => {
    const schema = createTestSchema()
    const data = {
      title: 'Test',
      email: 'test@example.com',
      status: 'invalid',
    }

    const result = validateAgainstSchema(data, schema)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Field "status" must be one of: draft, published')
  })

  it('should validate select field with hasMany', () => {
    const schema: CollectionSchema = {
      name: 'Test',
      slug: 'test',
      fields: [
        {
          name: 'tags',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Tag 1', value: 'tag1' },
            { label: 'Tag 2', value: 'tag2' },
          ],
        } as PayloadField,
      ],
      timestamps: true,
    }

    const data1 = {
      tags: ['tag1', 'tag2'],
    }
    const result1 = validateAgainstSchema(data1, schema)
    expect(result1.valid).toBe(true)

    const data2 = {
      tags: ['tag1', 'invalid'],
    }
    const result2 = validateAgainstSchema(data2, schema)
    expect(result2.valid).toBe(false)
    expect(result2.errors).toContain('Field "tags" contains invalid value "invalid"')
  })

  it('should validate type mismatches', () => {
    const schema = createTestSchema()
    const data = {
      title: 123, // Should be string
      email: 'test@example.com',
    }

    const result = validateAgainstSchema(data, schema)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Field "title" must be a string')
  })

  it('should skip validation for undefined optional fields', () => {
    const schema = createTestSchema()
    const data = {
      title: 'Test',
      email: 'test@example.com',
      // count is optional and not provided
    }

    const result = validateAgainstSchema(data, schema)
    expect(result.valid).toBe(true)
  })
})

describe('payloadToVeliteSchema', () => {
  it('should convert Payload schema to Velite format', () => {
    const payloadSchema: CollectionSchema = {
      name: 'Post',
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text', required: true, admin: { description: 'Post title' } } as PayloadField,
        { name: 'content', type: 'richText', required: false } as PayloadField,
      ],
      timestamps: true,
    }

    const veliteSchema = payloadToVeliteSchema(payloadSchema)

    expect(veliteSchema.title).toBeDefined()
    expect(veliteSchema.title.type).toBe('text')
    expect(veliteSchema.title.required).toBe(true)
    expect(veliteSchema.title.description).toBe('Post title')

    expect(veliteSchema.content).toBeDefined()
    expect(veliteSchema.content.type).toBe('richText')
    expect(veliteSchema.content.required).toBe(false)
  })
})
