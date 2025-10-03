# Hono Worker - HTML Mode

Cloudflare Worker example that serves MDX content as beautiful HTML with Tailwind CSS.

## Features

- **Beautiful HTML**: Responsive, accessible HTML output
- **Tailwind Typography**: Professional typography out of the box
- **Table of Contents**: Sticky sidebar navigation
- **Custom Styling**: Easy theming and customization
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Fast & Global**: Deployed on Cloudflare's edge network

## Usage

### Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:8788

### Deployment

```bash
npm run deploy
```

## Pages

### Home Page

```
GET /
```

Shows index of all collections with cards.

### Collection Index

```
GET /:collection
```

Lists all documents in the collection with previews.

### Document Page

```
GET /:collection/:slug
```

Renders document as HTML with:
- Tailwind typography styling
- Table of contents sidebar
- Breadcrumb navigation
- Responsive design

### Health Check

```
GET /health
```

Returns health status.

## Configuration

Edit `index.ts` to configure:

### Basic Options

- `collections`: Array of collection names
- `basePath`: Base URL path
- `siteTitle`: Site title for `<title>` tag
- `siteDescription`: Meta description

### Styling Options

- `typographyTheme`: Tailwind typography theme (default, slate, gray, etc.)
- `includeTocSidebar`: Show table of contents sidebar
- `styling.typography`: Custom typography config
- `styling.customCss`: Custom CSS styles

### Performance Options

- `cacheDuration`: Cache duration in seconds

## Styling Themes

Available typography themes:

- `default` - Default Tailwind typography
- `slate` - Slate color scheme
- `gray` - Gray color scheme
- `zinc` - Zinc color scheme
- `neutral` - Neutral color scheme
- `stone` - Stone color scheme

## Custom CSS

Add custom styles via the `styling.customCss` option:

```typescript
styling: {
  customCss: `
    .prose code {
      background-color: #f7fafc;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
    }
  `
}
```

## Examples

### Visit home page

```bash
curl https://your-worker.workers.dev/
```

### View a document

```bash
curl https://your-worker.workers.dev/docs/getting-started
```

### List blog posts

```bash
curl https://your-worker.workers.dev/blog
```

## Performance

- **Cold Start**: ~100ms (with Tailwind CDN)
- **Request Time**: ~20ms
- **Cache Hit**: ~1ms
- **Memory**: ~20MB

## Use Cases

- Documentation sites
- Knowledge bases
- Blog platforms
- API documentation
- Internal wikis
- Portfolio sites
- Landing pages
