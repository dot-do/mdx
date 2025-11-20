import type { TestimonialsProps } from '@mdxui/types'
import { useDualAPI } from '../../hooks/useDualAPI.js'
import { BackgroundContainer } from '../backgrounds/BackgroundContainer.js'
import { cn } from '../../utils/cn.js'

/**
 * Testimonials section component with dual API support
 *
 * Display customer testimonials and reviews with various layouts.
 *
 * @example
 * // Explicit props
 * <Testimonials
 *   title="What Our Customers Say"
 *   testimonials={[
 *     {
 *       quote: "Amazing product!",
 *       author: { name: "John Doe", title: "CEO", company: "Acme Corp" },
 *       rating: 5
 *     }
 *   ]}
 *   layout="grid"
 *   columns={3}
 * />
 *
 * @example
 * // MDX children
 * <Testimonials backgroundType="dots">
 *   ## What Our Customers Say
 *
 *   > Amazing product! The team is fantastic.
 *   > — John Doe, CEO at Acme Corp
 *   > ⭐⭐⭐⭐⭐
 * </Testimonials>
 */
export function Testimonials({
  children,
  title,
  description,
  testimonials = [],
  layout = 'grid',
  columns = 3,
  showRatings = true,
  showAvatars = true,
  className,
  backgroundType,
  backgroundConfig,
  backgroundOpacity,
  reduceMotion,
  ...rest
}: TestimonialsProps) {
  const props = useDualAPI(
    children,
    {
      title,
      description,
      testimonials,
      layout,
      columns,
      showRatings,
      showAvatars,
    },
    'testimonials'
  )

  const layoutClasses = {
    grid: 'grid gap-8',
    carousel: 'flex overflow-x-auto gap-8 snap-x snap-mandatory scrollbar-hide',
    wall: 'columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8',
    single: 'max-w-4xl mx-auto',
  }

  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  const renderRating = (rating?: number) => {
    if (!rating || !props.showRatings) return null

    return (
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={cn(
              'h-5 w-5',
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
            )}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const renderTestimonial = (testimonial: any, index: number) => {
    const author = typeof testimonial.author === 'string'
      ? { name: testimonial.author }
      : testimonial.author

    return (
      <div
        key={index}
        className={cn(
          'relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8',
          props.layout === 'carousel' && 'min-w-[300px] md:min-w-[400px] snap-start',
          props.layout === 'wall' && 'break-inside-avoid'
        )}
      >
        {/* Rating */}
        {renderRating(testimonial.rating)}

        {/* Quote */}
        <blockquote className="flex-1 mb-6">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            "{testimonial.quote}"
          </p>
        </blockquote>

        {/* Author */}
        {author && (
          <div className="flex items-center gap-4">
            {props.showAvatars && author.avatar && (
              <img
                src={author.avatar}
                alt={author.name || ''}
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                {author.name}
              </div>
              {(author.title || author.company) && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {author.title}
                  {author.title && author.company && ' at '}
                  {author.company}
                </div>
              )}
            </div>
          </div>
        )}
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

        {/* Testimonials */}
        {props.testimonials && props.testimonials.length > 0 && (
          <div
            className={cn(
              layoutClasses[props.layout!],
              props.layout === 'grid' && columnClasses[props.columns!]
            )}
          >
            {props.testimonials.map((testimonial, index) =>
              renderTestimonial(testimonial, index)
            )}
          </div>
        )}
      </div>
    </BackgroundContainer>
  )
}
