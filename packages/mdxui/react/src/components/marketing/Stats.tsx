import type { ReactNode } from 'react'
import type { BackgroundProps } from '@mdxui/types'
import { useDualAPI } from '../../hooks/useDualAPI.js'
import { BackgroundContainer } from '../backgrounds/BackgroundContainer.js'
import { cn } from '../../utils/cn.js'

export interface StatsProps extends BackgroundProps {
  children?: ReactNode
  title?: string
  description?: string
  stats?: Array<{
    value: string
    label: string
    description?: string
    icon?: string
  }>
  layout?: 'horizontal' | 'vertical' | 'compact'
  columns?: 2 | 3 | 4
  className?: string
}

/**
 * Stats section component with dual API support
 *
 * Display key metrics and statistics to build credibility.
 *
 * @example
 * // Explicit props
 * <Stats
 *   title="Trusted by Thousands"
 *   stats={[
 *     { value: "10K+", label: "Active Users" },
 *     { value: "99.9%", label: "Uptime" },
 *     { value: "24/7", label: "Support" }
 *   ]}
 *   layout="horizontal"
 * />
 *
 * @example
 * // MDX children
 * <Stats backgroundType="grid">
 *   ## Trusted by Thousands
 *
 *   ### 10K+
 *   Active Users
 *
 *   ### 99.9%
 *   Uptime
 * </Stats>
 */
export function Stats({
  children,
  title,
  description,
  stats = [],
  layout = 'horizontal',
  columns = 4,
  className,
  backgroundType,
  backgroundConfig,
  backgroundOpacity,
  reduceMotion,
  ...rest
}: StatsProps) {
  const props = useDualAPI(
    children,
    {
      title,
      description,
      stats,
      layout,
      columns,
    },
    'stats'
  )

  const layoutClasses = {
    horizontal: 'grid gap-8',
    vertical: 'space-y-12',
    compact: 'flex flex-wrap gap-8 justify-center',
  }

  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
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

        {/* Stats */}
        {props.stats && props.stats.length > 0 && (
          <div
            className={cn(
              layoutClasses[props.layout!],
              props.layout === 'horizontal' && columnClasses[props.columns!]
            )}
          >
            {props.stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  'text-center',
                  props.layout === 'compact' && 'min-w-[200px]'
                )}
              >
                {/* Icon */}
                {stat.icon && (
                  <div className="mb-4 flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                      {stat.icon}
                    </div>
                  </div>
                )}

                {/* Value */}
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>

                {/* Description */}
                {stat.description && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    {stat.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BackgroundContainer>
  )
}
