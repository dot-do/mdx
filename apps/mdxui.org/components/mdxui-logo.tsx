'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function MdxuiLogo() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return dark logo as default during SSR (for light mode)
    return (
      <Image
        src="/mdxuiLogo_Dark.svg"
        alt="MDXUI Logo"
        width={120}
        height={32}
        className="h-6 w-auto"
      />
    )
  }

  // Use resolvedTheme for system theme, fallback to theme
  const currentTheme = resolvedTheme || theme
  const logoSrc = currentTheme === 'dark' ? '/mdxuiLogo_Light.svg' : '/mdxuiLogo_Dark.svg'

  return (
    <Image
      src={logoSrc}
      alt="MDXUI Logo"
      width={120}
      height={32}
      className="h-6 w-auto"
    />
  )
} 