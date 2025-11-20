// Streaming content script with TypeScript and mode switching

import * as monaco from 'monaco-editor'
import { createHighlighter } from 'shiki/bundle/web'
import { DEFAULT_SHIKI_THEME, RENDER_DEBOUNCE_MS, SCROLL_THRESHOLD_PX, SUPPORTED_LANGUAGES } from './constants/index.js'
import { getCurrentUrl, getDocumentMimeType } from './utils/chrome-utils.js'
import { checkIfMarkdownFile, detectFileTypeFromUrl, detectPageLanguage, isSupportedFile } from './utils/file-detection.js'
import { createMonacoEditor, initializeMonaco, setupMonacoThemes } from './utils/monaco-renderer.js'

console.log('MDX Chrome Extension: Unified streaming script loaded')

// Global state - keep it simple like the working code
let container: HTMLDivElement | null = null
let originalBody: HTMLDivElement | null = null
let lastContent = ''
let renderTimeout: ReturnType<typeof setTimeout> | null = null
let isMarkdownFile = false
let autoScrollEnabled = false
let hasUserScrolled = false

// Mode switching state
let currentMode: 'browse' | 'edit' = 'browse'
let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null
let monacoInitialized = false

// Initialize Shiki highlighter
let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null

async function initializeShiki() {
  try {
    console.log('Initializing Shiki highlighter...')
    highlighter = await createHighlighter({
      themes: [DEFAULT_SHIKI_THEME], // Use theme name string
      langs: [...SUPPORTED_LANGUAGES], // Spread to create mutable array
    })
    console.log('Shiki highlighter initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize Shiki:', error)
    return false
  }
}

// Helper function to use highlighter or fallback
function codeToHtmlFn(code: string, options: { lang: string; theme: string }) {
  if (highlighter) {
    return highlighter.codeToHtml(code, {
      lang: options.lang,
      theme: options.theme || DEFAULT_SHIKI_THEME,
    })
  }
  // Fallback - should rarely happen
  return `<pre><code>${escapeHtml(code)}</code></pre>`
}

function checkIfMarkdown() {
  const url = getCurrentUrl()
  const mimeType = getDocumentMimeType()

  console.log('Checking if markdown - URL:', url, 'MIME type:', mimeType)

  const fileInfo = detectFileTypeFromUrl(url)
  const isSupported = isSupportedFile(url, mimeType) || checkIfMarkdownFile()

  console.log('File info:', fileInfo)
  console.log('Is supported file:', isSupported)

  return fileInfo.isSupported || isSupported
}

// Direct port of user's processMarkdownWithCodeBlocks function
async function processMarkdownWithCodeBlocks(content: string): Promise<string> {
  try {
    // Regular expressions for different content types
    const codeBlockRegex = /```([\w-]+)\s*(.*?)\n([\s\S]*?)```/g
    const incompleteCodeBlockRegex = /```([\w-]+)\s*(.*?)\n([\s\S]*)$/
    const htmlBlockRegex = /<(\w+)(?:\s[^>]*)?>[\s\S]*?<\/\1>|<\w+(?:\s[^>]*)?\s*\/>/g
    const incompleteHtmlBlockRegex = /<(\w+)(?:\s[^>]*)?>[\s\S]*$/

    // Collect all special blocks (code blocks and HTML blocks)
    const specialBlocks: Array<{
      type: 'code' | 'html'
      fullMatch: string
      language?: string
      code?: string
      index: number
      length: number
      isComplete: boolean
      tagName?: string
    }> = []

    // Find all complete code blocks
    let match: RegExpExecArray | null
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text'
      const attributes = match[2] || ''
      let code = match[3] || ''

      // Heuristic to check if attributes are actually the first line of code
      const looksLikeAttributes = /^\s*[\w-]+\s*=/.test(attributes)
      let header = language
      if (looksLikeAttributes && attributes.trim().length > 0) {
        header = `${language} ${attributes}`
      } else if (!looksLikeAttributes && attributes.trim().length > 0) {
        // It's likely the first line of code, prepend it back
        code = `${attributes}\n${code}`
      }

      specialBlocks.push({
        type: 'code',
        fullMatch: match[0],
        language: header,
        code,
        index: match.index,
        length: match[0].length,
        isComplete: true,
      })
    }

    // Check for incomplete code block at the end
    const incompleteMatch = content.match(incompleteCodeBlockRegex)
    if (incompleteMatch && !content.endsWith('```')) {
      // Make sure this isn't already part of a complete block
      const incompleteStart = content.lastIndexOf(incompleteMatch[0])
      const isPartOfCompleteBlock = specialBlocks.some(
        (block) => block.type === 'code' && incompleteStart >= block.index && incompleteStart < block.index + block.length,
      )

      if (!isPartOfCompleteBlock) {
        const language = incompleteMatch[1] || 'text'
        const attributes = incompleteMatch[2] || ''
        let code = incompleteMatch[3] || ''

        // Heuristic to check if attributes are actually the first line of code
        const looksLikeAttributes = /^\s*[\w-]+\s*=/.test(attributes)
        let header = language
        if (looksLikeAttributes && attributes.trim().length > 0) {
          header = `${language} ${attributes}`
        } else if (!looksLikeAttributes && attributes.trim().length > 0) {
          // It's likely the first line of code, prepend it back
          code = `${attributes}\n${code}`
        }

        specialBlocks.push({
          type: 'code',
          fullMatch: incompleteMatch[0],
          language: header,
          code,
          index: incompleteStart,
          length: incompleteMatch[0].length,
          isComplete: false,
        })
      }
    }

    // Find all HTML blocks (but not those inside code blocks)
    const tempContent = content.replace(codeBlockRegex, (match) => ' '.repeat(match.length))
    while ((match = htmlBlockRegex.exec(tempContent)) !== null) {
      // Extract the original HTML from the content
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

      const incompleteStart = content.lastIndexOf(incompleteHtmlMatch[0])

      // Check if there's a proper closing tag after this opening tag
      const remainingContent = content.slice(incompleteStart)
      const openingTagEnd = remainingContent.indexOf('>') + 1
      const contentAfterOpeningTag = remainingContent.slice(openingTagEnd)

      // Only consider it incomplete if there's no matching closing tag
      if (!contentAfterOpeningTag.includes(closingTag)) {
        // Make sure this isn't already part of a complete block
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
      return codeToHtmlFn(content, {
        lang: 'markdown',
        theme: DEFAULT_SHIKI_THEME,
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
          result += codeToHtmlFn(markdownSegment, {
            lang: 'markdown',
            theme: DEFAULT_SHIKI_THEME,
          })
        }
      }

      if (block.type === 'code') {
        // Handle code block
        try {
          const lang = block.language?.split(' ')[0] || 'text'
          const codeHtml = codeToHtmlFn(block.code?.trim() || '', {
            lang,
            theme: DEFAULT_SHIKI_THEME,
          })

          result +=
            `<div class="code-block-wrapper${block.isComplete ? '' : ' incomplete'}">` +
            `<div class="code-block-header">${block.language}${block.isComplete ? '' : ''}</div>` +
            `${codeHtml}` +
            `</div>`
        } catch {
          const fallbackHtml = codeToHtmlFn(block.code?.trim() || '', {
            lang: 'text',
            theme: DEFAULT_SHIKI_THEME,
          })
          result +=
            `<div class="code-block-wrapper${block.isComplete ? '' : ' incomplete'}">` +
            `<div class="code-block-header">${block.language}${block.isComplete ? '' : ''}</div>` +
            `${fallbackHtml}` +
            `</div>`
        }
      } else if (block.type === 'html') {
        // Handle HTML block - extract content and process markdown inside
        if (block.isComplete) {
          const htmlTagMatch = block.fullMatch.match(/^<(\w+)(?:\s[^>]*)?>(.*)(<\/\1>)$/s)

          if (htmlTagMatch) {
            const tagName = htmlTagMatch[1] || 'div'
            const openingTag = block.fullMatch.substring(0, block.fullMatch.indexOf('>') + 1)
            const innerContent = htmlTagMatch[2] || ''
            const closingTag = htmlTagMatch[3] || ''

            // Process the inner content based on tag type
            let processedInner = ''
            if (innerContent.trim()) {
              if (tagName.toLowerCase() === 'usage') {
                // Treat content inside <usage> tags as YAML
                processedInner = codeToHtmlFn(innerContent.trim(), {
                  lang: 'yaml',
                  theme: DEFAULT_SHIKI_THEME,
                })
              } else if (tagName.toLowerCase() === 'note') {
                // Process content inside <Note> as a single markdown block
                processedInner = await processMarkdownWithCodeBlocks(innerContent.trim())
              } else {
                // Process as markdown (recursively) for other tags
                processedInner = await processMarkdownWithCodeBlocks(unIndent(innerContent).trim())
              }
            }

            if (tagName.toLowerCase() === 'note') {
              result += `<div class="html-block-wrapper note-block">` + `${processedInner}` + `</div>`
            } else {
              // Highlight the opening and closing tags
              const openingTagHtml = codeToHtmlFn(openingTag, {
                lang: 'html',
                theme: DEFAULT_SHIKI_THEME,
              })

              const closingTagHtml = codeToHtmlFn(closingTag, {
                lang: 'html',
                theme: DEFAULT_SHIKI_THEME,
              })

              result +=
                `<div class="html-block-wrapper${tagName.toLowerCase() === 'usage' ? ' usage-block' : ''}">` +
                `<div class="html-tag">${openingTagHtml}</div>` +
                `<div class="html-content">${processedInner}</div>` +
                `<div class="html-tag">${closingTagHtml}</div>` +
                `</div>`
            }
          } else {
            // Self-closing tag or malformed - just highlight as HTML
            const htmlHighlighted = codeToHtmlFn(block.fullMatch, {
              lang: 'html',
              theme: DEFAULT_SHIKI_THEME,
            })

            result += `<div class="html-block-wrapper">${htmlHighlighted}</div>`
          }
        } else {
          // Incomplete HTML block
          const openingTagMatch = block.fullMatch.match(/^<(\w+)(?:\s[^>]*)?>(.*)$/s)
          if (openingTagMatch) {
            const tagName = openingTagMatch[1] || 'div'
            const openingTag = block.fullMatch.substring(0, block.fullMatch.indexOf('>') + 1)
            const innerContent = openingTagMatch[2] || ''

            // Process the inner content based on tag type
            let processedInner = ''
            if (innerContent.trim()) {
              if (tagName.toLowerCase() === 'usage') {
                // Treat content inside <usage> tags as YAML
                processedInner = codeToHtmlFn(innerContent.trim(), {
                  lang: 'yaml',
                  theme: DEFAULT_SHIKI_THEME,
                })
              } else if (tagName.toLowerCase() === 'thinking') {
                // Treat content inside <thinking> tags as markdown
                processedInner = await processMarkdownWithCodeBlocks(innerContent.trim())
              } else {
                // Process as markdown (recursively) for other tags
                processedInner = await processMarkdownWithCodeBlocks(unIndent(innerContent).trim())
              }
            }

            // Highlight the opening tag
            const openingTagHtml = codeToHtmlFn(openingTag, {
              lang: 'html',
              theme: DEFAULT_SHIKI_THEME,
            })

            result +=
              `<div class="html-block-wrapper${tagName.toLowerCase() === 'usage' ? ' usage-block' : ''} incomplete">` +
              `<div class="html-tag">${openingTagHtml}</div>` +
              `<div class="html-content">${processedInner}</div>` +
              `</div>`
          }
        }
      }

      lastIndex = block.index + block.length
    }

    // Add any remaining markdown content
    if (lastIndex < content.length) {
      const remainingContent = content.slice(lastIndex)
      if (remainingContent.trim()) {
        result += codeToHtmlFn(remainingContent, {
          lang: 'markdown',
          theme: DEFAULT_SHIKI_THEME,
        })
      }
    }

    return result
  } catch (error) {
    console.error('Chrome Extension: Error in processMarkdownWithCodeBlocks:', error)
    // Return a safe fallback rendering
    return `<pre style="color: #e6edf3; padding: 20px; margin: 0; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 15px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;">${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
  }
}

// Direct port of user's makeUrlsClickable function
function makeUrlsClickable(html: string): string {
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g

  const processTextNode = (text: string) => {
    return text.replace(urlRegex, (url) => {
      const cleanUrl = url.replace(/[.,;:!?]+$/, '')
      const trailingPunct = url.slice(cleanUrl.length)
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #58a6ff; text-decoration: underline;">${cleanUrl}</a>${trailingPunct}`
    })
  }

  return html.replace(/>([^<]+)</g, (_match, textContent) => {
    return `>${processTextNode(textContent)}<`
  })
}

// Direct port of user's auto-scroll functions
function isAtBottom(): boolean {
  // Check if user is scrolled to near the bottom (within threshold)
  const scrollPosition = window.scrollY + window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  return documentHeight - scrollPosition < SCROLL_THRESHOLD_PX
}

function scrollToBottom(): void {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth',
  })
}

// Direct port of user's escapeHtml function
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m] || m)
}

function unIndent(text: string): string {
  // Find the minimum indentation of non-empty lines
  const lines = text.split('\n')
  const minIndent = lines.reduce((min, line) => {
    if (line.trim() === '') return min
    const indent = line.match(/^\s*/)?.[0].length ?? 0
    return Math.min(min, indent)
  }, Infinity)

  if (minIndent === Infinity) return text

  // Remove the minimum indentation from each line
  return lines.map((line) => line.substring(minIndent)).join('\n')
}

// Render markdown content - direct port from working code
async function renderMarkdownContent(content: string): Promise<void> {
  if (!container) {
    container = document.createElement('div')
    container.style.cssText = `
      margin: 0;
      padding: 0;
      background-color: transparent;
      min-height: 100vh;
    `

    // Hide original body content
    if (originalBody) {
      originalBody.style.display = 'none'
    }

    // Insert our container
    if (document.body) {
      document.body.insertBefore(container, document.body.firstChild)
    } else {
      // If body doesn't exist yet, wait for it
      const observer = new MutationObserver(() => {
        if (document.body) {
          document.body.insertBefore(container!, document.body.firstChild)
          observer.disconnect()
        }
      })
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      })
    }

    addShikiBaseStyles()
  }

  try {
    let highlightedHtml: string

    // Process all content as markdown (like the original working code that supported streaming)
    // Check for YAML frontmatter first
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

    if (yamlMatch) {
      // Separate frontmatter and content
      const frontmatter = yamlMatch[1] || ''
      const mainContent = yamlMatch[2] || ''

      // Highlight frontmatter as YAML
      const frontmatterHtml = codeToHtmlFn(frontmatter, {
        lang: 'yaml',
        theme: DEFAULT_SHIKI_THEME,
      })

      // Process main content with code blocks (supports streaming)
      const processedContent = await processMarkdownWithCodeBlocks(mainContent)

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
      // No frontmatter - check if this looks like a code file that should be wrapped
      if (!isMarkdownFile && content.trim() && !content.includes('```')) {
        // This looks like a pure code file (JavaScript, Python, etc.) - wrap it for streaming
        const detectedLang = detectPageLanguage()
        console.log(`Wrapping non-markdown content as ${detectedLang} code block for streaming`)

        // Create an incomplete code block (without closing ```) to enable streaming indicators
        const wrappedContent = '```' + detectedLang + '\n' + content
        highlightedHtml = await processMarkdownWithCodeBlocks(wrappedContent)
      } else {
        // Process all content with code blocks (this supports streaming naturally)
        highlightedHtml = await processMarkdownWithCodeBlocks(content)
      }
    }

    // Make URLs clickable
    highlightedHtml = makeUrlsClickable(highlightedHtml)

    // Wrap in Shiki content wrapper for proper spacing
    container.innerHTML = `<div class="shiki-content-wrapper">${highlightedHtml}</div>`
  } catch (error) {
    console.error('Rendering error:', error)
    container.innerHTML = `<pre style="color: #e6edf3; padding: 0 20px; margin: 0; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 15px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;">${escapeHtml(content)}</pre>`
  }
}

// Render Monaco editor for edit mode
async function renderEditMode(content: string): Promise<void> {
  if (!container) return

  console.log('Attempting to render edit mode...')

  // Try Monaco first, fallback to textarea if it fails
  try {
    console.log('Trying Monaco editor...')

    // Initialize Monaco if not already done
    if (!monacoInitialized) {
      console.log('Initializing Monaco...')
      await initializeMonaco()
      setupMonacoThemes()
      monacoInitialized = true
      console.log('Monaco initialized successfully')
    }

    // Create a fresh container for Monaco to avoid context conflicts
    container.innerHTML = ''
    const monacoContainer = document.createElement('div')
    monacoContainer.id = 'monaco-container'
    monacoContainer.style.cssText = `
      width: 100%;
      height: 100vh;
      margin: 0;
      padding: 0;
    `

    // Add thin scrollbar styles for Monaco
    const scrollbarStyle = document.createElement('style')
    scrollbarStyle.textContent = `
      .monaco-editor .monaco-scrollable-element > .scrollbar > .slider {
        background: rgba(255, 255, 255, 0.2) !important;
        border-radius: 3px !important;
      }
      .monaco-editor .monaco-scrollable-element > .scrollbar > .slider:hover {
        background: rgba(255, 255, 255, 0.3) !important;
      }
      .monaco-editor .monaco-scrollable-element > .scrollbar {
        background: transparent !important;
      }
      .monaco-editor .monaco-scrollable-element > .scrollbar.vertical {
        width: 8px !important;
      }
    `
    if (!document.getElementById('monaco-scrollbar-style')) {
      scrollbarStyle.id = 'monaco-scrollbar-style'
      document.head.appendChild(scrollbarStyle)
    }
    container.appendChild(monacoContainer)

    // Create Monaco editor
    console.log('Creating Monaco editor...')
    const detectedLang = detectPageLanguage()
    console.log(`Using detected language for Monaco: ${detectedLang}`)
    monacoEditor = await createMonacoEditor(monacoContainer, {
      content: content || '',
      language: detectedLang,
      theme: 'github-dark',
      readOnly: false,
    })

    // Set up resize handler
    const resizeHandler = () => {
      if (monacoEditor) {
        monacoEditor.layout()
      }
    }
    window.addEventListener('resize', resizeHandler)

    console.log('Edit mode rendering complete with Monaco')
  } catch (error) {
    console.error('Error rendering edit mode:', error)

    // Fallback to textarea with better styling (from CDN version)
    container.innerHTML = `
      <div style="padding: var(--content-padding-x, 20px); height: 100vh; box-sizing: border-box;">
        <div style="
          background-color: #21262d;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 20px;
          color: #f85149;
        ">
          <strong>Monaco Editor Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}<br>
          Falling back to basic textarea.
        </div>
        <textarea id="fallback-editor" style="
          width: 100%;
          height: calc(100vh - 120px);
          background-color: #21262d;
          color: #e6edf3;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 16px;
          font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          outline: none;
          box-sizing: border-box;
        ">${escapeHtml(content || '')}</textarea>
      </div>
    `

    // For fallback textarea, we'll handle it separately without Monaco
    const textarea = document.getElementById('fallback-editor') as HTMLTextAreaElement
    if (textarea) {
      // Don't set monacoEditor for fallback case - handle separately in switchMode
      monacoEditor = null
    }
  }
}

// Debounced render function - exact copy from working code
function debounceRender(content: string): void {
  // Clear any pending render
  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }

  // Schedule a new render
  renderTimeout = setTimeout(async () => {
    if (currentMode === 'browse') {
      console.log(`Streaming render - content length: ${content.length}`)
      await renderMarkdownContent(content)

      // Only auto-scroll if user has scrolled and they're currently at the bottom
      if (hasUserScrolled && autoScrollEnabled) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          scrollToBottom()
        }, 10)
      }
    }
    // Edit mode doesn't need re-rendering
  }, RENDER_DEBOUNCE_MS) // Reduced debounce for faster updates
}

// Extract text content from DOM - direct port from working code
function extractTextContent(node: Node): string {
  // Extract text content from a node, handling various cases
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || ''
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element

    // Skip our own container
    if (node === container) return ''

    // Skip style and script elements to avoid including CSS/JS in content
    if (element.tagName === 'STYLE' || element.tagName === 'SCRIPT') {
      return ''
    }

    let text = ''
    for (const child of Array.from(node.childNodes)) {
      text += extractTextContent(child)
    }
    return text
  }
  return ''
}

function getCurrentContent(): string {
  if (!originalBody) return ''
  return extractTextContent(originalBody)
}

// Mode switching function
async function switchMode(): Promise<void> {
  console.log(`Switching from ${currentMode} mode`)

  // Get current content if in edit mode
  let contentToUse = lastContent
  if (currentMode === 'edit' && monacoEditor) {
    try {
      const editorContent = monacoEditor.getValue()
      if (editorContent !== undefined && typeof editorContent === 'string') {
        contentToUse = editorContent
        lastContent = contentToUse
        console.log('Got content from Monaco editor, length:', contentToUse.length)
      } else {
        console.warn('Monaco editor returned invalid content, using last known content')
      }
    } catch (error) {
      console.warn('Failed to get content from Monaco editor:', error)
      // Fallback: check if we have a textarea instead
      const textarea = document.getElementById('fallback-editor') as HTMLTextAreaElement
      if (textarea) {
        contentToUse = textarea.value
        lastContent = contentToUse
        console.log('Got content from fallback textarea, length:', contentToUse.length)
      }
    }
  }

  // Switch mode
  const previousMode = currentMode
  currentMode = currentMode === 'browse' ? 'edit' : 'browse'

  // Clean up Monaco if switching away from edit
  if (previousMode === 'edit' && monacoEditor) {
    console.log('Disposing Monaco editor')
    monacoEditor.dispose()
    monacoEditor = null
  }

  // Render new mode
  if (currentMode === 'browse') {
    console.log('Rendering browse mode with content length:', contentToUse.length)
    await renderMarkdownContent(contentToUse)
  } else {
    console.log('Rendering edit mode with content length:', contentToUse.length)
    await renderEditMode(contentToUse)
  }

  console.log(`Switched to ${currentMode} mode`)
}

// Setup streaming observer - direct port from working code
function setupStreamingObserver(): void {
  console.log('Setting up streaming observer...')

  // Set up scroll listener to detect manual scrolling
  window.addEventListener(
    'scroll',
    () => {
      // Mark that user has scrolled
      hasUserScrolled = true

      // Enable auto-scroll if user scrolls to bottom, disable if they scroll away
      if (isAtBottom()) {
        autoScrollEnabled = true
      } else {
        autoScrollEnabled = false
      }
    },
    { passive: true },
  )

  // Set up scroll listener to detect manual scrolling
  window.addEventListener(
    'scroll',
    () => {
      // Mark that user has scrolled
      hasUserScrolled = true

      // Chat interface behavior: disable auto-scroll only when user scrolls away from bottom
      if (isAtBottom()) {
        autoScrollEnabled = true // Re-enable when user scrolls back to bottom
      } else {
        autoScrollEnabled = false // Disable when user scrolls up/away from bottom
      }
    },
    { passive: true },
  )

  // Create a wrapper div to hold the original content
  originalBody = document.createElement('div')
  originalBody.id = 'chrome-markdown-original'

  // Function to move all body content to our wrapper
  const moveBodyContent = () => {
    while (document.body.firstChild) {
      if (document.body.firstChild === container || document.body.firstChild === originalBody) {
        document.body.removeChild(document.body.firstChild)
      } else {
        originalBody!.appendChild(document.body.firstChild)
      }
    }
    document.body.appendChild(originalBody!)
    if (container) {
      document.body.insertBefore(container, originalBody!)
    }
  }

  // Wait for body to exist
  if (document.body) {
    moveBodyContent()

    // Initial render - immediate, no debounce
    const initialContent = getCurrentContent()
    if (initialContent) {
      lastContent = initialContent
      console.log('Initial render - content length:', initialContent.length)
      // Render immediately for page load
      if (currentMode === 'browse') {
        renderMarkdownContent(initialContent).then(() => {
          // Auto-scroll after initial render
          if (autoScrollEnabled) {
            setTimeout(() => {
              scrollToBottom()
            }, 10)
          }
        })
      }
    }

    // Observe changes to the original body wrapper
    const contentObserver = new MutationObserver((mutations) => {
      console.log(`🔄 Mutation observer fired with ${mutations.length} mutations`)
      mutations.forEach((mutation, i) => {
        console.log(
          `  Mutation ${i}: type=${mutation.type}, target=${mutation.target.nodeName}, addedNodes=${mutation.addedNodes.length}, removedNodes=${mutation.removedNodes.length}`,
        )
      })

      // Only update content if we're in browse mode (not edit mode)
      if (currentMode === 'browse') {
        const currentContent = getCurrentContent()
        console.log(`📝 Current content length: ${currentContent.length}, last content length: ${lastContent.length}`)
        if (currentContent !== lastContent) {
          console.log(`✅ Content changed - old length: ${lastContent.length}, new length: ${currentContent.length}`)
          console.log(`📄 First 100 chars: ${currentContent.substring(0, 100)}...`)
          lastContent = currentContent

          debounceRender(currentContent)
        } else {
          console.log('❌ Mutation detected but content unchanged')
        }
      } else {
        console.log(`⏸️ Not in browse mode (current: ${currentMode})`)
      }
    })

    contentObserver.observe(originalBody!, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    // Also observe direct additions to body (in case content is added outside our wrapper)
    const bodyAdditionObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node !== container && node !== originalBody && node.nodeType === Node.ELEMENT_NODE) {
            try {
              // Move new content to our wrapper
              originalBody!.appendChild(node)
            } catch (e) {
              // Ignore hierarchy errors - node might already be in the right place
              console.warn('Could not move node:', e)
            }
          }
        }
      }
    })

    bodyAdditionObserver.observe(document.body, {
      childList: true,
    })

    console.log('Streaming observer active')
  } else {
    const bodyObserver = new MutationObserver(() => {
      if (document.body) {
        bodyObserver.disconnect()
        moveBodyContent()

        // Initial render and observer setup (same as above) - immediate, no debounce
        const initialContent = getCurrentContent()
        if (initialContent) {
          lastContent = initialContent
          console.log('Initial render (body ready) - content length:', initialContent.length)
          // Render immediately for page load
          if (currentMode === 'browse') {
            renderMarkdownContent(initialContent).then(() => {
              // Auto-scroll after initial render
              if (autoScrollEnabled) {
                setTimeout(() => {
                  scrollToBottom()
                }, 10)
              }
            })
          }
        }

        const contentObserver = new MutationObserver(() => {
          // Only update content if we're in browse mode (not edit mode)
          if (currentMode === 'browse') {
            const currentContent = getCurrentContent()
            if (currentContent !== lastContent) {
              lastContent = currentContent
              debounceRender(currentContent)
            }
          }
        })

        contentObserver.observe(originalBody!, {
          childList: true,
          subtree: true,
          characterData: true,
        })

        const bodyAdditionObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of Array.from(mutation.addedNodes)) {
              if (node !== container && node !== originalBody && node.nodeType === Node.ELEMENT_NODE) {
                try {
                  originalBody!.appendChild(node)
                } catch (e) {
                  console.warn('Could not move node:', e)
                }
              }
            }
          }
        })

        bodyAdditionObserver.observe(document.body, {
          childList: true,
        })

        console.log('Streaming observer active')
      }
    })

    bodyObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  }
}

// Add styles - direct port from working code with mode toggle
function addShikiBaseStyles(): void {
  // Inject critical styles immediately to prevent flash, even without head
  const immediateStyle = document.createElement('style')
  immediateStyle.id = 'chrome-markdown-immediate'
  immediateStyle.textContent = `
    html, body {
      background-color: #0A0C10 !important;
      color: #e6edf3 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  `

  // Inject immediately wherever possible
  if (document.head) {
    document.head.appendChild(immediateStyle)
  } else if (document.documentElement) {
    document.documentElement.appendChild(immediateStyle)
  }

  // Wait for head to exist for full styles
  const addStylesImpl = () => {
    const style = document.createElement('style')
    style.textContent = `
    :root {
        --content-padding-x: 20px; /* Mobile default */
        --un-ring-offset-shadow: 0 0 rgb(0 0 0 / 0);
        --un-ring-shadow: 0 0 rgb(0 0 0 / 0);
        --un-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      }
      
      @media (min-width: 768px) {
        :root {
          --content-padding-x: 32px; /* Desktop */
        }
      }
        
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #0A0C10 !important;
      color: #e6edf3 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif !important;
      font-size: 16px !important;
      line-height: 1.4 !important;
      min-height: 100vh;
    }
    
    #chrome-markdown-original {
      display: none !important;
    }
    
    .frontmatter-wrapper {
      margin: 0;
      overflow: hidden;
    }
    
    .frontmatter-delimiter {
      padding: 0 var(--content-padding-x) !important;
      color: #7d8590;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 14px;
    }
    
    .code-block-wrapper {
      margin: 0 var(--content-padding-x) 16px;
      border: 1px solid #30363d;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: var(--un-ring-offset-shadow, 0 0 #0000),
        var(--un-ring-shadow, 0 0 #0000), var(--un-shadow);
      }
        
    .code-block-wrapper.incomplete {
      border-color: #f85149;
      animation: pulse 2s infinite;
      }
      
    .code-block-wrapper pre {
      padding: 16px !important;
    }
    
    .code-block-header {
      color: #7d8590;
      padding: 8px 16px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      border-bottom: 1px solid #30363d;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    
    .html-block-wrapper.note-block {
      border-left: 4px solid #58a6ff;
      background-color: rgba(88, 166, 255, 0.1);
      padding: 16px;
      border-radius: 6px;
      margin: 0 var(--content-padding-x) 16px;
      color: #c9d1d9;
      white-space: pre-wrap;
    }
    
    .html-block-wrapper.note-block pre {
      background-color: transparent !important;
      padding: 0 !important;
    }

    .html-block-wrapper.note-block a {
      color: #58a6ff !important;
    }
    
    .html-content {
      padding: 0 var(--content-padding-x) !important;
    }
    
    /* Override Shiki styles for better integration */
    pre {
      margin: 0 !important;
      padding: 0 var(--content-padding-x) !important;
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
    
    /* Shiki content wrapper for proper spacing */
    .shiki-content-wrapper {
      padding: 24px 0 48px 0;
      max-width: 80rem;
      margin: auto;
    }

    /* Ensure proper spacing for markdown content */
    .shiki {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      max-width: 100% !important;
    }
    
    /* Ensure all content blocks have proper spacing */
    .shiki + .shiki,
    .code-block-wrapper + .code-block-wrapper {
      margin-top: 24px !important;
    }
    
    /* Style for clickable links */
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

    .html-block-wrapper.incomplete {
      border-color: #f85149;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { border-color: #f85149; }
      50% { border-color: #ff7b72; }
    }
  `

    document.head.appendChild(style)
  }

  if (document.head) {
    addStylesImpl()
  } else {
    const observer = new MutationObserver(() => {
      if (document.head) {
        observer.disconnect()
        addStylesImpl()
      }
    })
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  }
}

// Add glassmorphism toggle button
function addModeIndicator(): void {
  // Create toggle button container
  const toggleContainer = document.createElement('div')
  toggleContainer.id = 'mdx-mode-toggle'
  toggleContainer.style.cssText = `
    position: fixed !important;
    top: 16px !important;
    right: 24px !important;
    z-index: 2147483647 !important;
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif !important;
    pointer-events: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
    left: auto !important;
    bottom: auto !important;
    width: auto !important;
    height: auto !important;
  `

  // Create toggle button
  const toggleButton = document.createElement('button')
  toggleButton.id = 'mdx-toggle-btn'
  toggleButton.style.cssText = `
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 32px !important;
    height: 32px !important;
    padding: 0 !important;
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 50% !important;
    color: rgba(255, 255, 255, 0.9) !important;
    cursor: pointer !important;
    font-size: 14px !important;
    font-weight: 400 !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    margin: 0 !important;
    position: relative !important;
    z-index: 1 !important;
    min-width: auto !important;
    min-height: auto !important;
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
    outline: none !important;
    text-decoration: none !important;
    font-family: inherit !important;
  `

  // Create mode indicator icon
  const modeIcon = document.createElement('span')
  modeIcon.id = 'mdx-mode-icon'
  modeIcon.style.cssText = `
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  `

  // Only append the icon - no text for minimal design
  toggleButton.appendChild(modeIcon)
  toggleContainer.appendChild(toggleButton)

  // Update button state based on current mode
  function updateToggleButton(): void {
    const isBrowseMode = currentMode === 'browse'

    modeIcon.innerHTML = isBrowseMode ? '✏️' : '👀' // Eye icon for browse mode, Pencil icon for edit mode

    // Update tooltip with mode info
    const isMac = /Mac|macOS|Macintosh/.test(navigator.userAgent) || navigator.platform.includes('Mac')
    toggleButton.title = `${isBrowseMode ? 'Switch to Edit' : 'Switch to Browse'} mode (${isMac ? 'Cmd' : 'Ctrl'}+Shift+L)`
  }

  // Add hover effects for glassmorphism design
  toggleButton.addEventListener('mouseenter', () => {
    toggleButton.style.background = 'rgba(255, 255, 255, 0.15)'
    toggleButton.style.borderColor = 'rgba(255, 255, 255, 0.25)'
    toggleButton.style.transform = 'scale(1.05)'
    toggleButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)'
  })

  toggleButton.addEventListener('mouseleave', () => {
    toggleButton.style.background = 'rgba(255, 255, 255, 0.1)'
    toggleButton.style.borderColor = 'rgba(255, 255, 255, 0.15)'
    toggleButton.style.transform = 'scale(1)'
    toggleButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
  })

  // Add active state
  toggleButton.addEventListener('mousedown', () => {
    toggleButton.style.transform = 'scale(0.95)'
  })

  toggleButton.addEventListener('mouseup', () => {
    toggleButton.style.transform = 'scale(1.05)' // Return to hover state
  })

  // Add click handler with debouncing to prevent double-clicks
  let isToggling = false

  const handleToggleClick = async (event: Event) => {
    event.preventDefault()
    event.stopPropagation()

    if (isToggling) {
      console.log('MDX Extension: Toggle ignored - already in progress')
      return
    }

    isToggling = true
    console.log('MDX Extension: Toggle button clicked')

    try {
      // Add loading state and disable button
      toggleButton.style.opacity = '0.6'
      toggleButton.style.cursor = 'wait'
      toggleButton.disabled = true

      await switchMode()
      updateToggleButton()

      console.log('MDX Extension: Mode switched to', currentMode)
    } catch (error) {
      console.error('MDX Extension: Error switching mode:', error)
    } finally {
      // Remove loading state and re-enable button
      toggleButton.style.opacity = '1'
      toggleButton.style.cursor = 'pointer'
      toggleButton.disabled = false
      isToggling = false
    }
  }

  // Click handler
  toggleButton.addEventListener('click', handleToggleClick, { capture: true })

  // Initial button state
  updateToggleButton()

  // Wait for body to exist before appending
  const appendToggleButton = () => {
    const appendTarget = document.documentElement || document.body
    appendTarget.appendChild(toggleContainer)
    console.log('MDX Extension: Toggle button appended to', appendTarget.tagName)
  }

  if (document.body) {
    appendToggleButton()
  } else {
    const bodyObserver = new MutationObserver(() => {
      if (document.body) {
        bodyObserver.disconnect()
        appendToggleButton()
      }
    })
    bodyObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  }

  // Setup keyboard shortcut
  document.addEventListener('keydown', async (event) => {
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && (event.key === 'L' || event.key === 'l')) {
      event.preventDefault()
      await switchMode()
      updateToggleButton()
    }
  })
}

// Global error handlers to prevent extension disabling
window.addEventListener('error', (event) => {
  console.error('Chrome Extension: Global error caught:', event.error)
  // Prevent the error from bubbling up and potentially disabling the extension
  event.preventDefault()
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Chrome Extension: Unhandled promise rejection:', event.reason)
  // Prevent the rejection from potentially disabling the extension
  event.preventDefault()
})
;(async () => {
  console.log('🚀 Chrome Markdown Extension initializing at document_start...')

  try {
    // Check if extension is enabled
    const response = await chrome.runtime.sendMessage({ type: 'checkExtensionEnabled' })
    if (!response?.enabled) {
      console.log('❌ Extension is disabled, skipping initialization')
      return
    }

    if (checkIfMarkdown()) {
      console.log('✅ Detected markdown file, setting up extension...')
      isMarkdownFile = true

      // Inject styles immediately to prevent flash
      addShikiBaseStyles()

      await initializeShiki()

      // Set up streaming observer immediately - don't wait for DOM
      try {
        setupStreamingObserver()
      } catch (error) {
        console.error('Chrome Extension: Error setting up streaming observer:', error)
      }

      // Add mode toggle button (will wait for body to exist)
      try {
        addModeIndicator()
      } catch (error) {
        console.error('Chrome Extension: Error adding mode indicator:', error)
      }
    } else {
      console.log('❌ Not a markdown file, extension will remain inactive')
    }
  } catch (error) {
    console.error('Chrome Extension: Error during initialization:', error)
    // Gracefully fail - don't crash the page
  }
})()
