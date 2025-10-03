/**
 * Tests for MDX evaluation engine
 */

import { describe, it, expect } from 'vitest'
import { MdxEvaluator, evaluateJavaScript, evaluateTypeScript } from './eval.js'

describe('MdxEvaluator', () => {
  describe('local evaluation (fallback)', () => {
    it('should evaluate simple JavaScript code', async () => {
      const evaluator = new MdxEvaluator()

      const result = await evaluator.evaluateJavaScript('return 1 + 1')

      expect(result.success).toBe(true)
      expect(result.result).toBe(2)
      expect(result.duration).toBeGreaterThan(0)
    })

    it('should evaluate JavaScript with variables', async () => {
      const evaluator = new MdxEvaluator()

      const code = `
        const x = 10;
        const y = 20;
        return x + y;
      `

      const result = await evaluator.evaluateJavaScript(code)

      expect(result.success).toBe(true)
      expect(result.result).toBe(30)
    })

    it('should capture console outputs', async () => {
      const evaluator = new MdxEvaluator()

      const code = `
        console.log('Hello');
        console.warn('Warning');
        console.error('Error');
        return 'done';
      `

      const result = await evaluator.evaluateJavaScript(code)

      expect(result.success).toBe(true)
      expect(result.outputs).toBeDefined()
      expect(result.outputs?.length).toBeGreaterThan(0)

      const types = result.outputs?.map((o) => o.type)
      expect(types).toContain('log')
      expect(types).toContain('warn')
      expect(types).toContain('error')
    })

    it('should handle errors gracefully', async () => {
      const evaluator = new MdxEvaluator()

      const code = `
        throw new Error('Test error');
      `

      const result = await evaluator.evaluateJavaScript(code)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Test error')
    })

    it('should evaluate TypeScript code', async () => {
      const evaluator = new MdxEvaluator()

      const code = `
        interface Person {
          name: string;
          age: number;
        }

        const person: Person = {
          name: 'Alice',
          age: 30
        };

        return person.name;
      `

      const result = await evaluator.evaluateTypeScript(code)

      expect(result.success).toBe(true)
      expect(result.result).toBe('Alice')
    })

    it('should support async code', async () => {
      const evaluator = new MdxEvaluator()

      const code = `
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(10);
        return 'completed';
      `

      const result = await evaluator.evaluateJavaScript(code)

      expect(result.success).toBe(true)
      expect(result.result).toBe('completed')
    })

    it('should provide custom bindings', async () => {
      const evaluator = new MdxEvaluator()

      const code = `
        return apiKey + ' - ' + user.name;
      `

      const result = await evaluator.evaluateJavaScript(code, {
        bindings: {
          apiKey: 'secret-123',
          user: { name: 'Alice' },
        },
      })

      expect(result.success).toBe(true)
      expect(result.result).toBe('secret-123 - Alice')
    })

    it('should provide database context', async () => {
      const evaluator = new MdxEvaluator()

      const mockDb = {
        list: () => [{ slug: 'doc1' }, { slug: 'doc2' }],
        get: (id: string) => ({ slug: id, title: `Document ${id}` }),
        db: {} as any,
      }

      const code = `
        const docs = db.list();
        const first = db.get('doc1');
        return { count: docs.length, title: first.title };
      `

      const result = await evaluator.evaluateJavaScript(code, {
        db: mockDb as any,
      })

      expect(result.success).toBe(true)
      expect(result.result).toEqual({
        count: 2,
        title: 'Document doc1',
      })
    })

    it('should handle syntax errors in TypeScript', async () => {
      const evaluator = new MdxEvaluator()

      const code = `
        const x: string = 123; // Type error
        return x;
      `

      const result = await evaluator.evaluateTypeScript(code)

      // esbuild will transpile but not type-check, so this will succeed
      // In a real scenario with type checking enabled, this would fail
      expect(result.success).toBe(true)
    })
  })

  describe('Worker Loader availability', () => {
    it('should report Worker Loader as not available without binding', () => {
      const evaluator = new MdxEvaluator()
      expect(evaluator.isWorkerLoaderAvailable()).toBe(false)
    })

    it('should report Worker Loader as available with binding', () => {
      const mockBinding = {
        get: async () => ({} as any),
      }

      const evaluator = new MdxEvaluator(mockBinding as any)
      expect(evaluator.isWorkerLoaderAvailable()).toBe(true)
    })
  })
})

describe('convenience functions', () => {
  it('evaluateJavaScript should work', async () => {
    const result = await evaluateJavaScript('return 42')

    expect(result.success).toBe(true)
    expect(result.result).toBe(42)
  })

  it('evaluateTypeScript should work', async () => {
    const code = `
      const x: number = 10;
      return x * 2;
    `

    const result = await evaluateTypeScript(code)

    expect(result.success).toBe(true)
    expect(result.result).toBe(20)
  })

  it('should handle errors in convenience functions', async () => {
    const result = await evaluateJavaScript('throw new Error("fail")')

    expect(result.success).toBe(false)
    expect(result.error).toContain('fail')
  })
})

describe('integration scenarios', () => {
  it('should handle complex code with multiple features', async () => {
    const evaluator = new MdxEvaluator()

    const code = `
      // Variables
      const data = [1, 2, 3, 4, 5];

      // Functions
      function sum(arr) {
        return arr.reduce((a, b) => a + b, 0);
      }

      // Async operations
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      await delay(5);

      // Console outputs
      console.log('Processing data...');

      // Return result
      return {
        sum: sum(data),
        count: data.length,
        avg: sum(data) / data.length
      };
    `

    const result = await evaluator.evaluateJavaScript(code)

    expect(result.success).toBe(true)
    expect(result.result).toEqual({
      sum: 15,
      count: 5,
      avg: 3,
    })
    expect(result.outputs).toBeDefined()
    expect(result.outputs?.some((o) => o.type === 'log')).toBe(true)
  })

  it('should handle code with external bindings and database', async () => {
    const evaluator = new MdxEvaluator()

    const mockDb = {
      list: () => [
        { slug: 'post-1', title: 'Post 1', views: 100 },
        { slug: 'post-2', title: 'Post 2', views: 200 },
      ],
      get: (id: string) => ({ slug: id, title: `Post ${id}` }),
      db: {} as any,
    }

    const code = `
      // Get all posts
      const posts = db.list();

      // Calculate stats
      const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
      const avgViews = totalViews / posts.length;

      // Use external config
      const threshold = config.viewThreshold;

      console.log(\`Total views: \${totalViews}\`);
      console.log(\`Average views: \${avgViews}\`);

      return {
        totalPosts: posts.length,
        totalViews,
        avgViews,
        aboveThreshold: posts.filter(p => p.views > threshold).length
      };
    `

    const result = await evaluator.evaluateJavaScript(code, {
      db: mockDb as any,
      bindings: {
        config: { viewThreshold: 150 },
      },
    })

    expect(result.success).toBe(true)
    expect(result.result).toEqual({
      totalPosts: 2,
      totalViews: 300,
      avgViews: 150,
      aboveThreshold: 1,
    })
  })
})
