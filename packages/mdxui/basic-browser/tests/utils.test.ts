import { describe, expect, it } from 'vitest'
import { cn } from '../src/utils'

describe('cn', () => {
  it('should join multiple class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('should filter out falsy values', () => {
    expect(cn('a', undefined, 'b', null, 'c', false)).toBe('a b c')
  })

  it('should handle an empty array', () => {
    expect(cn()).toBe('')
  })

  it('should handle an array with only falsy values', () => {
    expect(cn(undefined, null, false)).toBe('')
  })

  it('should handle a mix of strings and falsy values', () => {
    expect(cn('bg-red-500', false, 'text-white', null)).toBe('bg-red-500 text-white')
  })
})
