# @mdxdb/render

Website rendering with tweakcn styling from YAML configuration.

## Features

- **YAML-based styling** - Define themes using simple YAML config files
- **tweakcn-inspired** - Component-level styling with variants
- **MDX rendering** - Full MDX support with custom components
- **Multiple templates** - Basic, docs, and blog templates included
- **Tailwind integration** - Generate Tailwind configs from YAML
- **4 built-in presets** - Minimal, modern, docs, and blog themes

## Installation

```bash
pnpm add @mdxdb/render
```

## Quick Start

### Basic Usage

```typescript
import { renderMdx, loadPresetConfig } from '@mdxdb/render'

const content = '# Hello World\n\nThis is **MDX** content.'
const config = loadPresetConfig('modern')

const result = await renderMdx(content, { config })
console.log(result.html)
```

### Using YAML Config

```typescript
import { renderWithYAML } from '@mdxdb/render'
import { readFileSync } from 'fs'

const yamlConfig = readFileSync('./theme.yaml', 'utf-8')
const result = await renderWithYAML(content, yamlConfig)
```

### Full Pipeline (MDX → HTML Page)

```typescript
import { renderPipeline } from '@mdxdb/render'

const html = await renderPipeline({
  content: markdownContent,
  preset: 'docs',
  template: 'docs',
  templateOptions: {
    title: 'Documentation',
    siteName: 'My Project',
    navigation: [
      { title: 'Home', href: '/' },
      { title: 'API', href: '/api' }
    ],
    tableOfContents: [
      { level: 1, text: 'Introduction', id: 'intro' },
      { level: 2, text: 'Getting Started', id: 'start' }
    ]
  }
})

// Write complete HTML page
writeFileSync('./output.html', html)
```

## YAML Configuration Format

```yaml
theme:
  colors:
    primary: "#3b82f6"
    secondary: "#8b5cf6"
    background: "#ffffff"
    foreground: "#0f172a"
    muted: "#f8fafc"
    border: "#e2e8f0"

  fonts:
    body: "Inter"
    heading: "Poppins"
    mono: "Fira Code"

  spacing:
    xs: "0.5rem"
    sm: "1rem"
    md: "1.5rem"

  borderRadius: "0.5rem"

  components:
    heading:
      className: "font-bold text-foreground"
      variants:
        h1: "text-4xl"
        h2: "text-3xl"

    link:
      className: "text-primary hover:underline"

    button:
      className: "px-4 py-2 rounded"
      variants:
        default: "bg-primary text-white"
        outline: "border-2 border-primary"

  customCSS: |
    /* Your custom styles */
    .special { color: red; }
```

## Built-in Presets

### minimal
Clean, simple design with system fonts
```typescript
const config = loadPresetConfig('minimal')
```

### modern
Vibrant colors, modern fonts, smooth transitions
```typescript
const config = loadPresetConfig('modern')
```

### docs
Optimized for technical documentation
```typescript
const config = loadPresetConfig('docs')
```

### blog
Elegant reading experience for long-form content
```typescript
const config = loadPresetConfig('blog')
```

## Templates

### Basic Template
Simple HTML page with container

```typescript
import { renderBasicTemplate } from '@mdxdb/render'

const html = renderBasicTemplate(renderResult, config, {
  title: 'My Page',
  description: 'Page description'
})
```

### Docs Template
Full documentation layout with sidebar and TOC

```typescript
import { renderDocsTemplate } from '@mdxdb/render'

const html = renderDocsTemplate(renderResult, config, {
  title: 'API Reference',
  siteName: 'My Docs',
  navigation: [...],
  tableOfContents: [...],
  editUrl: 'https://github.com/...'
})
```

### Blog Template
Blog post layout with author, date, tags

```typescript
import { renderBlogTemplate } from '@mdxdb/render'

const html = renderBlogTemplate(renderResult, config, {
  title: 'My Blog Post',
  author: {
    name: 'John Doe',
    avatar: '/avatar.jpg',
    bio: 'Writer'
  },
  date: '2024-10-03',
  tags: ['javascript', 'web'],
  coverImage: '/cover.jpg'
})
```

## Tailwind Integration

Generate Tailwind config from tweakcn config:

```typescript
import { generateTailwindConfig, exportTailwindConfigFile } from '@mdxdb/render'

const config = loadPresetConfig('modern')

// Get config object
const tailwindConfig = generateTailwindConfig(config)

// Export to file
const configFile = exportTailwindConfigFile(config)
writeFileSync('./tailwind.config.js', configFile)
```

## Advanced Usage

### Custom Components

```typescript
import { renderMdxWithComponents } from '@mdxdb/render'

const components = {
  Alert: (props, children) => `<div class="alert">${children}</div>`,
  Button: (props, children) => `<button class="${props.variant}">${children}</button>`
}

const result = await renderMdxWithComponents(content, components, { config })
```

### Extract Metadata

```typescript
import { extractMdxMetadata } from '@mdxdb/render'

const metadata = await extractMdxMetadata(content)

console.log(metadata.frontmatter) // { title: '...', author: '...' }
console.log(metadata.headings)    // [{ level: 1, text: '...', id: '...' }]
console.log(metadata.wordCount)   // 1234
console.log(metadata.readingTime) // 6 (minutes)
```

### Render to Plain Text

```typescript
import { renderMdxToText } from '@mdxdb/render'

const text = await renderMdxToText(content)
console.log(text) // Plain text without markdown syntax
```

## API Reference

### Core Functions

- `renderMdx(content, options)` - Render MDX to HTML with styles
- `renderWithPreset(content, preset, options)` - Render with built-in preset
- `renderWithYAML(content, yaml, options)` - Render with YAML config
- `renderPipeline(options)` - Full pipeline (MDX → complete HTML page)

### Config Functions

- `parseTweakcnConfig(yaml)` - Parse YAML to config object
- `mergeTweakcnConfigs(base, override)` - Merge two configs
- `loadPresetConfig(preset)` - Load built-in preset
- `getComponentStyles(config, name, variant)` - Get component class names

### Template Functions

- `renderBasicTemplate(result, config, options)` - Basic HTML template
- `renderDocsTemplate(result, config, options)` - Documentation template
- `renderBlogTemplate(result, config, options)` - Blog post template

### Tailwind Functions

- `generateTailwindConfig(config)` - Generate Tailwind config object
- `generateTailwindCSSVariables(config)` - Generate CSS variables
- `exportTailwindConfigFile(config)` - Export config file content

### Utility Functions

- `extractMdxMetadata(content)` - Extract frontmatter, headings, word count
- `renderMdxToText(content)` - Strip HTML, get plain text
- `renderMdxWithComponents(content, components, options)` - Custom components

## Examples

See the `/examples` directory for complete YAML configurations:

- `minimal.yaml` - Minimal design
- `modern.yaml` - Modern design with glassmorphism
- `docs.yaml` - Technical documentation
- `blog.yaml` - Blog reading experience
- `dark-mode.yaml` - Dark theme

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  TweakcnConfig,
  TweakcnTheme,
  MdxRenderOptions,
  MdxRenderResult,
  BasicTemplateOptions,
  DocsTemplateOptions,
  BlogTemplateOptions
} from '@mdxdb/render'
```

## License

MIT
