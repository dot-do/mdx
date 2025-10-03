import type { TweakcnConfig } from './tweakcn.js'
import { generateTailwindConfig } from './tweakcn.js'

/**
 * Tailwind CSS integration for tweakcn
 */

/**
 * Generate a complete Tailwind config with tweakcn integration
 */
export function generateFullTailwindConfig(config: TweakcnConfig): any {
  const baseConfig = generateTailwindConfig(config)

  return {
    ...baseConfig,
    content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './content/**/*.{md,mdx}'],
    plugins: [
      // Typography plugin config
      require('@tailwindcss/typography'),
    ],
  }
}

/**
 * Generate Tailwind CSS classes for a component
 */
export function getTailwindClasses(config: TweakcnConfig, componentName: string, variant?: string): string[] {
  const component = config.theme?.components?.[componentName]
  if (!component) return []

  const classes: string[] = []

  // Add base className
  if (component.className) {
    classes.push(...component.className.split(' '))
  }

  // Add variant className
  if (variant && component.variants?.[variant]) {
    classes.push(...component.variants[variant].split(' '))
  }

  return classes.filter(Boolean)
}

/**
 * Generate Tailwind prose configuration
 */
export function generateProseConfig(config: TweakcnConfig): any {
  const { theme } = config
  if (!theme) return {}

  return {
    css: {
      '--tw-prose-body': theme.colors?.foreground || '#000000',
      '--tw-prose-headings': theme.colors?.foreground || '#000000',
      '--tw-prose-links': theme.colors?.primary || '#3b82f6',
      '--tw-prose-bold': theme.colors?.foreground || '#000000',
      '--tw-prose-code': theme.colors?.primary || '#3b82f6',
      '--tw-prose-pre-bg': theme.colors?.muted || '#f5f5f5',
      '--tw-prose-quotes': theme.colors?.mutedForeground || '#666666',
      '--tw-prose-borders': theme.colors?.border || '#e5e5e5',
      maxWidth: 'none',
    },
  }
}

/**
 * Generate PostCSS config for tweakcn
 */
export function generatePostCSSConfig(): any {
  return {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
}

/**
 * Generate base CSS with Tailwind directives
 */
export function generateBaseCss(config: TweakcnConfig): string {
  const { theme } = config

  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${Object.entries(theme?.colors || {})
  .map(([key, value]) => `    --color-${key}: ${value};`)
  .join('\n')}
  }

  body {
    font-family: ${theme?.fonts?.body || 'system-ui'}, -apple-system, sans-serif;
    color: ${theme?.colors?.foreground || '#000000'};
    background-color: ${theme?.colors?.background || '#ffffff'};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme?.fonts?.heading || 'system-ui'}, -apple-system, sans-serif;
  }

  code, pre {
    font-family: ${theme?.fonts?.mono || 'monospace'};
  }
}

@layer components {
${generateComponentStyles(config)}
}
`
}

/**
 * Generate component-specific CSS classes
 */
function generateComponentStyles(config: TweakcnConfig): string {
  const { theme } = config
  if (!theme?.components) return ''

  const styles: string[] = []

  Object.entries(theme.components).forEach(([name, component]) => {
    if (component.className) {
      styles.push(`  .tweakcn-${name} {`)
      // Parse className to CSS properties (simplified)
      styles.push(`    @apply ${component.className};`)
      styles.push(`  }`)
    }

    // Add variant classes
    if (component.variants) {
      Object.entries(component.variants).forEach(([variantName, variantClass]) => {
        styles.push(`  .tweakcn-${name}-${variantName} {`)
        styles.push(`    @apply ${variantClass};`)
        styles.push(`  }`)
      })
    }
  })

  return styles.join('\n')
}

/**
 * Create a Tailwind plugin from tweakcn config
 */
export function createTailwindPlugin(config: TweakcnConfig): any {
  return function ({ addBase, addComponents, theme }: any) {
    // Add base styles
    if (config.theme?.colors) {
      addBase({
        ':root': Object.entries(config.theme.colors).reduce((acc, [key, value]) => {
          acc[`--color-${key}`] = value
          return acc
        }, {} as Record<string, string>),
      })
    }

    // Add component classes
    if (config.theme?.components) {
      const components: Record<string, any> = {}

      Object.entries(config.theme.components).forEach(([name, component]) => {
        if (component.className) {
          components[`.tweakcn-${name}`] = {
            // Convert Tailwind classes to CSS (simplified)
          }
        }
      })

      addComponents(components)
    }
  }
}

/**
 * Export Tailwind config file content
 */
export function exportTailwindConfigFile(config: TweakcnConfig): string {
  const tailwindConfig = generateFullTailwindConfig(config)

  return `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(tailwindConfig, null, 2)}`
}

/**
 * Export PostCSS config file content
 */
export function exportPostCSSConfigFile(): string {
  const postcssConfig = generatePostCSSConfig()

  return `module.exports = ${JSON.stringify(postcssConfig, null, 2)}`
}
