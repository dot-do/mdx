import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { extractProps } from '@mdxui/semantic-mapping'

/**
 * Hook to merge explicit props with props extracted from MDX children
 *
 * @param children - React children (possibly MDX content)
 * @param explicitProps - Props passed explicitly to the component
 * @param componentType - Type of component ('hero', 'features', etc.)
 * @param preferExplicit - Whether explicit props take precedence (default: true)
 * @returns Merged props object
 *
 * @example
 * function Hero({ children, headline, description, ...rest }) {
 *   const props = useDualAPI(children, { headline, description, ...rest }, 'hero')
 *   // props.headline will be explicit value or extracted from children
 * }
 */
export function useDualAPI<T extends Record<string, any>>(
  children: ReactNode | undefined,
  explicitProps: Partial<T>,
  componentType: string,
  preferExplicit: boolean = true
): T {
  return useMemo(() => {
    // If no children, just return explicit props
    if (!children) {
      return explicitProps as T
    }

    // Extract props from children
    const extractedProps = extractProps<T>(children, componentType)

    // Merge based on preference
    if (preferExplicit) {
      // Explicit props override extracted props
      return {
        ...extractedProps,
        ...explicitProps,
      } as T
    } else {
      // Extracted props override explicit props
      return {
        ...explicitProps,
        ...extractedProps,
      } as T
    }
  }, [children, explicitProps, componentType, preferExplicit])
}
