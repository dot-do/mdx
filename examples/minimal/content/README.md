# Minimal MDXE Example

This is a minimal example of using MDXE to serve Markdown and MDX files with zero configuration.

## Features

- Zero-config setup for serving Markdown and MDX files
- Automatic serving of .md and .mdx files
- Tailwind CSS with Typography plugin for styling
- Includes all components from mdxui package

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

## Using MDXE Components

MDXE includes built-in components and supports mdxui components via mdx-components.js:

### Built-in Components (No setup required)

<Alert type="info">
This is an info alert that works out of the box!
</Alert>

<Alert type="success">
Success alerts are green and indicate positive actions.
</Alert>

<Callout emoji="🚀">
This is a callout with an emoji - great for highlighting important information!
</Callout>

<YouTube id="dQw4w9WgXcQ" title="Example YouTube Video" />

### mdxui Components (via mdx-components.js)

<Button size='icon'>Click Me</Button>

<Card title="MDXE Card">
  This is a card component from mdxui.
  <Button variant="secondary" size="icon">Click Me</Button>
</Card>

<Badge>New Feature</Badge>

## Styling with Tailwind

MDXE includes Tailwind CSS with the Typography plugin for beautiful typography:

<div className='prose prose-lg'>
  This content is styled with Tailwind Typography.
</div>

## Learn More

- [MDXE Documentation](https://mdxe.js.org)
- [MDX Documentation](https://mdxjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)

## Deploying to Vercel

When deploying to Vercel, you can optionally create a `vercel.json` configuration file in your project root to ensure proper handling of the build directory:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "distDir": ".next"
      }
    }
  ]
}
```

This configuration explicitly tells Vercel to use the `.next` directory in your project root for the build output. Note that with the latest version of mdxe, this configuration is optional as the tool now automatically detects Vercel deployment environments and handles the build directory appropriately.
