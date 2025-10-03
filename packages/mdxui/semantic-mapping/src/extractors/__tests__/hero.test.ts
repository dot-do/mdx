import { describe, it, expect } from 'vitest'
import { extractHeroProps } from '../hero.js'
import type { MDXNode } from '../../utils/types.js'

describe('Hero Extraction', () => {
  it('should extract headline from h1', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h1',
        children: 'Welcome to Our Platform',
      },
    ]

    const props = extractHeroProps(nodes)
    expect(props.headline).toBe('Welcome to Our Platform')
  })

  it('should extract headline from h2 if no h1', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h2',
        children: 'Welcome to Our Platform',
      },
    ]

    const props = extractHeroProps(nodes)
    expect(props.headline).toBe('Welcome to Our Platform')
  })

  it('should extract description from first paragraph', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h1',
        children: 'Welcome',
      },
      {
        type: 'p',
        children: 'This is the description',
      },
    ]

    const props = extractHeroProps(nodes)
    expect(props.headline).toBe('Welcome')
    expect(props.description).toBe('This is the description')
  })

  it('should extract image media', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h1',
        children: 'Welcome',
      },
      {
        type: 'img',
        props: {
          src: '/hero.png',
          alt: 'Hero image',
        },
      },
    ]

    const props = extractHeroProps(nodes)
    expect(props.media).toEqual({
      src: '/hero.png',
      alt: 'Hero image',
      type: 'image',
    })
  })

  it('should extract complete hero section', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h1',
        children: 'Build Amazing Products',
      },
      {
        type: 'p',
        children: 'The best platform for creating stunning websites',
      },
      {
        type: 'img',
        props: {
          src: '/hero.jpg',
          alt: 'Platform screenshot',
        },
      },
    ]

    const props = extractHeroProps(nodes)
    expect(props).toEqual({
      headline: 'Build Amazing Products',
      description: 'The best platform for creating stunning websites',
      media: {
        src: '/hero.jpg',
        alt: 'Platform screenshot',
        type: 'image',
      },
    })
  })

  it('should handle missing elements gracefully', () => {
    const nodes: MDXNode[] = []
    const props = extractHeroProps(nodes)
    expect(props).toEqual({})
  })
})
