# D1 vs SQLite Migration Guide

This guide documents the key differences between Cloudflare D1 and SQLite when using Payload CMS with Drizzle ORM.

## Overview

Both D1 and SQLite use the same SQL dialect (SQLite), but they differ in:
- **Access method** - D1 via Workers bindings, SQLite via file/network access
- **Result format** - D1 returns D1Result objects, SQLite returns standard results
- **Environment** - D1 is serverless, SQLite requires a process/server
- **Deployment** - D1 is globally distributed, SQLite is single-instance

## Key Differences

### 1. Database Connection

**D1 (Cloudflare Workers):**
```typescript
// Access via Workers binding
import { drizzle } from 'drizzle-orm/d1'

export default {
  async fetch(request, env) {
    const db = drizzle(env.DB) // env.DB is the D1 binding
    // ...
  }
}
```

**SQLite (Local Development):**
```typescript
// Access via libSQL client
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const client = createClient({
  url: 'file:./database.db', // or Turso URL
  authToken: process.env.AUTH_TOKEN, // optional
})

const db = drizzle(client)
```

### 2. Wrangler Configuration

**D1 Binding (wrangler.jsonc):**
```json
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-database",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

**SQLite (No Wrangler needed):**
```typescript
// Just use DATABASE_URL environment variable
const url = process.env.DATABASE_URL || 'file:./database.db'
```

### 3. Drizzle Configuration

**D1 (drizzle.config.ts):**
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http', // D1 HTTP API
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
})
```

**SQLite (drizzle.config.ts):**
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./database.db',
  },
})
```

### 4. Result Objects

**D1 Returns:**
- `D1Result` objects with `.results`, `.success`, `.meta` properties
- Requires accessing `.results` to get rows

**SQLite Returns:**
- Standard array of row objects
- Direct access to results

**Drizzle ORM Normalizes:**
Fortunately, Drizzle ORM handles this difference automatically. Both return the same structure when using Drizzle queries.

### 5. Migrations

**D1 Migrations:**
```bash
# Generate migration
npx drizzle-kit generate

# Apply migration via wrangler
npx wrangler d1 migrations apply my-database

# Or via Payload
pnpm payload migrate:create
pnpm run deploy
```

**SQLite Migrations:**
```bash
# Generate migration
npx drizzle-kit generate

# Apply migration via drizzle-kit
npx drizzle-kit push

# Or via Payload
pnpm payload migrate
```

### 6. Custom Types (Vector Embeddings)

Both D1 and SQLite store vectors the same way in our adapter:

```typescript
const vectorType = customType<{
  data: number[]
  config: { dimensions: number }
  configRequired: true
  driverData: string
}>({
  dataType(config) {
    return `TEXT` // Store as JSON string
  },
  fromDriver(value: string) {
    return JSON.parse(value)
  },
  toDriver(value: number[]) {
    return JSON.stringify(value)
  },
})
```

**Note:** Neither D1 nor SQLite have native vector types, so we serialize to JSON.

### 7. Local Development

**D1 Local Development:**
```bash
# Run local D1 instance
npx wrangler dev

# D1 creates .wrangler/state/v3/d1/miniflare-D1DatabaseObject/
# for local persistence
```

**SQLite Local Development:**
```bash
# Just run your app
npm run dev

# Database file is created at specified path
```

### 8. Performance Characteristics

**D1:**
- ✅ Globally distributed reads
- ✅ Automatic replication
- ✅ No cold starts
- ⚠️ Writes go to primary region (eventual consistency)
- ⚠️ Query limits per request

**SQLite:**
- ✅ Fast local reads/writes
- ✅ No network latency
- ✅ No query limits
- ⚠️ Single instance (no distribution)
- ⚠️ Requires server/process

## Migration Path

### From SQLite to D1

1. **Export your SQLite data:**
   ```bash
   sqlite3 database.db .dump > dump.sql
   ```

2. **Create D1 database:**
   ```bash
   npx wrangler d1 create my-database
   ```

3. **Import data to D1:**
   ```bash
   npx wrangler d1 execute my-database --file=dump.sql
   ```

4. **Update configuration:**
   - Change database config to use D1 binding
   - Update environment variables
   - Deploy to Workers

### From D1 to SQLite

1. **Export D1 data:**
   ```bash
   npx wrangler d1 export my-database --output=dump.sql
   ```

2. **Import to SQLite:**
   ```bash
   sqlite3 database.db < dump.sql
   ```

3. **Update configuration:**
   - Change database config to use SQLite
   - Update environment variables

## Unified Adapter Usage

Our adapter handles both automatically:

```typescript
import { createDatabaseAdapter, detectDatabaseConfig } from '@mdxdb/payload'

// Auto-detect environment (D1 or SQLite)
const config = detectDatabaseConfig(env)
const adapter = createDatabaseAdapter(config)

// Use the same way regardless of backend
const db = adapter.getDatabase()
```

**Manual Configuration:**

```typescript
// D1 (Workers)
const adapter = createDatabaseAdapter({
  d1: env.DB // D1 binding from Cloudflare Workers
})

// SQLite (Local)
const adapter = createDatabaseAdapter({
  url: 'file:./database.db',
  authToken: process.env.AUTH_TOKEN // optional, for Turso
})
```

## Testing

### D1 Testing
- Use Miniflare for local D1 emulation
- Or use vitest with `@cloudflare/vitest-pool-workers`

### SQLite Testing
- Use in-memory database: `{ inMemory: true }`
- Fast and isolated test runs

## Best Practices

### Development Workflow
1. **Local dev:** Use SQLite for fast iteration
2. **Preview:** Deploy to D1 preview environment
3. **Production:** Deploy to D1 production

### Environment Variables
```bash
# Local development (.env.local)
DATABASE_URL=file:./database.db

# Production (Workers)
# D1 binding configured in wrangler.jsonc
# No DATABASE_URL needed
```

### Type Safety
Both backends work with the same Drizzle schema:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const files = sqliteTable('files', {
  id: integer('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
})

// Works with both D1 and SQLite!
```

## Troubleshooting

### Issue: D1 binding not found
**Solution:** Check `wrangler.jsonc` has correct binding name matching `env.DB`

### Issue: SQLite file not created
**Solution:** Ensure directory exists and has write permissions

### Issue: Migrations out of sync
**Solution:**
```bash
# D1
npx wrangler d1 migrations list my-database

# SQLite
npx drizzle-kit check
```

### Issue: Different results between D1 and SQLite
**Solution:** Always use Drizzle ORM queries, not raw SQL

## Resources

- [Drizzle ORM - D1 Docs](https://orm.drizzle.team/docs/connect-cloudflare-d1)
- [Drizzle ORM - SQLite Docs](https://orm.drizzle.team/docs/get-started-sqlite)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Payload CMS on Workers](https://blog.cloudflare.com/payload-cms-workers/)
- [libSQL Client](https://github.com/libsql/libsql-client-ts)

## Conclusion

The unified adapter in `@mdxdb/payload` abstracts away the differences between D1 and SQLite, allowing you to:

- ✅ Develop locally with SQLite
- ✅ Deploy to production with D1
- ✅ Use the same code for both
- ✅ Switch backends with minimal changes

The only differences you need to manage are:
1. Environment configuration (wrangler.jsonc vs .env)
2. Deployment commands (wrangler vs standard hosting)
3. Migration application (wrangler d1 vs drizzle-kit)
