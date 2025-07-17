'use client'

import { Attribute, ThemeProvider as NextThemeProvider } from 'next-themes'
import * as React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: Attribute | Attribute[]
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider attribute='class' defaultTheme='system' enableSystem={true} disableTransitionOnChange={true} {...props}>
      {children}
    </NextThemeProvider>
  )
}
