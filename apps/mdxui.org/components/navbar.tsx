'use client'

import { usePathname } from 'next/navigation'
import { MdxuiLogo } from './mdxui-logo'
import { ThemeToggle } from './theme-toggle'
import { ComponentSelector } from './component-selector'

export function Navbar() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-100 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
        <a href="/">
          <MdxuiLogo />
        </a>
          <div className="flex items-center space-x-8">
            
            <nav className="hidden md:flex items-center justify-between space-x-6">
              <a 
                href="/" 
                className={`font-text text-sm transition-colors ${
                  pathname === '/' 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Components
              </a>
              <a 
                href="#" 
                className={`font-text text-sm transition-colors ${
                  pathname === '/templates' 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Templates
              </a>
              <a 
                href="/ui-architecture" 
                className={`font-text text-sm transition-colors ${
                  pathname === '/ui-architecture' 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Architecture
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ComponentSelector />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
} 