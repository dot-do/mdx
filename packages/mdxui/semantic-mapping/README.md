# @mdxui/semantic-mapping

Semantic MDX parser that extracts structured props from markdown children.

## Installation

```bash
pnpm add @mdxui/semantic-mapping @mdxui/types
```

## Features

- **Semantic parsing** - Understands markdown structure (headings, paragraphs, images, lists)
- **Props extraction** - Converts MDX children to component props
- **Type-safe** - Full TypeScript support with @mdxui/types integration
- **Extensible** - Easy to add custom extractors

## Usage

### Extract Hero Props

```tsx
import { extractHero } from '@mdxui/semantic-mapping'

function Hero({ children }) {
  const props = extractHero(children)
  // props = {
  //   headline: "Welcome",
  //   description: "Get started today",
  //   media: { src: "/hero.png", alt: "Hero" }
  // }

  return (
    <section>
      <h1>{props.headline}</h1>
      <p>{props.description}</p>
      {props.media && <img {...props.media} />}
    </section>
  )
}

// Usage:
<Hero>
  # Welcome
  Get started today
  ![Hero](/hero.png)
</Hero>
```

### Extract Features Props

```tsx
import { extractFeatures } from '@mdxui/semantic-mapping'

function Features({ children }) {
  const props = extractFeatures(children)
  // props = {
  //   title: "Our Features",
  //   features: [
  //     { title: "Fast", description: "Lightning fast" },
  //     { title: "Secure", description: "Bank-level security" }
  //   ]
  // }

  return (
    <section>
      <h2>{props.title}</h2>
      <div>
        {props.features?.map(feature => (
          <div key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// Usage:
<Features>
  ## Our Features

  ### Fast
  Lightning fast

  ### Secure
  Bank-level security
</Features>
```

### Generic Extraction

```tsx
import { extractProps } from '@mdxui/semantic-mapping'
import type { HeroSectionProps } from '@mdxui/types'

const props = extractProps<HeroSectionProps>(children, 'hero')
```

## Semantic Mapping Rules

### Hero Section

- **Headline**: First h1 or h2 heading
- **Description**: First paragraph after headline
- **Media**: First image

```mdx
# This becomes the headline

This becomes the description

![This becomes the media](/image.png)
```

### Features Section

- **Title**: First h2 heading
- **Features**: All h3 headings with following paragraphs

```mdx
## This becomes the section title

### This becomes feature[0].title
This becomes feature[0].description

### This becomes feature[1].title
This becomes feature[1].description
```

## API Reference

### `extractProps<T>(children, componentType)`

Generic extraction function.

**Parameters:**
- `children: ReactNode` - React children to parse
- `componentType: string` - Type of component ('hero', 'features', etc.)

**Returns:** `Partial<T>` - Extracted props

### `extractHero(children)`

Convenience function for hero sections.

**Returns:** `Partial<HeroSectionProps>`

### `extractFeatures(children)`

Convenience function for features sections.

**Returns:** `Partial<FeaturesSectionProps>`

### `parseChildren(children)`

Low-level function to parse React children into MDX AST.

**Returns:** `MDXNode[]`

### `extractText(node)`

Extract all text content from an MDX node.

**Returns:** `string`

## Advanced Usage

### Custom Extractors

```typescript
import { parseChildren, extractText } from '@mdxui/semantic-mapping'
import type { MDXNode } from '@mdxui/semantic-mapping'

function extractCustomProps(nodes: MDXNode[]) {
  const titleNode = nodes.find(n => n.type === 'h1')
  const title = titleNode ? extractText(titleNode) : ''

  return { title }
}

// Use it:
const nodes = parseChildren(children)
const props = extractCustomProps(nodes)
```

### Dual API Components

Combine semantic mapping with explicit props:

```tsx
import { extractHero } from '@mdxui/semantic-mapping'
import type { HeroProps } from '@mdxui/types'

function Hero({ children, headline, description, ...rest }: HeroProps) {
  // Extract from children if props not provided
  const extracted = children ? extractHero(children) : {}

  // Explicit props take precedence
  const finalProps = {
    headline: headline || extracted.headline,
    description: description || extracted.description,
    ...rest,
  }

  return <section>{/* ... */}</section>
}

// Works with both APIs:
<Hero headline="Explicit" />
<Hero>
  # Semantic
  Extracted from markdown
</Hero>
```

## Testing

The package includes comprehensive tests:

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck
```

## How It Works

1. **Parse**: Convert React children to MDX AST nodes
2. **Detect**: Identify structural boundaries (headings, sections)
3. **Extract**: Pull out relevant content based on component type
4. **Return**: Structured props ready to use

```
React Children → MDX AST → Semantic Analysis → Component Props
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Tests
pnpm test

# Type check
pnpm typecheck
```

## License

MIT
