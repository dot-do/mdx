import { describe, it, expect } from 'vitest'
import { extractText, extractTextFromNodes, findFirstText } from '../text.js'
import type { MDXNode } from '../../utils/types.js'

describe('Text Extraction', () => {
  describe('extractText', () => {
    it('should extract text from a simple text node', () => {
      const node: MDXNode = {
        type: 'text',
        children: 'Hello World',
      }
      expect(extractText(node)).toBe('Hello World')
    })

    it('should extract text from nested nodes', () => {
      const node: MDXNode = {
        type: 'p',
        children: [
          { type: 'text', children: 'Hello ' },
          { type: 'strong', children: 'World' },
        ],
      }
      expect(extractText(node)).toBe('Hello World')
    })

    it('should handle empty nodes', () => {
      const node: MDXNode = {
        type: 'p',
        children: [],
      }
      expect(extractText(node)).toBe('')
    })

    it('should trim whitespace', () => {
      const node: MDXNode = {
        type: 'text',
        children: '  Hello World  ',
      }
      expect(extractText(node)).toBe('Hello World')
    })
  })

  describe('extractTextFromNodes', () => {
    it('should extract text from multiple nodes', () => {
      const nodes: MDXNode[] = [
        { type: 'text', children: 'First' },
        { type: 'text', children: 'Second' },
      ]
      expect(extractTextFromNodes(nodes)).toBe('First Second')
    })

    it('should handle empty array', () => {
      expect(extractTextFromNodes([])).toBe('')
    })
  })

  describe('findFirstText', () => {
    it('should find first non-empty text', () => {
      const nodes: MDXNode[] = [
        { type: 'text', children: '' },
        { type: 'text', children: 'First' },
        { type: 'text', children: 'Second' },
      ]
      expect(findFirstText(nodes)).toBe('First')
    })

    it('should return empty string if no text found', () => {
      const nodes: MDXNode[] = [
        { type: 'text', children: '' },
        { type: 'text', children: '   ' },
      ]
      expect(findFirstText(nodes)).toBe('')
    })
  })
})
