import type { CTAProps } from '@mdxui/types'
import { useDualAPI } from '../../hooks/useDualAPI.js'
import { BackgroundContainer } from '../backgrounds/BackgroundContainer.js'
import { cn } from '../../utils/cn.js'

/**
 * Call-to-Action section component with dual API support
 *
 * Prominent CTA sections to drive user actions.
 *
 * @example
 * // Explicit props
 * <CTA
 *   headline="Ready to get started?"
 *   description="Join thousands of users today"
 *   primaryAction={{ text: "Sign Up", href: "/signup" }}
 *   layout="centered"
 *   backgroundStyle="gradient"
 * />
 *
 * @example
 * // MDX children
 * <CTA backgroundType="particles">
 *   # Ready to get started?
 *   Join thousands of users today
 * </CTA>
 */
export function CTA({
  children,
  headline,
  description,
  primaryAction,
  secondaryAction,
  layout = 'centered',
  backgroundStyle = 'solid',
  className,
  backgroundType,
  backgroundConfig,
  backgroundOpacity,
  reduceMotion,
  ...rest
}: CTAProps) {
  const props = useDualAPI(
    children,
    {
      headline,
      description,
      primaryAction,
      secondaryAction,
      layout,
      backgroundStyle,
    },
    'cta'
  )

  const layoutClasses = {
    centered: 'text-center items-center',
    split: 'md:flex-row md:justify-between md:items-center gap-8',
    banner: 'md:flex-row md:justify-between md:items-center gap-6',
  }

  const backgroundStyles = {
    solid: 'bg-gray-50 dark:bg-gray-900',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
    pattern: 'bg-gray-900 dark:bg-gray-950 text-white',
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
        <div
          className={cn(
            'rounded-2xl p-8 md:p-12',
            backgroundStyles[props.backgroundStyle!]
          )}
        >
          <div className={cn('flex flex-col', layoutClasses[props.layout!])}>
            {/* Content */}
            <div className={cn(props.layout === 'centered' ? 'max-w-3xl mx-auto' : 'flex-1')}>
              {props.headline && (
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  {props.headline}
                </h2>
              )}
              {props.description && (
                <p className={cn(
                  'text-lg',
                  props.backgroundStyle === 'gradient' || props.backgroundStyle === 'pattern'
                    ? 'text-white/90'
                    : 'text-gray-600 dark:text-gray-300'
                )}>
                  {props.description}
                </p>
              )}
            </div>

            {/* Actions */}
            {(props.primaryAction || props.secondaryAction) && (
              <div className={cn(
                'flex flex-wrap gap-4',
                props.layout === 'centered' ? 'justify-center mt-8' : 'mt-6 md:mt-0'
              )}>
                {props.primaryAction && (
                  <a
                    href={props.primaryAction.href}
                    target={props.primaryAction.target}
                    rel={props.primaryAction.rel}
                    onClick={props.primaryAction.onClick}
                    className={cn(
                      'px-6 py-3 rounded-lg font-medium transition-colors',
                      props.backgroundStyle === 'gradient' || props.backgroundStyle === 'pattern'
                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    {props.primaryAction.text}
                  </a>
                )}

                {props.secondaryAction && (
                  <a
                    href={props.secondaryAction.href}
                    target={props.secondaryAction.target}
                    rel={props.secondaryAction.rel}
                    onClick={props.secondaryAction.onClick}
                    className={cn(
                      'px-6 py-3 rounded-lg font-medium transition-colors',
                      props.backgroundStyle === 'gradient' || props.backgroundStyle === 'pattern'
                        ? 'border border-white/30 text-white hover:bg-white/10'
                        : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {props.secondaryAction.text}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundContainer>
  )
}
