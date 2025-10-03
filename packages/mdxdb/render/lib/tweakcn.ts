import { parse as parseYaml } from 'yaml'

/**
 * tweakcn-inspired theme configuration
 * Supports YAML-based styling for MDX content
 */

export interface TweakcnColors {
  primary?: string
  secondary?: string
  accent?: string
  background?: string
  foreground?: string
  muted?: string
  mutedForeground?: string
  border?: string
  input?: string
  ring?: string
  destructive?: string
  destructiveForeground?: string
  success?: string
  warning?: string
  info?: string
  [key: string]: string | undefined
}

export interface TweakcnFonts {
  body?: string
  heading?: string
  mono?: string
  [key: string]: string | undefined
}

export interface TweakcnSpacing {
  xs?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  '2xl'?: string
  [key: string]: string | undefined
}

export interface TweakcnComponent {
  className?: string
  style?: Record<string, string>
  variant?: string
  variants?: Record<string, string>
  [key: string]: any
}

export interface TweakcnTheme {
  colors?: TweakcnColors
  fonts?: TweakcnFonts
  spacing?: TweakcnSpacing
  borderRadius?: string
  components?: Record<string, TweakcnComponent>
  customCSS?: string
}

export interface TweakcnConfig {
  theme?: TweakcnTheme
  extends?: string // Reference to another config
  [key: string]: any
}

/**
 * Parse tweakcn YAML configuration
 */
export function parseTweakcnConfig(yaml: string): TweakcnConfig {
  try {
    const config = parseYaml(yaml) as TweakcnConfig
    return config
  } catch (error) {
    throw new Error(`Failed to parse tweakcn YAML: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Merge multiple tweakcn configs (supports extends)
 */
export function mergeTweakcnConfigs(base: TweakcnConfig, override: TweakcnConfig): TweakcnConfig {
  return {
    ...base,
    ...override,
    theme: {
      ...base.theme,
      ...override.theme,
      colors: {
        ...base.theme?.colors,
        ...override.theme?.colors,
      },
      fonts: {
        ...base.theme?.fonts,
        ...override.theme?.fonts,
      },
      spacing: {
        ...base.theme?.spacing,
        ...override.theme?.spacing,
      },
      components: {
        ...base.theme?.components,
        ...override.theme?.components,
      },
    },
  }
}

/**
 * Convert tweakcn colors to Tailwind CSS variables
 */
export function generateTailwindCSSVariables(config: TweakcnConfig): string {
  const { theme } = config
  if (!theme?.colors) return ''

  const cssVars: string[] = [':root {']

  Object.entries(theme.colors).forEach(([key, value]) => {
    if (value) {
      cssVars.push(`  --${key}: ${value};`)
    }
  })

  cssVars.push('}')
  return cssVars.join('\n')
}

/**
 * Generate Tailwind config from tweakcn config
 */
export function generateTailwindConfig(config: TweakcnConfig): Record<string, any> {
  const { theme } = config
  if (!theme) return {}

  const tailwindConfig: Record<string, any> = {
    theme: {
      extend: {},
    },
  }

  // Colors
  if (theme.colors) {
    tailwindConfig.theme.extend.colors = theme.colors
  }

  // Fonts
  if (theme.fonts) {
    const fontFamilies: Record<string, string[]> = {}
    Object.entries(theme.fonts).forEach(([key, value]) => {
      if (value) {
        fontFamilies[key] = [value, 'sans-serif']
      }
    })
    tailwindConfig.theme.extend.fontFamily = fontFamilies
  }

  // Spacing
  if (theme.spacing) {
    tailwindConfig.theme.extend.spacing = theme.spacing
  }

  // Border radius
  if (theme.borderRadius) {
    tailwindConfig.theme.extend.borderRadius = {
      DEFAULT: theme.borderRadius,
    }
  }

  return tailwindConfig
}

/**
 * Get component styles from tweakcn config
 */
export function getComponentStyles(config: TweakcnConfig, componentName: string, variant?: string): string {
  const component = config.theme?.components?.[componentName]
  if (!component) return ''

  let className = component.className || ''

  // Apply variant if specified
  if (variant && component.variants?.[variant]) {
    className += ` ${component.variants[variant]}`
  }

  return className.trim()
}

/**
 * Apply component inline styles
 */
export function getComponentInlineStyles(config: TweakcnConfig, componentName: string): Record<string, string> {
  const component = config.theme?.components?.[componentName]
  return component?.style || {}
}

/**
 * Default tweakcn configurations
 */
export const DEFAULT_CONFIGS = {
  minimal: {
    theme: {
      colors: {
        primary: '#000000',
        secondary: '#666666',
        background: '#ffffff',
        foreground: '#000000',
        muted: '#f5f5f5',
        border: '#e5e5e5',
      },
      fonts: {
        body: 'system-ui',
        heading: 'system-ui',
        mono: 'monospace',
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      borderRadius: '0.25rem',
      components: {
        heading: {
          className: 'font-bold tracking-tight',
        },
        link: {
          className: 'text-primary underline hover:opacity-80',
        },
        button: {
          className: 'px-4 py-2 rounded bg-primary text-background',
        },
      },
    },
  } as TweakcnConfig,

  modern: {
    theme: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        background: '#ffffff',
        foreground: '#0f172a',
        muted: '#f8fafc',
        mutedForeground: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        destructive: '#ef4444',
      },
      fonts: {
        body: 'Inter',
        heading: 'Poppins',
        mono: 'Fira Code',
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      borderRadius: '0.5rem',
      components: {
        heading: {
          className: 'font-bold text-foreground',
          variants: {
            h1: 'text-4xl md:text-5xl',
            h2: 'text-3xl md:text-4xl',
            h3: 'text-2xl md:text-3xl',
            h4: 'text-xl md:text-2xl',
            h5: 'text-lg md:text-xl',
            h6: 'text-base md:text-lg',
          },
        },
        link: {
          className: 'text-primary hover:underline transition-opacity',
        },
        button: {
          className: 'px-4 py-2 rounded-lg font-medium transition-colors',
          variants: {
            default: 'bg-primary text-white hover:opacity-90',
            secondary: 'bg-secondary text-white hover:opacity-90',
            outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
          },
        },
        card: {
          className: 'p-6 rounded-lg border border-border bg-background shadow-sm',
        },
        code: {
          className: 'px-1.5 py-0.5 rounded bg-muted text-sm font-mono',
        },
        pre: {
          className: 'p-4 rounded-lg bg-muted overflow-x-auto',
        },
      },
    },
  } as TweakcnConfig,

  docs: {
    theme: {
      colors: {
        primary: '#2563eb',
        secondary: '#7c3aed',
        background: '#ffffff',
        foreground: '#1e293b',
        muted: '#f1f5f9',
        mutedForeground: '#64748b',
        border: '#cbd5e1',
        success: '#059669',
        warning: '#d97706',
        info: '#0284c7',
      },
      fonts: {
        body: 'Inter',
        heading: 'Inter',
        mono: 'JetBrains Mono',
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      borderRadius: '0.375rem',
      components: {
        heading: {
          className: 'font-semibold text-foreground border-b border-border pb-2 mb-4',
        },
        link: {
          className: 'text-primary hover:underline',
        },
        code: {
          className: 'px-1 py-0.5 rounded bg-muted text-sm font-mono text-primary',
        },
        pre: {
          className: 'p-4 rounded-lg bg-slate-900 text-slate-50 overflow-x-auto my-4',
        },
        blockquote: {
          className: 'border-l-4 border-primary pl-4 italic text-mutedForeground my-4',
        },
        table: {
          className: 'w-full border-collapse',
        },
        th: {
          className: 'border border-border bg-muted px-4 py-2 text-left font-semibold',
        },
        td: {
          className: 'border border-border px-4 py-2',
        },
      },
    },
  } as TweakcnConfig,

  blog: {
    theme: {
      colors: {
        primary: '#0ea5e9',
        secondary: '#a855f7',
        accent: '#f43f5e',
        background: '#ffffff',
        foreground: '#1f2937',
        muted: '#f9fafb',
        mutedForeground: '#6b7280',
        border: '#d1d5db',
      },
      fonts: {
        body: 'Georgia',
        heading: 'Inter',
        mono: 'Courier New',
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      borderRadius: '0.5rem',
      components: {
        heading: {
          className: 'font-bold text-foreground mb-4',
          variants: {
            h1: 'text-5xl leading-tight',
            h2: 'text-4xl leading-tight',
            h3: 'text-3xl leading-snug',
            h4: 'text-2xl leading-snug',
          },
        },
        paragraph: {
          className: 'text-lg leading-relaxed text-foreground mb-4',
        },
        link: {
          className: 'text-primary underline-offset-4 hover:underline',
        },
        image: {
          className: 'rounded-lg shadow-md w-full',
        },
        blockquote: {
          className: 'border-l-4 border-accent pl-6 italic text-xl text-mutedForeground my-6',
        },
        code: {
          className: 'px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-accent',
        },
      },
    },
  } as TweakcnConfig,
}

/**
 * Load a preset config by name
 */
export function loadPresetConfig(preset: 'minimal' | 'modern' | 'docs' | 'blog'): TweakcnConfig {
  return DEFAULT_CONFIGS[preset]
}
