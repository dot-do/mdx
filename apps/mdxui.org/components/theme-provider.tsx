'use client'

import * as React from 'react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute={'class' as any}
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={true}
      {...props}
    >
      {children}
    </NextThemeProvider>
  )
} 