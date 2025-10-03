import type { ReactNode } from 'react'
import type { BackgroundProps } from '@mdxui/types'
import { cn } from '../../utils/cn.js'
import { Particles } from './Particles.js'
import { Grid } from './Grid.js'
import { Dots } from './Dots.js'
import { Meteors } from './Meteors.js'
import { Aurora } from './Aurora.js'
import { Warp } from './Warp.js'

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
 * - meteors: Shooting stars effect
 * - aurora: Northern lights effect
 * - warp: Perspective grid warp
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

      {backgroundType === 'meteors' && (
        <Meteors
          count={backgroundConfig.count}
          color={backgroundConfig.color}
          opacity={backgroundOpacity}
          reduceMotion={reduceMotion}
        />
      )}

      {backgroundType === 'aurora' && (
        <Aurora
          color1={backgroundConfig.color1}
          color2={backgroundConfig.color2}
          color3={backgroundConfig.color3}
          opacity={backgroundOpacity}
          reduceMotion={reduceMotion}
        />
      )}

      {backgroundType === 'warp' && (
        <Warp
          size={backgroundConfig.size}
          color={backgroundConfig.color}
          opacity={backgroundOpacity}
          warpIntensity={backgroundConfig.warpIntensity}
          reduceMotion={reduceMotion}
        />
      )}

      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
