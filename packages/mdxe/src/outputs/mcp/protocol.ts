import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

export interface MCPServerOptions {
  /**
   * Server name
   */
  name?: string

  /**
   * Server version
   */
  version?: string

  /**
   * Enable database tools
   */
  enableDbTools?: boolean

  /**
   * Enable resource bindings
   */
  enableResources?: boolean

  /**
   * Custom tool handlers
   */
  tools?: Map<string, ToolHandler>

  /**
   * Custom resource providers
   */
  resources?: Map<string, ResourceProvider>
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

export interface ToolHandler {
  (args: Record<string, any>): Promise<ToolResult>
}

export interface ToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource'
    text?: string
    data?: string
    mimeType?: string
    uri?: string
  }>
  isError?: boolean
}

export interface ResourceDefinition {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

export interface ResourceProvider {
  (): Promise<ResourceDefinition[]>
}

export interface ResourceReader {
  (uri: string): Promise<{
    contents: Array<{
      uri: string
      mimeType?: string
      text?: string
      blob?: string
    }>
  }>
}

/**
 * MCP Protocol Server for MDXE
 */
export class MDXEMCPServer {
  private server: Server
  private tools: Map<string, ToolHandler>
  private toolDefinitions: Map<string, ToolDefinition>
  private resourceProviders: Map<string, ResourceProvider>
  private resourceReaders: Map<string, ResourceReader>

  constructor(options: MCPServerOptions = {}) {
    this.tools = options.tools || new Map()
    this.toolDefinitions = new Map()
    this.resourceProviders = options.resources || new Map()
    this.resourceReaders = new Map()

    this.server = new Server(
      {
        name: options.name || 'mdxe-mcp',
        version: options.version || '0.1.0',
      },
      {
        capabilities: {
          tools: options.enableDbTools !== false ? {} : undefined,
          resources: options.enableResources !== false ? {} : undefined,
        },
      }
    )

    this.setupHandlers()
  }

  /**
   * Register a tool handler
   */
  registerTool(definition: ToolDefinition, handler: ToolHandler) {
    this.toolDefinitions.set(definition.name, definition)
    this.tools.set(definition.name, handler)
  }

  /**
   * Register a resource provider
   */
  registerResourceProvider(name: string, provider: ResourceProvider, reader: ResourceReader) {
    this.resourceProviders.set(name, provider)
    this.resourceReaders.set(name, reader)
  }

  private setupHandlers() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Array.from(this.toolDefinitions.values()),
      }
    })

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params
      const handler = this.tools.get(name)

      if (!handler) {
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        }
      }

      try {
        return await handler(args as Record<string, any>)
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        }
      }
    })

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const allResources: ResourceDefinition[] = []

      for (const provider of this.resourceProviders.values()) {
        const resources = await provider()
        allResources.push(...resources)
      }

      return {
        resources: allResources,
      }
    })

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params

      // Find the appropriate reader based on URI pattern
      for (const [name, reader] of this.resourceReaders.entries()) {
        try {
          return await reader(uri)
        } catch (error) {
          // Try next reader
          continue
        }
      }

      throw new Error(`No resource reader found for URI: ${uri}`)
    })
  }

  /**
   * Connect using stdio transport
   */
  async connectStdio() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('MDXE MCP Server running on stdio')
  }

  /**
   * Get the underlying MCP server
   */
  getServer(): Server {
    return this.server
  }
}

/**
 * Create an MDXE MCP server
 */
export async function createMCPServer(options: MCPServerOptions = {}): Promise<MDXEMCPServer> {
  return new MDXEMCPServer(options)
}
