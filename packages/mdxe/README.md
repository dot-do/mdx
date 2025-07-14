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
