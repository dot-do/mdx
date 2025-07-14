'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { name: 'System', value: 'system', icon: Monitor },
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
  ]

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {themes.map((t) => {
        const Icon = t.icon
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            title={t.name}
            className={`
              flex items-center justify-center w-8 h-8 rounded-md transition-colors
              ${theme === t.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }
            `}
          >
            <Icon size={16} />
          </button>
        )
      })}
    </div>
  )
} 