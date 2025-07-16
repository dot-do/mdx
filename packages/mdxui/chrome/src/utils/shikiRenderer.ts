// Shiki renderer utilities extracted from content-shiki.ts
import { codeToHtml } from 'shiki'
import type { ShikiRenderResult, RenderOptions } from '../types/index.js'
import { escapeHtml } from '../utils/domUtils.js'
import { DEFAULT_SHIKI_THEME } from '../constants/index.js'

type CodeToHtmlFunction = typeof codeToHtml

interface SpecialBlock {
  type: 'code' | 'html'
  fullMatch: string
  index: number
  length: number
  isComplete: boolean
  language?: string
  code?: string
  tagName?: string
}

export class ShikiRenderer {
  private codeToHtmlFn: CodeToHtmlFunction | null = null
  private theme = DEFAULT_SHIKI_THEME

  constructor() {
    this.initialize()
  }

  private initialize(): void {
    try {
      console.log('Initializing Shiki renderer...')
      this.codeToHtmlFn = codeToHtml
      console.log('Shiki renderer initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Shiki:', error)
    }
  }

  async render(options: RenderOptions): Promise<ShikiRenderResult> {
    const { content, theme = DEFAULT_SHIKI_THEME } = options
    this.theme = theme

    try {
      let highlightedHtml: string
      let hasCodeBlocks = false
      let hasFrontmatter = false

      if (this.codeToHtmlFn) {
        // Check for YAML frontmatter
        const yamlMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

        if (yamlMatch) {
          hasFrontmatter = true
          const frontmatter = yamlMatch[1]
          const mainContent = yamlMatch[2]

          // Highlight frontmatter as YAML
          const frontmatterHtml = await this.codeToHtmlFn(frontmatter || '', {
            lang: 'yaml',
            theme: this.theme,
          })

          // Process main content with code blocks
          const processedContent = await this.processWithCodeBlocks(mainContent || '', this.codeToHtmlFn)
          hasCodeBlocks = this.hasCodeBlocksInContent(mainContent || '')

          // Combine with frontmatter delimiters
          highlightedHtml = `
            <div class="frontmatter-wrapper">
              <div class="frontmatter-delimiter">---</div>
              ${frontmatterHtml}
              <div class="frontmatter-delimiter">---</div>
            </div>
            ${processedContent}
          `
        } else {
          // No frontmatter, process with code blocks
          highlightedHtml = await this.processWithCodeBlocks(content, this.codeToHtmlFn)
          hasCodeBlocks = this.hasCodeBlocksInContent(content)
        }

        // Make URLs clickable
        highlightedHtml = this.makeURLsClickable(highlightedHtml)
      } else {
        // Fallback rendering
        highlightedHtml = `<pre style="color: #e6edf3; padding: 0 20px; margin: 0; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 15px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;">${escapeHtml(content)}</pre>`
      }

      return {
        html: highlightedHtml,
        hasCodeBlocks,
        hasFrontmatter,
        isStreaming: this.isStreamingContent(content),
      }
    } catch (error) {
      console.error('Shiki rendering error:', error)
      return {
        html: `<pre style="color: #e6edf3; padding: 0 20px; margin: 0; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 15px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;">${escapeHtml(content)}</pre>`,
        hasCodeBlocks: false,
        hasFrontmatter: false,
        isStreaming: false,
      }
    }
  }

  private async processWithCodeBlocks(content: string, codeToHtmlFn: CodeToHtmlFunction): Promise<string> {
    // Regular expressions for different content types
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    const incompleteCodeBlockRegex = /```(\w*)\n([\s\S]*)$/
    const htmlBlockRegex = /<(\w+)(?:\s[^>]*)?>[\s\S]*?<\/\1>|<\w+(?:\s[^>]*)?\s*\/>/g
    const incompleteHtmlBlockRegex = /<(\w+)(?:\s[^>]*)?>[\s\S]*$/

    // Collect all special blocks (code blocks and HTML blocks)
    const specialBlocks: SpecialBlock[] = []

    // Find all complete code blocks
    let match: RegExpExecArray | null
    while ((match = codeBlockRegex.exec(content)) !== null) {
      specialBlocks.push({
        type: 'code',
        fullMatch: match[0],
        language: match[1] || 'text',
        code: match[2],
        index: match.index,
        length: match[0].length,
        isComplete: true,
      })
    }

    // Check for incomplete code block at the end
    const incompleteMatch = content.match(incompleteCodeBlockRegex)
    if (incompleteMatch && !content.endsWith('```')) {
      const incompleteStart = content.lastIndexOf(incompleteMatch[0])
      const isPartOfCompleteBlock = specialBlocks.some(
        (block) => block.type === 'code' && incompleteStart >= block.index && incompleteStart < block.index + block.length,
      )

      if (!isPartOfCompleteBlock) {
        specialBlocks.push({
          type: 'code',
          fullMatch: incompleteMatch[0],
          language: incompleteMatch[1] || 'text',
          code: incompleteMatch[2],
          index: incompleteStart,
          length: incompleteMatch[0].length,
          isComplete: false,
        })
      }
    }

    // Find all HTML blocks (but not those inside code blocks)
    const tempContent = content.replace(codeBlockRegex, (match: string) => ' '.repeat(match.length))
    while ((match = htmlBlockRegex.exec(tempContent)) !== null) {
      const htmlContent = content.slice(match.index, match.index + match[0].length)
      specialBlocks.push({
        type: 'html',
        fullMatch: htmlContent,
        index: match.index,
        length: match[0].length,
        isComplete: true,
      })
    }

    // Check for incomplete HTML block at the end
    const incompleteHtmlMatch = tempContent.match(incompleteHtmlBlockRegex)
    if (incompleteHtmlMatch) {
      const tagName = incompleteHtmlMatch[1]
      const closingTag = `</${tagName}>`

      if (!content.includes(closingTag, content.lastIndexOf(incompleteHtmlMatch[0]))) {
        const incompleteStart = content.lastIndexOf(incompleteHtmlMatch[0])
        const isPartOfCompleteBlock = specialBlocks.some((block) => incompleteStart >= block.index && incompleteStart < block.index + block.length)

        if (!isPartOfCompleteBlock) {
          specialBlocks.push({
            type: 'html',
            fullMatch: incompleteHtmlMatch[0],
            index: incompleteStart,
            length: incompleteHtmlMatch[0].length,
            isComplete: false,
            tagName: tagName,
          })
        }
      }
    }

    // Sort blocks by position
    specialBlocks.sort((a, b) => a.index - b.index)

    // If no special blocks, render as pure markdown
    if (specialBlocks.length === 0) {
      return await codeToHtmlFn(content, {
        lang: 'markdown',
        theme: this.theme,
      })
    }

    // Process content in segments
    let result = ''
    let lastIndex = 0

    for (const block of specialBlocks) {
      // Add markdown content before this block
      if (block.index > lastIndex) {
        const markdownSegment = content.slice(lastIndex, block.index)
        if (markdownSegment.trim()) {
          result += await codeToHtmlFn(markdownSegment, {
            lang: 'markdown',
            theme: this.theme,
          })
        }
      }

      if (block.type === 'code') {
        result += await this.processCodeBlock(block, codeToHtmlFn)
      } else if (block.type === 'html') {
        result += await this.processHtmlBlock(block, codeToHtmlFn)
      }

      lastIndex = block.index + block.length
    }

    // Add any remaining markdown content
    if (lastIndex < content.length) {
      const remainingContent = content.slice(lastIndex)
      if (remainingContent.trim()) {
        result += await codeToHtmlFn(remainingContent, {
          lang: 'markdown',
          theme: this.theme,
        })
      }
    }

    return result
  }

  private async processCodeBlock(block: SpecialBlock, codeToHtmlFn: CodeToHtmlFunction): Promise<string> {
    if (!block.code || !block.language) return ''

    try {
      const codeHtml = await codeToHtmlFn(block.code.trim(), {
        lang: block.language,
        theme: this.theme,
      })

      return (
        `<div class="code-block-wrapper${block.isComplete ? '' : ' incomplete'}">` +
        `<div class="code-block-header">${block.language}${block.isComplete ? '' : '<span class="streaming-indicator">● Streaming...</span>'}</div>` +
        `${codeHtml}` +
        `</div>`
      )
    } catch {
      const fallbackHtml = await codeToHtmlFn(block.code.trim(), {
        lang: 'text',
        theme: this.theme,
      })
      return (
        `<div class="code-block-wrapper${block.isComplete ? '' : ' incomplete'}">` +
        `<div class="code-block-header">${block.language}${block.isComplete ? '' : '<span class="streaming-indicator">● Streaming...</span>'}</div>` +
        `${fallbackHtml}` +
        `</div>`
      )
    }
  }

  private async processHtmlBlock(block: SpecialBlock, codeToHtmlFn: CodeToHtmlFunction): Promise<string> {
    if (block.isComplete) {
      const htmlTagMatch = block.fullMatch.match(/^<(\w+)(?:\s[^>]*)?>(.*)(<\/\1>)$/)

      if (htmlTagMatch) {
        const tagName = htmlTagMatch[1] || ''
        const openingTag = block.fullMatch.substring(0, block.fullMatch.indexOf('>') + 1)
        const innerContent = htmlTagMatch[2] || ''
        const closingTag = htmlTagMatch[3] || ''

        let processedInner = ''
        if (innerContent.trim()) {
          if (tagName.toLowerCase() === 'usage') {
            processedInner = await codeToHtmlFn(innerContent.trim(), {
              lang: 'yaml',
              theme: this.theme,
            })
          } else {
            processedInner = await this.processWithCodeBlocks(innerContent, codeToHtmlFn)
          }
        }

        const openingTagHtml = await codeToHtmlFn(openingTag, {
          lang: 'html',
          theme: this.theme,
        })

        const closingTagHtml = await codeToHtmlFn(closingTag, {
          lang: 'html',
          theme: this.theme,
        })

        return (
          `<div class="html-block-wrapper${tagName.toLowerCase() === 'usage' ? ' usage-block' : ''}">` +
          `<div class="html-tag">${openingTagHtml}</div>` +
          `<div class="html-content">${processedInner}</div>` +
          `<div class="html-tag">${closingTagHtml}</div>` +
          `</div>`
        )
      } else {
        const htmlHighlighted = await codeToHtmlFn(block.fullMatch, {
          lang: 'html',
          theme: this.theme,
        })
        return `<div class="html-block-wrapper">${htmlHighlighted}</div>`
      }
    } else {
      const openingTagMatch = block.fullMatch.match(/^<(\w+)(?:\s[^>]*)?>(.*)$/)
      if (openingTagMatch) {
        const tagName = openingTagMatch[1] || ''
        const openingTag = block.fullMatch.substring(0, block.fullMatch.indexOf('>') + 1)
        const innerContent = openingTagMatch[2] || ''

        let processedInner = ''
        if (innerContent.trim()) {
          if (tagName.toLowerCase() === 'usage') {
            processedInner = await codeToHtmlFn(innerContent.trim(), {
              lang: 'yaml',
              theme: this.theme,
            })
          } else {
            processedInner = await this.processWithCodeBlocks(innerContent, codeToHtmlFn)
          }
        }

        const openingTagHtml = await codeToHtmlFn(openingTag, {
          lang: 'html',
          theme: this.theme,
        })

        return (
          `<div class="html-block-wrapper${tagName.toLowerCase() === 'usage' ? ' usage-block' : ''} incomplete">` +
          `<div class="html-tag">${openingTagHtml}</div>` +
          `<div class="html-content">${processedInner}</div>` +
          `<div class="html-tag streaming-tag"><span class="streaming-indicator">● Waiting for </${tagName}>...</span></div>` +
          `</div>`
        )
      }
    }
    return ''
  }

  private makeURLsClickable(html: string): string {
    const urlRegex = /(https?:\/\/[^\s<>"']+)/g

    const processTextNode = (text: string): string => {
      return text.replace(urlRegex, (url: string) => {
        const cleanUrl = url.replace(/[.,;:!?]+$/, '')
        const trailingPunct = url.slice(cleanUrl.length)
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #58a6ff; text-decoration: underline;">${cleanUrl}</a>${trailingPunct}`
      })
    }

    return html.replace(/>([^<]+)</g, (_match: string, textContent: string) => {
      return `>${processTextNode(textContent)}<`
    })
  }

  private hasCodeBlocksInContent(content: string): boolean {
    return /```[\s\S]*?```/.test(content)
  }

  private isStreamingContent(content: string): boolean {
    // Check for incomplete code blocks or HTML blocks
    const incompleteCodeBlock = /```\w*\n[\s\S]*$/.test(content) && !content.endsWith('```')
    const incompleteHtmlBlock = /<\w+(?:\s[^>]*)?>[\s\S]*$/.test(content) && !/.*<\/\w+>\s*$/.test(content)
    return incompleteCodeBlock || incompleteHtmlBlock
  }

  getShikiStyles(): string {
    return `
      .frontmatter-wrapper {
        margin: 0;
        overflow: hidden;
      }
      
      .frontmatter-delimiter {
        padding: 0 20px;
        background-color: #0d1117;
        color: #7d8590;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 14px;
      }
      
      .code-block-wrapper {
        margin: 0 0 30px 0;
        border: 1px solid #30363d;
        border-radius: 6px;
        overflow: hidden;
      }
      
      .code-block-wrapper.incomplete {
        border-color: #f85149;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { border-color: #f85149; }
        50% { border-color: #ff7b72; }
      }
      
      .code-block-header {
        background-color: #21262d;
        color: #7d8590;
        padding: 8px 16px;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 12px;
        border-bottom: 1px solid #30363d;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .streaming-indicator {
        color: #f85149;
        font-weight: bold;
        animation: blink 1s infinite;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
      
      .html-block-wrapper {
        overflow: hidden;
      }
      
      .html-block-wrapper.incomplete {
        border-color: #f85149;
        animation: pulse 2s infinite;
      }
      
      .html-block-wrapper.usage-block {
        border-color: #1f6feb;
      }
      
      .html-tag {
        background-color: #21262d;
      }
      
      .html-content {
        padding: 0 20px;
        background-color: #0d1117;
      }
      
      .streaming-tag {
        background-color: #21262d;
        color: #7d8590;
        padding: 8px 16px;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      /* Override Shiki styles for better integration */
      pre {
        margin: 0 !important;
        padding: 0 20px !important;
        background-color: #0d1117 !important;
        overflow-x: auto !important;
        font-size: 15px !important;
        line-height: 1.4 !important;
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
      }
      
      code {
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace !important;
      }
      
      .shiki {
        background-color: #0d1117 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
      }
      
      .shiki + .shiki,
      .code-block-wrapper + .code-block-wrapper {
        margin-top: 30px !important;
      }
      
      a {
        color: #58a6ff !important;
        text-decoration: underline !important;
      }
      
      a:hover {
        color: #79c0ff !important;
      }
      
      a:visited {
        color: #bc8cff !important;
      }
    `
  }
}
