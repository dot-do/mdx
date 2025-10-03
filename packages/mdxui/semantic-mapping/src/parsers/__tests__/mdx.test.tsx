import { describe, it, expect } from 'vitest'
import { parseChildren, flattenNodes } from '../mdx.js'
import type { MDXNode } from '../../utils/types.js'

describe('MDX Parser', () => {
  describe('parseChildren', () => {
    it('should parse string children', () => {
      const children = 'Hello World'
      const nodes = parseChildren(children)

      expect(nodes).toHaveLength(1)
      expect(nodes[0]).toEqual({
        type: 'text',
        children: 'Hello World',
      })
    })

    it('should parse React elements', () => {
      const children = {
        type: 'h1',
        props: { children: 'Title' },
      }
      const nodes = parseChildren(children)

      expect(nodes).toHaveLength(1)
      expect(nodes[0].type).toBe('h1')
    })

    it('should parse arrays of children', () => {
      const children = [
        'Text 1',
        {
          type: 'p',
          props: { children: 'Text 2' },
        },
      ]
      const nodes = parseChildren(children)

      expect(nodes).toHaveLength(2)
      expect(nodes[0].type).toBe('text')
      expect(nodes[1].type).toBe('p')
    })

    it('should handle nested React elements', () => {
      const children = {
        type: 'div',
        props: {
          children: {
            type: 'p',
            props: {
              children: 'Nested text',
            },
          },
        },
      }
      const nodes = parseChildren(children)

      expect(nodes).toHaveLength(1)
      expect(nodes[0].type).toBe('div')
      expect(nodes[0].children).toBeDefined()
      expect(Array.isArray(nodes[0].children)).toBe(true)
    })

    it('should skip null and undefined', () => {
      const children = [null, undefined, 'Text']
      const nodes = parseChildren(children)

      expect(nodes).toHaveLength(1)
      expect(nodes[0].children).toBe('Text')
    })

    it('should skip empty strings', () => {
      const children = ['', '  ', 'Valid']
      const nodes = parseChildren(children)

      expect(nodes).toHaveLength(1)
      expect(nodes[0].children).toBe('Valid')
    })

    it('should convert numbers to strings', () => {
      const children = 42
      const nodes = parseChildren(children)

      expect(nodes).toHaveLength(1)
      expect(nodes[0].children).toBe('42')
    })
  })

  describe('flattenNodes', () => {
    it('should flatten nested nodes', () => {
      const nodes: MDXNode[] = [
        {
          type: 'div',
          children: [
            {
              type: 'p',
              children: 'Text',
            },
          ],
        },
      ]

      const flattened = flattenNodes(nodes)
      expect(flattened).toHaveLength(2)
      expect(flattened[0].type).toBe('div')
      expect(flattened[1].type).toBe('p')
    })

    it('should handle empty arrays', () => {
      const flattened = flattenNodes([])
      expect(flattened).toEqual([])
    })

    it('should handle deeply nested structures', () => {
      const nodes: MDXNode[] = [
        {
          type: 'div',
          children: [
            {
              type: 'section',
              children: [
                {
                  type: 'p',
                  children: 'Text',
                },
              ],
            },
          ],
        },
      ]

      const flattened = flattenNodes(nodes)
      expect(flattened).toHaveLength(3)
    })
  })
})
