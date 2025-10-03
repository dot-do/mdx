import { useEffect, useRef } from 'react'
import { cn } from '../../utils/cn.js'

export interface MeteorsProps {
  /**
   * Number of meteors to render
   * @default 20
   */
  count?: number

  /**
   * Color of the meteors (CSS color string)
   * @default "rgb(255, 255, 255)"
   */
  color?: string

  /**
   * Opacity of the meteors
   * @default 0.5
   */
  opacity?: number

  /**
   * Respect user's reduced motion preferences
   * @default true
   */
  reduceMotion?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Meteors background component
 *
 * Animated shooting stars effect inspired by MagicUI.
 *
 * @example
 * <div className="relative h-screen">
 *   <Meteors count={20} color="rgb(59, 130, 246)" opacity={0.6} />
 *   <div className="relative z-10">{children}</div>
 * </div>
 */
export function Meteors({
  count = 20,
  color = 'rgb(255, 255, 255)',
  opacity = 0.5,
  reduceMotion = true,
  className = '',
}: MeteorsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Respect reduced motion preference
    if (reduceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const container = containerRef.current
    if (!container) return

    // Create meteor elements
    const meteors: HTMLDivElement[] = []

    for (let i = 0; i < count; i++) {
      const meteor = document.createElement('div')
      meteor.className = 'meteor'

      // Random starting position
      const startX = Math.random() * 100
      const startY = Math.random() * 100
      const angle = 45 + Math.random() * 30 // 45-75 degrees

      // Random animation delay and duration
      const delay = Math.random() * 5
      const duration = 1 + Math.random() * 2

      meteor.style.cssText = `
        position: absolute;
        left: ${startX}%;
        top: ${startY}%;
        width: 2px;
        height: ${20 + Math.random() * 40}px;
        background: linear-gradient(to bottom, ${color}, transparent);
        opacity: ${opacity};
        transform: rotate(${angle}deg);
        animation: meteor-fall ${duration}s linear ${delay}s infinite;
        pointer-events: none;
      `

      container.appendChild(meteor)
      meteors.push(meteor)
    }

    // Cleanup
    return () => {
      meteors.forEach((meteor) => meteor.remove())
    }
  }, [count, color, opacity, reduceMotion])

  return (
    <>
      <style>{`
        @keyframes meteor-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(45deg);
            opacity: ${opacity};
          }
          70% {
            opacity: ${opacity};
          }
          100% {
            transform: translateY(300px) translateX(-300px) rotate(45deg);
            opacity: 0;
          }
        }
      `}</style>
      <div ref={containerRef} className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)} />
    </>
  )
}
