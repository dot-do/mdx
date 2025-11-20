/**
 * Auto-generate Payload CMS collections from YAML schema definitions
 *
 * This module converts YAML schema definitions (similar to Payload field types)
 * into full Payload collection configurations with proper field mappings.
 */

import type { CollectionConfig, Field } from 'payload'
import { z } from 'zod'

/**
 * YAML schema field definition
 */
export interface SchemaField {
  name: string
  type: string
  required?: boolean
  unique?: boolean
  label?: string
  description?: string
  defaultValue?: any
  options?: Array<{ label: string; value: string }>
  relationTo?: string
  hasMany?: boolean
  min?: number
  max?: number
  admin?: {
    useAsTitle?: boolean
    hidden?: boolean
    readOnly?: boolean
  }
}

/**
 * YAML schema collection definition
 */
export interface SchemaCollection {
  name: string
  slug: string
  fields: SchemaField[]
  admin?: {
    useAsTitle?: string
    defaultColumns?: string[]
    group?: string
  }
  auth?: boolean
  timestamps?: boolean
  hooks?: {
    beforeChange?: string[]
    afterChange?: string[]
    beforeRead?: string[]
    afterRead?: string[]
  }
}

/**
 * Convert YAML field type to Payload field type
 */
function convertFieldType(field: SchemaField): Field {
  const baseField: Partial<Field> = {
    name: field.name,
    label: field.label,
    required: field.required,
    admin: field.admin,
  }

  switch (field.type) {
    case 'text':
    case 'string':
      return {
        ...baseField,
        type: 'text',
        unique: field.unique,
      } as Field

    case 'textarea':
    case 'longText':
      return {
        ...baseField,
        type: 'textarea',
      } as Field

    case 'richText':
    case 'markdown':
    case 'mdx':
      return {
        ...baseField,
        type: 'richText',
      } as Field

    case 'number':
    case 'integer':
      return {
        ...baseField,
        type: 'number',
        min: field.min,
        max: field.max,
      } as Field

    case 'checkbox':
    case 'boolean':
      return {
        ...baseField,
        type: 'checkbox',
        defaultValue: field.defaultValue || false,
      } as Field

    case 'date':
    case 'datetime':
      return {
        ...baseField,
        type: 'date',
      } as Field

    case 'select':
    case 'enum':
      return {
        ...baseField,
        type: 'select',
        options: field.options || [],
      } as Field

    case 'relationship':
    case 'relation':
      return {
        ...baseField,
        type: 'relationship',
        relationTo: field.relationTo || 'files',
        hasMany: field.hasMany,
      } as Field

    case 'json':
    case 'object':
      return {
        ...baseField,
        type: 'json',
      } as Field

    case 'array':
      return {
        ...baseField,
        type: 'array',
        fields: [],
      } as Field

    case 'email':
      return {
        ...baseField,
        type: 'email',
      } as Field

    case 'url':
      return {
        ...baseField,
        type: 'text',
      } as Field

    case 'slug':
      return {
        ...baseField,
        type: 'text',
        unique: true,
      } as Field

    default:
      // Default to text for unknown types
      console.warn(`Unknown field type: ${field.type}, defaulting to 'text'`)
      return {
        ...baseField,
        type: 'text',
      } as Field
  }
}

/**
 * Generate Payload collection from schema definition
 */
export function generateCollection(schema: SchemaCollection): CollectionConfig {
  const fields: Field[] = schema.fields.map(convertFieldType)

  // Add standard timestamps if enabled (default: true)
  const timestamps = schema.timestamps !== false

  const collection: CollectionConfig = {
    slug: schema.slug,
    fields,
    timestamps,
  }

  // Add admin config if provided
  if (schema.admin) {
    const firstTextField = fields.find(f => f.type === 'text')
    collection.admin = {
      useAsTitle: schema.admin.useAsTitle || (firstTextField && 'name' in firstTextField ? firstTextField.name : 'id'),
      defaultColumns: schema.admin.defaultColumns,
      group: schema.admin.group,
    }
  }

  // Add auth if enabled
  if (schema.auth) {
    collection.auth = true
  }

  return collection
}

/**
 * Generate multiple collections from schema definitions
 */
export function generateCollections(schemas: SchemaCollection[]): CollectionConfig[] {
  return schemas.map(generateCollection)
}

/**
 * Default MDX file collection for mdxdb
 */
export const MDX_FILES_COLLECTION: SchemaCollection = {
  name: 'MDX Files',
  slug: 'files',
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      description: 'Unique identifier for this document',
    },
    {
      name: 'collection',
      type: 'text',
      required: true,
      label: 'Collection',
      description: 'Collection this document belongs to',
    },
    {
      name: 'frontmatter',
      type: 'json',
      required: true,
      label: 'Frontmatter',
      description: 'YAML frontmatter data',
    },
    {
      name: 'mdx',
      type: 'textarea',
      required: true,
      label: 'MDX Content',
      description: 'Full MDX content with frontmatter',
    },
    {
      name: 'markdown',
      type: 'textarea',
      required: true,
      label: 'Markdown Content',
      description: 'Markdown body without frontmatter',
    },
    {
      name: 'html',
      type: 'textarea',
      required: true,
      label: 'HTML',
      description: 'Rendered HTML output',
    },
    {
      name: 'code',
      type: 'textarea',
      required: true,
      label: 'Code',
      description: 'Compiled JavaScript/React code',
    },
  ],
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'collection', 'updatedAt'],
  },
}

/**
 * Default embeddings collection for vector search
 */
export const EMBEDDINGS_COLLECTION: SchemaCollection = {
  name: 'Embeddings',
  slug: 'embeddings',
  fields: [
    {
      name: 'fileId',
      type: 'relationship',
      relationTo: 'files',
      required: true,
      label: 'File',
      description: 'Reference to the source file',
    },
    {
      name: 'collection',
      type: 'text',
      required: true,
      label: 'Collection',
      description: 'Collection this embedding belongs to',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Content',
      description: 'Text content that was embedded',
    },
    {
      name: 'chunkType',
      type: 'select',
      required: true,
      label: 'Chunk Type',
      description: 'Type of content chunk',
      options: [
        { label: 'Full Document', value: 'document' },
        { label: 'Frontmatter', value: 'frontmatter' },
        { label: 'Section', value: 'section' },
      ],
    },
    {
      name: 'sectionPath',
      type: 'text',
      required: false,
      label: 'Section Path',
      description: 'Hierarchical path to section (e.g., "Chapter 1 > Section 2")',
    },
    {
      name: 'vector',
      type: 'json',
      required: true,
      label: 'Vector',
      description: 'Embedding vector (1536 dimensions)',
    },
  ],
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['fileId', 'chunkType', 'collection', 'updatedAt'],
  },
  timestamps: true,
}

/**
 * Get default collections for mdxdb
 */
export function getDefaultCollections(): CollectionConfig[] {
  return [
    generateCollection(MDX_FILES_COLLECTION),
    generateCollection(EMBEDDINGS_COLLECTION),
  ]
}
