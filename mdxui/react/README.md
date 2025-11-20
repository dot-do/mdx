# @mdxui/react

React components for mdxui with **dual API support** - use explicit props OR pure MDX children.

## Installation

```bash
pnpm add @mdxui/react @mdxui/types
```

## Features

- 🎨 **MagicUI-inspired backgrounds** - Particles, Grid, Dots
- 🔄 **Dual API pattern** - Props OR MDX children
- ♿ **Accessibility** - Reduced motion support
- 🎯 **Type-safe** - Full TypeScript support
- 🌙 **Dark mode ready** - Tailwind CSS compatible
- 📱 **Responsive** - Mobile-first design

## Quick Start

### Option 1: Explicit Props

```tsx
import { Hero, Features } from '@mdxui/react'

export default function Page() {
  return (
    <>
      <Hero
        headline="Welcome to Our Platform"
        description="The best solution for your needs"
        primaryAction={{ text: "Get Started", href: "/signup" }}
        backgroundType="particles"
      />

      <Features
        title="Our Features"
        features={[
          { title: "Fast", description: "Lightning-fast performance" },
          { title: "Secure", description: "Bank-level security" },
        ]}
        layout="grid"
        columns={3}
      />
    </>
  )
}
```

### Option 2: Pure MDX (Semantic Extraction)

```mdx
import { Hero, Features } from '@mdxui/react'

<Hero backgroundType="particles">
# Welcome to Our Platform

The best solution for your needs

![Hero Image](/hero.png)
</Hero>

<Features>
## Our Features

### Fast
Lightning-fast performance

### Secure
Bank-level security
</Features>
```

## Components

### Marketing Components

#### Hero

Hero section with headline, description, CTAs, and optional media.

**Props API:**
```tsx
<Hero
  headline="Your Headline"
  description="Your description"
  primaryAction={{ text: "Get Started", href: "/signup" }}
  secondaryAction={{ text: "Learn More", href: "/learn" }}
  media={{ src: "/hero.png", alt: "Hero" }}
  mediaPosition="right"
  layout="split"
  backgroundType="particles"
/>
```

**MDX API:**
```mdx
<Hero backgroundType="grid">
# Your Headline

Your description

![Hero](/hero.png)
</Hero>
```

**Layouts:**
- `centered` - Centered content (default)
- `split` - Content on left, media on right
- `minimal` - Minimal spacing
- `full-screen` - Full viewport height

**Text Alignment:**
- `left` | `center` | `right`

**Max Width:**
- `sm` | `md` | `lg` | `xl` | `full`

#### Features

Features section with grid/list layout.

**Props API:**
```tsx
<Features
  title="Our Features"
  description="What makes us different"
  features={[
    {
      title: "Feature 1",
      description: "Description",
      icon: "🚀",
      href: "/feature-1"
    }
  ]}
  layout="grid"
  columns={3}
/>
```

**MDX API:**
```mdx
<Features>
## Our Features

### Feature 1
Description

### Feature 2
Description
</Features>
```

**Layouts:**
- `grid` - Grid layout (default)
- `list` - Vertical list
- `alternating` - Alternating left/right
- `bento` - Bento box grid

**Columns (grid layout):**
- `2` | `3` | `4`

#### Pricing

Pricing section with multiple tiers and feature comparison.

**Props API:**
```tsx
<Pricing
  title="Simple Pricing"
  description="Choose the plan that's right for you"
  tiers={[
    {
      name: "Starter",
      price: "9",
      currency: "$",
      period: "per month",
      description: "Perfect for getting started",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      action: { text: "Get Started", href: "/signup" },
      highlighted: false,
      badge: "Popular"
    }
  ]}
  layout="cards"
  backgroundType="dots"
/>
```

**MDX API:**
```mdx
<Pricing backgroundType="dots">
## Simple Pricing

### Starter
$9 per month
- Feature 1
- Feature 2
- Feature 3
</Pricing>
```

**Layouts:**
- `cards` - Card-based grid (default)

#### CTA

Call-to-action section to drive user actions.

**Props API:**
```tsx
<CTA
  headline="Ready to get started?"
  description="Join thousands of users today"
  primaryAction={{ text: "Sign Up", href: "/signup" }}
  secondaryAction={{ text: "Learn More", href: "/learn" }}
  layout="centered"
  backgroundStyle="gradient"
  backgroundType="particles"
/>
```

**MDX API:**
```mdx
<CTA backgroundType="particles" backgroundStyle="gradient">
# Ready to get started?
Join thousands of users today
</CTA>
```

**Layouts:**
- `centered` - Centered content (default)
- `split` - Content on left, actions on right
- `banner` - Horizontal banner style

**Background Styles:**
- `solid` - Solid background
- `gradient` - Gradient background
- `pattern` - Pattern background

#### Testimonials

Customer testimonials and reviews section.

**Props API:**
```tsx
<Testimonials
  title="What Our Customers Say"
  testimonials={[
    {
      quote: "Amazing product! The team is fantastic.",
      author: {
        name: "John Doe",
        title: "CEO",
        company: "Acme Corp",
        avatar: "/avatar.jpg"
      },
      rating: 5
    }
  ]}
  layout="grid"
  columns={3}
  showRatings={true}
  showAvatars={true}
/>
```

**MDX API:**
```mdx
<Testimonials backgroundType="aurora">
## What Our Customers Say

> Amazing product! The team is fantastic.
> — John Doe, CEO at Acme Corp
> ⭐⭐⭐⭐⭐
</Testimonials>
```

**Layouts:**
- `grid` - Grid layout (default)
- `carousel` - Horizontal scrolling carousel
- `wall` - Masonry-style wall
- `single` - Single centered testimonial

**Columns (grid layout):**
- `2` | `3` | `4`

#### FAQ

Frequently asked questions with accordion interface.

**Props API:**
```tsx
<FAQ
  title="Frequently Asked Questions"
  items={[
    {
      question: "How does it work?",
      answer: "It works by leveraging modern web technologies..."
    },
    {
      question: "Is it free?",
      answer: "Yes, we offer a generous free tier."
    }
  ]}
  layout="accordion"
  allowMultiple={false}
/>
```

**MDX API:**
```mdx
<FAQ backgroundType="grid">
## Frequently Asked Questions

### How does it work?
It works by leveraging modern web technologies...

### Is it free?
Yes, we offer a generous free tier.
</FAQ>
```

**Layouts:**
- `accordion` - Single column accordion (default)
- `two-column` - Two-column layout
- `grid` - Grid layout

### Background Components

#### BackgroundContainer

Wrapper component that adds animated backgrounds to any content.

```tsx
import { BackgroundContainer } from '@mdxui/react/backgrounds'

<BackgroundContainer
  backgroundType="particles"
  backgroundOpacity={0.5}
  reduceMotion={true}
>
  {/* Your content */}
</BackgroundContainer>
```

**Background Types:**
- `none` - No background (default)
- `particles` - Animated particles
- `grid` - Grid lines
- `dots` - Dot pattern
- `meteors` - Shooting stars effect
- `aurora` - Northern lights with flowing gradients
- `warp` - Perspective grid warp

**Configuration:**
```tsx
backgroundConfig={{
  // Particles
  count: 100,
  color: "rgb(255, 255, 255)",

  // Grid
  size: 50,

  // Dots
  spacing: 30,
  size: 1,

  // Meteors
  count: 20,
  color: "rgb(59, 130, 246)",

  // Aurora
  color1: "rgb(59, 130, 246)",
  color2: "rgb(147, 51, 234)",
  color3: "rgb(219, 39, 119)",

  // Warp
  size: 50,
  warpIntensity: 0.5
}}
```

#### Individual Backgrounds

Use background components directly:

```tsx
import { Particles, Grid, Dots, Meteors, Aurora, Warp } from '@mdxui/react/backgrounds'

<div className="relative h-screen">
  {/* Particles */}
  <Particles count={100} color="rgb(255, 255, 255)" opacity={0.5} />

  {/* Meteors */}
  <Meteors count={20} color="rgb(59, 130, 246)" opacity={0.6} />

  {/* Aurora */}
  <Aurora
    color1="rgb(59, 130, 246)"
    color2="rgb(147, 51, 234)"
    color3="rgb(219, 39, 119)"
    opacity={0.4}
  />

  {/* Warp */}
  <Warp size={40} color="rgb(59, 130, 246)" opacity={0.3} warpIntensity={0.7} />

  <div className="relative z-10">{/* Content */}</div>
</div>
```

## Dual API Pattern

All components support **two usage patterns** simultaneously:

### 1. Explicit Props (Traditional)

```tsx
<Hero
  headline="Welcome"
  description="Get started today"
/>
```

### 2. MDX Children (Semantic)

```mdx
<Hero>
# Welcome

Get started today
</Hero>
```

### 3. Hybrid (Best of Both)

```mdx
<Hero backgroundType="particles" layout="split">
# Welcome

Get started today
</Hero>
```

Explicit props always take precedence over extracted props.

## Styling

Components use Tailwind CSS classes. Customize by:

1. **className prop:**
```tsx
<Hero className="bg-gradient-to-r from-blue-500 to-purple-600" />
```

2. **Tailwind config:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
      },
    },
  },
}
```

3. **CSS variables:**
```css
:root {
  --color-primary: 59 130 246;
}
```

## Accessibility

All components are built with accessibility in mind:

- **Semantic HTML** - Proper heading hierarchy
- **ARIA labels** - Screen reader support
- **Keyboard navigation** - Tab/Enter support
- **Reduced motion** - Respects `prefers-reduced-motion`
- **Color contrast** - WCAG AA compliant

### Reduced Motion

Backgrounds automatically respect user preferences:

```tsx
<Hero backgroundType="particles" reduceMotion={true}>
  {/* Particles will be static if user prefers reduced motion */}
</Hero>
```

## TypeScript

Full TypeScript support with type inference:

```tsx
import type { HeroProps, FeaturesProps } from '@mdxui/types'

const heroProps: HeroProps = {
  headline: "Welcome",
  description: "Get started",
}
```

## Advanced Usage

### Custom Hook

Use the `useDualAPI` hook in your own components:

```tsx
import { useDualAPI } from '@mdxui/react'
import type { HeroSectionProps } from '@mdxui/types'

function CustomHero({ children, ...props }: HeroProps) {
  const mergedProps = useDualAPI<HeroSectionProps>(
    children,
    props,
    'hero'
  )

  return (
    <section>
      <h1>{mergedProps.headline}</h1>
      <p>{mergedProps.description}</p>
    </section>
  )
}
```

### Utility Functions

```tsx
import { cn } from '@mdxui/react'

// Merge Tailwind classes
<div className={cn('px-4 py-2', isActive && 'bg-blue-500')} />
```

## Examples

### Landing Page

```tsx
import { Hero, Features, Pricing, Testimonials, FAQ, CTA } from '@mdxui/react'

export default function LandingPage() {
  return (
    <>
      <Hero
        headline="Build Amazing Products"
        description="The complete platform for modern development"
        primaryAction={{ text: "Get Started", href: "/signup" }}
        secondaryAction={{ text: "View Demo", href: "/demo" }}
        layout="centered"
        backgroundType="particles"
        backgroundOpacity={0.3}
      />

      <Features
        title="Why Choose Us"
        features={[
          {
            title: "Fast Performance",
            description: "Lightning-fast load times",
            icon: "⚡",
          },
          {
            title: "Secure by Default",
            description: "Bank-level security",
            icon: "🔒",
          },
          {
            title: "Easy to Use",
            description: "Intuitive interface",
            icon: "✨",
          },
        ]}
        layout="grid"
        columns={3}
      />

      <Pricing
        title="Simple Pricing"
        tiers={[
          {
            name: "Starter",
            price: "9",
            currency: "$",
            period: "per month",
            features: ["Up to 10 users", "Basic features", "24/7 support"],
            action: { text: "Get Started", href: "/signup" },
          },
          {
            name: "Pro",
            price: "29",
            currency: "$",
            period: "per month",
            features: ["Up to 100 users", "Advanced features", "Priority support"],
            action: { text: "Get Started", href: "/signup" },
            highlighted: true,
            badge: "Popular",
          },
        ]}
        backgroundType="dots"
      />

      <Testimonials
        title="What Our Customers Say"
        testimonials={[
          {
            quote: "This product has transformed our workflow!",
            author: { name: "John Doe", title: "CEO", company: "Acme Corp" },
            rating: 5,
          },
        ]}
        backgroundType="aurora"
      />

      <FAQ
        title="Frequently Asked Questions"
        items={[
          {
            question: "How does it work?",
            answer: "It works by leveraging modern web technologies...",
          },
        ]}
        backgroundType="grid"
      />

      <CTA
        headline="Ready to get started?"
        description="Join thousands of users today"
        primaryAction={{ text: "Sign Up", href: "/signup" }}
        backgroundStyle="gradient"
        backgroundType="meteors"
      />
    </>
  )
}
```

### MDX Blog Post

```mdx
import { Hero, Features, CTA, FAQ } from '@mdxui/react'

<Hero backgroundType="grid">
# Getting Started with MDX UI

Learn how to build beautiful interfaces with markdown

![Tutorial](/tutorial.png)
</Hero>

<Features>
## What You'll Learn

### Setup
Install and configure MDX UI

### Components
Use pre-built components

### Customize
Make it your own
</Features>

<FAQ backgroundType="warp">
## Common Questions

### How do I get started?
Simply install the package and import the components you need.

### Is it free?
Yes, MDX UI is completely open source and free to use.
</FAQ>

<CTA backgroundType="meteors" backgroundStyle="gradient">
# Start Building Today

Get started with MDX UI and create beautiful interfaces in minutes.
</CTA>
```

## Development

```bash
# Build
pnpm build

# Type check
pnpm typecheck

# Run tests
pnpm test

# Watch mode
pnpm dev
```

## Dependencies

- `@mdxui/types` - TypeScript types
- `@mdxui/semantic-mapping` - MDX parser
- `clsx` - Class name utility
- `framer-motion` - Animation library
- `react` (peer) - React 19+

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Related Packages

- [@mdxui/types](../types) - TypeScript types
- [@mdxui/semantic-mapping](../semantic-mapping) - MDX parser
