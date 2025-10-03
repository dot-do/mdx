import { useEffect, useRef } from 'react'
import { cn } from '../../utils/cn.js'

export interface WarpProps {
  /**
   * Grid size (spacing between lines)
   * @default 50
   */
  size?: number

  /**
   * Color of the grid lines (CSS color string)
   * @default "rgb(255, 255, 255)"
   */
  color?: string

  /**
   * Opacity of the grid
   * @default 0.2
   */
  opacity?: number

  /**
   * Intensity of the warp effect
   * @default 0.5
   */
  warpIntensity?: number

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
 * Warp background component
 *
 * Animated grid with perspective warp effect inspired by MagicUI.
 *
 * @example
 * <div className="relative h-screen bg-black">
 *   <Warp size={40} color="rgb(59, 130, 246)" opacity={0.3} warpIntensity={0.7} />
 *   <div className="relative z-10">{children}</div>
 * </div>
 */
export function Warp({
  size = 50,
  color = 'rgb(255, 255, 255)',
  opacity = 0.2,
  warpIntensity = 0.5,
  reduceMotion = true,
  className = '',
}: WarpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = reduceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    let animationId: number
    let time = 0

    const drawWarpGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = color
      ctx.globalAlpha = opacity
      ctx.lineWidth = 1

      const cols = Math.ceil(canvas.width / size) + 1
      const rows = Math.ceil(canvas.height / size) + 1

      // Draw vertical lines
      for (let i = 0; i < cols; i++) {
        ctx.beginPath()
        const x = i * size

        for (let j = 0; j <= rows; j++) {
          const y = j * size
          const offsetX = prefersReducedMotion
            ? 0
            : Math.sin((y / 100 + time) * Math.PI) * size * warpIntensity
          const offsetY = prefersReducedMotion
            ? 0
            : Math.cos((x / 100 + time) * Math.PI) * 10 * warpIntensity

          if (j === 0) {
            ctx.moveTo(x + offsetX, y + offsetY)
          } else {
            ctx.lineTo(x + offsetX, y + offsetY)
          }
        }
        ctx.stroke()
      }

      // Draw horizontal lines
      for (let j = 0; j < rows; j++) {
        ctx.beginPath()
        const y = j * size

        for (let i = 0; i <= cols; i++) {
          const x = i * size
          const offsetX = prefersReducedMotion
            ? 0
            : Math.sin((y / 100 + time) * Math.PI) * size * warpIntensity
          const offsetY = prefersReducedMotion
            ? 0
            : Math.cos((x / 100 + time) * Math.PI) * 10 * warpIntensity

          if (i === 0) {
            ctx.moveTo(x + offsetX, y + offsetY)
          } else {
            ctx.lineTo(x + offsetX, y + offsetY)
          }
        }
        ctx.stroke()
      }

      if (!prefersReducedMotion) {
        time += 0.01
        animationId = requestAnimationFrame(drawWarpGrid)
      }
    }

    drawWarpGrid()

    return () => {
      window.removeEventListener('resize', updateSize)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [size, color, opacity, warpIntensity, reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
