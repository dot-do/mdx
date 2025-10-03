import type { PricingProps } from '@mdxui/types'
import { useDualAPI } from '../../hooks/useDualAPI.js'
import { BackgroundContainer } from '../backgrounds/BackgroundContainer.js'
import { cn } from '../../utils/cn.js'

/**
 * Pricing section component with dual API support
 *
 * Supports pricing tables with multiple tiers, billing toggles, and comparison features.
 *
 * @example
 * // Explicit props
 * <Pricing
 *   title="Simple Pricing"
 *   tiers={[
 *     {
 *       name: "Starter",
 *       price: "$9",
 *       period: "per month",
 *       features: ["Feature 1", "Feature 2"],
 *       action: { text: "Get Started", href: "/signup" }
 *     }
 *   ]}
 * />
 */
export function Pricing({
  children,
  title,
  description,
  tiers = [],
  layout = 'cards',
  billingPeriods,
  showComparison = false,
  className,
  backgroundType,
  backgroundConfig,
  backgroundOpacity,
  reduceMotion,
  ...rest
}: PricingProps) {
  const props = useDualAPI(
    children,
    {
      title,
      description,
      tiers,
      layout,
      billingPeriods,
      showComparison,
    },
    'pricing'
  )

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

        {/* Pricing tiers */}
        {props.tiers && props.tiers.length > 0 && (
          <div className={cn(
            'grid gap-8',
            props.tiers.length === 1 && 'max-w-md mx-auto',
            props.tiers.length === 2 && 'md:grid-cols-2 max-w-4xl mx-auto',
            props.tiers.length >= 3 && 'md:grid-cols-3'
          )}>
            {props.tiers.map((tier, index) => (
              <div
                key={index}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-8',
                  tier.highlighted
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-xl scale-105'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                )}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white">
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Tier name */}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>

                {/* Description */}
                {tier.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {tier.description}
                  </p>
                )}

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    {tier.currency && (
                      <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                        {tier.currency}
                      </span>
                    )}
                    <span className="text-5xl font-bold tracking-tight">
                      {tier.price}
                    </span>
                  </div>
                  {tier.period && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {tier.period}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <svg
                        className="h-6 w-6 flex-shrink-0 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {tier.action && (
                  <a
                    href={tier.action.href}
                    target={tier.action.target}
                    rel={tier.action.rel}
                    onClick={tier.action.onClick}
                    className={cn(
                      'w-full py-3 px-6 rounded-lg font-medium text-center transition-colors',
                      tier.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {tier.action.text}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BackgroundContainer>
  )
}
