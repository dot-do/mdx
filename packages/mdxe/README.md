# mdxe - Zero-Config CLI for MDX Development with Embedded CMS

`mdxe` is a batteries-included CLI that provides a complete MDX development environment with an embedded CMS. Build documentation sites, blogs, and content-driven applications with zero configuration.

## Features

- 🚀 **Zero Configuration**: Get started instantly with no setup
- 📝 **MDX Support**: Write content in Markdown with React components
- 🎨 **Built-in Components**: Alert, YouTube, Callout, and more
- 🔧 **Extensible**: Add custom components with `mdx-components.js`
- 📊 **Embedded CMS**: Payload CMS with SQLite by default
- 🎯 **Next.js 14+**: Built on the latest Next.js with App Router
- 🎨 **Tailwind CSS**: Beautiful styling out of the box
- 🔄 **Content Management**: File-based and CMS-based content
- 🗃️ **Multiple Databases**: SQLite, PostgreSQL, MongoDB support
- 🔧 **Code Block Execution**: Run TypeScript/JavaScript directly from MDX files
- 🧪 **Test Runner**: Execute tests embedded in your documentation
- 🏗️ **Build Pipeline**: Production-ready builds with esbuild optimization
- ✨ **SDK.do Integration**: Business-as-Code runtime with AI, database, and API capabilities

## Installation

```bash
npm install mdxe
```

## Quick Start

```bash
# Start development server
npx mdxe dev

# Build for production
npx mdxe build

# Start production server
npx mdxe start

# Execute TypeScript code
npx mdxe code repl
npx mdxe code exec "return 2 + 2"
npx mdxe code script.ts
```

## Project Structure

When you run `mdxe dev`, it creates a temporary project with:

```
project/
├── content/              # Your MDX content files
│   └── index.mdx        # Sample content
├── mdx-components.js    # Custom MDX components (optional)
├── .env.example         # Environment variables template
└── .next/               # Next.js build output (after build)
```

## Writing Content

### MDX Files

Create `.mdx` files in the `content/` directory:

```mdx
---
title: 'My First Post'
description: 'This is my first MDX post'
date: '2024-01-01'
---

# My First Post

This is **bold** text and this is _italic_ text.

## Built-in Components

<Alert type='info'>This is an info alert!</Alert>

<YouTube id='dQw4w9WgXcQ' />

<Callout emoji='💡'>This is a callout with an emoji!</Callout>

## Executable Code

\`\`\`typescript
console.log('This code runs automatically!')
\`\`\`

\`\`\`typescript test
// This runs only during testing
expect(2 + 2).toBe(4)
\`\`\`
```

### Custom Components

Create an `mdx-components.js` file to add your own components:

```javascript
// mdx-components.js
export function useMDXComponents(components) {
  return {
    ...components,
    MyCustomComponent: ({ children }) => <div className='bg-blue-100 p-4 rounded'>{children}</div>,
  }
}
```

## Content Management

### File-based Content

- Write MDX files in the `content/` directory
- Files are automatically processed by Contentlayer
- Supports frontmatter for metadata
- Live reloading in development

### CMS-based Content

- Access the admin panel at `/admin`
- Create and edit posts and pages
- Rich text editor with Lexical
- Media management
- User authentication

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Payload CMS
PAYLOAD_SECRET=your-secret-key
DATABASE_URL=file:./payload.db

# For PostgreSQL
# DATABASE_URL=postgres://user:password@localhost:5432/mdxe

# For MongoDB
# DATABASE_URL=mongodb://localhost:27017/mdxe
```

### Database Options

mdxe supports multiple databases:

- **SQLite** (default): `file:./payload.db`
- **PostgreSQL**: `postgres://user:password@localhost:5432/mdxe`
- **MongoDB**: `mongodb://localhost:27017/mdxe`

The database adapter is automatically chosen based on the `DATABASE_URL`.

## Built-in Components

### Alert

```mdx
<Alert type='info'>Info message</Alert>
<Alert type='warning'>Warning message</Alert>
<Alert type='error'>Error message</Alert>
<Alert type='success'>Success message</Alert>
```

### YouTube

```mdx
<YouTube id='dQw4w9WgXcQ' title='My Video' />
```

### Callout

```mdx
<Callout emoji='🚀'>This is a callout with an emoji!</Callout>
```

## Advanced Features

### SDK.do Integration (Business-as-Code Runtime)

mdxe automatically integrates with [sdk.do](https://sdk.do) when available, providing a powerful Business-as-Code runtime with AI, database, and API capabilities.

**Setup:**
1. Add `sdk.do` to your dependencies
2. Create `.env` with your API keys
3. Use `$` and other globals in your MDX files

**Example:**
```mdx
# AI-Powered Content

```typescript
// Use the $ runtime for AI operations
const haiku = await $.ai.generate('Write a haiku about TypeScript')
console.log(haiku)

// Database operations
const records = await $.db.find({ type: 'post' })

// API calls
const data = await $.api.get('https://api.example.com/data')
```

// Test with mocked AI
```typescript test
describe('AI integration', () => {
  it('generates text', async () => {
    const result = await $.ai.generate('test prompt')
    expect(result).toBeDefined()
  })
})
```
```

**Available Globals:**
- `$` - Full Business-as-Code runtime
  - `$.ai.generate(prompt)` - AI text generation
  - `$.ai.embed(text)` - Generate embeddings
  - `$.ai.models` - Model registry and pricing
  - `$.db.find(query)` - Database queries
  - `$.db.create(data)` - Create records
  - `$.api.get(url)` - HTTP requests
  - `$.send.email(...)` - Send emails
  - `$.send.webhook(...)` - Trigger webhooks
- `ai` - AI operations (legacy, use `$.ai`)
- `db` - Database operations (legacy, use `$.db`)
- `on`, `send` - Event system
- `list`, `research`, `extract` - Utility functions

**Environment Variables:**
```env
# .env file
API_BASE_URL=https://api.do
API_KEY=your_api_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

**Fallback Behavior:**
If sdk.do is not available, mdxe provides stub implementations for development and testing. No errors will occur.

### Code Block Execution

```typescript
// Share state between blocks
exportVar('data', { count: 0 })

// Use in another block
const data = importVar('data')
data.count++
console.log(data.count) // 1
```

### Event Communication

```typescript
// Listen for events
on('user-action', (payload) => {
  console.log('Received:', payload)
})

// Send events
send('user-action', { type: 'click', target: 'button' })
```

## Code Execution (Code Mode)

The `mdxe code` command provides a powerful TypeScript execution environment powered by Cloudflare's Dynamic Worker Loader API. Execute code locally or in secure V8 isolates with access to platform services.

### Three Execution Modes

#### 1. REPL Mode (Interactive)

Start an interactive TypeScript REPL:

```bash
npx mdxe code
# or explicitly
npx mdxe code repl
```

**Features:**
- Line-by-line TypeScript execution
- Variable persistence between commands
- Async/await support
- Syntax highlighting and autocomplete (if supported by terminal)
- Access to service bindings (when configured)

**Example REPL Session:**
```typescript
> const x = 42
42

> const y = await Promise.resolve(x * 2)
84

> return { x, y, sum: x + y }
{ x: 42, y: 84, sum: 126 }

> .exit  // or Ctrl+C to exit
```

#### 2. Inline Execution

Execute code directly from the command line:

```bash
npx mdxe code exec "return 2 + 2"
# Output: 4

npx mdxe code exec "const data = { name: 'Alice', age: 30 }; return data"
# Output: { name: 'Alice', age: 30 }

npx mdxe code exec "return await fetch('https://api.example.com/data').then(r => r.json())"
# Output: { ... API response ... }
```

**Use Cases:**
- Quick calculations
- One-off data transformations
- Testing API responses
- Debugging expressions

#### 3. File Execution

Execute TypeScript files:

```bash
npx mdxe code script.ts
npx mdxe code ./path/to/file.ts
```

**Example `script.ts`:**
```typescript
// Access environment variables
const apiKey = process.env.API_KEY

// Async operations
const response = await fetch('https://api.example.com/data', {
  headers: { Authorization: `Bearer ${apiKey}` }
})

const data = await response.json()

// Use service bindings (if configured)
if (typeof DB !== 'undefined') {
  await DB.query('INSERT INTO logs (data) VALUES (?)', JSON.stringify(data))
}

// Return result
return {
  success: true,
  recordCount: data.length,
  timestamp: new Date().toISOString()
}
```

### Command Options

All three modes support these options:

```bash
--bindings <list>    # Service bindings to enable (comma-separated)
                     # Example: --bindings db,email,queue

--timeout <ms>       # Execution timeout in milliseconds
                     # Default: 30000 (30 seconds)
                     # Max: Depends on authorization tier

--cache              # Enable result caching (useful for expensive operations)
                     # Results cached for 1 hour

--output <format>    # Output format: 'json' or 'text'
                     # Default: 'json'
```

**Examples:**
```bash
# With database binding
npx mdxe code exec "return await DB.query('SELECT COUNT(*) FROM users')" --bindings db

# With email binding and timeout
npx mdxe code exec "await EMAIL.send('test@example.com', 'Hello', 'World')" --bindings email --timeout 5000

# Enable caching for expensive operation
npx mdxe code script.ts --cache

# Output as plain text
npx mdxe code exec "return 'Hello, World!'" --output text
```

### Service Bindings

When running with the DO worker, you can access platform services:

```typescript
// Database operations
const users = await DB.query('SELECT * FROM users WHERE active = true')

// Email sending
await EMAIL.send(
  'user@example.com',
  'Welcome!',
  'Thanks for signing up!'
)

// Queue messages
await QUEUE.send('process-data', { userId: 123, data: {...} })

// AI operations (internal tier only)
const embedding = await AI.generateEmbedding('Hello world')

// MCP tools (internal tier only)
const tools = await MCP.listTools()
```

**Available Bindings by Authorization Tier:**

| Tier | Bindings | Description |
|------|----------|-------------|
| **Public** | `db` | Regular users - minimal access |
| **Tenant** | `db`, `email`, `queue` | Tenant users - tenant-scoped access |
| **Internal** | All bindings | Admin/service accounts - full access |

### Authorization & Security

Code execution is secured using a three-tier authorization system:

#### Public Tier (Default)
- **Bindings:** `db` only
- **Namespace:** `user:{userId}` or `session:{requestId}`
- **Max Execution Time:** 10 seconds
- **Rate Limit:** 3 executions per minute
- **Arbitrary Code:** Requires paid upgrade

**Example:**
```bash
# Public user - database queries scoped to their namespace
npx mdxe code exec "return await DB.query('SELECT * FROM notes')" --bindings db
# Automatically scoped to user:usr_123abc
```

#### Tenant Tier
- **Bindings:** `db`, `email`, `queue`
- **Namespace:** `tenant:{tenantId}`
- **Max Execution Time:** 30 seconds
- **Rate Limit:** 10 executions per minute
- **Arbitrary Code:** Allowed

**Example:**
```bash
# Tenant user - access to tenant-scoped data
npx mdxe code exec "return await DB.query('SELECT * FROM customers')" --bindings db
# Automatically scoped to tenant:acme-corp
```

#### Internal Tier (Admin/Service)
- **Bindings:** All (`db`, `auth`, `gateway`, `schedule`, `webhooks`, `email`, `mcp`, `queue`)
- **Namespace:** `*` (no restrictions)
- **Max Execution Time:** 120 seconds
- **Rate Limit:** None
- **Arbitrary Code:** Allowed

**Example:**
```bash
# Admin user - full platform access
npx mdxe code exec "return await AUTH.getUser('usr_123')" --bindings auth
# No namespace restrictions
```

### Environment Setup

#### Local Development

1. Create `.env` file:
```env
DO_WORKER_URL=http://localhost:8787
```

2. Start DO worker locally:
```bash
cd workers/do
pnpm dev
```

3. Execute code:
```bash
npx mdxe code exec "return 2 + 2"
```

**Fallback:** If DO worker is not available, code executes locally using `eval()` (less secure, development only).

#### Production Setup

1. Set production worker URL:
```env
DO_WORKER_URL=https://do.do
```

2. Configure authentication:
```env
AUTH_TOKEN=your_api_key_here
```

3. Execute code:
```bash
npx mdxe code exec "return await DB.query('SELECT 1')" --bindings db
```

### Execution Results

All execution modes return a structured result:

```typescript
{
  success: true,
  result: /* your return value */,
  logs: [
    "console.log output line 1",
    "console.log output line 2"
  ],
  executionTime: 145  // milliseconds
}
```

**On Error:**
```typescript
{
  success: false,
  error: {
    message: "Error message",
    stack: "Error stack trace"
  },
  logs: [],
  executionTime: 23
}
```

### Best Practices

1. **Always return a value** - Use `return` statement for meaningful output
2. **Use appropriate bindings** - Only request bindings you need
3. **Handle errors** - Wrap risky code in try/catch
4. **Set reasonable timeouts** - Don't default to maximum
5. **Use caching for expensive operations** - `--cache` flag for repeated queries
6. **Namespace awareness** - Remember your queries are automatically scoped
7. **Test locally first** - Use local DO worker before production

### Example Workflows

#### Data Analysis Script
```typescript
// analyze-users.ts
const users = await DB.query('SELECT * FROM users')

const stats = {
  total: users.length,
  active: users.filter(u => u.active).length,
  byCountry: users.reduce((acc, u) => {
    acc[u.country] = (acc[u.country] || 0) + 1
    return acc
  }, {})
}

console.log('User Statistics:')
console.log(JSON.stringify(stats, null, 2))

return stats
```

```bash
npx mdxe code analyze-users.ts --bindings db
```

#### Send Email Notification
```bash
npx mdxe code exec "
  const users = await DB.query('SELECT email FROM users WHERE notify = true');
  for (const user of users) {
    await EMAIL.send(
      user.email,
      'Weekly Update',
      'Here is your weekly update!'
    );
  }
  return { sent: users.length };
" --bindings db,email --timeout 60000
```

#### Queue Background Job
```bash
npx mdxe code exec "
  const jobs = await DB.query('SELECT id FROM pending_jobs LIMIT 100');
  for (const job of jobs) {
    await QUEUE.send('process-job', { jobId: job.id });
  }
  return { queued: jobs.length };
" --bindings db,queue
```

### Troubleshooting

**Error: "DO worker not available"**
- Check `DO_WORKER_URL` is set correctly
- Verify DO worker is running (`cd workers/do && pnpm dev`)
- Check network connectivity

**Error: "Rate limit exceeded"**
- Wait for rate limit window to reset (1 minute)
- Upgrade to higher tier for increased limits
- Use `--cache` flag for repeated operations

**Error: "Access denied to bindings"**
- Check your authorization tier
- Request only allowed bindings for your tier
- Contact admin for tier upgrade if needed

**Error: "Timeout exceeded"**
- Reduce execution time
- Use shorter timeout: `--timeout 5000`
- Optimize your code
- Consider upgrading tier for longer execution time

### Integration with mdxe Dev Server

Code blocks in MDX files can be executed automatically:

```mdx
---
title: Data Analysis
---

# User Statistics

\`\`\`typescript
const users = await DB.query('SELECT * FROM users')
return {
  total: users.length,
  active: users.filter(u => u.active).length
}
\`\`\`
```

This code executes when the page loads, with results displayed inline.

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Set build command: `npx mdxe build`
3. Set output directory: `.next` (default)
4. Deploy!

### Other Platforms

1. Run `npx mdxe build`
2. Deploy the `.next` directory
3. Set start command: `npx mdxe start`

## Integration with MDX Ecosystem

`mdxe` works seamlessly with other MDX ecosystem packages:

- **[@mdxui](../mdxui/README.md)** - UI components automatically available
- **[@mdxai](../mdxai/README.md)** - AI functions for content generation
- **[@mdxdb](../mdxdb/README.md)** - Database operations on MDX files
- **[@mdxld](../mdxld/README.md)** - Linked data and schema integration

## Implementation Details

For detailed implementation information, architecture decisions, and research alignment, see [IMPLEMENTATION.md](./IMPLEMENTATION.md).

This document covers:

- Package consolidation process
- Research findings implementation
- Architecture decisions and patterns
- Development workflow details
- Deployment strategies

## Contributing

This package is part of the [MDX ecosystem](https://github.com/mdxld/mdx).

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for technical details about the codebase structure and development patterns.

## License

MIT
