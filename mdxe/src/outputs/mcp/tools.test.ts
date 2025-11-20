import { describe, it, expect, vi } from 'vitest'
import { createDbTools, createMdxTools, DatabaseAdapter } from './tools'

describe('MCP Tools', () => {
  describe('createDbTools', () => {
    it('should create database tools', () => {
      const mockDb: DatabaseAdapter = {
        get: vi.fn().mockResolvedValue({ id: 'test', data: 'test' }),
        list: vi.fn().mockResolvedValue([]),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(0),
        getSchema: vi.fn().mockResolvedValue({}),
      }

      const tools = createDbTools(mockDb)

      expect(tools.size).toBeGreaterThan(0)
      expect(tools.has('db.get')).toBe(true)
      expect(tools.has('db.list')).toBe(true)
      expect(tools.has('db.set')).toBe(true)
      expect(tools.has('db.delete')).toBe(true)
      expect(tools.has('db.schema')).toBe(true)
    })

    it('should call db.get with correct arguments', async () => {
      const mockDb: DatabaseAdapter = {
        get: vi.fn().mockResolvedValue({ id: 'test-123', title: 'Test' }),
        list: vi.fn().mockResolvedValue([]),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(0),
      }

      const tools = createDbTools(mockDb)
      const getTool = tools.get('db.get')

      if (getTool) {
        const result = await getTool.handler({ id: 'test-123' })

        expect(mockDb.get).toHaveBeenCalledWith('test-123')
        expect(result.content[0].text).toContain('test-123')
        expect(result.content[0].text).toContain('Test')
      }
    })

    it('should call db.list with pattern', async () => {
      const mockDb: DatabaseAdapter = {
        get: vi.fn(),
        list: vi.fn().mockResolvedValue([
          { id: 'posts/1', data: { title: 'Post 1' } },
          { id: 'posts/2', data: { title: 'Post 2' } },
        ]),
        set: vi.fn(),
        delete: vi.fn(),
      }

      const tools = createDbTools(mockDb)
      const listTool = tools.get('db.list')

      if (listTool) {
        const result = await listTool.handler({ pattern: 'posts/*' })

        expect(mockDb.list).toHaveBeenCalledWith('posts/*')
        expect(result.content[0].text).toContain('posts/1')
        expect(result.content[0].text).toContain('posts/2')
      }
    })

    it('should call db.set with data', async () => {
      const mockDb: DatabaseAdapter = {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn(),
      }

      const tools = createDbTools(mockDb)
      const setTool = tools.get('db.set')

      if (setTool) {
        const testData = { title: 'New Post', content: 'Content' }
        const result = await setTool.handler({ id: 'posts/new', data: testData })

        expect(mockDb.set).toHaveBeenCalledWith('posts/new', testData)
        expect(result.content[0].text).toContain('success')
      }
    })

    it('should call db.delete with pattern', async () => {
      const mockDb: DatabaseAdapter = {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn().mockResolvedValue(3),
      }

      const tools = createDbTools(mockDb)
      const deleteTool = tools.get('db.delete')

      if (deleteTool) {
        const result = await deleteTool.handler({ pattern: 'drafts/*' })

        expect(mockDb.delete).toHaveBeenCalledWith('drafts/*')
        expect(result.content[0].text).toContain('3')
        expect(result.content[0].text).toContain('Deleted')
      }
    })
  })

  describe('createMdxTools', () => {
    it('should create MDX tools', () => {
      const tools = createMdxTools()

      expect(tools.size).toBeGreaterThan(0)
      expect(tools.has('mdx.compile')).toBe(true)
      expect(tools.has('mdx.render')).toBe(true)
    })

    it('should compile MDX content', async () => {
      const tools = createMdxTools()
      const compileTool = tools.get('mdx.compile')

      if (compileTool) {
        const result = await compileTool.handler({
          content: '# Hello\n\nWorld',
          format: 'function-body',
        })

        expect(result.content[0].text).toBeDefined()
        expect(result.content[0].text.length).toBeGreaterThan(0)
      }
    })

    it('should render MDX to ANSI', async () => {
      const tools = createMdxTools()
      const renderTool = tools.get('mdx.render')

      if (renderTool) {
        const result = await renderTool.handler({
          content: '# Hello\n\nWorld',
          format: 'cli',
        })

        expect(result.content[0].text).toBeDefined()
        expect(result.content[0].text).toContain('Hello')
      }
    })
  })
})
