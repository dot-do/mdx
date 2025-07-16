// Mode manager that orchestrates between Browse (Shiki) and Edit (Monaco) modes
import type { ViewMode, ContentState, MonacoEditorProxy } from '../types/index.js'
import { ShikiRenderer } from '../utils/shikiRenderer.js'
import { createMonacoEditor, initializeMonaco, setupMonacoThemes } from '../utils/monacoRenderer.js'
import { detectLanguage } from '../utils/fileDetection.js'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createStyleElement, getScrollPosition, scrollToPosition, isNearBottom } from '../utils/domUtils.js' // Used for DOM manipulation and scroll management
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createCustomEvent } from '../utils/chromeUtils.js' // Used for mode change events
import { RENDER_DEBOUNCE_MS, SCROLL_THRESHOLD_PX } from '../constants/index.js'

export class ModeManager {
  private currentMode: ViewMode = { type: 'browse', renderer: 'shiki' }
  private contentState: ContentState = {
    originalContent: '',
    currentContent: '',
    hasChanges: false,
    scrollPosition: 0,
    lastModified: Date.now(),
  }

  private container: HTMLElement | null = null
  private shikiRenderer: ShikiRenderer
  private monacoEditor: MonacoEditorProxy | null = null
  private monacoInitialized = false

  // Streaming support
  private originalBody: HTMLElement | null = null
  private streamingObserver: MutationObserver | null = null
  private renderTimeout: ReturnType<typeof setTimeout> | null = null
  private hasUserScrolled = false
  private autoScrollEnabled = false

  // Note: Constants are now imported from constants/index.js

  constructor() {
    this.shikiRenderer = new ShikiRenderer()
    this.setupScrollListener()
  }

  async initialize(
    content: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mimeType: string,
  ): Promise<void> {
    console.log('ModeManager: Initializing with content length:', content.length)

    // Store URL and MIME type for future use in language detection and file handling
    // Currently used indirectly via detectLanguageFromContent() -> detectLanguage()

    this.contentState.originalContent = content
    this.contentState.currentContent = content
    this.contentState.lastModified = Date.now()

    // Create main container
    this.createContainer()

    // Set up streaming support
    this.setupStreamingObserver()

    // Start in browse mode
    await this.renderBrowseMode()

    console.log('ModeManager: Initialization complete')
  }

  async switchMode(targetMode: ViewMode['type']): Promise<void> {
    if (this.currentMode.type === targetMode) {
      console.log(`ModeManager: Already in ${targetMode} mode`)
      return
    }

    console.log(`ModeManager: Switching from ${this.currentMode.type} to ${targetMode}`)

    // Debug: Check content state before switch
    console.log('ModeManager: Content preview before switch:', this.contentState.currentContent.substring(0, 100) + '...')

    // Save current scroll position
    const savedScrollPosition = window.scrollY
    this.contentState.scrollPosition = savedScrollPosition

    // Get current content if in edit mode
    if (this.currentMode.type === 'edit' && this.monacoEditor) {
      // TODO: Get content from Monaco editor when implemented
      // For now, we'll use the current content state
      console.log('ModeManager: Preserving content from edit mode')
      console.log('ModeManager: Current content preview during switch:', this.contentState.currentContent.substring(0, 200) + '...')
    }

    const previousMode = this.currentMode.type

    // Dispose of Monaco editor if switching away from edit mode
    if (this.currentMode.type === 'edit' && this.monacoEditor) {
      console.log('ModeManager: Disposing Monaco editor before mode switch')
      this.monacoEditor.dispose()
      this.monacoEditor = null
    }

    // Temporarily disable auto-scroll during mode switch
    const wasAutoScrollEnabled = this.autoScrollEnabled
    this.autoScrollEnabled = false

    // Update mode
    this.currentMode = {
      type: targetMode,
      renderer: targetMode === 'browse' ? 'shiki' : 'monaco',
    }

    // Clear container
    if (this.container) {
      this.container.innerHTML = ''
    }

    // Render new mode
    if (targetMode === 'browse') {
      await this.renderBrowseMode()
    } else {
      await this.renderEditMode()
    }

    // Restore scroll position after a short delay to let content render
    setTimeout(() => {
      console.log(`ModeManager: Restoring scroll position to ${savedScrollPosition}`)
      window.scrollTo({
        top: savedScrollPosition,
        behavior: 'instant',
      })

      // Restore auto-scroll setting
      this.autoScrollEnabled = wasAutoScrollEnabled
    }, 50)

    // Dispatch mode change event
    this.dispatchModeChangeEvent(previousMode, targetMode)

    console.log(`ModeManager: Mode switch complete`)
  }

  getCurrentMode(): ViewMode {
    return this.currentMode
  }

  getContentState(): ContentState {
    return { ...this.contentState }
  }

  updateContent(newContent: string): void {
    if (newContent !== this.contentState.currentContent) {
      this.contentState.currentContent = newContent
      this.contentState.hasChanges = newContent !== this.contentState.originalContent
      this.contentState.lastModified = Date.now()

      // Re-render current mode with debouncing
      this.debounceRender()
    }
  }

  private async renderBrowseMode(): Promise<void> {
    if (!this.container) return

    console.log('ModeManager: Rendering browse mode with Shiki')

    try {
      // Use original content to avoid any potential corruption
      const contentToRender = this.contentState.originalContent
      console.log('ModeManager: Using original content for Browse mode:', contentToRender.substring(0, 100) + '...')

      const language = this.detectLanguageFromContent()
      const renderResult = await this.shikiRenderer.render({
        content: contentToRender,
        language,
        theme: 'github-dark',
      })

      // Debug: Check Shiki HTML output
      console.log('ModeManager: Shiki HTML length:', renderResult.html.length)
      console.log('ModeManager: Shiki HTML preview:', renderResult.html.substring(0, 500) + '...')

      this.container.innerHTML = renderResult.html

      // Add Shiki styles if not already added
      this.addShikiStyles()

      // Debug: Check what's actually in the container after insertion
      setTimeout(() => {
        if (this.container) {
          console.log('ModeManager: Container content after insertion:', this.container.innerHTML.substring(0, 200) + '...')
        }
      }, 10)

      // Handle auto-scroll for streaming content
      if (renderResult.isStreaming && this.hasUserScrolled && this.autoScrollEnabled) {
        setTimeout(() => this.scrollToBottom(), 10)
      }

      console.log('ModeManager: Browse mode rendering complete')
    } catch (error) {
      console.error('ModeManager: Browse mode rendering failed:', error)
      this.renderFallback()
    }
  }

  private async renderEditMode(): Promise<void> {
    if (!this.container) return

    console.log('ModeManager: Rendering edit mode with Monaco')

    try {
      // Initialize Monaco if not already done
      if (!this.monacoInitialized) {
        await initializeMonaco()
        setupMonacoThemes()
        this.monacoInitialized = true
      }

      // Create a fresh container for Monaco to avoid context conflicts
      this.container.innerHTML = ''
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
        .monaco-editor .monaco-scrollable-element > .scrollbar.horizontal {
          height: 8px !important;
        }
      `
      if (!document.getElementById('monaco-scrollbar-style')) {
        scrollbarStyle.id = 'monaco-scrollbar-style'
        document.head.appendChild(scrollbarStyle)
      }
      this.container.appendChild(monacoContainer)

      const language = this.detectLanguageFromContent()

      // Use original content to avoid any potential corruption
      const contentToEdit = this.contentState.originalContent

      // Debug: Check content before passing to Monaco
      console.log('ModeManager: Using original content for Edit mode:', contentToEdit.substring(0, 200) + '...')
      console.log('ModeManager: Content length for Monaco:', contentToEdit.length)

      // Create Monaco editor in the fresh container
      this.monacoEditor = await createMonacoEditor(monacoContainer, {
        content: contentToEdit,
        language,
        theme: 'github-dark',
        readOnly: false,
      })

      // Set up resize handler
      window.addEventListener('resize', () => {
        if (this.monacoEditor && this.monacoEditor.layout) {
          this.monacoEditor.layout()
        }
      })

      console.log('ModeManager: Edit mode rendering complete')
    } catch (error) {
      console.error('ModeManager: Edit mode rendering failed:', error)

      // Check if it's an extension context error
      if (error instanceof Error && error.message.includes('Extension context invalidated')) {
        this.renderExtensionError()
      } else {
        this.renderFallback()
      }
    }
  }

  private renderFallback(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <pre style="
        color: #e6edf3; 
        background-color: #0d1117;
        padding: 20px; 
        margin: 0; 
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; 
        font-size: 15px; 
        line-height: 1.4; 
        white-space: pre-wrap; 
        word-wrap: break-word; 
        overflow-wrap: break-word; 
        max-width: 100%;
      ">${this.escapeHtml(this.contentState.currentContent)}</pre>
    `
  }

  private renderExtensionError(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div style="
        padding: 40px 20px;
        text-align: center;
        background-color: #0d1117;
        color: #e6edf3;
        border-radius: 6px;
        border: 1px solid #f85149;
        margin: 20px;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      ">
        <h3 style="color: #f85149; margin: 0 0 16px 0;">🔄 Extension Reload Required</h3>
        <p style="margin: 0 0 16px 0; color: #e6edf3;">
          The extension context has been invalidated. This usually happens when the extension is reloaded.
        </p>
        <p style="margin: 0 0 20px 0; color: #8b949e; font-size: 14px;">
          To fix this:
        </p>
        <ol style="text-align: left; max-width: 400px; margin: 0 auto 20px auto; color: #8b949e;">
          <li>Refresh this page (⌘+R / Ctrl+R)</li>
          <li>Or reload the extension in chrome://extensions/</li>
        </ol>
        <button onclick="window.location.reload()" style="
          background: #238636;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">
          Refresh Page
        </button>
      </div>
    `
  }

  private createContainer(): void {
    this.container = document.createElement('div')
    this.container.id = 'mdx-viewer-container'
    this.container.style.cssText = `
      margin: 0;
      padding: 0;
      background-color: #0d1117;
      color: #e6edf3;
      min-height: 100vh;
    `

    // Set up body styles
    document.body.style.cssText = `
      margin: 0 !important;
      padding: 0 !important;
      background-color: #0d1117 !important;
      color: #e6edf3 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif !important;
      font-size: 16px !important;
      line-height: 1.4 !important;
      min-height: 100vh;
    `

    // Create original body wrapper for streaming
    this.originalBody = document.createElement('div')
    this.originalBody.id = 'chrome-markdown-original'
    this.originalBody.style.display = 'none'

    // Move existing body content to wrapper
    this.moveBodyContentToWrapper()

    // Insert our container at the beginning
    document.body.insertBefore(this.container, document.body.firstChild)
  }

  private moveBodyContentToWrapper(): void {
    if (!this.originalBody) return

    const bodyChildren = Array.from(document.body.children)
    for (const child of bodyChildren) {
      if (child !== this.container && child !== this.originalBody) {
        this.originalBody.appendChild(child)
      }
    }

    document.body.appendChild(this.originalBody)
  }

  private setupStreamingObserver(): void {
    if (!this.originalBody) return

    // Observe changes to the original body wrapper
    this.streamingObserver = new MutationObserver(() => {
      const newContent = this.extractContentFromOriginalBody()
      if (newContent !== this.contentState.currentContent) {
        this.updateContent(newContent)
      }
    })

    this.streamingObserver.observe(this.originalBody, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    // Also observe direct additions to body
    const bodyObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes)
        for (const node of addedNodes) {
          if (node !== this.container && node !== this.originalBody && node.nodeType === Node.ELEMENT_NODE) {
            try {
              this.originalBody?.appendChild(node)
            } catch (e) {
              console.warn('Could not move node to wrapper:', e)
            }
          }
        }
      }
    })

    bodyObserver.observe(document.body, { childList: true })
  }

  private extractContentFromOriginalBody(): string {
    if (!this.originalBody) return ''
    return this.extractTextContent(this.originalBody)
  }

  private extractTextContent(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      let text = ''
      for (const child of Array.from(node.childNodes)) {
        text += this.extractTextContent(child)
      }
      return text
    }
    return ''
  }

  private debounceRender(): void {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout)
    }

    this.renderTimeout = setTimeout(async () => {
      if (this.currentMode.type === 'browse') {
        await this.renderBrowseMode()
      }
      // Edit mode doesn't need re-rendering as Monaco handles updates
    }, RENDER_DEBOUNCE_MS)
  }

  private setupScrollListener(): void {
    window.addEventListener(
      'scroll',
      () => {
        this.hasUserScrolled = true

        if (this.isAtBottom()) {
          this.autoScrollEnabled = true
        } else {
          this.autoScrollEnabled = false
        }
      },
      { passive: true },
    )
  }

  private isAtBottom(): boolean {
    const scrollPosition = window.scrollY + window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    return documentHeight - scrollPosition < SCROLL_THRESHOLD_PX
  }

  private scrollToBottom(): void {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })
  }

  private detectLanguageFromContent(): string {
    // Use existing file detection logic
    const url = window.location.href
    const mimeType = document.contentType || ''
    return detectLanguage(url, mimeType)
  }

  private addShikiStyles(): void {
    const existingStyle = document.getElementById('shiki-styles')
    if (existingStyle) return

    const style = document.createElement('style')
    style.id = 'shiki-styles'
    style.textContent = this.shikiRenderer.getShikiStyles()
    document.head.appendChild(style)
  }

  private dispatchModeChangeEvent(fromMode: ViewMode['type'], toMode: ViewMode['type']): void {
    const event = new CustomEvent('modechange', {
      detail: {
        fromMode,
        toMode,
        content: this.contentState.currentContent,
      },
    })
    window.dispatchEvent(event)
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m: string) => map[m] || m)
  }

  dispose(): void {
    if (this.streamingObserver) {
      this.streamingObserver.disconnect()
    }

    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout)
    }

    if (this.monacoEditor) {
      this.monacoEditor.dispose()
    }

    console.log('ModeManager: Disposed')
  }
}
