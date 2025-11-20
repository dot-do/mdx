import { MDXEMCPServer, MCPServerOptions } from './protocol.js'
import { createDbTools, DatabaseAdapter } from './tools.js'
import { createMdxTools } from './tools.js'
import {
  createCollectionResourceProvider,
  createMdxFileResourceProvider,
  createSchemaResourceProvider,
  combineResourceProviders,
  CollectionAdapter,
} from './resources.js'

/**
 * Extended MCP server options with database and collections
 */
export interface MDXEServerOptions extends MCPServerOptions {
  /**
   * Database adapter for db.* tools
   */
  database?: DatabaseAdapter

  /**
   * Collection adapter for collection:// resources
   */
  collections?: CollectionAdapter

  /**
   * Base directory for MDX files
   */
  mdxBaseDir?: string

  /**
   * Schema definitions for schema:// resources
   */
  schemas?: Record<string, any>
}

/**
 * Create a fully configured MDXE MCP server
 */
export async function createMDXEServer(options: MDXEServerOptions = {}): Promise<MDXEMCPServer> {
  const server = new MDXEMCPServer({
    name: options.name || 'mdxe-mcp',
    version: options.version || '0.1.0',
    enableDbTools: !!options.database,
    enableResources: !!(options.collections || options.mdxBaseDir || options.schemas),
  })

  // Register database tools if database adapter provided
  if (options.database) {
    const dbTools = createDbTools(options.database)

    for (const [name, { definition, handler }] of dbTools.entries()) {
      server.registerTool(definition, handler)
    }
  }

  // Register MDX tools
  const mdxTools = createMdxTools()
  for (const [name, { definition, handler }] of mdxTools.entries()) {
    server.registerTool(definition, handler)
  }

  // Register resource providers
  const resourceProviders: Array<{ provider: any; reader: any }> = []

  if (options.collections) {
    const { provider, reader } = createCollectionResourceProvider(options.collections)
    resourceProviders.push({ provider, reader })
  }

  if (options.mdxBaseDir) {
    const { provider, reader } = createMdxFileResourceProvider(options.mdxBaseDir)
    resourceProviders.push({ provider, reader })
  }

  if (options.schemas) {
    const { provider, reader } = createSchemaResourceProvider(options.schemas)
    resourceProviders.push({ provider, reader })
  }

  if (resourceProviders.length > 0) {
    const { provider, reader } = combineResourceProviders(resourceProviders)
    server.registerResourceProvider('combined', provider, reader)
  }

  return server
}

/**
 * Start an MDXE MCP server with stdio transport
 */
export async function startMDXEServer(options: MDXEServerOptions = {}): Promise<void> {
  const server = await createMDXEServer(options)
  await server.connectStdio()

  // Keep process alive
  process.on('SIGINT', () => {
    console.error('Shutting down MDXE MCP Server...')
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.error('Shutting down MDXE MCP Server...')
    process.exit(0)
  })
}
