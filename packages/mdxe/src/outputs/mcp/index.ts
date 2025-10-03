export {
  MDXEMCPServer,
  createMCPServer,
  type MCPServerOptions,
  type ToolDefinition,
  type ToolHandler,
  type ToolResult,
  type ResourceDefinition,
  type ResourceProvider,
  type ResourceReader,
} from './protocol.js'

export {
  createDbTools,
  createMdxTools,
  type DatabaseAdapter,
} from './tools.js'

export {
  createCollectionResourceProvider,
  createMdxFileResourceProvider,
  createSchemaResourceProvider,
  combineResourceProviders,
  type Collection,
  type CollectionItem,
  type CollectionAdapter,
} from './resources.js'

export {
  createMDXEServer,
  startMDXEServer,
  type MDXEServerOptions,
} from './server.js'
