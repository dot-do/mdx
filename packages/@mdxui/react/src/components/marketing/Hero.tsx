import type { HeroProps } from '@mdxui/types'
import { useDualAPI } from '../../hooks/useDualAPI.js'
import { BackgroundContainer } from '../backgrounds/BackgroundContainer.js'
import { cn } from '../../utils/cn.js'

/**
 * Hero section component with dual API support
 *
 * Supports two usage patterns:
 * 1. Explicit props: <Hero headline="..." description="..." />
 * 2. MDX children: <Hero># Headline\nDescription</Hero>
 *
 * @example
 * // Explicit props
 * <Hero
 *   headline="Welcome to Our Platform"
 *   description="The best solution for your needs"
 *   primaryAction={{ text: "Get Started", href: "/signup" }}
 *   backgroundType="particles"
 * />
 *
 * @example
 * // MDX children (semantic extraction)
 * <Hero backgroundType="grid">
 *   # Welcome to Our Platform
 *   The best solution for your needs
 *   ![Hero](/hero.png)
 * </Hero>
 */
export function Hero({
  children,
  headline,
  description,
  primaryAction,
  secondaryAction,
  media,
  mediaPosition = 'right',
  layout = 'centered',
  textAlign = 'center',
  maxWidth = 'lg',
  className,
  backgroundType,
  backgroundConfig,
  backgroundOpacity,
  reduceMotion,
  ...rest
}: HeroProps) {
  // Merge explicit props with props extracted from children
  const props = useDualAPI(
    children,
    {
      headline,
      description,
      primaryAction,
      secondaryAction,
      media,
      mediaPosition,
      layout,
      textAlign,
      maxWidth,
    },
    'hero'
  )

  // Layout classes
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const layoutClasses = {
    centered: 'flex flex-col items-center justify-center min-h-[60vh]',
    split: 'grid md:grid-cols-2 gap-12 items-center min-h-[60vh]',
    minimal: 'flex flex-col gap-6',
    'full-screen': 'flex flex-col items-center justify-center min-h-screen',
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
      <div className={cn('mx-auto w-full', maxWidthClasses[props.maxWidth!])}>
        <div className={cn(layoutClasses[props.layout!])}>
          {/* Content section */}
          <div className={cn('flex flex-col gap-6', textAlignClasses[props.textAlign!])}>
            {/* Headline */}
            {props.headline && (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {props.headline}
              </h1>
            )}

            {/* Description */}
            {props.description && (
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                {props.description}
              </p>
            )}

            {/* Actions */}
            {(props.primaryAction || props.secondaryAction) && (
              <div className="flex flex-wrap gap-4 mt-4">
                {props.primaryAction && (
                  <a
                    href={props.primaryAction.href}
                    target={props.primaryAction.target}
                    rel={props.primaryAction.rel}
                    onClick={props.primaryAction.onClick}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
                    className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {props.secondaryAction.text}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Media section */}
          {props.media && props.layout === 'split' && (
            <div className="flex items-center justify-center">
              {props.media.type === 'image' ? (
                <img
                  src={props.media.src}
                  alt={props.media.alt || ''}
                  className="rounded-lg shadow-2xl max-w-full h-auto"
                  style={{
                    width: props.media.width,
                    height: props.media.height,
                  }}
                />
              ) : (
                <video
                  src={props.media.src}
                  className="rounded-lg shadow-2xl max-w-full h-auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
            </div>
          )}
        </div>
      </div>
    </BackgroundContainer>
  )
}
