/**
 * Theme configuration types for mdxui components
 *
 * Supports Tailwind CSS v4 theming with CSS variables
 */

/**
 * Color palette configuration
 */
export interface ColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

/**
 * Theme colors
 */
export interface ThemeColors {
  primary?: Partial<ColorPalette>
  secondary?: Partial<ColorPalette>
  accent?: Partial<ColorPalette>
  neutral?: Partial<ColorPalette>
  success?: Partial<ColorPalette>
  warning?: Partial<ColorPalette>
  error?: Partial<ColorPalette>
  info?: Partial<ColorPalette>
}

/**
 * Typography configuration
 */
export interface Typography {
  fontFamily?: {
    sans?: string
    serif?: string
    mono?: string
  }
  fontSize?: {
    xs?: string
    sm?: string
    base?: string
    lg?: string
    xl?: string
    '2xl'?: string
    '3xl'?: string
    '4xl'?: string
    '5xl'?: string
  }
  fontWeight?: {
    normal?: number
    medium?: number
    semibold?: number
    bold?: number
  }
}

/**
 * Spacing configuration
 */
export interface Spacing {
  xs?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  '2xl'?: string
  '3xl'?: string
}

/**
 * Border radius configuration
 */
export interface BorderRadius {
  none?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  full?: string
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  /** Color scheme mode */
  mode?: 'light' | 'dark' | 'auto'
  /** Color palette */
  colors?: ThemeColors
  /** Typography settings */
  typography?: Typography
  /** Spacing scale */
  spacing?: Spacing
  /** Border radius scale */
  borderRadius?: BorderRadius
  /** Custom CSS variables */
  cssVariables?: Record<string, string>
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /** Current theme config */
  theme: ThemeConfig
  /** Update theme config */
  setTheme: (theme: Partial<ThemeConfig>) => void
  /** Current mode */
  mode: 'light' | 'dark'
  /** Toggle between light/dark */
  toggleMode: () => void
}
