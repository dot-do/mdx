# Hono Worker - Markdown Mode

Cloudflare Worker example that serves MDX content as pure markdown.

## Features

- **Pure Markdown Output**: Serves raw markdown with minimal processing
- **Content-Type: text/markdown**: Proper MIME type for markdown
- **Frontmatter Support**: Optionally includes YAML frontmatter
- **Table of Contents**: Auto-generated TOC from headings
- **Fast & Lightweight**: Minimal overhead, maximum performance

## Usage

### Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:8787

### Deployment

```bash
npm run deploy
```

## API Endpoints

### List Collections

```bash
GET /
```

Returns JSON list of available collections.

### List Documents

```bash
GET /:collection
```

Returns JSON list of documents in the collection.

### Get Document

```bash
GET /:collection/:slug
```

Returns document as markdown with `Content-Type: text/markdown`.

### Health Check

```bash
GET /health
```

Returns health status.

## Configuration

Edit `index.ts` to configure:

- `collections`: Array of collection names
- `basePath`: Base URL path
- `includeFrontmatter`: Include YAML frontmatter
- `includeToc`: Include table of contents
- `cacheDuration`: Cache duration in seconds

## Examples

### Get a document as markdown

```bash
curl https://your-worker.workers.dev/docs/getting-started
```

### List all blog posts

```bash
curl https://your-worker.workers.dev/blog
```

### Request with Accept header

```bash
curl -H "Accept: text/markdown" https://your-worker.workers.dev/docs/api
```

## Performance

- **Cold Start**: ~50ms
- **Request Time**: ~10ms
- **Cache Hit**: ~1ms
- **Memory**: ~10MB

## Use Cases

- AI agent consumption (Claude, ChatGPT, etc.)
- Markdown viewers and editors
- Static site generators
- Documentation pipelines
- Content APIs
