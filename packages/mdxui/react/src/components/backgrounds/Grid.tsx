import { cn } from '../../utils/cn.js'

export interface GridProps {
  /** Grid size in pixels */
  size?: number
  /** Grid line color */
  color?: string
  /** Opacity (0-1) */
  opacity?: number
  /** Custom className */
  className?: string
}

/**
 * Animated grid background (MagicUI-inspired)
 */
export function Grid({ size = 50, color = 'rgb(255, 255, 255)', opacity = 0.1, className }: GridProps) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        backgroundImage: `
          linear-gradient(to right, ${color} 1px, transparent 1px),
          linear-gradient(to bottom, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        opacity,
      }}
    />
  )
}
