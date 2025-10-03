import { describe, it, expect } from 'vitest'
import { extractFeaturesProps } from '../features.js'
import type { MDXNode } from '../../utils/types.js'

describe('Features Extraction', () => {
  it('should extract section title from h2', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h2',
        children: 'Our Key Features',
      },
    ]

    const props = extractFeaturesProps(nodes)
    expect(props.title).toBe('Our Key Features')
  })

  it('should extract features from h3 headings', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h3',
        children: 'Fast Performance',
      },
      {
        type: 'p',
        children: 'Lightning-fast load times',
      },
      {
        type: 'h3',
        children: 'Easy to Use',
      },
      {
        type: 'p',
        children: 'Intuitive interface',
      },
    ]

    const props = extractFeaturesProps(nodes)
    expect(props.features).toHaveLength(2)
    expect(props.features?.[0]).toEqual({
      title: 'Fast Performance',
      description: 'Lightning-fast load times',
    })
    expect(props.features?.[1]).toEqual({
      title: 'Easy to Use',
      description: 'Intuitive interface',
    })
  })

  it('should handle features without descriptions', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h3',
        children: 'Feature One',
      },
      {
        type: 'h3',
        children: 'Feature Two',
      },
    ]

    const props = extractFeaturesProps(nodes)
    expect(props.features).toHaveLength(2)
    expect(props.features?.[0]).toEqual({
      title: 'Feature One',
      description: '',
    })
  })

  it('should extract complete features section', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h2',
        children: 'Why Choose Us',
      },
      {
        type: 'h3',
        children: 'Performance',
      },
      {
        type: 'p',
        children: 'Blazing fast',
      },
      {
        type: 'h3',
        children: 'Security',
      },
      {
        type: 'p',
        children: 'Bank-level encryption',
      },
    ]

    const props = extractFeaturesProps(nodes)
    expect(props).toEqual({
      title: 'Why Choose Us',
      features: [
        {
          title: 'Performance',
          description: 'Blazing fast',
        },
        {
          title: 'Security',
          description: 'Bank-level encryption',
        },
      ],
    })
  })

  it('should handle empty nodes', () => {
    const nodes: MDXNode[] = []
    const props = extractFeaturesProps(nodes)
    expect(props.features).toEqual([])
  })

  it('should ignore non-h3 features', () => {
    const nodes: MDXNode[] = [
      {
        type: 'h2',
        children: 'Features',
      },
      {
        type: 'h4',
        children: 'Should be ignored',
      },
      {
        type: 'h3',
        children: 'Real Feature',
      },
    ]

    const props = extractFeaturesProps(nodes)
    expect(props.features).toHaveLength(1)
    expect(props.features?.[0].title).toBe('Real Feature')
  })
})
