import { cn } from '../../utils/cn.js'

export interface DotsProps {
  /** Dot spacing in pixels */
  spacing?: number
  /** Dot size in pixels */
  size?: number
  /** Dot color */
  color?: string
  /** Opacity (0-1) */
  opacity?: number
  /** Custom className */
  className?: string
}

/**
 * Dots pattern background (MagicUI-inspired)
 */
export function Dots({ spacing = 30, size = 1, color = 'rgb(255, 255, 255)', opacity = 0.3, className }: DotsProps) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        backgroundImage: `radial-gradient(circle, ${color} ${size}px, transparent ${size}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        opacity,
      }}
    />
  )
}
