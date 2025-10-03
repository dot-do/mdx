# @mdxui/types

TypeScript types for mdxui components.

## Installation

```bash
pnpm add @mdxui/types
```

## Features

- **Comprehensive type system** for all mdxui components
- **Dual API support** - components accept both explicit props and MDX children
- **Category-based organization** - Marketing, Docs, Dashboard, Chat
- **Tree-shakeable** - import only the types you need

## Usage

### Import all types

```typescript
import type { HeroProps, FeaturesProps } from '@mdxui/types'
```

### Import by category

```typescript
import type { HeroProps, FeaturesProps } from '@mdxui/types/marketing'
import type { CalloutProps, TabsProps } from '@mdxui/types/docs'
import type { ChartProps, StatCardProps } from '@mdxui/types/dashboard'
import type { MessageProps, ChatInterfaceProps } from '@mdxui/types/chat'
import type { ThemeConfig } from '@mdxui/types/theme'
```

## Component Types

### Marketing Components

- `HeroProps` - Hero sections
- `FeaturesProps` - Features sections
- `PricingProps` - Pricing tables
- `CTAProps` - Call-to-action sections
- `TestimonialsProps` - Testimonial sections
- `FAQProps` - FAQ sections

### Documentation Components

- `CalloutProps` - Callouts/admonitions
- `TabsProps` - Tab groups
- `CodeBlockProps` - Code blocks with syntax highlighting
- `StepsProps` - Step-by-step guides
- `FileTreeProps` - File tree visualization

### Dashboard Components

- `StatCardProps` - KPI/metric cards
- `CardProps` - Generic cards
- `ChartProps` - Charts (Tremor-style)
- `TableProps` - Data tables

### Chat Components

- `MessageProps` - Chat messages
- `ChatInputProps` - Chat input field
- `MessageListProps` - Message list container
- `ChatInterfaceProps` - Complete chat interface
- `PromptSuggestionsProps` - Suggested prompts

## Dual API Pattern

All component types support the **dual API pattern** - you can provide either:

1. **Explicit props**:
```tsx
<Hero
  headline="Welcome"
  description="Get started today"
  media={{ src: "/hero.png", alt: "Hero" }}
/>
```

2. **MDX children** (parsed semantically):
```tsx
<Hero>
  # Welcome
  Get started today
  ![Hero](/hero.png)
</Hero>
```

3. **Both** (explicit props take precedence):
```tsx
<Hero headline="Override">
  # This will be ignored
  But this description will be used
</Hero>
```

## Base Types

### Common Props

All components extend these base types:

- `BaseComponentProps` - className, style, id, aria-label, data-*
- `SpacingProps` - padding, margin, gap
- `ColorProps` - colorVariant, colorScheme
- `SizeProps` - size
- `MediaProps` - src, alt, type, width, height, aspectRatio
- `ActionProps` - href, target, text, onClick, disabled
- `BackgroundProps` - backgroundType (for MagicUI backgrounds)

### Polymorphic Components

Use `PolymorphicProps` for components that can render as different HTML elements:

```typescript
import type { PolymorphicProps } from '@mdxui/types'

type ButtonProps<E extends ElementType = 'button'> = PolymorphicProps<E, {
  variant?: 'primary' | 'secondary'
}>

// Usage:
<Button as="a" href="/link">Link Button</Button>
<Button as="button" onClick={handleClick}>Regular Button</Button>
```

## Theme Configuration

The `ThemeConfig` type provides complete theming support:

```typescript
import type { ThemeConfig } from '@mdxui/types/theme'

const theme: ThemeConfig = {
  mode: 'dark',
  colors: {
    primary: {
      500: '#3b82f6',
      600: '#2563eb',
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, sans-serif',
    },
  },
}
```

## Development

```bash
# Build
pnpm build

# Type check
pnpm typecheck

# Run tests
pnpm test
```

## License

MIT
