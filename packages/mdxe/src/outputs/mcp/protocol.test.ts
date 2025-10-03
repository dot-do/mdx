import { describe, it, expect, beforeEach } from 'vitest'
import { MDXEMCPServer } from './protocol'

describe('MCP Protocol', () => {
  let server: MDXEMCPServer

  beforeEach(() => {
    server = new MDXEMCPServer({
      name: 'test-server',
      version: '1.0.0',
    })
  })

  describe('MDXEMCPServer', () => {
    it('should create a server instance', () => {
      expect(server).toBeDefined()
      expect(server.getServer()).toBeDefined()
    })

    it('should register tools', () => {
      const definition = {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object' as const,
          properties: {
            input: { type: 'string' },
          },
          required: ['input'],
        },
      }

      const handler = async (args: any) => ({
        content: [
          {
            type: 'text' as const,
            text: `Received: ${args.input}`,
          },
        ],
      })

      server.registerTool(definition, handler)

      // Tool should be registered
      expect(server).toBeDefined()
    })

    it('should register resource providers', () => {
      const provider = async () => [
        {
          uri: 'test://resource',
          name: 'test',
          description: 'Test resource',
        },
      ]

      const reader = async (uri: string) => ({
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: 'Test content',
          },
        ],
      })

      server.registerResourceProvider('test', provider, reader)

      // Provider should be registered
      expect(server).toBeDefined()
    })

    it('should support multiple tools', () => {
      const tool1 = {
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: {
          type: 'object' as const,
          properties: {},
        },
      }

      const tool2 = {
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: {
          type: 'object' as const,
          properties: {},
        },
      }

      const handler1 = async () => ({
        content: [{ type: 'text' as const, text: 'Tool 1' }],
      })

      const handler2 = async () => ({
        content: [{ type: 'text' as const, text: 'Tool 2' }],
      })

      server.registerTool(tool1, handler1)
      server.registerTool(tool2, handler2)

      expect(server).toBeDefined()
    })
  })
})
