# MCP Server Client Examples

This document shows how to interact with the MDXE MCP server from various AI agents.

## Starting the Server

```bash
node examples/mcp/server.ts
```

The server will listen on stdio transport and expose:

- **Database Tools**: `db.get`, `db.list`, `db.set`, `db.delete`, `db.schema`
- **MDX Tools**: `mdx.compile`, `mdx.render`
- **Resources**: Collections (posts, pages), Schemas

## Example Tool Calls

### 1. Get a Document

```json
{
  "method": "tools/call",
  "params": {
    "name": "db.get",
    "arguments": {
      "id": "posts/hello-world"
    }
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"id\": \"posts/hello-world\",\n  \"title\": \"Hello World\",\n  \"content\": \"# Hello World\\n\\nThis is my first post!\",\n  \"author\": \"Alice\",\n  \"published\": true\n}"
    }
  ]
}
```

### 2. List Documents

```json
{
  "method": "tools/call",
  "params": {
    "name": "db.list",
    "arguments": {
      "pattern": "posts/*"
    }
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "[\n  {\n    \"id\": \"posts/hello-world\",\n    \"data\": {...}\n  },\n  {\n    \"id\": \"posts/second-post\",\n    \"data\": {...}\n  }\n]"
    }
  ]
}
```

### 3. Create/Update Document

```json
{
  "method": "tools/call",
  "params": {
    "name": "db.set",
    "arguments": {
      "id": "posts/new-post",
      "data": {
        "title": "New Post",
        "content": "# New Post\\n\\nContent here",
        "author": "Charlie",
        "published": true
      }
    }
  }
}
```

### 4. Delete Documents

```json
{
  "method": "tools/call",
  "params": {
    "name": "db.delete",
    "arguments": {
      "pattern": "posts/draft-*"
    }
  }
}
```

### 5. Get Schema

```json
{
  "method": "tools/call",
  "params": {
    "name": "db.schema",
    "arguments": {
      "collection": "posts"
    }
  }
}
```

### 6. Compile MDX

```json
{
  "method": "tools/call",
  "params": {
    "name": "mdx.compile",
    "arguments": {
      "content": "# Hello\\n\\nThis is **MDX**!",
      "format": "function-body"
    }
  }
}
```

### 7. Render MDX to CLI

```json
{
  "method": "tools/call",
  "params": {
    "name": "mdx.render",
    "arguments": {
      "content": "# Hello\\n\\nThis is **MDX**!",
      "format": "cli"
    }
  }
}
```

## Example Resource Access

### List Resources

```json
{
  "method": "resources/list"
}
```

**Response:**
```json
{
  "resources": [
    {
      "uri": "collection://posts",
      "name": "posts",
      "description": "Collection: posts",
      "mimeType": "application/json"
    },
    {
      "uri": "collection://posts/hello-world",
      "name": "Hello World",
      "mimeType": "text/markdown"
    },
    {
      "uri": "schema:///post",
      "name": "post",
      "description": "Schema: post",
      "mimeType": "application/json"
    }
  ]
}
```

### Read Resource

```json
{
  "method": "resources/read",
  "params": {
    "uri": "collection://posts/hello-world"
  }
}
```

**Response:**
```json
{
  "contents": [
    {
      "uri": "collection://posts/hello-world",
      "mimeType": "text/markdown",
      "text": "# Hello World\\n\\nThis is my first post!"
    }
  ]
}
```

## Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mdxe": {
      "command": "node",
      "args": ["/path/to/mdx/packages/mdxe/examples/mcp/server.ts"]
    }
  }
}
```

## Usage Patterns

### AI Agent Workflow: Content Management

1. **List all posts**: `db.list("posts/*")`
2. **Read specific post**: `db.get("posts/hello-world")`
3. **Update post**: `db.set("posts/hello-world", { ... })`
4. **Compile to check syntax**: `mdx.compile(content)`
5. **Render preview**: `mdx.render(content, { format: "cli" })`

### AI Agent Workflow: Content Creation

1. **Get schema**: `db.schema("posts")`
2. **Generate content** (using AI)
3. **Validate with compile**: `mdx.compile(content)`
4. **Save**: `db.set("posts/new-post", data)`
5. **Preview**: Access resource `collection://posts/new-post`

### AI Agent Workflow: Batch Operations

1. **List all drafts**: `db.list("posts/draft-*")`
2. **Process each draft** (compile, validate)
3. **Publish**: Update `published: true`
4. **Cleanup**: `db.delete("posts/draft-*")`

## Advanced Examples

### Custom Database Adapter

```typescript
import { DatabaseAdapter } from '@mdxe/mcp'

class PostgresAdapter implements DatabaseAdapter {
  async get(id: string) {
    // Query PostgreSQL
  }

  async list(pattern?: string) {
    // List with pattern matching
  }

  async set(id: string, data: any) {
    // Insert/update
  }

  async delete(pattern: string) {
    // Bulk delete
  }

  async getSchema(collection: string) {
    // Return schema
  }
}
```

### Custom Collection Adapter

```typescript
import { CollectionAdapter } from '@mdxe/mcp'

class FileSystemCollections implements CollectionAdapter {
  async listCollections() {
    // Read directories
  }

  async getCollection(name: string) {
    // Read files in directory
  }

  async getItem(collection: string, id: string) {
    // Read specific file
  }
}
```

### Starting Server with Custom Adapters

```typescript
import { createMDXEServer } from '@mdxe/mcp'

const server = await createMDXEServer({
  database: new PostgresAdapter(),
  collections: new FileSystemCollections('/path/to/content'),
  mdxBaseDir: '/path/to/mdx',
  schemas: {
    post: { /* schema */ },
    page: { /* schema */ }
  }
})

await server.connectStdio()
```
