# mdxe CLI Reference

Quick reference for all mdxe CLI commands.

## Publishing Commands

### `mdxe publish`

Deploy mdxe project to Cloudflare.

```bash
mdxe publish [options]
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `--worker` | Deploy to Cloudflare Workers | ✓ (default) |
| `--snippet` | Create Cloudflare Snippet | |
| `--assets` | Upload to Worker Assets | |
| `--name <name>` | Custom deployment name | Project directory name |
| `--env <env>` | Environment (production/staging) | production |
| `--minify` | Enable minification | ✓ (default) |
| `--no-minify` | Disable minification | |
| `--sourcemap` | Generate source maps | |

**Examples:**

```bash
# Deploy to Workers (default)
mdxe publish

# Deploy to specific environment
mdxe publish --env staging

# Deploy as Snippet
mdxe publish --snippet --name my-snippet

# Deploy to Worker Assets
mdxe publish --assets --name my-content

# Custom name with source maps
mdxe publish --name my-app --sourcemap
```

### `mdxe snippet`

Create a Cloudflare Snippet from MDX content.

```bash
mdxe snippet [options]
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `--name <name>` | Snippet name | Project directory name + "-snippet" |
| `--output <path>` | Output file path | .mdxe/snippet.js |
| `--minify` | Enable minification | ✓ (default) |
| `--no-minify` | Disable minification | |

**Examples:**

```bash
# Create snippet
mdxe snippet

# Custom name and output
mdxe snippet --name my-edge-logic --output dist/snippet.js

# No minification (for debugging)
mdxe snippet --no-minify
```

**Output:**
- `.mdxe/snippet.js` - Snippet code
- `.mdxe/snippet-metadata.json` - Metadata
- `.mdxe/DEPLOYMENT.md` - Deployment guide

### `mdxe assets`

Upload MDX files to Worker Assets.

```bash
mdxe assets [options]
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `--name <name>` | Asset name | Project directory name + "-assets" |
| `--env <env>` | Environment | production |
| `--bucket <name>` | R2 bucket name (optional) | |
| `--private` | Make assets private | Public by default |

**Examples:**

```bash
# Upload assets
mdxe assets

# Custom name and environment
mdxe assets --name my-content --env staging

# Private assets
mdxe assets --private
```

**Output:**
- `.mdxe/assets/` - Staged assets
- `.mdxe/assets-worker.js` - Asset serving worker
- `.mdxe/assets-metadata.json` - Asset manifest
- `wrangler.toml` - Cloudflare configuration

## Development Commands

### `mdxe dev`

Start development server.

```bash
mdxe dev
```

Starts Next.js dev server with:
- Hot module replacement
- File watching
- Temporary build directory

### `mdxe build`

Build for production.

```bash
mdxe build
```

Creates optimized production build:
- Compiles Next.js app
- Optimizes assets
- Generates `.next/` directory

### `mdxe start`

Start production server.

```bash
mdxe start
```

Starts Next.js production server from `.next/` build.

## Execution Commands

### `mdxe exec`

Execute MDX file code blocks.

```bash
mdxe exec [file] [options]
```

**Options:**

| Flag | Description |
|------|-------------|
| `--watch` | Watch for file changes |
| `--context <type>` | Execution context (dev/test/production/default) |

**Examples:**

```bash
# Execute index file
mdxe exec

# Execute specific file
mdxe exec content/index.mdx

# Watch mode
mdxe exec --watch

# Custom context
mdxe exec --context test
```

### `mdxe test`

Run tests from MDX files.

```bash
mdxe test [options]
```

**Options:**

| Flag | Description |
|------|-------------|
| `--watch` | Watch mode |

**Examples:**

```bash
# Run tests
mdxe test

# Watch mode
mdxe test --watch
```

### `mdxe lint`

Lint MDX files.

```bash
mdxe lint
```

### `mdxe send`

Send event to MDX event system.

```bash
mdxe send <event> [data] [options]
```

**Options:**

| Flag | Description |
|------|-------------|
| `-v, --verbose` | Verbose output |

**Examples:**

```bash
# Send event
mdxe send myEvent

# With data
mdxe send myEvent '{"key":"value"}'

# Verbose
mdxe send myEvent --verbose
```

## Function Execution

Execute functions directly from MDX files:

```bash
# Execute function
mdxe functionName(arg1, arg2)
```

**Examples:**

```bash
# Call function with no args
mdxe greet()

# Call with string arg
mdxe greet("World")

# Call with multiple args
mdxe calculate(10, 20)

# Call with JSON args
mdxe processData('{"name":"John"}', 42, true)
```

## Interactive Mode

Run without arguments for interactive file/function browser:

```bash
mdxe
```

**Features:**
- Browse MDX files
- View extracted functions
- Execute functions interactively
- Keyboard navigation (↑/↓/Enter/q)

## Environment Variables

Create `.env` file:

```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Deployment
WORKER_NAME=my-app
WORKER_ENV=production

# Optional
KV_CACHE_ID=kv-namespace-id
R2_BUCKET_NAME=bucket-name
```

## Configuration Files

### wrangler.toml

Auto-generated Cloudflare configuration:

```toml
name = "my-app"
main = ".mdxe/worker.js"
compatibility_date = "2024-01-01"

[env.production]
workers_dev = true
```

### package.json

Optional package.json for custom scripts:

```json
{
  "scripts": {
    "dev": "mdxe dev",
    "build": "mdxe build",
    "deploy": "mdxe publish --env production"
  }
}
```

## Deployment Workflows

### Manual Deployment

```bash
# 1. Build
mdxe build

# 2. Deploy to Workers
mdxe publish --env production

# 3. Deploy as Snippet
mdxe snippet

# 4. Upload assets
mdxe assets --env production
```

### CI/CD Deployment

```bash
# Single command deployment
mdxe publish --env $CI_ENVIRONMENT
```

### Multi-Target Deployment

```bash
# Deploy to all targets
mdxe publish --worker --env production
mdxe snippet
mdxe assets --env production
```

## Troubleshooting

### Common Issues

**"wrangler: command not found"**
```bash
npm install -g wrangler
```

**"No content found"**
```bash
# Ensure content/ directory exists
mkdir -p content
echo "# Test" > content/index.mdx
```

**"Build failed"**
```bash
# Check build output
mdxe build
ls -la .next
```

**"Authentication failed"**
```bash
# Login to Cloudflare
wrangler login
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=mdxe:*
mdxe publish
```

## Additional Resources

- [Full Publishing Guide](./src/cli/templates/PUBLISH.md)
- [Implementation Notes](/notes/2025-10-03-mdxe-publishing-cli-implementation.md)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

**mdxe** - Zero-config MDX development and deployment
