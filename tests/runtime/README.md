# mdxe Runtime Tests

Simple test files to verify mdxe can execute TypeScript code blocks.

## Test Files

### ✅ Working Tests
- **simple.test.mdx** - Basic TypeScript execution tests (console, functions, async/await, arrays, objects)

### 🚧 Future Tests (Require $ Runtime)
- **ai.test.mdx** - AI service tests (requires `$.ai` runtime)
- **db.test.mdx** - Database service tests (requires `$.db` runtime)
- **api.test.mdx** - API service tests (requires `$.api` runtime)
- **integration.test.mdx** - Integration tests (requires full `$` runtime)

**Note:** The `$` runtime context ($.ai, $.db, $.api) is not yet implemented. The future test files are placeholders for when the runtime is ready.

## Prerequisites

1. **Environment Variables**: Create `.env` file with API keys:
   ```bash
   # Required for AI tests
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...

   # Required for DB tests
   DATABASE_URL=postgresql://...
   CLICKHOUSE_URL=https://...

   # Optional (for specific AI providers)
   WORKERS_AI_ACCOUNT_ID=...
   WORKERS_AI_API_TOKEN=...
   ```

2. **Build mdxe package**:
   ```bash
   cd /Users/nathanclevenger/Projects/.do/mdx
   pnpm install
   pnpm build:packages
   ```

3. **Ensure workers are deployed**:
   - `db` worker (database service)
   - `ai` worker (AI service)
   - `api` worker (API gateway)

## Running Tests

### Quick Start

```bash
# From mdx root directory
cd /Users/nathanclevenger/Projects/.do/mdx

# Run the working test - use direct path to mdxe binary
./packages/mdxe/bin/mdxe.js exec tests/runtime/simple.test.mdx

# Or if mdxe is built and in node_modules
pnpm exec mdxe exec tests/runtime/simple.test.mdx
```

### Watch Mode

```bash
# Re-run on file changes
./packages/mdxe/bin/mdxe.js exec tests/runtime/simple.test.mdx --watch
```

### Latest Test Results (2025-10-05)

**✅ simple.test.mdx** - 5/6 tests passing (83%)
**✅ api.test.mdx** - 4/6 tests passing (67%)
**✅ ai.test.mdx** - 5/5 tests passing (100%)
**⚠️ db.test.mdx** - 3/8 tests passing (38%)
**🚧 integration.test.mdx** - Not tested yet

**Overall: 17/30 tests passing (57%)**

See [STATUS.md](STATUS.md) for detailed test results and implementation notes.

### Running $ Runtime Tests

```bash
# $ runtime is now implemented - run tests with --skip-auth
./packages/mdxe/bin/mdxe.js exec tests/runtime/ai.test.mdx --skip-auth
./packages/mdxe/bin/mdxe.js exec tests/runtime/db.test.mdx --skip-auth
./packages/mdxe/bin/mdxe.js exec tests/runtime/api.test.mdx --skip-auth
./packages/mdxe/bin/mdxe.js exec tests/runtime/integration.test.mdx --skip-auth
```

**Note:** The $ runtime ($.ai, $.db, $.api) is now functional and makes HTTP calls to deployed workers at apis.do. Some tests may use fallback responses when worker endpoints are not fully configured.

## Expected Output

Each test file will:

1. Execute TypeScript code blocks sequentially
2. Display AI request tracking (if AI calls are made)
3. Show console.log output from each code block
4. Report success/failure for each block
5. Display execution summary with timing

Example output:

```
Executing test-ai.mdx in business-as-code context

AI Requests: ●●●●● (5/5 completed)

🔄 Execution complete at 10:30:45 AM
Executed 5 code block(s)

AI Requests Summary:
- Total: 5
- Completed: 5
- Errors: 0

✅ All code blocks executed successfully
```

## Troubleshooting

### Error: "$ is not defined"

The `$` runtime context is not available. Ensure:
- You're running with mdxe (not plain node)
- Frontmatter includes `executionContext: business-as-code`
- Workers are properly deployed and accessible

### Error: "Cannot connect to database"

Database service is not accessible. Verify:
- `DATABASE_URL` in `.env` file
- `db` worker is deployed
- Network connectivity to database

### Error: "AI provider failed"

AI provider error. Check:
- API keys are valid in `.env`
- Provider is accessible (not rate limited)
- Correct provider name in options

### Error: "Module not found"

mdxe dependencies not installed. Run:
```bash
cd /Users/nathanclevenger/Projects/.do/mdx
pnpm install
pnpm build:packages
```

## Test Development

### Adding New Tests

1. Create a new `.mdx` file in this directory
2. Add frontmatter with `executionContext: business-as-code`
3. Write TypeScript code blocks using `$.ai`, `$.db`, `$.api`
4. Run with `pnpm exec mdxe exec your-test.mdx`

### Test Template

```mdx
---
title: My Test
description: Test description
executionContext: business-as-code
---

# My Test

Test description here.

## Test Case 1

\```typescript
// Your test code using $.ai, $.db, $.api
const result = await $.ai.generate('test')
console.log('Result:', result.text)
\```

## Summary

Test completed!
```

## Architecture Notes

### The $ Runtime Context

The `$` object provides access to:

- **$.ai** - AIService RPC interface
  - `generate(prompt, options)` - Generate text
  - `embed(text, options)` - Create embeddings
  - `list(topic, options)` - Generate lists
  - `code(description, options)` - Generate code
  - `analyze(content, analysis, options)` - Analyze content

- **$.db** - DatabaseService RPC interface
  - `get(ns, id, options)` - Get entity
  - `list(ns, options)` - List entities
  - `upsert(thing)` - Create/update entity
  - `delete(ns, id)` - Delete entity
  - `search(query, embedding, options)` - Hybrid search
  - `vectorSearch(embedding, options)` - Vector search
  - `getRelationships(ns, id, options)` - Get relationships
  - `upsertRelationship(relationship)` - Create relationship

- **$.api** - API service interface
  - `get(url, options)` - HTTP GET
  - `post(url, options)` - HTTP POST

All methods return Promises and should be awaited.

### Execution Flow

1. mdxe parses the MDX file
2. Extracts TypeScript code blocks
3. Transpiles TypeScript to JavaScript with esbuild
4. Injects `$` runtime context
5. Executes code blocks sequentially
6. Captures console output
7. Reports results

### Environment

Code blocks execute in a Node.js environment with:
- Full TypeScript support
- Access to node built-ins
- Access to `$` runtime context
- Console output captured and displayed

## Related Documentation

- **[mdxe README](../../packages/mdxe/README.md)** - mdxe CLI documentation
- **[AI Service](../../../workers/ai/src/index.ts)** - AI service implementation
- **[DB Service](../../../workers/db/src/index.ts)** - Database service implementation
- **[API Service](../../../workers/api/)** - API gateway implementation
- **[Examples](../../../examples/)** - Business-as-Code examples

## Contributing

To add more tests:

1. Create a new `.mdx` file in this directory
2. Follow the test template above
3. Ensure tests are self-contained and idempotent
4. Clean up any created resources
5. Document expected behavior

## License

MIT
