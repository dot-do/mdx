# Worker Loader Integration for mdxe

## Overview

The `mdxe/core` module provides secure, isolated MDX/JS/TS code evaluation using Cloudflare's **Worker Loader** API. This enables real-time execution of user-generated content, dynamic plugins, and multi-tenant code execution with strong security boundaries.

## Architecture

```
┌─────────────────────────────────────────────────┐
│              mdxe Evaluation Engine              │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐      ┌──────────────┐        │
│  │  mdxdb       │      │ Worker Loader │        │
│  │  Integration │      │  Wrapper      │        │
│  └──────────────┘      └──────────────┘        │
│         │                      │                 │
│         │                      │                 │
│         ▼                      ▼                 │
│  ┌──────────────────────────────────┐          │
│  │   Safe MDX Evaluation Engine     │          │
│  └──────────────────────────────────┘          │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────┐          │
│  │   Cloudflare Workers Isolate      │          │
│  │   (Secure Sandbox)                │          │
│  └──────────────────────────────────┘          │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Core Components

### 1. Database Integration (`src/core/db.ts`)

Provides full mdxdb access within evaluation contexts.

**Features:**
- File system and SQLite implementations
- Collection-based access
- Read-only mode for security
- Type-safe database operations

**API:**

```typescript
import { createDbContext, createReadOnlyDbContext } from 'mdxe/core'

// Full database access
const db = await createDbContext({
  implementation: 'fs',
  root: process.cwd(),
  collectionsDir: '.db',
})

// Read-only access (safer for untrusted code)
const readOnlyDb = await createReadOnlyDbContext({
  implementation: 'sqlite',
  root: './data',
})

// Use in code evaluation
const result = await evaluator.evaluateJavaScript(code, { db })
```

### 2. Worker Loader Wrapper (`src/core/loader.ts`)

High-level API for Cloudflare Worker Loader.

**Features:**
- Dynamic worker loading
- Isolate management
- Worker caching
- Security controls
- Custom bindings

**API:**

```typescript
import { WorkerLoader, createCodeWorker } from 'mdxe/core'

// Initialize with Worker Loader binding
const loader = new WorkerLoader(env.LOADER)

// Load a worker
await loader.load('my-worker', {
  modules: {
    'index.js': 'export default { fetch() { return new Response("OK") } }',
  },
  bindings: { API_KEY: 'secret' },
})

// Execute worker
const response = await loader.execute('my-worker', {
  request: new Request('https://example.com'),
})

// Cleanup
loader.unload('my-worker')
```

### 3. Evaluation Engine (`src/core/eval.ts`)

Safe evaluation of MDX/JS/TS with multiple backends.

**Features:**
- MDX compilation and execution
- TypeScript transpilation
- JavaScript evaluation
- Console output capture
- Error handling
- Timeout support
- Fallback to local execution

**API:**

```typescript
import { MdxEvaluator, evaluateJavaScript, evaluateTypeScript, evaluateMdx } from 'mdxe/core'

// Create evaluator (with optional Worker Loader binding)
const evaluator = new MdxEvaluator(env.LOADER)

// Evaluate JavaScript
const result = await evaluator.evaluateJavaScript('return 1 + 1')

// Evaluate TypeScript
const tsResult = await evaluator.evaluateTypeScript(`
  interface Person { name: string }
  const person: Person = { name: 'Alice' }
  return person
`)

// Evaluate MDX
const mdxResult = await evaluator.evaluateMdx(`
# Hello MDX

This is **formatted** content.
`)

// With database context
const dbResult = await evaluator.evaluateJavaScript(code, {
  db: await createDbContext(),
})

// With security options
const secureResult = await evaluator.evaluateJavaScript(code, {
  timeout: 5000,
  security: {
    cpuLimit: 1000,
    memoryLimit: 128,
    blockNetwork: true,
  },
})
```

## Security Features

### 1. Isolate-Based Execution

Worker Loader creates **V8 isolates** for each worker, providing:
- Memory isolation
- CPU isolation
- No shared state between workers
- Automatic cleanup

### 2. Resource Limits

Control execution resources:

```typescript
const result = await evaluator.evaluateJavaScript(code, {
  timeout: 5000, // Execution timeout (ms)
  security: {
    cpuLimit: 1000, // CPU time limit (ms)
    memoryLimit: 128, // Memory limit (MB)
  },
})
```

### 3. Network Controls

Block or restrict network access:

```typescript
const config = createSecureWorkerConfig(code, {
  blockNetwork: true, // Block all network requests
  allowedDomains: ['api.example.com'], // Or whitelist domains
})
```

### 4. Read-Only Database Access

Prevent modifications to database:

```typescript
const readOnlyDb = await createReadOnlyDbContext()

const result = await evaluator.evaluateJavaScript(code, {
  db: readOnlyDb, // Can only read, not write
})
```

### 5. Bindings Whitelist

Control what bindings are exposed:

```typescript
const config = createSecureWorkerConfig(code, {
  bindingsWhitelist: ['API_KEY', 'USER_ID'],
})
```

## Use Cases

### 1. User-Generated Content Evaluation

Safely execute user-submitted code:

```typescript
const evaluator = new MdxEvaluator(env.LOADER)

const userCode = getUserSubmittedCode()

const result = await evaluator.evaluateJavaScript(userCode, {
  timeout: 3000,
  security: {
    cpuLimit: 2000,
    memoryLimit: 64,
    blockNetwork: true,
  },
})

if (result.success) {
  console.log('User code output:', result.result)
} else {
  console.error('Execution failed:', result.error)
}
```

### 2. Plugin System

Load and execute plugins in isolation:

```typescript
const plugins = await loadPlugins()

for (const plugin of plugins) {
  const { loader, id } = await createCodeWorker(env.LOADER, plugin.code, {
    bindings: { pluginName: plugin.name },
  })

  const result = await loader.execute(id, {
    method: 'transform',
    args: [content],
  })

  content = result
  loader.unload(id)
}
```

### 3. Multi-Tenant Code Execution

Isolate code execution per tenant:

```typescript
const tenants = ['tenant-1', 'tenant-2', 'tenant-3']

const results = await Promise.all(
  tenants.map(async (tenantId) => {
    const tenantDb = await createReadOnlyDbContext({
      root: `/data/${tenantId}`,
    })

    return evaluator.evaluateJavaScript(sharedCode, {
      db: tenantDb,
      bindings: { tenantId },
      workerId: `worker-${tenantId}`,
    })
  }),
)
```

### 4. Dynamic MDX Rendering

Real-time MDX compilation and rendering:

```typescript
const mdxContent = await fetchMdxFromDatabase()

const result = await evaluator.evaluateMdx(mdxContent, {
  compileMdx: true,
  bindings: {
    data: await fetchDataForTemplate(),
  },
})

if (result.success) {
  return new Response(result.result, {
    headers: { 'Content-Type': 'text/html' },
  })
}
```

### 5. Batch Processing

Process multiple code snippets in parallel:

```typescript
const tasks = await getTasksFromQueue()

const results = await Promise.all(
  tasks.map((task) =>
    evaluator.evaluateJavaScript(task.code, {
      workerId: `batch-${task.id}`,
      timeout: 2000,
    }),
  ),
)

await saveResults(results)
```

## Performance Characteristics

### Worker Loader Execution

- **Spin-up time:** ~1-5ms (isolate creation)
- **Execution:** Comparable to regular Workers
- **Memory:** Isolated per worker
- **Concurrency:** Limited by Workers platform

### Local Fallback Execution

- **Spin-up time:** ~0ms (same process)
- **Execution:** Direct V8 execution
- **Memory:** Shared process memory
- **Concurrency:** Limited by Node.js event loop

### Recommendations

1. **Use Worker Loader in production** for security
2. **Use local fallback in development** for speed
3. **Cache workers** for repeated execution
4. **Batch evaluations** when possible
5. **Set appropriate timeouts** based on workload

## Limitations

### Worker Loader (Beta)

1. **Beta Status:** Currently in closed beta
2. **Sign-up Required:** Production use requires beta access
3. **Platform Limits:** Subject to Cloudflare Workers limits
4. **No Direct DOM Access:** Workers environment, not browser

### Local Fallback

1. **Less Secure:** No isolate-based sandboxing
2. **Shared Memory:** All code runs in same process
3. **No Resource Limits:** Timeout only, no CPU/memory limits
4. **Development Only:** Not recommended for production

### General

1. **No Node.js APIs:** Workers environment restrictions apply
2. **ESM Only:** CommonJS not supported
3. **No Dynamic Imports:** From external URLs (security)
4. **Size Limits:** Worker code size limits apply

## Best Practices

### 1. Always Set Timeouts

```typescript
const result = await evaluator.evaluateJavaScript(code, {
  timeout: 5000, // Prevent infinite loops
})
```

### 2. Use Read-Only Database for Untrusted Code

```typescript
const db = await createReadOnlyDbContext() // Safer
const result = await evaluator.evaluateJavaScript(untrustedCode, { db })
```

### 3. Validate User Input

```typescript
// Validate before execution
if (!isValidCode(userCode)) {
  return { success: false, error: 'Invalid code' }
}

const result = await evaluator.evaluateJavaScript(userCode)
```

### 4. Implement Rate Limiting

```typescript
const rateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60000 })

if (!rateLimiter.allow(userId)) {
  return { success: false, error: 'Rate limit exceeded' }
}

const result = await evaluator.evaluateJavaScript(code)
```

### 5. Monitor Resource Usage

```typescript
const result = await evaluator.evaluateJavaScript(code, {
  timeout: 5000,
  security: { cpuLimit: 1000 },
})

if (result.duration > 1000) {
  console.warn('Code execution took longer than expected:', result.duration)
}
```

### 6. Cache Workers for Repeated Execution

```typescript
// Reuse worker ID for caching
const workerId = `cached-worker-${hashCode(code)}`

const result = await evaluator.evaluateJavaScript(code, { workerId })
```

### 7. Handle Errors Gracefully

```typescript
const result = await evaluator.evaluateJavaScript(code)

if (!result.success) {
  console.error('Execution failed:', result.error)
  // Return safe default or error response
  return { data: null, error: result.error }
}

return { data: result.result }
```

## Examples

See the `examples/` directory for comprehensive examples:

- **`worker-loader-basic.ts`** - Basic usage examples
- **`worker-loader-advanced.ts`** - Real-world use cases

Run examples:

```bash
# With Worker Loader binding (Cloudflare Workers)
node examples/worker-loader-basic.ts

# Or in Workers environment
wrangler dev
```

## API Reference

### Type Definitions

```typescript
// Database context
interface DbContext {
  list: (collectionName?: string, pattern?: string) => any[]
  get: (id: string, collectionName?: string) => any | undefined
  set: (id: string, content: any, collectionName: string) => Promise<void>
  delete: (id: string, collectionName: string) => Promise<boolean>
  collection: (name: string) => CollectionInterface
  db: MdxDbInterface
}

// Evaluation result
interface EvalResult {
  success: boolean
  result?: any
  error?: string
  duration: number
  outputs?: Array<{
    type: 'log' | 'error' | 'warn' | 'info'
    args: any[]
    timestamp: number
  }>
}

// Evaluation options
interface MdxEvalOptions {
  db?: DbContext
  bindings?: Record<string, any>
  security?: SecurityOptions
  workerId?: string
  compileMdx?: boolean
  timeout?: number
}

// Security options
interface SecurityOptions {
  blockNetwork?: boolean
  allowedDomains?: string[]
  cpuLimit?: number
  memoryLimit?: number
  bindingsWhitelist?: string[]
}
```

## Testing

Run tests:

```bash
pnpm test
```

Tests cover:
- Database context creation
- Worker Loader operations
- MDX/JS/TS evaluation
- Error handling
- Security features

## Troubleshooting

### Worker Loader Not Available

**Problem:** `Worker Loader not available` error

**Solution:**
1. Check if running in Cloudflare Workers environment
2. Verify Worker Loader binding is configured
3. Ensure you're enrolled in the beta program

### Timeout Errors

**Problem:** Code execution times out

**Solution:**
1. Increase timeout value
2. Optimize code performance
3. Check for infinite loops

### Memory Errors

**Problem:** Out of memory errors

**Solution:**
1. Increase memory limit
2. Reduce data size
3. Optimize algorithms

### Type Errors

**Problem:** TypeScript compilation errors

**Solution:**
1. Check TypeScript syntax
2. Ensure types are valid
3. Use `any` for dynamic types (if needed)

## Future Enhancements

Planned improvements:

1. **Advanced Network Controls** - Fine-grained fetch interception
2. **Resource Monitoring** - Real-time CPU/memory tracking
3. **Worker Pooling** - Reuse workers for better performance
4. **Streaming Support** - Stream evaluation results
5. **Debugging Tools** - Better error messages and stack traces

## License

MIT

## Contributing

Contributions welcome! Please see the main repository for guidelines.

## Support

For questions or issues:
- GitHub Issues: https://github.com/dot-do/mdx
- Documentation: https://mdx.org.ai
- Discord: [Coming soon]

---

**Last Updated:** 2025-10-03
**Version:** 0.1.0
**Status:** Beta (Worker Loader integration)
