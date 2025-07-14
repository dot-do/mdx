# MDXE Blog Example

This is a blog example built with MDXE that demonstrates how to create a blog with zero configuration using Markdown and MDX files.

## Features

- Zero-config blog setup with MDXE
- Automatic routing for blog posts (`.md` and `.mdx` files)
- Interactive MDX components in blog posts
- **Core mdxui components** automatically available
- Tailwind CSS with Typography plugin for beautiful styling
- Hot reload during development
- Built-in components like Alert, Callout, and YouTube

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Writing Blog Posts

Simply create `.md` or `.mdx` files in the project root. They'll automatically become available as routes:

- `getting-started-with-mdxe.mdx` → `/getting-started-with-mdxe`
- `mdx-components-showcase.mdx` → `/mdx-components-showcase`

### Example Blog Post

```mdx
---
title: 'My Blog Post'
date: '2024-01-15'
---

# My Blog Post

This is a blog post with **markdown** and interactive components.

<Alert type='info'>This is an info alert component!</Alert>

<Callout>This is a callout component for important information.</Callout>

<Button variant='primary'>Click me!</Button>

<Card title='My Card' href='/example'>
  This is a card from mdxui
</Card>
```

## Available Components

### Built-in MDXE Components

- `<Alert type="info|warning|error|success">` - Styled alert boxes
- `<Callout emoji="💡">` - Highlighted callout boxes
- `<YouTube id="video-id">` - Embedded YouTube videos

### MDXUI Core Components (Automatically Available)

Core mdxui components are automatically available in your MDX files:

```mdx
<!-- Core components -->

<Button variant='primary'>Primary Button</Button>
<Button variant='secondary'>Secondary Button</Button>
<Button variant='text'>Text Button</Button>
<Card title='Example' href='/link'>
  Card content
</Card>
```

### Component Reference

- **Button**: `<Button variant="primary|secondary|text">` - Styled buttons with variants
- **Card**: `<Card title="Title" href="/link">` - Clickable cards with titles

## Custom Components

You can add custom components by creating or editing `mdx-components.js` in your project root:

```javascript
export default {
  // Custom components
  CustomButton: ({ children, ...props }) => (
    <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600' {...props}>
      {children}
    </button>
  ),

  // Override default components
  h1: ({ children }) => <h1 className='text-4xl font-bold text-gray-900 mb-4'>{children}</h1>,

  // Extend existing components
  Button: ({ children, ...props }) => (
    <button className='custom-button-style' {...props}>
      🚀 {children}
    </button>
  ),
}
```

## Recent Blog Posts

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
  <article className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
    <h3 className="text-xl font-semibold mb-2">
      <a href="/getting-started-with-mdxe" className="text-blue-600 hover:text-blue-800 no-underline">
        Getting Started with MDXE
      </a>
    </h3>
    Learn the basics of MDXE and how to create your first blog with zero configuration.
    <div className="text-sm text-gray-500">
      A comprehensive guide to getting started with MDXE
    </div>
  </article>

  <article className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
    <h3 className="text-xl font-semibold mb-2">
      <a href="/mdx-components-showcase" className="text-blue-600 hover:text-blue-800 no-underline">
        MDX Components Showcase
      </a>
    </h3>
    Explore the interactive components available in MDXE and how to use them in your blog posts.
    <div className="text-sm text-gray-500">
      Interactive examples of alerts, callouts, and custom components
    </div>
  </article>
</div>

## Learn More

- [MDXE Documentation](https://mdxe.org)
- [MDX Documentation](https://mdxjs.com)
- [MDXUI Components](https://mdxui.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
