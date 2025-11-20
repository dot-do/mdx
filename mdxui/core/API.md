# @mdxui/core - Component API Reference

Complete API documentation for all components, types, and utilities in `@mdxui/core`.

## Table of Contents

- [Basic Components](#basic-components)
- [Tremor Charts](#tremor-charts)
- [MagicUI Animated Components](#magicui-animated-components)
- [Landing Page Types](#landing-page-types)
- [Workflow Types](#workflow-types)

---

## Basic Components

### Button

Flexible button component with variant support.

**Props:**
```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text'
}
```

**Variants:**
- `primary` (default) - Blue background, white text
- `secondary` - Gray background, dark text
- `text` - Transparent background, blue text with underline on hover

**Usage:**
```tsx
import { Button } from '@mdxui/core'

<Button>Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="text">Text button</Button>
<Button onClick={() => console.log('clicked')}>With handler</Button>
```

**Styling:**
```css
/* Base styles */
rounded px-4 py-2 text-sm font-medium

/* Primary variant */
bg-blue-600 text-white hover:bg-blue-700

/* Secondary variant */
bg-gray-100 text-gray-900 hover:bg-gray-200

/* Text variant */
bg-transparent text-blue-600 hover:underline
```

---

### Card

Link card component for navigation.

**Props:**
```typescript
interface CardProps {
  title: string
  children: ReactNode
  href: string
}
```

**Usage:**
```tsx
import { Card } from '@mdxui/core'

<Card title="Documentation" href="/docs">
  Comprehensive guides and API references
</Card>
```

**Features:**
- Hover effects with border and background transition
- Arrow indicator that animates on hover
- External link support (opens in new tab)
- Responsive design

---

### Gradient

Decorative gradient component for backgrounds and effects.

**Props:**
```typescript
interface GradientProps {
  small?: boolean
  conic?: boolean
  className?: string
}
```

**Options:**
- `small` - Reduces blur from 75px to 32px
- `conic` - Applies conic gradient (red → purple → blue)
- `className` - Additional Tailwind classes

**Usage:**
```tsx
import { Gradient } from '@mdxui/core'

{/* Large gradient with conic colors */}
<Gradient conic />

{/* Small gradient without conic */}
<Gradient small />

{/* Custom positioning */}
<Gradient conic className="top-0 left-0 w-64 h-64" />
```

**Styling:**
```css
/* Base styles */
absolute mix-blend-normal will-change-[filter] rounded-[100%]

/* Small variant */
blur-[32px]

/* Default variant */
blur-[75px]

/* Conic gradient */
bg-[conic-gradient(from_180deg_at_50%_50%,
  var(--red-1000)_0deg,
  var(--purple-1000)_180deg,
  var(--blue-1000)_360deg)]
```

---

## Tremor Charts

Complete re-export of [@tremor/react](https://tremor.so/) components.

**Import:**
```typescript
import { Tremor } from '@mdxui/core'
```

**Available Components:**
- **Charts**: AreaChart, BarChart, DonutChart, LineChart, etc.
- **KPI Cards**: Card, Metric, Text, Title
- **Data Display**: Table, Badge, Callout
- **Layout**: Grid, Flex, List
- **And more...**

**Usage:**
```tsx
import { Tremor } from '@mdxui/core'

<Tremor.Card>
  <Tremor.Title>Sales</Tremor.Title>
  <Tremor.Metric>$12,699</Tremor.Metric>
  <Tremor.BarChart
    data={chartdata}
    index="name"
    categories={["sales"]}
  />
</Tremor.Card>
```

**Documentation:**
Full Tremor documentation: https://tremor.so/docs

---

## MagicUI Animated Components

18 animation components from MagicUI for text effects and visual enhancements.

**Location:** `@mdxui/core/components/ui/magicui/`

### Text Animation Components

**1. Animated Gradient Text**
```tsx
<AnimatedGradientText>Gradient animated text</AnimatedGradientText>
```

**2. Animated Shiny Text**
```tsx
<AnimatedShinyText>Shiny text effect</AnimatedShinyText>
```

**3. Aurora Text**
```tsx
<AuroraText>Text with aurora effect</AuroraText>
```

**4. Box Reveal**
```tsx
<BoxReveal>Text revealed from box</BoxReveal>
```

**5. Flip Text**
```tsx
<FlipText>Text with flip animation</FlipText>
```

**6. Hyper Text**
```tsx
<HyperText>Hyperactive text effect</HyperText>
```

**7. Line Shadow Text**
```tsx
<LineShadowText>Text with line shadow</LineShadowText>
```

**8. Morphing Text**
```tsx
<MorphingText>Text that morphs</MorphingText>
```

**9. Number Ticker**
```tsx
<NumberTicker value={12345} />
```

**10. Sparkles Text**
```tsx
<SparklesText>Sparkly text effect</SparklesText>
```

**11. Spinning Text**
```tsx
<SpinningText>Spinning text animation</SpinningText>
```

**12. Text Animate**
```tsx
<TextAnimate>Animated text entry</TextAnimate>
```

**13. Text Reveal**
```tsx
<TextReveal>Text reveal animation</TextReveal>
```

**14. Typing Animation**
```tsx
<TypingAnimation>Typewriter effect</TypingAnimation>
```

**15. Scroll Based Velocity**
```tsx
<ScrollBasedVelocity>Scroll-triggered animation</ScrollBasedVelocity>
```

### Visual Effects

**16. Confetti**
```tsx
<Confetti />
```

**17. Globe**
```tsx
<Globe />
```

**Note:** These components are included from MagicUI. For detailed props and options, see the component source files in `components/ui/magicui/`.

---

## Landing Page Types

Type interfaces for common landing page sections. Framework-agnostic definitions that can be used with Shadcn (web) or Ink (CLI).

**Location:** `@mdxui/core/LandingPage.ts`

### Base Section

Common properties shared across all sections:

```typescript
interface Section {
  badge?: string                  // Eyebrow text above headline
  headline?: string               // Main title
  description?: string            // Supporting text
  primaryActionText?: string      // Primary CTA text
  primaryActionLink?: string      // Primary CTA URL
  secondaryActionText?: string    // Secondary CTA text
  secondaryActionLink?: string    // Secondary CTA URL
}
```

### Hero Section

Top section of landing page with attention-grabbing headline:

```typescript
interface HeroSection extends Section {
  headline: string                // Required: Value proposition
  description: string             // Required: Elaboration
  primaryActionText: string       // Required: Main CTA
  primaryActionLink: string       // Required: CTA URL
  secondaryActionText?: string    // Optional: Secondary action
  secondaryActionLink?: string    // Optional: Secondary URL
  mediaUrl?: string               // Optional: Image/video
  mediaAlt?: string               // Alt text for media
  mediaType?: 'image' | 'video'   // Media type
}
```

**Usage:**
```typescript
const hero: HeroSection = {
  badge: "New Release",
  headline: "Build faster with MDX",
  description: "Combine Markdown, JSX, and AI",
  primaryActionText: "Get Started",
  primaryActionLink: "/docs",
  secondaryActionText: "View Examples",
  secondaryActionLink: "/examples",
  mediaUrl: "/hero-image.png",
  mediaAlt: "MDX Editor Screenshot",
  mediaType: "image"
}
```

### Problem Section

Highlights pain points that the product solves:

```typescript
interface ProblemSection extends Section {
  headline?: string               // Problem statement
  description?: string            // Pain point elaboration
  points?: string[]               // Specific pain points
  imageUrl?: string               // Illustration
  imageAlt?: string               // Image alt text
}
```

### Features Section

Showcase product features and benefits:

```typescript
interface FeatureItem {
  title: string                   // Feature name
  description?: string            // Feature benefit
  iconUrl?: string                // Feature icon
  iconAlt?: string                // Icon alt text
}

interface FeaturesSection extends Section {
  features: FeatureItem[]         // List of features
  layout?: 'grid' | 'list'        // Display layout
}
```

### Testimonials Section

Social proof from customers:

```typescript
interface TestimonialItem {
  quote: string                   // Customer quote
  author: string                  // Customer name
  role?: string                   // Customer role
  company?: string                // Customer company
  avatarUrl?: string              // Customer photo
  avatarAlt?: string              // Photo alt text
}

interface TestimonialsSection extends Section {
  testimonials: TestimonialItem[] // List of testimonials
  layout?: 'grid' | 'carousel'    // Display layout
}
```

### Pricing Section

Pricing tiers and plans:

```typescript
interface PricingTier {
  name: string                    // Plan name
  price: string | number          // Price amount
  interval?: string               // Billing interval
  description?: string            // Plan description
  features: string[]              // Included features
  ctaText?: string                // CTA button text
  ctaLink?: string                // CTA button URL
  highlighted?: boolean           // Emphasis flag
}

interface PricingSection extends Section {
  tiers: PricingTier[]            // Pricing plans
  billingToggle?: boolean         // Monthly/yearly toggle
}
```

### FAQ Section

Frequently asked questions:

```typescript
interface FAQItem {
  question: string                // Question text
  answer: string                  // Answer text
}

interface FAQSection extends Section {
  faqs: FAQItem[]                 // List of FAQs
  layout?: 'accordion' | 'grid'   // Display layout
}
```

### CTA Section

Final call-to-action:

```typescript
interface CTASection extends Section {
  headline: string                // Required: Action headline
  primaryActionText: string       // Required: CTA text
  primaryActionLink: string       // Required: CTA URL
  backgroundType?: string         // Background style
}
```

---

## Workflow Types

TypeScript interfaces for workflow orchestration with Zod validation.

**Location:** `@mdxui/core/workflow.ts`

### Step

Single step in a workflow:

```typescript
interface Step<TInput = any, TOutput = any> {
  id: string                              // Unique step identifier
  name: string                            // Human-readable name
  description?: string                    // Step description
  inputSchema?: z.ZodSchema<TInput>       // Input validation schema
  outputSchema: z.ZodSchema<TOutput>      // Output validation schema
  execute?: (input?: TInput) => Promise<TOutput> | TOutput
}
```

**Usage:**
```typescript
import { z } from 'zod'
import type { Step } from '@mdxui/core'

const processDataStep: Step<string, number> = {
  id: 'process-data',
  name: 'Process Data',
  description: 'Transform string input to number',
  inputSchema: z.string(),
  outputSchema: z.number(),
  execute: async (input) => {
    return parseInt(input, 10)
  }
}
```

### Workflow

Complete workflow with multiple steps:

```typescript
interface Workflow<TInput = any, TOutput = any> {
  id: string                              // Workflow identifier
  name: string                            // Workflow name
  description?: string                    // Workflow description
  inputSchema: z.ZodSchema<TInput>        // Input validation
  outputSchema: z.ZodSchema<TOutput>      // Output validation
  steps: Step[]                           // Ordered steps
}
```

**Usage:**
```typescript
import type { Workflow } from '@mdxui/core'

const dataProcessingWorkflow: Workflow<string, object> = {
  id: 'data-processing',
  name: 'Data Processing Pipeline',
  description: 'Transform and validate data',
  inputSchema: z.string(),
  outputSchema: z.object({
    value: z.number(),
    processed: z.boolean()
  }),
  steps: [
    parseStep,
    validateStep,
    transformStep
  ]
}
```

### Workflow Execution

Execution state tracker:

```typescript
interface WorkflowExecution<TInput = any, TOutput = any> {
  workflow: Workflow<TInput, TOutput>     // Workflow being executed
  currentStepIndex: number                // Current step (0-indexed)
  stepResults: Record<string, any>        // Results from each step
  status: 'pending' | 'running' | 'completed' | 'failed'
  error?: Error                           // Error if failed
}
```

**Usage:**
```typescript
import type { WorkflowExecution } from '@mdxui/core'

const execution: WorkflowExecution = {
  workflow: myWorkflow,
  currentStepIndex: 0,
  stepResults: {},
  status: 'pending'
}

// Track progress
execution.currentStepIndex = 1
execution.stepResults['step-1'] = result
execution.status = 'running'
```

---

## Import Patterns

### Named Imports

```typescript
import { Button, Card, Gradient } from '@mdxui/core'
import { Tremor } from '@mdxui/core'
import type { Step, Workflow, WorkflowExecution } from '@mdxui/core'
import type { HeroSection, FeaturesSection } from '@mdxui/core'
```

### Default Import

```typescript
import Core from '@mdxui/core'

<Core.Button>Click me</Core.Button>
<Core.Card>Content</Core.Card>
<Core.Tremor.BarChart />
```

### Namespace Import

```typescript
import * as Core from '@mdxui/core'
```

---

## TypeScript Support

All components and types are fully typed:

```typescript
// Component props are inferred
const button: JSX.Element = <Button variant="primary" />

// Workflow types are generic
const typedStep: Step<string, number> = {
  id: 'convert',
  name: 'Convert to Number',
  inputSchema: z.string(),
  outputSchema: z.number(),
  execute: (input) => parseInt(input)  // Typed as (input: string) => number
}

// Landing page sections are strongly typed
const hero: HeroSection = {
  headline: "Welcome",  // Required
  description: "...",   // Required
  primaryActionText: "Start",  // Required
  primaryActionLink: "/start"  // Required
}
```

---

## Styling

### Tailwind CSS

All components use Tailwind CSS for styling. Import the stylesheet:

```typescript
import '@mdxui/core/styles.css'
```

### Custom Styles

Override styles with className:

```tsx
<Button className="bg-red-600 hover:bg-red-700">
  Custom styled button
</Button>

<Card className="border-2 border-blue-500" title="..." href="...">
  Custom border
</Card>
```

### Design Tokens

Components use CSS custom properties for theming:

```css
--red-1000
--purple-1000
--blue-1000
```

---

## Best Practices

1. **Use TypeScript** - Leverage full type safety for workflows and sections
2. **Validate schemas** - Always provide Zod schemas for workflow steps
3. **Composition** - Combine basic components to build complex UIs
4. **Accessibility** - All components follow accessibility best practices
5. **Performance** - MagicUI components use `will-change` for optimal animations

---

## Related Packages

- [@mdxui/shadcn](../shadcn) - Styled web components
- [@mdxui/magicui](../magicui) - Additional animation components
- [@mdxui/tailwind](../tailwind) - Tailwind configuration
- [mdxui](../) - Meta package with all components

---

**Last Updated:** 2025-10-04
**Version:** 0.0.0
**License:** MIT
