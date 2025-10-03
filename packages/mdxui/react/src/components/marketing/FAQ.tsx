import { useState } from 'react'
import type { FAQProps } from '@mdxui/types'
import { useDualAPI } from '../../hooks/useDualAPI.js'
import { BackgroundContainer } from '../backgrounds/BackgroundContainer.js'
import { cn } from '../../utils/cn.js'

/**
 * FAQ section component with dual API support
 *
 * Accordion-style frequently asked questions with multiple layout options.
 *
 * @example
 * // Explicit props
 * <FAQ
 *   title="Frequently Asked Questions"
 *   items={[
 *     {
 *       question: "How does it work?",
 *       answer: "It works by..."
 *     }
 *   ]}
 *   layout="single"
 * />
 *
 * @example
 * // MDX children
 * <FAQ backgroundType="grid">
 *   ## Frequently Asked Questions
 *
 *   ### How does it work?
 *   It works by leveraging modern web technologies...
 *
 *   ### Is it free?
 *   Yes, we offer a generous free tier.
 * </FAQ>
 */
export function FAQ({
  children,
  title,
  description,
  items = [],
  layout = 'accordion',
  allowMultiple = false,
  className,
  backgroundType,
  backgroundConfig,
  backgroundOpacity,
  reduceMotion,
  ...rest
}: FAQProps) {
  const props = useDualAPI(
    children,
    {
      title,
      description,
      items,
      layout,
      allowMultiple,
    },
    'faq'
  )

  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        if (!props.allowMultiple) {
          next.clear()
        }
        next.add(index)
      }
      return next
    })
  }

  const layoutClasses = {
    accordion: 'max-w-3xl mx-auto',
    'two-column': 'grid md:grid-cols-2 gap-8 max-w-6xl mx-auto',
    grid: 'grid md:grid-cols-2 lg:grid-cols-3 gap-6',
  }

  const renderFAQItem = (item: any, index: number) => {
    const isOpen = openItems.has(index)

    return (
      <div
        key={index}
        className={cn(
          'border-b border-gray-200 dark:border-gray-800 py-6'
        )}
      >
        <button
          onClick={() => toggleItem(index)}
          className="w-full flex items-start justify-between gap-4 text-left group"
          aria-expanded={isOpen}
        >
          <span className="flex-1 font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {item.question}
          </span>
          <svg
            className={cn(
              'h-6 w-6 flex-shrink-0 text-gray-500 transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isOpen ? 'mt-4 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {item.answer}
          </div>
        </div>
      </div>
    )
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
          <div className="text-center mb-16">
            {props.title && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {props.title}
              </h2>
            )}
            {props.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {props.description}
              </p>
            )}
          </div>
        )}

        {/* FAQ Items */}
        {props.items && props.items.length > 0 && (
          <div className={layoutClasses[props.layout!]}>
            {props.layout === 'two-column' ? (
              <>
                <div className="space-y-0">
                  {props.items
                    .filter((_, i) => i % 2 === 0)
                    .map((item, i) => renderFAQItem(item, i * 2))}
                </div>
                <div className="space-y-0">
                  {props.items
                    .filter((_, i) => i % 2 === 1)
                    .map((item, i) => renderFAQItem(item, i * 2 + 1))}
                </div>
              </>
            ) : (
              <div className="space-y-0">
                {props.items.map((item, index) => renderFAQItem(item, index))}
              </div>
            )}
          </div>
        )}
      </div>
    </BackgroundContainer>
  )
}
