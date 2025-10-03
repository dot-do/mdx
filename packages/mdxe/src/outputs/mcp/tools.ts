import { ToolDefinition, ToolHandler } from './protocol.js'

/**
 * Database interface for MCP tools
 * This should be implemented by the consuming application
 */
export interface DatabaseAdapter {
  /**
   * Get a single document by ID
   */
  get(id: string): Promise<any>

  /**
   * List documents matching a pattern
   */
  list(pattern?: string): Promise<Array<{ id: string; data: any }>>

  /**
   * Set/update a document
   */
  set(id: string, data: any): Promise<void>

  /**
   * Delete documents matching a pattern
   */
  delete(pattern: string): Promise<number>

  /**
   * Get collection schema
   */
  getSchema?(collection: string): Promise<any>
}

/**
 * Create database tool definitions and handlers
 */
export function createDbTools(db: DatabaseAdapter): Map<string, { definition: ToolDefinition; handler: ToolHandler }> {
  const tools = new Map<string, { definition: ToolDefinition; handler: ToolHandler }>()

  // db.get tool
  tools.set('db.get', {
    definition: {
      name: 'db.get',
      description: 'Get a single document from the database by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Document ID to retrieve',
          },
        },
        required: ['id'],
      },
    },
    handler: async (args) => {
      const result = await db.get(args.id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    },
  })

  // db.list tool
  tools.set('db.list', {
    definition: {
      name: 'db.list',
      description: 'List documents from the database, optionally filtered by glob pattern',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Optional glob pattern to filter results (e.g., "posts/*")',
          },
        },
      },
    },
    handler: async (args) => {
      const results = await db.list(args.pattern)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      }
    },
  })

  // db.set tool
  tools.set('db.set', {
    definition: {
      name: 'db.set',
      description: 'Create or update a document in the database',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Document ID',
          },
          data: {
            type: 'object',
            description: 'Document data (JSON object)',
          },
        },
        required: ['id', 'data'],
      },
    },
    handler: async (args) => {
      await db.set(args.id, args.data)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                id: args.id,
                message: 'Document saved successfully',
              },
              null,
              2
            ),
          },
        ],
      }
    },
  })

  // db.delete tool
  tools.set('db.delete', {
    definition: {
      name: 'db.delete',
      description: 'Delete documents matching a glob pattern',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Glob pattern for documents to delete (e.g., "drafts/*")',
          },
        },
        required: ['pattern'],
      },
    },
    handler: async (args) => {
      const count = await db.delete(args.pattern)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                count,
                message: `Deleted ${count} document(s)`,
              },
              null,
              2
            ),
          },
        ],
      }
    },
  })

  // db.schema tool (optional)
  if (db.getSchema) {
    tools.set('db.schema', {
      definition: {
        name: 'db.schema',
        description: 'Get the schema definition for a collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
          },
          required: ['collection'],
        },
      },
      handler: async (args) => {
        const schema = await db.getSchema!(args.collection)

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(schema, null, 2),
            },
          ],
        }
      },
    })
  }

  return tools
}

/**
 * MDX-specific tools
 */
export function createMdxTools(): Map<string, { definition: ToolDefinition; handler: ToolHandler }> {
  const tools = new Map<string, { definition: ToolDefinition; handler: ToolHandler }>()

  // mdx.compile tool
  tools.set('mdx.compile', {
    definition: {
      name: 'mdx.compile',
      description: 'Compile MDX content to JavaScript',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'MDX content to compile',
          },
          format: {
            type: 'string',
            description: 'Output format: "function-body" or "program"',
            enum: ['function-body', 'program'],
          },
        },
        required: ['content'],
      },
    },
    handler: async (args) => {
      const { compile } = await import('@mdx-js/mdx')
      const { VFile } = await import('vfile')

      const vfile = new VFile({ value: args.content })
      const compiled = await compile(vfile, {
        outputFormat: (args.format as 'function-body' | 'program') || 'function-body',
      })

      return {
        content: [
          {
            type: 'text',
            text: String(compiled),
          },
        ],
      }
    },
  })

  // mdx.render tool
  tools.set('mdx.render', {
    definition: {
      name: 'mdx.render',
      description: 'Render MDX content to HTML or CLI format',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'MDX content to render',
          },
          format: {
            type: 'string',
            description: 'Output format: "html", "cli", or "ansi"',
            enum: ['html', 'cli', 'ansi'],
          },
        },
        required: ['content'],
      },
    },
    handler: async (args) => {
      const format = args.format || 'html'

      if (format === 'cli' || format === 'ansi') {
        const { renderMdxToAnsi } = await import('../react-ink/renderer.js')
        const { defaultInkComponents } = await import('../react-ink/components.js')

        const output = await renderMdxToAnsi(args.content, {
          components: defaultInkComponents,
        })

        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        }
      }

      // HTML rendering would go here
      return {
        content: [
          {
            type: 'text',
            text: 'HTML rendering not yet implemented',
          },
        ],
      }
    },
  })

  return tools
}
