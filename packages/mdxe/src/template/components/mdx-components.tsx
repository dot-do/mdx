// @ts-nocheck
import React from 'react'
import type { MDXComponents } from 'mdx/types'

// Import MDXUI components directly from the built packages
import { Button as OriginalButton, Card as OriginalCard, Core, Shadcn, Magicui, Browser } from 'mdxui'
import { Slides, Slide } from '@mdxui/reveal'

// Wrapper components to add not-prose class
export const Button = ({ className, ...props }: any) => <OriginalButton className={`not-prose ${className || ''}`} {...props} />

export const Card = ({ className, ...props }: any) => <OriginalCard className={`not-prose ${className || ''}`} {...props} />

// Custom compones for enhanced MDX experience
export const Alert = ({ type = 'info', children }: { type?: 'info' | 'warning' | 'error' | 'success'; children: React.ReactNode }) => {
  const typeStyles = {
    info: 'bg-blue-50 border-l-4 border-blue-500 text-blue-900 shadow-sm',
    warning: 'bg-amber-50 border-l-4 border-amber-500 text-amber-900 shadow-sm',
    error: 'bg-red-50 border-l-4 border-red-500 text-red-900 shadow-sm',
    success: 'bg-green-50 border-l-4 border-green-500 text-green-900 shadow-sm',
  }

  const iconStyles = {
    info: '🛈',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  }

  return (
    <div className={`not-prose rounded-r-lg p-4 mb-4 ${typeStyles[type]}`}>
      <div className='flex items-start'>
        <span className='text-lg mr-3 flex-shrink-0'>{iconStyles[type]}</span>
        <div className='flex-1'>{children}</div>
      </div>
    </div>
  )
}

export const YouTube = ({ id, title = 'YouTube Video' }: { id: string; title?: string }) => {
  return (
    <div className='not-prose my-6'>
      <div className='aspect-w-16 aspect-h-9'>
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          className='w-full h-96 rounded-lg'
        />
      </div>
    </div>
  )
}

export const Callout = ({ emoji, children }: { emoji?: string; children: React.ReactNode }) => {
  return (
    <div className='not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4'>
      <div className='flex items-start'>
        {emoji && <span className='text-2xl mr-3'>{emoji}</span>}
        <div className='flex-1'>{children}</div>
      </div>
    </div>
  )
}

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }) => {
  const variantClasses = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    destructive: 'bg-red-600 text-white',
    outline: 'border border-gray-300 bg-transparent text-gray-700',
  }

  return <span className={`not-prose inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>{children}</span>
}

// Enhanced components with mdxui and custom components
export const enhancedComponents: MDXComponents = {
  // Custom mdxe components
  Alert,
  Badge,
  YouTube,
  Callout,
  // MDXUI components (with not-prose wrappers)
  Button,
  Card,
  Slides,
  Slide,
  // Export namespaces for advanced usage
  Core,
  Shadcn,
  Magicui,
  Browser,
}

// Export the useMDXComponents function following Next.js pattern
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...enhancedComponents,
    ...components,
  }
}
