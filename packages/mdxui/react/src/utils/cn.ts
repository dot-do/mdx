import { clsx, type ClassValue } from 'clsx'

/**
 * Utility for merging Tailwind CSS classes
 * Combines clsx for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
