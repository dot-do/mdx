import type { ComponentPropsWithRef, ElementType, PropsWithChildren } from 'react'

/**
 * Props for polymorphic components that can render as different HTML elements
 * Based on proven patterns from Radix UI and Chakra UI
 */
export type PolymorphicProps<E extends ElementType, P = {}> = PropsWithChildren<P & Omit<ComponentPropsWithRef<E>, keyof P | 'as'>> & {
  /** The element type to render as */
  as?: E
}

/**
 * Helper type to extract props from a polymorphic component
 */
export type PolymorphicComponentProps<E extends ElementType, P = {}> = PolymorphicProps<E, P>

/**
 * Default element type for polymorphic components
 */
export type DefaultElement = 'div'

/**
 * Common HTML element types for polymorphic components
 */
export type CommonElements =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'span'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'a'
  | 'button'
