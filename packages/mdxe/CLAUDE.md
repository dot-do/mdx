# CLAUDE.md - mdxe Package

## Project Overview

**mdxe** is a zero-config CLI for MDX development with **built-in .do platform integration**. Every mdxe project automatically includes:

- 🔐 Authentication via WorkOS OAuth (.do platform credentials)
- 🤖 AI capabilities via `sdk.do` (LLM, embeddings, models)
- 💼 Business runtime via `graphdl` (data operations)
- 🌐 API infrastructure (REST, RPC, MCP)
- ⚡ Real-time features (events, scheduling, messaging)

**Status:** 🟢 Active - .do platform integration is baked in

## Architecture

### Core Dependencies (.do Platform)

These are **core dependencies** (not optional) - every mdxe project gets them:

```json
{
  "dependencies": {
    "sdk.do": "workspace:*",      // Comprehensive .do SDK
    "oauth.do": "workspace:*",    // WorkOS OAuth components
    "token.do": "workspace:*",    // Shared token storage
    "open": "^10.1.0"             // Auto-open browser
  }
}
```

### Template Structure

The Next.js template at `src/template/` includes:

**Components:**
- `components/auth-wrapper.tsx` - WorkOS OAuth provider
- `components/sdk-provider.tsx` - .do SDK context provider
- `app/callback/page.tsx` - OAuth callback handler
- `app/layout.tsx` - Root layout with auth + SDK

**Configuration:**
- `.env.example` - .do platform WorkOS credentials (baked in)
- `package.json.template` - Includes oauth.do, token.do, sdk.do

**Content:**
- `content/welcome.mdx` - Example using .do SDK

## Authentication Flow

### Browser-Based OAuth (No Configuration Needed)

1. User runs `npx mdxe dev`
2. Browser auto-opens at `http://localhost:3000`
3. Floating "Sign in" button appears
4. Click → WorkOS OAuth flow (Google, Microsoft, Okta)
5. Tokens stored via `token.do` (works in both browser and Node.js)
6. Same tokens shared with `cli.do` and other .do packages

### WorkOS Configuration

Uses **.do platform's WorkOS account** (shared across all mdxe projects):

```bash
# These are baked into .env.example
NEXT_PUBLIC_WORKOS_CLIENT_ID=client_01JGQHQ9KZP59W7SGXB7HQMXKD
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Redirect URI is auto-detected
# Development: http://localhost:3000/callback
# Production: https://yourdomain.com/callback
```

**No user configuration needed** - it just works!

## SDK Integration

### Global SDK Provider

The `SDKProvider` component wraps the entire app and exposes:

**SDK Structure:**
- `sdk.ai` - AI capabilities (LLM, embeddings, models)
- `sdk.$` - Business runtime containing:
  - `$.api` - API client
  - `$.db` - Database operations
  - `$.every` - Event scheduling
  - `$.on` - Event handlers
  - `$.send` - Messaging

### Using SDK in MDX

Access SDK via React hooks:

```tsx
'use client'

import { useSDK, use$ } from '../components/sdk-provider'

export function MyComponent() {
  // Option 1: Get full SDK
  const { ai, $ } = useSDK()

  // Option 2: Get specific parts
  const { ai } = useSDK()
  const $ = use$()

  async function generate() {
    const result = await ai.llm.post('/generate', {
      prompt: 'Write a haiku'
    })

    // Use business runtime
    return await $.ai.generate(result.text)
  }

  return <button onClick={generate}>Generate</button>
}
```

**Available hooks:**
- `useSDK()` - Returns full SDK object `{ ai, $ }`
- `use$()` - Returns business runtime directly
- `useAI()` - Returns AI capabilities directly

**Usage patterns:**

```tsx
// Pattern 1: Destructure from useSDK
const { ai, $ } = useSDK()

// Pattern 2: Use convenience hooks
const ai = useAI()
const $ = use$()

// Pattern 3: Access nested properties
const $ = use$()
// Then use $.api, $.db, $.every, $.on, $.send
```

### CapnWeb: Zero-Latency RPC

**CRITICAL:** The business runtime (`$`) uses **CapnWeb** which queues operations automatically.

**How it works:**

1. Operations without `await` are queued locally
2. Multiple operations batch into single RPC call
3. Results stream back as they become available
4. Only `await` when you need to read the result

**Example:**

```tsx
const $ = use$()

// ❌ WRONG: Unnecessary awaits create round-trip delays
await $.db.insert('users', user)     // Wait for round-trip
await $.db.insert('logs', log)       // Wait for another round-trip
await $.send('notifications', notif) // Wait for yet another round-trip

// ✅ CORRECT: Queue operations (no awaits)
$.db.insert('users', user)           // Queued locally
$.db.insert('logs', log)             // Queued locally
$.send('notifications', notif)       // Queued locally
// All three operations sent as single RPC batch - super fast!

// Only await when you need results
const users = await $.db.query('SELECT * FROM users')
```

**Performance Impact:**

- **Without CapnWeb**: 3 operations = 3 round-trips = ~300ms (100ms each)
- **With CapnWeb**: 3 operations = 1 batch RPC = ~100ms total

**Key Benefits:**

- 🚀 **Zero latency** - Operations return immediately (queued)
- 📦 **Automatic batching** - Multiple calls = single RPC
- 🔄 **Streaming** - Results arrive as soon as ready
- ⚡ **Pipeline efficiency** - No round-trip overhead
- 🎯 **Intuitive API** - Write synchronous-looking async code

### Auto-Authentication

SDK automatically includes Bearer token from WorkOS OAuth:

```typescript
// SDK is created with autoAuth: true
const sdk = createSDK({ autoAuth: true })

// All API calls automatically include Authorization header
await sdk.ai.llm.post('/generate', { prompt: '...' })
// → Authorization: Bearer <token-from-workos>
```

## Development Commands

### Standard Commands

```bash
# Start dev server (auto-opens browser with auth)
npx mdxe dev

# Disable auto-open
npx mdxe dev --no-open

# Build for production
npx mdxe build

# Run tests
npx mdxe test
```

### Authentication Behavior

- `dev` command: **Browser-based auth** (no CLI login needed)
- Other commands: **CLI auth** via `do login` (for CI/CD)

## File Structure

```
mdxe/
├── src/
│   ├── cli/
│   │   ├── commands/
│   │   │   └── dev.ts          # Auto-open browser, skip CLI auth
│   │   ├── utils/
│   │   │   └── auth.ts         # Token storage integration
│   │   └── cli.ts              # Main CLI entry (dev = no auth check)
│   ├── template/                # Next.js template
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout (AuthWrapper + SDKProvider)
│   │   │   └── callback/       # OAuth callback page
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── auth-wrapper.tsx    # WorkOS OAuth provider
│   │   │   └── sdk-provider.tsx    # .do SDK context
│   │   ├── content/
│   │   │   └── welcome.mdx     # Example using .do SDK
│   │   ├── .env.example        # .do platform credentials
│   │   └── package.json.template
│   └── package.json            # Core: sdk.do, oauth.do, token.do
└── README.md                   # User-facing documentation
```

## Development Workflow

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/dot-do/mdx.git
cd mdx/packages/mdxe

# 2. Install dependencies
pnpm install

# 3. Build package
pnpm build

# 4. Test locally
pnpm link --global
cd /path/to/test-project
mdxe dev
```

### Testing Auth Flow

```bash
# Start dev server
mdxe dev

# Browser opens automatically
# → http://localhost:3000

# Click "Sign in" button
# → WorkOS OAuth flow

# Authenticate with provider
# → Redirects to /callback

# Token stored in localStorage (browser) or filesystem (CLI)
# → Same token works in cli.do, sdk.do, etc.
```

## Key Implementation Files

### CLI Entry Point

**`src/cli/cli.ts`** - Main CLI entry:
```typescript
// Dev command skips CLI auth (browser-based instead)
const noAuthCommands = ['help', '--help', '-h', '--version', '-v', 'dev']

if (command === 'dev') {
  const openBrowser = !args.includes('--no-open')
  return runDevCommand(cwd, { open: openBrowser })
}
```

### Dev Command

**`src/cli/commands/dev.ts`** - Dev server with auto-open:
```typescript
// Auto-open browser when Next.js is ready
if (!browserOpened && options.open && output.includes('Ready in')) {
  browserOpened = true
  await open('http://localhost:3000')
}
```

### Auth Wrapper

**`src/template/components/auth-wrapper.tsx`** - WorkOS OAuth:
```typescript
// .do platform WorkOS client ID (shared across all mdxe projects)
const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || 'client_01JGQHQ9KZP59W7SGXB7HQMXKD'

// Auto-detect redirect URI
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const redirectUri = `${siteUrl}/callback`
```

### SDK Provider

**`src/template/components/sdk-provider.tsx`** - Global SDK:
```typescript
// Create SDK with auto-authentication
const sdk = createSDK({ autoAuth: true })

// Expose via React context
export function useSDK() {
  return useContext(SDKContext)
}
```

## Token Storage

### Browser (localStorage)

When running in Next.js (browser):
- Tokens stored in `localStorage` via `token.do`
- Key: `'do-tokens'`
- Persists across page refreshes

### Node.js (filesystem)

When running CLI commands:
- Tokens stored in OS-specific secure location via `token.do`
- macOS: `~/Library/Application Support/do/tokens.json`
- Linux: `~/.config/do/tokens.json`
- Windows: `%APPDATA%\do\tokens.json`

### Shared Tokens

Same tokens work across:
- `mdxe dev` (browser)
- `cli.do` (CLI)
- `sdk.do` (programmatic)

## Deployment

### Production Environment Variables

```bash
# Required
NEXT_PUBLIC_WORKOS_CLIENT_ID=client_01JGQHQ9KZP59W7SGXB7HQMXKD
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional (auto-detected from NEXT_PUBLIC_SITE_URL)
# NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://yourdomain.com/callback
```

### Deploy to Vercel

```bash
# Build command
pnpm build

# Output directory
.next

# Environment variables
# → Add NEXT_PUBLIC_WORKOS_CLIENT_ID (same as dev)
# → Add NEXT_PUBLIC_SITE_URL (your domain)
```

## Troubleshooting

### "Cannot find module 'oauth.do'"

Make sure dependencies are installed:
```bash
pnpm install
```

oauth.do, token.do, sdk.do are core dependencies now (not optional).

### Authentication not working

Check WorkOS client ID:
```bash
# Should match .do platform credentials
echo $NEXT_PUBLIC_WORKOS_CLIENT_ID
# → client_01JGQHQ9KZP59W7SGXB7HQMXKD
```

### Browser not opening

Disable auto-open:
```bash
mdxe dev --no-open
```

Then manually open `http://localhost:3000`

## Related Documentation

**Within This Repository:**
- [README.md](./README.md) - User-facing documentation
- [src/template/content/welcome.mdx](./src/template/content/welcome.mdx) - Example usage

**SDK Packages:**
- [sdk.do/CLAUDE.md](../../sdk/packages/sdk.do/CLAUDE.md) - Comprehensive SDK
- [oauth.do/README.md](../../sdk/packages/oauth.do/README.md) - OAuth components
- [token.do/README.md](../../sdk/packages/token.do/README.md) - Token storage

**Root Repository:**
- [Root CLAUDE.md](../../CLAUDE.md) - Multi-repo architecture
- [admin/CLAUDE.md](../../admin/CLAUDE.md) - Admin system

## Standards

### TypeScript Configuration

Uses `@repo/typescript-config` for shared settings:
- Strict mode enabled
- ES2022 target
- ESM modules
- Path aliases

### Code Style

- **Prettier**: printWidth 160, singleQuote, semi: false
- **ESLint**: Shared SDK rules
- **Naming**: MDX files use Title_Case_With_Underscores

### Testing

- **Framework**: Vitest
- **Coverage**: 80%+ target
- **Pattern**: Tests co-located with source files

## Next Steps

**Immediate:**
1. Test browser OAuth flow end-to-end
2. Add more example MDX files using .do SDK
3. Document common patterns (AI generation, data operations)

**Short-Term:**
1. Add SDK usage examples to template
2. Create video tutorials for .do platform integration
3. Build starter templates (AI blog, data dashboard, etc.)

**Long-Term:**
1. Add MCP server integration for AI agents
2. Enable Cloudflare Workers deployment
3. Add real-time collaboration features

---

**Last Updated:** 2025-10-05
**Status:** Active - .do platform integration is baked in
**Managed By:** Claude Code (AI Project Manager)
**Contact:** Issues at https://github.com/dot-do/mdx/issues
