#!/usr/bin/env node
import { createMDXEServer, DatabaseAdapter, CollectionAdapter } from '../../src/outputs/mcp/index.js'

/**
 * Example in-memory database adapter
 */
class InMemoryDatabase implements DatabaseAdapter {
  private data: Map<string, any> = new Map()

  constructor() {
    // Initialize with some sample data
    this.data.set('posts/hello-world', {
      id: 'posts/hello-world',
      title: 'Hello World',
      content: '# Hello World\n\nThis is my first post!',
      author: 'Alice',
      published: true,
    })

    this.data.set('posts/second-post', {
      id: 'posts/second-post',
      title: 'Second Post',
      content: '# My Second Post\n\nHere is more content.',
      author: 'Bob',
      published: false,
    })

    this.data.set('pages/about', {
      id: 'pages/about',
      title: 'About',
      content: '# About Us\n\nWe are a team of developers.',
    })
  }

  async get(id: string): Promise<any> {
    const result = this.data.get(id)
    if (!result) {
      throw new Error(`Document not found: ${id}`)
    }
    return result
  }

  async list(pattern?: string): Promise<Array<{ id: string; data: any }>> {
    const results: Array<{ id: string; data: any }> = []

    for (const [id, data] of this.data.entries()) {
      if (!pattern || this.matchPattern(id, pattern)) {
        results.push({ id, data })
      }
    }

    return results
  }

  async set(id: string, data: any): Promise<void> {
    this.data.set(id, { ...data, id })
  }

  async delete(pattern: string): Promise<number> {
    let count = 0

    for (const id of this.data.keys()) {
      if (this.matchPattern(id, pattern)) {
        this.data.delete(id)
        count++
      }
    }

    return count
  }

  async getSchema(collection: string): Promise<any> {
    // Return a simple schema
    return {
      collection,
      fields: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        content: { type: 'string', required: true },
        author: { type: 'string' },
        published: { type: 'boolean' },
      },
    }
  }

  private matchPattern(str: string, pattern: string): boolean {
    // Simple glob matching
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    )
    return regex.test(str)
  }
}

/**
 * Example collection adapter
 */
class InMemoryCollections implements CollectionAdapter {
  private db: InMemoryDatabase

  constructor(db: InMemoryDatabase) {
    this.db = db
  }

  async listCollections() {
    const posts = await this.db.list('posts/*')
    const pages = await this.db.list('pages/*')

    return [
      {
        name: 'posts',
        description: 'Blog posts',
        items: posts.map((p) => ({
          id: p.id.replace('posts/', ''),
          title: p.data.title,
          content: p.data.content,
          metadata: {
            author: p.data.author,
            published: p.data.published,
          },
        })),
      },
      {
        name: 'pages',
        description: 'Static pages',
        items: pages.map((p) => ({
          id: p.id.replace('pages/', ''),
          title: p.data.title,
          content: p.data.content,
        })),
      },
    ]
  }

  async getCollection(name: string) {
    const items = await this.db.list(`${name}/*`)

    return {
      name,
      description: `Collection: ${name}`,
      items: items.map((item) => ({
        id: item.id.replace(`${name}/`, ''),
        title: item.data.title,
        content: item.data.content,
        metadata: item.data,
      })),
    }
  }

  async getItem(collection: string, id: string) {
    const data = await this.db.get(`${collection}/${id}`)

    return {
      id,
      title: data.title,
      content: data.content,
      metadata: data,
    }
  }
}

/**
 * Start the MCP server
 */
async function startServer() {
  console.error('Starting MDXE MCP Server...')

  // Create database and collections
  const db = new InMemoryDatabase()
  const collections = new InMemoryCollections(db)

  // Create and start server
  const server = await createMDXEServer({
    name: 'mdxe-example',
    version: '1.0.0',
    database: db,
    collections: collections,
    schemas: {
      post: {
        fields: {
          title: { type: 'string', required: true },
          content: { type: 'string', required: true },
          author: { type: 'string' },
          published: { type: 'boolean' },
        },
      },
      page: {
        fields: {
          title: { type: 'string', required: true },
          content: { type: 'string', required: true },
        },
      },
    },
  })

  console.error('Server configured with:')
  console.error('  - Database tools: db.get, db.list, db.set, db.delete, db.schema')
  console.error('  - MDX tools: mdx.compile, mdx.render')
  console.error('  - Resources: collections (posts, pages), schemas')
  console.error('')
  console.error('Connecting to stdio transport...')

  await server.connectStdio()
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('\nShutting down server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.error('\nShutting down server...')
  process.exit(0)
})

// Start server
startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
