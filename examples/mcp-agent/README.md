# MCP Agent Integration Example

This example demonstrates how to create an MCP (Model Context Protocol) server using mdxe, enabling AI agents to interact with your MDX content as tools and resources.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io) is an open protocol that standardizes how AI applications interact with external data sources and tools. This example shows how mdxe can expose your MDX content through MCP for AI agents.

## Features

- 🤖 **MCP Server** - Expose MDX content as MCP resources and tools
- 📚 **Content Resources** - AI agents can read your documentation
- 🛠️ **Custom Tools** - Define tools for agents to manipulate content
- 🔍 **Search Integration** - Full-text search across all content
- 📝 **CRUD Operations** - Create, read, update, delete content via tools
- 🔗 **Resource Bindings** - Link content to agent context

## Quick Start

```bash
# Install dependencies
pnpm install

# Build the database
pnpm db:build

# Start MCP server
pnpm mcp:start

# Test with MCP client
pnpm mcp:test
```

## Project Structure

```
mcp-agent/
├── .db/
│   └── docs-schema.md          # Schema definitions
├── content/
│   ├── guides/                 # Documentation guides
│   ├── api/                    # API documentation
│   └── examples/               # Code examples
├── mcp/
│   ├── server.ts               # MCP server implementation
│   ├── tools.ts                # Tool definitions
│   └── resources.ts            # Resource providers
├── package.json
└── README.md
```

## Schema Definition

The documentation schema is defined in `.db/docs-schema.md`:

```yaml
---
collections:
  guides:
    title: Guide title
    slug: URL slug (string)
    category: Guide category (getting-started | tutorials | advanced)
    tags: Guide tags (array)
    difficulty: Difficulty level (beginner | intermediate | advanced)
    estimatedTime: Estimated reading time in minutes (number)

  api:
    title: API endpoint name
    path: API path (string)
    method: HTTP method (GET | POST | PUT | DELETE | PATCH)
    description: Endpoint description
    parameters: Request parameters (array)
    responses: Response examples (array)

  examples:
    title: Example title
    language: Programming language (javascript | typescript | python | go)
    tags: Example tags (array)
    runnable: Whether example can be executed (boolean)
---

# Documentation Schema

This schema defines documentation structure optimized for AI agent consumption.
```

## MCP Server Implementation

### Basic Setup

```typescript
// mcp/server.ts
import { createMCPServer } from 'mdxe/outputs/mcp'
import { MdxDb } from '@mdxdb/fs'
import { registerDocTools } from './tools'
import { registerDocResources } from './resources'

async function main() {
  // Initialize mdxdb
  const db = new MdxDb(process.cwd())
  await db.build()

  // Create MCP server
  const server = await createMCPServer({
    name: 'docs-mcp',
    version: '1.0.0',
    enableDbTools: true,
    enableResources: true
  })

  // Register tools for content manipulation
  registerDocTools(server, db)

  // Register resources for content access
  registerDocResources(server, db)

  // Connect using stdio
  await server.connectStdio()
}

main().catch(console.error)
```

### Defining Tools

Tools allow AI agents to perform actions on your content:

```typescript
// mcp/tools.ts
import type { MDXEMCPServer } from 'mdxe/outputs/mcp'
import type { MdxDb } from '@mdxdb/fs'

export function registerDocTools(server: MDXEMCPServer, db: MdxDb) {
  // Tool: Search documentation
  server.registerTool(
    {
      name: 'search_docs',
      description: 'Search across all documentation',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          },
          collection: {
            type: 'string',
            description: 'Collection to search (guides, api, examples)',
            enum: ['guides', 'api', 'examples']
          },
          limit: {
            type: 'number',
            description: 'Maximum results to return',
            default: 10
          }
        },
        required: ['query']
      }
    },
    async (args) => {
      const { query, collection, limit = 10 } = args
      const collections = collection ? [collection] : ['guides', 'api', 'examples']

      const results = []
      for (const coll of collections) {
        const docs = db.list(coll)
        const matches = docs.filter(doc =>
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.body?.toLowerCase().includes(query.toLowerCase())
        )
        results.push(...matches.slice(0, limit))
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2)
          }
        ]
      }
    }
  )

  // Tool: Get document by slug
  server.registerTool(
    {
      name: 'get_document',
      description: 'Retrieve a specific document by slug',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description: 'Document slug'
          },
          collection: {
            type: 'string',
            description: 'Collection name',
            enum: ['guides', 'api', 'examples']
          }
        },
        required: ['slug', 'collection']
      }
    },
    async (args) => {
      const { slug, collection } = args
      const doc = db.get(slug, collection)

      if (!doc) {
        return {
          content: [{ type: 'text', text: 'Document not found' }],
          isError: true
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(doc, null, 2)
          }
        ]
      }
    }
  )

  // Tool: List documents in collection
  server.registerTool(
    {
      name: 'list_documents',
      description: 'List all documents in a collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection: {
            type: 'string',
            description: 'Collection name',
            enum: ['guides', 'api', 'examples']
          },
          category: {
            type: 'string',
            description: 'Filter by category (optional)'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by tags (optional)'
          }
        },
        required: ['collection']
      }
    },
    async (args) => {
      const { collection, category, tags } = args
      let docs = db.list(collection)

      // Apply filters
      if (category) {
        docs = docs.filter(doc => doc.category === category)
      }
      if (tags && tags.length > 0) {
        docs = docs.filter(doc =>
          tags.some(tag => doc.tags?.includes(tag))
        )
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              docs.map(d => ({ slug: d.slug, title: d.title, category: d.category })),
              null,
              2
            )
          }
        ]
      }
    }
  )

  // Tool: Create new document
  server.registerTool(
    {
      name: 'create_document',
      description: 'Create a new document',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description: 'Document slug'
          },
          collection: {
            type: 'string',
            description: 'Collection name',
            enum: ['guides', 'api', 'examples']
          },
          title: {
            type: 'string',
            description: 'Document title'
          },
          content: {
            type: 'string',
            description: 'Document content (Markdown/MDX)'
          },
          metadata: {
            type: 'object',
            description: 'Additional frontmatter fields'
          }
        },
        required: ['slug', 'collection', 'title', 'content']
      }
    },
    async (args) => {
      const { slug, collection, title, content, metadata = {} } = args

      try {
        await db.set(
          slug,
          {
            frontmatter: { title, ...metadata },
            body: content
          },
          collection
        )

        return {
          content: [
            {
              type: 'text',
              text: `Document created successfully: ${slug}`
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error creating document: ${error.message}`
            }
          ],
          isError: true
        }
      }
    }
  )

  // Tool: Update existing document
  server.registerTool(
    {
      name: 'update_document',
      description: 'Update an existing document',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description: 'Document slug'
          },
          collection: {
            type: 'string',
            description: 'Collection name',
            enum: ['guides', 'api', 'examples']
          },
          content: {
            type: 'string',
            description: 'Updated content (Markdown/MDX)'
          },
          metadata: {
            type: 'object',
            description: 'Updated frontmatter fields'
          }
        },
        required: ['slug', 'collection']
      }
    },
    async (args) => {
      const { slug, collection, content, metadata } = args

      try {
        const existing = db.get(slug, collection)
        if (!existing) {
          return {
            content: [{ type: 'text', text: 'Document not found' }],
            isError: true
          }
        }

        await db.set(
          slug,
          {
            frontmatter: { ...existing.frontmatter, ...metadata },
            body: content || existing.body
          },
          collection
        )

        return {
          content: [
            {
              type: 'text',
              text: `Document updated successfully: ${slug}`
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error updating document: ${error.message}`
            }
          ],
          isError: true
        }
      }
    }
  )
}
```

### Defining Resources

Resources provide read-only access to content:

```typescript
// mcp/resources.ts
import type { MDXEMCPServer } from 'mdxe/outputs/mcp'
import type { MdxDb } from '@mdxdb/fs'

export function registerDocResources(server: MDXEMCPServer, db: MdxDb) {
  // Resource provider: List all available docs
  server.registerResourceProvider(
    'docs',
    async () => {
      const resources = []

      for (const collection of ['guides', 'api', 'examples']) {
        const docs = db.list(collection)
        docs.forEach(doc => {
          resources.push({
            uri: `mdx://${collection}/${doc.slug}`,
            name: doc.title,
            description: doc.description || doc.excerpt,
            mimeType: 'text/markdown'
          })
        })
      }

      return resources
    },
    async (uri) => {
      // Parse URI: mdx://collection/slug
      const match = uri.match(/^mdx:\/\/([^/]+)\/(.+)$/)
      if (!match) {
        throw new Error(`Invalid URI format: ${uri}`)
      }

      const [, collection, slug] = match
      const doc = db.get(slug, collection)

      if (!doc) {
        throw new Error(`Document not found: ${uri}`)
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: doc.body
          }
        ]
      }
    }
  )
}
```

## Usage with AI Agents

### Claude Desktop

Configure Claude Desktop to use your MCP server:

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "docs": {
      "command": "node",
      "args": ["/path/to/mcp-agent/dist/mcp/server.js"]
    }
  }
}
```

### Testing with MCP Inspector

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Test your server
mcp-inspector node dist/mcp/server.js
```

### Example Agent Interactions

**Search Documentation:**
```
Agent: Search for "authentication" in the guides

Response: [
  {
    "slug": "auth-setup",
    "title": "Setting Up Authentication",
    "category": "getting-started",
    "excerpt": "Learn how to implement authentication..."
  },
  {
    "slug": "oauth-integration",
    "title": "OAuth Integration Guide",
    "category": "advanced",
    "excerpt": "Integrate OAuth providers..."
  }
]
```

**Get Specific Document:**
```
Agent: Get the authentication setup guide

Response: {
  "slug": "auth-setup",
  "title": "Setting Up Authentication",
  "category": "getting-started",
  "body": "# Setting Up Authentication\n\n..."
}
```

**Create New Document:**
```
Agent: Create a new guide called "webhooks" about setting up webhooks

Response: Document created successfully: webhooks
```

## Advanced Features

### Context-Aware Search

```typescript
server.registerTool(
  {
    name: 'smart_search',
    description: 'AI-enhanced context-aware search',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        context: {
          type: 'string',
          description: 'Current user context or conversation topic'
        },
        semantic: {
          type: 'boolean',
          description: 'Use vector search (requires SQLite backend)',
          default: false
        }
      },
      required: ['query']
    }
  },
  async (args) => {
    const { query, context, semantic } = args

    if (semantic) {
      // Use SQLite backend for vector search
      const dbSqlite = new MdxDbSqlite({ url: 'file:./docs.db' })
      await dbSqlite.build()
      const results = await dbSqlite.search(query, 'guides')
      return { content: [{ type: 'text', text: JSON.stringify(results) }] }
    }

    // Regular text search with context ranking
    // ...
  }
)
```

### Resource Subscriptions

Monitor content changes:

```typescript
server.registerResourceProvider(
  'docs-live',
  async () => {
    // Watch for changes
    await db.watch()

    // Return current resources
    return getResourceList()
  },
  async (uri) => {
    // Return latest version
    return getResource(uri)
  }
)
```

### Multi-Model Integration

Use different models for different tasks:

```typescript
// Generate documentation with AI
server.registerTool(
  {
    name: 'generate_docs',
    description: 'Generate documentation using AI',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        type: {
          type: 'string',
          enum: ['guide', 'api', 'example']
        },
        model: {
          type: 'string',
          enum: ['gpt-4', 'claude-3-opus', 'gemini-pro']
        }
      },
      required: ['topic', 'type']
    }
  },
  async (args) => {
    // Use mdxai for generation
    const { ai } = await import('mdxai')
    const content = await ai`Write a ${args.type} about ${args.topic}`

    // Save to database
    const slug = args.topic.toLowerCase().replace(/\s+/g, '-')
    await db.set(slug, {
      frontmatter: { title: args.topic },
      body: content
    }, `${args.type}s`)

    return {
      content: [{ type: 'text', text: `Generated: ${slug}` }]
    }
  }
)
```

## Deployment

### Docker Container

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

CMD ["node", "dist/mcp/server.js"]
```

### Systemd Service

```ini
# /etc/systemd/system/mcp-docs.service
[Unit]
Description=MCP Documentation Server
After=network.target

[Service]
Type=simple
User=mcp
WorkingDirectory=/opt/mcp-agent
ExecStart=/usr/bin/node /opt/mcp-agent/dist/mcp/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## Security Considerations

1. **Authentication:** Add auth for write operations
2. **Rate Limiting:** Prevent abuse of expensive operations
3. **Validation:** Validate all input from agents
4. **Sandboxing:** Run in isolated environment
5. **Logging:** Log all agent actions for audit

## Learn More

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [mdxe MCP Integration](../../packages/mdxe/src/outputs/mcp/README.md)
- [mdxdb Documentation](../../packages/mdxdb/README.md)
- [MCP Examples](https://github.com/modelcontextprotocol/servers)

## License

MIT
