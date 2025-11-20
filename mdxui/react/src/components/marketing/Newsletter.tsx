import { useState } from 'react'
import type { ReactNode } from 'react'
import type { BackgroundProps } from '@mdxui/types'
import { useDualAPI } from '../../hooks/useDualAPI.js'
import { BackgroundContainer } from '../backgrounds/BackgroundContainer.js'
import { cn } from '../../utils/cn.js'

export interface NewsletterProps extends BackgroundProps {
  children?: ReactNode
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  layout?: 'inline' | 'stacked' | 'card'
  showPrivacyNote?: boolean
  privacyNote?: string
  onSubmit?: (email: string) => Promise<void>
  className?: string
}

/**
 * Newsletter signup component with dual API support
 *
 * Email capture form for newsletter subscriptions.
 *
 * @example
 * // Explicit props
 * <Newsletter
 *   title="Stay Updated"
 *   description="Get the latest news delivered to your inbox"
 *   placeholder="Enter your email"
 *   buttonText="Subscribe"
 *   layout="inline"
 *   onSubmit={async (email) => {
 *     await fetch('/api/newsletter', {
 *       method: 'POST',
 *       body: JSON.stringify({ email })
 *     })
 *   }}
 * />
 *
 * @example
 * // MDX children
 * <Newsletter backgroundType="gradient">
 *   ## Stay Updated
 *   Get the latest news delivered to your inbox
 * </Newsletter>
 */
export function Newsletter({
  children,
  title,
  description,
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  layout = 'inline',
  showPrivacyNote = true,
  privacyNote = 'We respect your privacy. Unsubscribe at any time.',
  onSubmit,
  className,
  backgroundType,
  backgroundConfig,
  backgroundOpacity,
  reduceMotion,
  ...rest
}: NewsletterProps) {
  const props = useDualAPI(
    children,
    {
      title,
      description,
      placeholder,
      buttonText,
      layout,
      showPrivacyNote,
      privacyNote,
      onSubmit,
    },
    'newsletter'
  )

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setMessage('Please enter your email')
      return
    }

    setStatus('loading')

    try {
      if (props.onSubmit) {
        await props.onSubmit(email)
      }
      setStatus('success')
      setMessage('Thanks for subscribing!')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const layoutClasses = {
    inline: 'flex flex-col sm:flex-row gap-3 max-w-lg mx-auto',
    stacked: 'flex flex-col gap-3 max-w-md mx-auto',
    card: 'flex flex-col gap-4 max-w-md mx-auto p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900',
  }

  return (
    <BackgroundContainer
      backgroundType={backgroundType}
      backgroundConfig={backgroundConfig}
      backgroundOpacity={backgroundOpacity}
      reduceMotion={reduceMotion}
      className={cn('py-20 px-4', className)}
      {...rest}
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        {(props.title || props.description) && (
          <div className="text-center mb-8">
            {props.title && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {props.title}
              </h2>
            )}
            {props.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {props.description}
              </p>
            )}
          </div>
        )}

        {/* Newsletter form */}
        <form onSubmit={handleSubmit} className={layoutClasses[props.layout!]}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={props.placeholder}
            disabled={status === 'loading'}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-500 dark:placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={cn(
              'px-6 py-3 rounded-lg font-medium transition-colors',
              'bg-blue-600 text-white hover:bg-blue-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              props.layout === 'inline' ? 'sm:w-auto' : 'w-full'
            )}
          >
            {status === 'loading' ? 'Subscribing...' : props.buttonText}
          </button>
        </form>

        {/* Status message */}
        {status !== 'idle' && message && (
          <div
            className={cn(
              'text-center mt-4 text-sm',
              status === 'success' && 'text-green-600 dark:text-green-400',
              status === 'error' && 'text-red-600 dark:text-red-400'
            )}
          >
            {message}
          </div>
        )}

        {/* Privacy note */}
        {props.showPrivacyNote && (
          <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            {props.privacyNote}
          </p>
        )}
      </div>
    </BackgroundContainer>
  )
}
