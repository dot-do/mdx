import { cn } from '../../utils/cn.js'

export interface AuroraProps {
  /**
   * Primary color for aurora effect (CSS color string)
   * @default "rgb(59, 130, 246)"
   */
  color1?: string

  /**
   * Secondary color for aurora effect (CSS color string)
   * @default "rgb(147, 51, 234)"
   */
  color2?: string

  /**
   * Tertiary color for aurora effect (CSS color string)
   * @default "rgb(219, 39, 119)"
   */
  color3?: string

  /**
   * Opacity of the aurora effect
   * @default 0.3
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
 * Aurora background component
 *
 * Animated northern lights effect with flowing gradients inspired by MagicUI.
 *
 * @example
 * <div className="relative h-screen bg-gray-900">
 *   <Aurora
 *     color1="rgb(59, 130, 246)"
 *     color2="rgb(147, 51, 234)"
 *     color3="rgb(219, 39, 119)"
 *     opacity={0.4}
 *   />
 *   <div className="relative z-10">{children}</div>
 * </div>
 */
export function Aurora({
  color1 = 'rgb(59, 130, 246)',
  color2 = 'rgb(147, 51, 234)',
  color3 = 'rgb(219, 39, 119)',
  opacity = 0.3,
  reduceMotion = true,
  className = '',
}: AuroraProps) {
  // Respect reduced motion preference
  const shouldAnimate = !reduceMotion || !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <>
      <style>{`
        @keyframes aurora-move {
          0%, 100% {
            transform: translateY(0%) translateX(0%) scale(1);
          }
          33% {
            transform: translateY(-10%) translateX(10%) scale(1.1);
          }
          66% {
            transform: translateY(10%) translateX(-10%) scale(0.9);
          }
        }

        @keyframes aurora-pulse {
          0%, 100% {
            opacity: ${opacity * 0.7};
          }
          50% {
            opacity: ${opacity};
          }
        }

        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform, opacity;
        }

        .aurora-blob-1 {
          width: 500px;
          height: 500px;
          background: ${color1};
          top: 0%;
          left: 0%;
          animation: aurora-move 20s ease-in-out infinite, aurora-pulse 8s ease-in-out infinite;
        }

        .aurora-blob-2 {
          width: 400px;
          height: 400px;
          background: ${color2};
          top: 50%;
          right: 0%;
          animation: aurora-move 25s ease-in-out infinite reverse, aurora-pulse 10s ease-in-out infinite;
        }

        .aurora-blob-3 {
          width: 450px;
          height: 450px;
          background: ${color3};
          bottom: 0%;
          left: 50%;
          animation: aurora-move 22s ease-in-out infinite, aurora-pulse 12s ease-in-out infinite;
        }

        ${!shouldAnimate ? `
          .aurora-blob {
            animation: none !important;
            opacity: ${opacity * 0.85};
          }
        ` : ''}
      `}</style>
      <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>
    </>
  )
}
