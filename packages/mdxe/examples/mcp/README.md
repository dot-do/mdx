# MCP (Model Context Protocol) Examples

This directory contains examples of using the MCP output format for MDXE.

## What is MCP Output?

MCP (Model Context Protocol) output exposes MDXE functionality through the MCP protocol, enabling AI agents to:

- **Access Database**: CRUD operations on MDX documents
- **Compile & Render MDX**: Process MDX content
- **Access Collections**: Browse structured content
- **Read Resources**: Access MDX files and schemas

## Quick Start

```bash
# Start the example server
node packages/mdxe/examples/mcp/server.ts

# Or integrate with Claude Desktop (see below)
```

## Files

- **`server.ts`** - Complete MCP server implementation with in-memory database
- **`client-example.md`** - Detailed examples of all tool calls and resources
- **`README.md`** - This file

## Server Features

### Tools

1. **db.get** - Get a single document by ID
2. **db.list** - List documents (with glob pattern support)
3. **db.set** - Create/update a document
4. **db.delete** - Delete documents (with glob pattern support)
5. **db.schema** - Get collection schema
6. **mdx.compile** - Compile MDX to JavaScript
7. **mdx.render** - Render MDX to HTML or CLI format

### Resources

1. **collection://** - Access collections and items
   - `collection://posts` - All posts
   - `collection://posts/hello-world` - Specific post
   - `collection://pages` - All pages

2. **schema://** - Access schema definitions
   - `schema:///post` - Post schema
   - `schema:///page` - Page schema

## Example Usage

### Get a Document

```typescript
const response = await callTool('db.get', {
  id: 'posts/hello-world'
})
```

### List Documents with Pattern

```typescript
const response = await callTool('db.list', {
  pattern: 'posts/*'
})
```

### Create/Update Document

```typescript
await callTool('db.set', {
  id: 'posts/new-post',
  data: {
    title: 'New Post',
    content: '# New Post\n\nContent here',
    author: 'Alice',
    published: true
  }
})
```

### Compile MDX

```typescript
const response = await callTool('mdx.compile', {
  content: '# Hello\n\nThis is **MDX**!',
  format: 'function-body'
})
```

### Render MDX to CLI

```typescript
const response = await callTool('mdx.render', {
  content: '# Hello\n\nThis is **MDX**!',
  format: 'cli'
})
```

### Read Collection Resource

```typescript
const response = await readResource('collection://posts/hello-world')
```

## Claude Desktop Integration

### 1. Install Claude Desktop

Download from: https://claude.ai/download

### 2. Configure MCP Server

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mdxe": {
      "command": "node",
      "args": [
        "/absolute/path/to/mdx/packages/mdxe/examples/mcp/server.ts"
      ]
    }
  }
}
```

### 3. Restart Claude Desktop

The server will appear in the MCP section.

### 4. Test Integration

In Claude Desktop, try:
- "List all posts using MCP"
- "Get the post with ID posts/hello-world"
- "Create a new post about TypeScript"
- "Show me the schema for posts"

## Custom Implementation

### Database Adapter

Implement `DatabaseAdapter` interface:

```typescript
import { DatabaseAdapter } from 'mdxe/outputs/mcp'

class MyDatabaseAdapter implements DatabaseAdapter {
  async get(id: string): Promise<any> {
    // Your implementation
  }

  async list(pattern?: string): Promise<Array<{ id: string; data: any }>> {
    // Your implementation
  }

  async set(id: string, data: any): Promise<void> {
    // Your implementation
  }

  async delete(pattern: string): Promise<number> {
    // Your implementation
  }

  async getSchema(collection: string): Promise<any> {
    // Your implementation
  }
}
```

### Collection Adapter

Implement `CollectionAdapter` interface:

```typescript
import { CollectionAdapter } from 'mdxe/outputs/mcp'

class MyCollectionAdapter implements CollectionAdapter {
  async listCollections() {
    // Return array of collections
  }

  async getCollection(name: string) {
    // Return collection with items
  }

  async getItem(collection: string, id: string) {
    // Return specific item
  }
}
```

### Create Custom Server

```typescript
import { createMDXEServer } from 'mdxe/outputs/mcp'

const server = await createMDXEServer({
  name: 'my-mdx-server',
  version: '1.0.0',
  database: new MyDatabaseAdapter(),
  collections: new MyCollectionAdapter(),
  mdxBaseDir: '/path/to/mdx/files',
  schemas: {
    post: { /* schema definition */ },
    page: { /* schema definition */ }
  }
})

await server.connectStdio()
```

## Real-World Examples

### 1. Blog Management

AI agent workflow:
1. `db.list('posts/*')` - Get all posts
2. `db.get('posts/draft-123')` - Read draft
3. `mdx.compile(content)` - Validate syntax
4. `db.set('posts/draft-123', updatedData)` - Save changes
5. `mdx.render(content, { format: 'cli' })` - Preview

### 2. Documentation Generation

AI agent workflow:
1. `db.schema('pages')` - Understand structure
2. Generate MDX content
3. `mdx.compile(generated)` - Validate
4. `db.set('pages/new-doc', data)` - Create page
5. Access via `collection://pages/new-doc`

### 3. Content Migration

AI agent workflow:
1. `db.list('old-format/*')` - Get old content
2. Transform to new format
3. `mdx.compile(transformed)` - Validate
4. `db.set('new-format/...', data)` - Save
5. `db.delete('old-format/*')` - Cleanup

## Architecture

### Protocol Layer

- Uses `@modelcontextprotocol/sdk` for protocol handling
- Stdio transport for Claude Desktop integration
- JSON-RPC 2.0 messages

### Tool Layer

- Database tools for CRUD operations
- MDX tools for compilation/rendering
- Extensible tool registry

### Resource Layer

- Collection resources for structured content
- MDX file resources for raw files
- Schema resources for metadata
- Extensible resource providers

## Debugging

### Enable Verbose Logging

```typescript
process.env.DEBUG = 'mcp:*'
```

### Test Tools Manually

```bash
# Send tool call via stdin
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node server.ts
```

### Check Claude Desktop Logs

```bash
# macOS
tail -f ~/Library/Logs/Claude/mcp*.log

# Windows
# Check %APPDATA%\Claude\logs
```

## Best Practices

1. **Use Glob Patterns**: Leverage `db.list('posts/*')` for efficient queries
2. **Validate with Compile**: Always compile MDX before saving
3. **Schema First**: Get schema before creating content
4. **Batch Operations**: Use patterns for bulk operations
5. **Error Handling**: Wrap tool calls in try/catch

## Limitations

- **Stdio Only**: HTTP transport not yet implemented
- **In-Memory Example**: Production needs persistent database
- **No Authentication**: Add auth layer for production
- **Single Process**: No multi-server support yet

## Troubleshooting

### Server Won't Start

- Check Node.js version (>= 18)
- Verify package is built: `pnpm build`
- Check stdio permissions

### Tools Not Showing in Claude

- Verify config path is absolute
- Restart Claude Desktop
- Check Claude Desktop logs

### Resource Access Fails

- Verify resource URI format
- Check adapter implementation
- Enable debug logging

## Related

- [React-ink Output Examples](../react-ink/README.md) - CLI rendering
- [MCP Protocol Spec](https://spec.modelcontextprotocol.io/)
- [Claude Desktop Docs](https://docs.anthropic.com/claude/docs)
