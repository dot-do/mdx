import { describe, it, expect } from 'vitest'
import { extractProps, extractHero, extractFeatures } from '../index.js'

describe('Semantic Mapping Integration', () => {
  describe('extractProps', () => {
    it('should extract hero props from component type', () => {
      const children = [
        { type: 'h1', props: { children: 'Welcome' } },
        { type: 'p', props: { children: 'Description' } },
      ]

      const props = extractProps(children, 'hero')
      expect(props.headline).toBe('Welcome')
      expect(props.description).toBe('Description')
    })

    it('should extract features props from component type', () => {
      const children = [
        { type: 'h2', props: { children: 'Features' } },
        { type: 'h3', props: { children: 'Feature 1' } },
        { type: 'p', props: { children: 'Description 1' } },
      ]

      const props = extractProps(children, 'features')
      expect(props.title).toBe('Features')
      expect(props.features).toHaveLength(1)
    })

    it('should return empty object for unknown component type', () => {
      const children = 'Text'
      const props = extractProps(children, 'unknown')
      expect(props).toEqual({})
    })
  })

  describe('extractHero', () => {
    it('should be a convenience wrapper for hero extraction', () => {
      const children = { type: 'h1', props: { children: 'Title' } }
      const props = extractHero(children)
      expect(props.headline).toBe('Title')
    })
  })

  describe('extractFeatures', () => {
    it('should be a convenience wrapper for features extraction', () => {
      const children = [
        { type: 'h3', props: { children: 'Feature' } },
      ]
      const props = extractFeatures(children)
      expect(props.features).toBeDefined()
    })
  })
})
