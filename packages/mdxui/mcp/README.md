# @mdxui/mcp - Model Context Protocol Server for MDX

Model Context Protocol (MCP) server that provides AI assistants with tools to read, search, and interact with MDX files. Enables Claude, ChatGPT, and other AI tools to understand and work with MDX content, YAML-LD frontmatter, and schema.org types.

## Features

- **File Operations** - Read, write, and search MDX files
- **Schema.org Integration** - Query and validate YAML-LD frontmatter
- **Component Discovery** - Find and document MDX components
- **Content Generation** - Generate MDX content with AI assistance
- **Type Safety** - Fully typed with Zod schema validation
- **CLI Tool** - Run as standalone MCP server or integrate into apps

## Installation

```bash
pnpm add @mdxui/mcp
```

## Usage

### As MCP Server (CLI)

Start the MCP server for use with Claude Desktop, Cody, or other MCP clients:

```bash
# Start server on default port (3000)
mdxui-mcp start

# Start with custom configuration
mdxui-mcp start --port 3001 --root ./content
```

### Programmatic Usage

```typescript
import { createMcpServer } from '@mdxui/mcp'

const server = createMcpServer({
  rootDir: process.cwd(),
  tools: ['read', 'search', 'generate'],
})

await server.start()
```

## MCP Tools

The server exposes the following tools to AI assistants:

### `mdx_read`

Read an MDX file and return its content, frontmatter, and metadata.

```typescript
{
  path: string              // Path to MDX file
  parseComponents?: boolean // Extract component usage (default: true)
}
```

**Returns:**
```typescript
{
  content: string           // Raw MDX content
  frontmatter: object       // Parsed YAML-LD frontmatter
  components: string[]      // List of components used
  metadata: {
    wordCount: number
    readingTime: number
    lastModified: string
  }
}
```

### `mdx_search`

Search for MDX files by content, frontmatter, or schema.org types.

```typescript
{
  query: string             // Search query
  types?: string[]          // Filter by schema.org types
  limit?: number            // Max results (default: 10)
}
```

**Returns:**
```typescript
{
  results: Array<{
    path: string
    title: string
    excerpt: string
    score: number
    type: string            // schema.org type
  }>
}
```

### `mdx_generate`

Generate MDX content with AI assistance.

```typescript
{
  prompt: string            // Generation prompt
  type?: string             // schema.org type
  template?: string         // Template to use
}
```

**Returns:**
```typescript
{
  content: string           // Generated MDX content
  frontmatter: object       // Suggested frontmatter
}
```

### `mdx_validate`

Validate MDX file structure and schema.org frontmatter.

```typescript
{
  path: string              // Path to MDX file
  strict?: boolean          // Strict validation (default: false)
}
```

**Returns:**
```typescript
{
  valid: boolean
  errors: string[]
  warnings: string[]
}
```

## Configuration

### Server Config

```typescript
interface McpServerConfig {
  rootDir: string           // Root directory for MDX files
  port?: number             // Server port (default: 3000)
  host?: string             // Server host (default: localhost)
  tools?: string[]          // Enabled tools (default: all)
  cache?: boolean           // Enable caching (default: true)
}
```

### Claude Desktop Integration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mdxui": {
      "command": "mdxui-mcp",
      "args": ["start", "--root", "/path/to/mdx/files"],
      "env": {}
    }
  }
}
```

### VS Code Integration

Add to your Cody extension settings:

```json
{
  "cody.experimental.mcp.servers": {
    "mdxui": {
      "command": "mdxui-mcp",
      "args": ["start"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

## CLI Commands

```bash
# Start MCP server
mdxui-mcp start [options]

# List available tools
mdxui-mcp tools

# Validate configuration
mdxui-mcp validate

# Show version
mdxui-mcp version
```

### CLI Options

```
--root <dir>      Root directory for MDX files (default: cwd)
--port <number>   Server port (default: 3000)
--host <string>   Server host (default: localhost)
--tools <list>    Comma-separated list of enabled tools
--cache           Enable caching (default: true)
--no-cache        Disable caching
--verbose         Verbose logging
--quiet           Minimal logging
```

## Examples

### With Claude Desktop

Once configured, you can ask Claude to work with your MDX files:

```
User: Can you read the file ./docs/introduction.mdx and summarize it?
Claude: [Uses mdx_read tool to read the file, then provides summary]

User: Find all blog posts about React
Claude: [Uses mdx_search tool with query="React" and type="BlogPosting"]

User: Generate a new blog post about TypeScript best practices
Claude: [Uses mdx_generate tool to create MDX content]
```

### Programmatic Example

```typescript
import { createMcpServer } from '@mdxui/mcp'
import { readMdxFile } from 'mdxld'

const server = createMcpServer({
  rootDir: './content',
  tools: ['read', 'search'],
})

// Add custom tool
server.addTool('custom_tool', {
  description: 'Custom MDX processing',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string' },
    },
  },
  handler: async ({ path }) => {
    const content = await readMdxFile(path)
    // Custom processing...
    return { result: '...' }
  },
})

await server.start()
console.log('MCP server running on http://localhost:3000')
```

## Architecture

```
@mdxui/mcp
├── server.ts          # MCP server implementation
├── cli.ts             # CLI entry point
├── tools/             # Individual MCP tools
│   ├── read.ts
│   ├── search.ts
│   ├── generate.ts
│   └── validate.ts
├── types/             # TypeScript types
└── utils/             # Helper functions
```

## Dependencies

- **@modelcontextprotocol/sdk** - MCP SDK for tool implementations
- **mdxld** - MDX file reading and parsing
- **mdxui** - UI components for generated content
- **mdxai** - AI-powered content generation
- **commander** - CLI framework
- **zod** - Schema validation

## Performance

- **Caching** - File contents cached in memory (configurable)
- **Streaming** - Large file support with streaming
- **Concurrent** - Handles multiple requests concurrently
- **Efficient** - Minimal overhead, optimized for speed

## Security

- **Path Validation** - Prevents directory traversal
- **Rate Limiting** - Configurable request rate limits
- **Access Control** - Optional authentication
- **Sandboxing** - Runs in isolated process

## Troubleshooting

### Server won't start

Check that the port isn't already in use:
```bash
lsof -i :3000
```

### Tools not appearing in Claude

Verify the configuration file syntax:
```bash
mdxui-mcp validate
```

### Performance issues

Enable caching and reduce concurrent requests:
```bash
mdxui-mcp start --cache --max-concurrent 5
```

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - Official MCP documentation
- [Claude Desktop](https://claude.ai/download) - Claude desktop app with MCP support
- [Cody](https://sourcegraph.com/cody) - VS Code AI assistant with MCP

## License

MIT

## Related Packages

- [mdxld](../../mdxld) - MDX linked data parsing
- [mdxai](../../mdxai) - AI-powered MDX generation
- [mdxui](../) - MDX UI components
- [@mdxui/core](../core) - Core UI components
