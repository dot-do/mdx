import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CodeBlock, CodeBlockCode } from '../src/components/code-block'
import React from 'react'

// Mock Shiki
vi.mock('shiki', () => ({
  codeToHtml: vi.fn(),
}))

import { codeToHtml } from 'shiki'

const mockCodeToHtml = vi.mocked(codeToHtml)

describe('CodeBlock', () => {
  it('renders children and applies custom class names', () => {
    render(
      <CodeBlock className='my-custom-class' data-testid='code-block'>
        <p>Hello</p>
      </CodeBlock>,
    )

    const block = screen.getByTestId('code-block')
    expect(block).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(block).toHaveClass('my-custom-class')
  })
})

describe('CodeBlockCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders code block with syntax highlighting', async () => {
    const code = 'console.log("Hello, World!");'
    const language = 'javascript'
    const highlightedHtml =
      '<pre><code><span style="color: #0000ff;">console</span>.<span style="color: #0000ff;">log</span>(<span style="color: #008000;">"Hello, World!"</span>);</code></pre>'

    mockCodeToHtml.mockResolvedValue(highlightedHtml)

    render(<CodeBlockCode code={code} language={language} />)

    await waitFor(() => {
      expect(mockCodeToHtml).toHaveBeenCalledWith(code, {
        lang: language,
        theme: 'dracula',
      })
    })

    // Check that the highlighted HTML is rendered
    const codeElement = await screen.findByRole('code')
    expect(codeElement.textContent).toBe('console.log("Hello, World!");')
  })

  it('renders code block with different language', async () => {
    const code = 'def hello():\n    print("Hello, World!")'
    const language = 'python'
    const highlightedHtml =
      '<pre><code><span style="color: #0000ff;">def</span> hello():\n    <span style="color: #0000ff;">print</span>(<span style="color: #008000;">"Hello, World!"</span>)</code></pre>'

    mockCodeToHtml.mockResolvedValue(highlightedHtml)

    render(<CodeBlockCode code={code} language={language} />)

    await waitFor(() => {
      expect(mockCodeToHtml).toHaveBeenCalledWith(code, {
        lang: language,
        theme: 'dracula',
      })
    })

    const codeElement = await screen.findByRole('code')
    expect(codeElement.textContent).toBe('def hello():\n    print("Hello, World!")')
  })

  it('uses default theme when none provided', async () => {
    const code = 'console.log("test");'
    const language = 'javascript'
    const highlightedHtml = '<pre><code>console.log("test");</code></pre>'

    mockCodeToHtml.mockResolvedValue(highlightedHtml)

    render(<CodeBlockCode code={code} language={language} />)

    await waitFor(() => {
      expect(mockCodeToHtml).toHaveBeenCalledWith(code, {
        lang: language,
        theme: 'dracula',
      })
    })
  })

  it('uses default language when none provided', async () => {
    const code = 'some code'
    const highlightedHtml = '<pre><code>some code</code></pre>'

    mockCodeToHtml.mockResolvedValue(highlightedHtml)

    render(<CodeBlockCode code={code} />)

    await waitFor(() => {
      expect(mockCodeToHtml).toHaveBeenCalledWith(code, {
        lang: 'tsx',
        theme: 'dracula',
      })
    })
  })

  it('handles empty code', async () => {
    const code = ''

    const { container } = render(<CodeBlockCode code={code} />)

    // Should render empty pre/code tags without calling codeToHtml
    expect(container.querySelector('pre > code')).toBeInTheDocument()
    expect(container.querySelector('pre > code')?.textContent).toBe('')
    expect(mockCodeToHtml).not.toHaveBeenCalled()
  })

  it('shows fallback when highlighting is in progress', async () => {
    const code = 'console.log("test");'

    // Don't resolve the promise immediately
    mockCodeToHtml.mockImplementation(() => new Promise(() => {}))

    render(<CodeBlockCode code={code} />)

    // Should show fallback plain text initially
    await waitFor(() => {
      const codeElement = screen.getByText('console.log("test");')
      expect(codeElement).toBeInTheDocument()
      expect(codeElement.tagName).toBe('CODE')
      expect(codeElement.parentElement?.tagName).toBe('PRE')
    })
  })

  it('handles custom theme', async () => {
    const code = 'console.log("test");'
    const language = 'javascript'
    const theme = 'github-light'
    const highlightedHtml = '<pre><code>console.log("test");</code></pre>'

    mockCodeToHtml.mockResolvedValue(highlightedHtml)

    render(<CodeBlockCode code={code} language={language} theme={theme} />)

    await waitFor(() => {
      expect(mockCodeToHtml).toHaveBeenCalledWith(code, {
        lang: language,
        theme: theme,
      })
    })
  })

  it('handles multiline code correctly', async () => {
    const code = 'function test() {\n  console.log("test");\n  return true;\n}'
    const language = 'javascript'
    const highlightedHtml = '<pre><code>function test() {\n  console.log("test");\n  return true;\n}</code></pre>'

    mockCodeToHtml.mockResolvedValue(highlightedHtml)

    render(<CodeBlockCode code={code} language={language} />)

    await waitFor(() => {
      expect(mockCodeToHtml).toHaveBeenCalledWith(code, {
        lang: language,
        theme: 'dracula',
      })
    })

    const codeElement = await screen.findByRole('code')
    expect(codeElement.textContent).toBe('function test() {\n  console.log("test");\n  return true;\n}')
  })

  it('handles rapid re-renders with different props', async () => {
    const code1 = 'console.log("first");'
    const code2 = 'console.log("second");'
    const language = 'javascript'

    mockCodeToHtml.mockResolvedValueOnce('<pre><code>first</code></pre>').mockResolvedValueOnce('<pre><code>second</code></pre>')

    const { rerender } = render(<CodeBlockCode code={code1} language={language} />)

    await waitFor(() => {
      expect(mockCodeToHtml).toHaveBeenCalledWith(code1, {
        lang: language,
        theme: 'dracula',
      })
    })

    rerender(<CodeBlockCode code={code2} language={language} />)

    await waitFor(() => {
      expect(mockCodeToHtml).toHaveBeenCalledWith(code2, {
        lang: language,
        theme: 'dracula',
      })
    })

    expect(mockCodeToHtml).toHaveBeenCalledTimes(2)
  })
})
