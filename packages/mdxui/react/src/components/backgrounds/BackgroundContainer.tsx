import type { ReactNode } from 'react'
import type { BackgroundProps } from '@mdxui/types'
import { cn } from '../../utils/cn.js'
import { Particles } from './Particles.js'
import { Grid } from './Grid.js'
import { Dots } from './Dots.js'

export interface BackgroundContainerProps extends BackgroundProps {
  /** Content to render on top of background */
  children: ReactNode
  /** Custom className for container */
  className?: string
}

/**
 * Container component that renders content with an optional animated background
 *
 * Supports multiple MagicUI-inspired background types:
 * - particles: Animated floating particles
 * - grid: Animated grid lines
 * - dots: Dot pattern
 * - none: No background (default)
 *
 * @example
 * <BackgroundContainer backgroundType="particles" backgroundOpacity={0.5}>
 *   <h1>Content over particles</h1>
 * </BackgroundContainer>
 */
export function BackgroundContainer({
  children,
  backgroundType = 'none',
  backgroundConfig = {},
  backgroundOpacity = 0.5,
  reduceMotion = true,
  className,
}: BackgroundContainerProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Render background based on type */}
      {backgroundType === 'particles' && (
        <Particles
          count={backgroundConfig.count}
          color={backgroundConfig.color}
          opacity={backgroundOpacity}
          reduceMotion={reduceMotion}
        />
      )}

      {backgroundType === 'grid' && (
        <Grid
          size={backgroundConfig.size}
          color={backgroundConfig.color}
          opacity={backgroundOpacity}
        />
      )}

      {backgroundType === 'dots' && (
        <Dots
          spacing={backgroundConfig.spacing}
          size={backgroundConfig.size}
          color={backgroundConfig.color}
          opacity={backgroundOpacity}
        />
      )}

      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
