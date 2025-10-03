# mdxe Publishing Guide

Deploy your mdxe projects to Cloudflare with zero configuration.

## Quick Start

```bash
# Publish to Cloudflare Workers (default)
mdxe publish

# Create a Cloudflare Snippet (ultra-lightweight)
mdxe snippet

# Upload to Worker Assets (free CDN)
mdxe assets
```

## Publishing Options

### 1. Cloudflare Workers

Deploy a full Next.js application to Cloudflare Workers.

```bash
# Deploy to production
mdxe publish --worker --env production

# Deploy with custom name
mdxe publish --worker --name my-app

# Deploy with source maps
mdxe publish --worker --sourcemap

# Disable minification (for debugging)
mdxe publish --worker --no-minify
```

**Features:**
- Full Next.js app with SSR capabilities
- Auto-generated `wrangler.toml` configuration
- Built-in caching with KV namespaces (optional)
- Custom domain support
- Zero downtime deployments

**Output:**
- `.mdxe/worker.js` - Bundled worker script
- `wrangler.toml` - Cloudflare configuration
- Deployment URL: `https://{name}.workers.dev`

### 2. Cloudflare Snippets

Create ultra-lightweight snippets for edge processing.

```bash
# Generate snippet
mdxe snippet --name my-snippet

# Custom output path
mdxe snippet --output dist/snippet.js

# No minification (for debugging)
mdxe snippet --no-minify
```

**Features:**
- Ultra-lightweight (~2KB minified)
- No rendering cost on Cloudflare
- Perfect for edge logic and routing
- Manual deployment via dashboard or API

**Output:**
- `.mdxe/snippet.js` - Minified snippet code
- `.mdxe/snippet-metadata.json` - Deployment metadata
- `.mdxe/DEPLOYMENT.md` - Deployment instructions

**Manual Deployment:**
1. Go to Cloudflare Dashboard → Workers & Pages → Snippets
2. Create new snippet with generated code
3. Configure triggers (URL patterns, zones)
4. Enable and deploy

### 3. Worker Assets

Upload MDX files to Worker Assets for free CDN distribution.

```bash
# Upload all content to Worker Assets
mdxe assets --env production

# Custom asset name
mdxe assets --name my-content

# Private assets (not publicly accessible)
mdxe assets --private
```

**Features:**
- Free storage and bandwidth
- Global CDN distribution
- Automatic content-type detection
- Asset manifest with hashing
- Versioning support

**Output:**
- `.mdxe/assets/` - Staged assets for deployment
- `.mdxe/assets-worker.js` - Asset serving worker
- `wrangler.toml` - Worker Assets configuration
- `.mdxe/assets-metadata.json` - Asset manifest

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Worker Configuration
WORKER_NAME=my-mdxe-app
WORKER_ENV=production

# KV Namespaces (optional)
KV_CACHE_ID=your-kv-namespace-id

# R2 Buckets (optional)
R2_BUCKET_NAME=my-assets-bucket
```

### Custom wrangler.toml

You can customize the auto-generated `wrangler.toml`:

```toml
name = "my-app"
main = ".mdxe/worker.js"
compatibility_date = "2024-01-01"

[env.production]
workers_dev = true

# Add KV for caching
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

# Add D1 for database
[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "your-db-id"

# Custom domains
[[routes]]
pattern = "example.com/*"
zone_name = "example.com"
```

### Build Optimization

Control build output with CLI flags:

```bash
# Full optimization (production)
mdxe publish --minify --env production

# Debug mode (no minification, source maps)
mdxe publish --no-minify --sourcemap --env development

# Specific target
mdxe publish --worker --env staging
```

## Deployment Targets Comparison

| Feature | Workers | Snippets | Assets |
|---------|---------|----------|--------|
| **Size** | ~100KB+ | ~2KB | ~1MB+ |
| **Cost** | $5/month (paid plan) | Free | Free |
| **Rendering** | Full SSR | No rendering | Static only |
| **Use Case** | Full app | Edge logic | Content delivery |
| **Setup** | Auto | Manual | Auto |
| **Bandwidth** | 10GB free | Unlimited | Unlimited |

## Advanced Workflows

### Multi-Environment Deployments

```bash
# Deploy to staging
mdxe publish --env staging

# Deploy to production
mdxe publish --env production

# Deploy to custom environment
mdxe publish --env preview
```

### CI/CD Integration

GitHub Actions example:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Deploy to Workers
        run: pnpm mdxe publish --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Rollback

To rollback a deployment:

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

### Monitoring

View logs and metrics:

```bash
# Tail logs in real-time
wrangler tail [worker-name]

# View metrics
wrangler metrics [worker-name]
```

## Troubleshooting

### Common Issues

**1. "wrangler: command not found"**
```bash
# Install wrangler globally
npm install -g wrangler

# Or use npx
npx wrangler --version
```

**2. "Authentication failed"**
```bash
# Login to Cloudflare
wrangler login

# Or set API token
export CLOUDFLARE_API_TOKEN=your-token
```

**3. "Build failed"**
```bash
# Run build separately to debug
mdxe build

# Check build output
ls -la .next
```

**4. "Asset not found"**
```bash
# Ensure content/ directory exists
ls -la content/

# Check asset manifest
cat .mdxe/assets-metadata.json
```

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
export DEBUG=mdxe:*

# Run with debug output
mdxe publish --worker
```

## Best Practices

1. **Use Workers for Full Apps**: If you need SSR, API routes, or dynamic content
2. **Use Snippets for Edge Logic**: Perfect for A/B testing, redirects, or simple routing
3. **Use Assets for Content**: Best for static MDX files served from CDN
4. **Enable Caching**: Use KV namespaces for caching in Workers
5. **Monitor Performance**: Set up analytics and monitoring
6. **Version Control**: Commit `wrangler.toml` for reproducible deployments
7. **Staging Environment**: Always test in staging before production
8. **Custom Domains**: Set up custom domains for production apps

## Examples

### Example 1: Blog with Worker Assets

```bash
# 1. Create content
mkdir content
echo "# My Blog" > content/index.mdx
echo "# About" > content/about.mdx

# 2. Upload to Worker Assets
mdxe assets --name my-blog

# 3. Access at https://my-blog-assets.workers.dev/
```

### Example 2: Dynamic App with Workers

```bash
# 1. Build Next.js app
mdxe build

# 2. Deploy to Workers
mdxe publish --worker --name my-app

# 3. Access at https://my-app.workers.dev/
```

### Example 3: A/B Testing with Snippets

```bash
# 1. Generate snippet
mdxe snippet --name ab-test

# 2. Deploy manually via dashboard
# 3. Configure triggers for specific routes
# 4. Monitor performance in dashboard
```

## Support

- Documentation: https://mdxe.dev/docs
- GitHub Issues: https://github.com/mdx/mdxe/issues
- Discord: https://discord.gg/mdx

---

Generated by mdxe - Zero-config MDX development and deployment
