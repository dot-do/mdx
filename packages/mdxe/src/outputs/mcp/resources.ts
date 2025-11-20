import { ResourceDefinition, ResourceProvider, ResourceReader } from './protocol.js'

/**
 * Collection interface for MCP resources
 */
export interface Collection {
  name: string
  description?: string
  items: CollectionItem[]
}

export interface CollectionItem {
  id: string
  title?: string
  description?: string
  content?: string
  metadata?: Record<string, any>
}

/**
 * Collection adapter interface
 */
export interface CollectionAdapter {
  /**
   * List all collections
   */
  listCollections(): Promise<Collection[]>

  /**
   * Get a specific collection
   */
  getCollection(name: string): Promise<Collection>

  /**
   * Get a specific item from a collection
   */
  getItem(collection: string, id: string): Promise<CollectionItem>
}

/**
 * Create resource provider for collections
 */
export function createCollectionResourceProvider(adapter: CollectionAdapter): {
  provider: ResourceProvider
  reader: ResourceReader
} {
  const provider: ResourceProvider = async () => {
    const collections = await adapter.listCollections()
    const resources: ResourceDefinition[] = []

    for (const collection of collections) {
      // Add collection resource
      resources.push({
        uri: `collection://${collection.name}`,
        name: collection.name,
        description: collection.description || `Collection: ${collection.name}`,
        mimeType: 'application/json',
      })

      // Add individual item resources
      for (const item of collection.items) {
        resources.push({
          uri: `collection://${collection.name}/${item.id}`,
          name: item.title || item.id,
          description: item.description,
          mimeType: 'text/markdown',
        })
      }
    }

    return resources
  }

  const reader: ResourceReader = async (uri: string) => {
    // Parse the URI: collection://collection-name/item-id
    const match = uri.match(/^collection:\/\/([^/]+)(?:\/(.+))?$/)

    if (!match) {
      throw new Error(`Invalid collection URI: ${uri}`)
    }

    const [, collectionName, itemId] = match

    if (!itemId) {
      // Return the entire collection
      const collection = await adapter.getCollection(collectionName)

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(collection, null, 2),
          },
        ],
      }
    }

    // Return a specific item
    const item = await adapter.getItem(collectionName, itemId)

    return {
      contents: [
        {
          uri,
          mimeType: 'text/markdown',
          text: item.content || JSON.stringify(item, null, 2),
        },
      ],
    }
  }

  return { provider, reader }
}

/**
 * Create resource provider for MDX files
 */
export function createMdxFileResourceProvider(baseDir: string): {
  provider: ResourceProvider
  reader: ResourceReader
} {
  const provider: ResourceProvider = async () => {
    const { glob } = await import('fast-glob')
    const path = await import('path')

    const files = await glob('**/*.{md,mdx}', {
      cwd: baseDir,
      absolute: false,
    })

    const resources: ResourceDefinition[] = files.map((file) => ({
      uri: `mdx:///${file}`,
      name: path.basename(file, path.extname(file)),
      description: `MDX file: ${file}`,
      mimeType: 'text/markdown',
    }))

    return resources
  }

  const reader: ResourceReader = async (uri: string) => {
    const fs = await import('fs/promises')
    const path = await import('path')

    // Parse the URI: mdx:///path/to/file.mdx
    const match = uri.match(/^mdx:\/\/\/(.+)$/)

    if (!match) {
      throw new Error(`Invalid MDX URI: ${uri}`)
    }

    const filePath = path.join(baseDir, match[1])
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      contents: [
        {
          uri,
          mimeType: 'text/markdown',
          text: content,
        },
      ],
    }
  }

  return { provider, reader }
}

/**
 * Create resource provider for schema definitions
 */
export function createSchemaResourceProvider(schemas: Record<string, any>): {
  provider: ResourceProvider
  reader: ResourceReader
} {
  const provider: ResourceProvider = async () => {
    const resources: ResourceDefinition[] = Object.keys(schemas).map((name) => ({
      uri: `schema:///${name}`,
      name,
      description: `Schema: ${name}`,
      mimeType: 'application/json',
    }))

    return resources
  }

  const reader: ResourceReader = async (uri: string) => {
    const match = uri.match(/^schema:\/\/\/(.+)$/)

    if (!match) {
      throw new Error(`Invalid schema URI: ${uri}`)
    }

    const schemaName = match[1]
    const schema = schemas[schemaName]

    if (!schema) {
      throw new Error(`Schema not found: ${schemaName}`)
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    }
  }

  return { provider, reader }
}

/**
 * Create a combined resource provider from multiple providers
 */
export function combineResourceProviders(
  providers: Array<{ provider: ResourceProvider; reader: ResourceReader }>
): {
  provider: ResourceProvider
  reader: ResourceReader
} {
  const combinedProvider: ResourceProvider = async () => {
    const allResources: ResourceDefinition[] = []

    for (const { provider } of providers) {
      const resources = await provider()
      allResources.push(...resources)
    }

    return allResources
  }

  const combinedReader: ResourceReader = async (uri: string) => {
    // Try each reader until one succeeds
    for (const { reader } of providers) {
      try {
        return await reader(uri)
      } catch (error) {
        // Continue to next reader
        continue
      }
    }

    throw new Error(`No resource reader found for URI: ${uri}`)
  }

  return { provider: combinedProvider, reader: combinedReader }
}
