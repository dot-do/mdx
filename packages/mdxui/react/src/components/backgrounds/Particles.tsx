import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export interface ParticlesProps {
  /** Number of particles */
  count?: number
  /** Particle color */
  color?: string
  /** Opacity (0-1) */
  opacity?: number
  /** Whether to respect reduced motion preference */
  reduceMotion?: boolean
  /** Custom className */
  className?: string
}

/**
 * Animated particles background (MagicUI-inspired)
 */
export function Particles({
  count = 100,
  color = 'rgb(255, 255, 255)',
  opacity = 0.5,
  reduceMotion = true,
  className = '',
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Check for reduced motion
    const prefersReducedMotion = reduceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Create particles
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
    }> = []

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      })
    }

    // Animation loop
    let animationFrame: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      ctx.fillStyle = color
      ctx.globalAlpha = opacity

      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Update position (skip if reduced motion)
        if (!prefersReducedMotion) {
          particle.x += particle.vx
          particle.y += particle.vy

          // Wrap around edges
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0
        }
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [count, color, opacity, reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
