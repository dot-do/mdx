import type { FeaturesProps } from '@mdxui/types'
import { useDualAPI } from '../../hooks/useDualAPI.js'
import { BackgroundContainer } from '../backgrounds/BackgroundContainer.js'
import { cn } from '../../utils/cn.js'

/**
 * Features section component with dual API support
 *
 * Supports two usage patterns:
 * 1. Explicit props: <Features features={[...]} />
 * 2. MDX children: <Features>## Title\n### Feature 1\nDescription</Features>
 *
 * @example
 * // Explicit props
 * <Features
 *   title="Our Features"
 *   features={[
 *     { title: "Fast", description: "Lightning fast performance" },
 *     { title: "Secure", description: "Bank-level security" }
 *   ]}
 *   layout="grid"
 *   columns={3}
 * />
 *
 * @example
 * // MDX children (semantic extraction)
 * <Features>
 *   ## Our Key Features
 *
 *   ### Fast Performance
 *   Lightning-fast load times
 *
 *   ### Easy to Use
 *   Intuitive interface
 * </Features>
 */
export function Features({
  children,
  title,
  description,
  features = [],
  layout = 'grid',
  columns = 3,
  showIcons = true,
  iconStyle = 'outlined',
  className,
  backgroundType,
  backgroundConfig,
  backgroundOpacity,
  reduceMotion,
  ...rest
}: FeaturesProps) {
  // Merge explicit props with props extracted from children
  const props = useDualAPI(
    children,
    {
      title,
      description,
      features,
      layout,
      columns,
      showIcons,
      iconStyle,
    },
    'features'
  )

  const layoutClasses = {
    grid: 'grid gap-8',
    list: 'flex flex-col gap-8',
    alternating: 'flex flex-col gap-12',
    bento: 'grid gap-4',
  }

  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
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
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{props.title}</h2>
            )}
            {props.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {props.description}
              </p>
            )}
          </div>
        )}

        {/* Features grid/list */}
        {props.features && props.features.length > 0 && (
          <div
            className={cn(
              layoutClasses[props.layout!],
              props.layout === 'grid' && columnClasses[props.columns!]
            )}
          >
            {props.features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  'flex flex-col gap-4',
                  props.layout === 'alternating' && index % 2 === 1 && 'md:flex-row-reverse'
                )}
              >
                {/* Icon */}
                {props.showIcons && feature.icon && (
                  <div className="flex-shrink-0">
                    {typeof feature.icon === 'string' ? (
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl">
                        {feature.icon}
                      </div>
                    ) : (
                      <feature.icon />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>

                  {/* Optional image */}
                  {feature.image && (
                    <img
                      src={feature.image.src}
                      alt={feature.image.alt || feature.title}
                      className="mt-4 rounded-lg"
                    />
                  )}

                  {/* Optional link */}
                  {feature.href && (
                    <a
                      href={feature.href}
                      className="inline-flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Learn more →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BackgroundContainer>
  )
}
