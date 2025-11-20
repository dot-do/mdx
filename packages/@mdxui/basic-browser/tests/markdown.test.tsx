import { render, screen, } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Markdown } from '../src/components/markdown'
import React from 'react'

// Mock the CodeBlock component
vi.mock('../src/components/code-block', () => ({
  CodeBlock: ({ children }: { children: React.ReactNode }) => <div data-testid='code-block'>{children}</div>,
  CodeBlockCode: ({ code, language }: { code: string; language: string }) => (
    <div data-testid='code-block-code'>
      <pre>
        <code>{code}</code>
      </pre>
      <div data-testid='code-block-language'>{language}</div>
    </div>
  ),
}))

describe('Markdown Component', () => {
  it('renders basic markdown content', () => {
    const markdown = `# Hello World\n\nThis is a paragraph.`
    render(<Markdown>{markdown}</Markdown>)

    expect(screen.getByRole('heading', { level: 1, name: /Hello World/i })).toBeDefined()
    expect(screen.getByText('This is a paragraph.')).toBeDefined()
  })

  it('renders inline code with correct styling', () => {
    const markdown = 'This is `inline code`.'
    render(<Markdown>{markdown}</Markdown>)

    const inlineCode = screen.getByText('inline code')
    expect(inlineCode).toBeDefined()
    expect(inlineCode.tagName).toBe('SPAN')
    expect(inlineCode).toHaveClass('bg-primary-foreground rounded-sm px-1 font-mono text-sm')
  })

  it('renders fenced code blocks using the custom CodeBlock component', async () => {
    const markdown = "```javascript\nconsole.log('hello');\n```"
    render(<Markdown>{markdown}</Markdown>)

    // Check if the mocked CodeBlock is rendered
    expect(screen.getByTestId('code-block')).toBeInTheDocument()
    expect(screen.getByTestId('code-block-code')).toBeInTheDocument()

    // Check if the code content is passed correctly
    const codeElement = screen.getByText("console.log('hello');")
    expect(codeElement).toBeInTheDocument()

    // Check if language is extracted and passed correctly
    const languageElement = screen.getByTestId('code-block-language')
    expect(languageElement).toHaveTextContent('javascript')
  })

  it('handles code blocks without a specified language', () => {
    const markdown = '```\njust some text\n```'
    render(<Markdown>{markdown}</Markdown>)

    expect(screen.getByTestId('code-block')).toBeInTheDocument()
    expect(screen.getByText('just some text')).toBeInTheDocument()
    const languageElement = screen.getByTestId('code-block-language')
    expect(languageElement).toHaveTextContent('plaintext')
  })

  it('renders a list correctly', () => {
    const markdown = '* one\n* two\n* three'
    render(<Markdown>{markdown}</Markdown>)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
    expect(listItems[0]).toHaveTextContent('one')
    expect(listItems[1]).toHaveTextContent('two')
    expect(listItems[2]).toHaveTextContent('three')
  })
})
