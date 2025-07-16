// Unified content script for Chrome extension
// Orchestrates between Browse (Shiki) and Edit (Monaco) modes using ModeManager

import { ModeManager } from './modes/ModeManager.js'
import { checkIfMarkdownFile, isSupportedFile, detectFileTypeFromUrl } from './utils/fileDetection.js'
import { extractPageContent, createFallbackContent } from './utils/domUtils.js'
import { checkExtensionEnabled, getCurrentUrl, getDocumentMimeType, setupMessageListener } from './utils/chromeUtils.js'
import { KEYBOARD_SHORTCUTS } from './constants/index.js'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createCustomEvent } from './utils/chromeUtils.js' // Will be used for mode change events

console.log('MDX Chrome Extension: Unified content script starting')

let modeManager: ModeManager | null = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let isInitialized = false // Used for preventing double initialization and debugging

async function initializeExtension(): Promise<void> {
  console.log('MDX Extension: Starting initialization')

  // Check if extension is enabled
  const isEnabled = await checkExtensionEnabled()
  if (!isEnabled) {
    console.log('MDX Extension: Extension is disabled, skipping initialization')
    return
  }

  const currentUrl = getCurrentUrl()
  const mimeType = getDocumentMimeType()

  console.log('MDX Extension: URL:', currentUrl)
  console.log('MDX Extension: MIME type:', mimeType)

  // Check if this is a supported file
  const fileInfo = detectFileTypeFromUrl(currentUrl)
  const isSupported = isSupportedFile(currentUrl, mimeType) || checkIfMarkdownFile()

  console.log('MDX Extension: File info:', fileInfo)
  console.log('MDX Extension: Is supported file:', isSupported)

  if (!fileInfo.isSupported && !isSupported) {
    console.log('MDX Extension: File not supported, exiting')
    return
  }

  // Extract content from page
  const content = extractPageContent()
  console.log('MDX Extension: Content length:', content.length)

  if (!content.trim()) {
    console.log('MDX Extension: No content found, exiting')
    return
  }

  try {
    // Initialize mode manager
    modeManager = new ModeManager()
    await modeManager.initialize(content, currentUrl, mimeType)

    // Set up mode toggle (will be implemented in next phase)
    setupModeControls()

    // Set up keyboard shortcuts
    setupKeyboardShortcuts()

    isInitialized = true
    console.log('MDX Extension: Initialization complete')
  } catch (error) {
    console.error('MDX Extension: Initialization failed:', error)

    // Fallback to simple text display
    renderFallback(content)
  }
}

function renderFallback(content: string): void {
  document.body.innerHTML = `
    <div style="
      margin: 0;
      padding: 20px;
      background-color: #0d1117;
      color: #e6edf3;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 14px;
      line-height: 1.6;
      min-height: 100vh;
    ">
      <div style="
        background-color: #21262d;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 20px;
      ">
        <strong>MDX Chrome Extension</strong><br>
        Extension failed to initialize, showing raw content:
      </div>
      ${createFallbackContent(content)}
    </div>
  `
}

function setupModeControls(): void {
  if (!modeManager) return

  // Create toggle button container
  const toggleContainer = document.createElement('div')
  toggleContainer.id = 'mdx-mode-toggle'
  toggleContainer.style.cssText = `
    position: fixed !important;
    top: 16px !important;
    right: 16px !important;
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
    width: auto !important;
    height: auto !important;
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
    if (!modeManager) return

    const currentMode = modeManager.getCurrentMode()
    const isBrowseMode = currentMode.type === 'browse'

    modeIcon.innerHTML = isBrowseMode
      ? '👁️' // Eye icon for browse mode
      : '✏️' // Pencil icon for edit mode

    // Update tooltip with mode info
    toggleButton.title = `${isBrowseMode ? 'Switch to Edit' : 'Switch to Browse'} mode (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+E)`
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

    if (!modeManager || isToggling) {
      console.log('MDX Extension: Toggle ignored - already in progress')
      return
    }

    isToggling = true
    console.log('MDX Extension: Toggle button clicked')

    const currentMode = modeManager.getCurrentMode()
    const targetMode = currentMode.type === 'browse' ? 'edit' : 'browse'

    try {
      // Add loading state and disable button
      toggleButton.style.opacity = '0.6 !important'
      toggleButton.style.cursor = 'wait !important'
      toggleButton.disabled = true

      await modeManager.switchMode(targetMode)
      updateToggleButton()

      console.log('MDX Extension: Mode switched to', targetMode)
    } catch (error) {
      console.error('MDX Extension: Error switching mode:', error)
    } finally {
      // Remove loading state and re-enable button
      toggleButton.style.opacity = '1 !important'
      toggleButton.style.cursor = 'pointer !important'
      toggleButton.disabled = false
      isToggling = false
    }
  }

  // Only use click event, remove mousedown to prevent double triggering
  toggleButton.addEventListener('click', handleToggleClick, { capture: true })

  // Initial button state
  updateToggleButton()

  // Add to page (append to documentElement to avoid page layout interference)
  const appendTarget = document.documentElement || document.body
  appendTarget.appendChild(toggleContainer)

  console.log('MDX Extension: Toggle button appended to', appendTarget.tagName)

  // Debug: Log toggle button position and visibility
  setTimeout(() => {
    const rect = toggleContainer.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(toggleContainer)
    console.log('MDX Extension: Toggle button debug info:', {
      rect: { top: rect.top, right: rect.right, width: rect.width, height: rect.height },
      styles: {
        position: computedStyle.position,
        zIndex: computedStyle.zIndex,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        display: computedStyle.display,
      },
      inViewport: rect.top >= 0 && rect.right <= window.innerWidth,
    })
  }, 100)

  // Listen for mode change events from other sources (keyboard shortcuts, background messages, etc.)
  window.addEventListener('modechange', (event) => {
    const customEvent = event as CustomEvent
    console.log('MDX Extension: Mode changed from', customEvent.detail.fromMode, 'to', customEvent.detail.toMode)

    // Update button state to reflect the new mode
    updateToggleButton()
  })

  console.log('MDX Extension: Mode toggle controls initialized')
}

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', async (event) => {
    // Cmd/Ctrl + E to toggle between browse and edit modes
    if ((event.metaKey || event.ctrlKey) && event.key === KEYBOARD_SHORTCUTS.TOGGLE_MODE) {
      event.preventDefault()

      if (modeManager) {
        const currentMode = modeManager.getCurrentMode()
        const targetMode = currentMode.type === 'browse' ? 'edit' : 'browse'

        console.log('MDX Extension: Keyboard shortcut triggered, switching to', targetMode, 'mode')
        await modeManager.switchMode(targetMode)
      }
    }
  })
}

// Listen for messages from background script
setupMessageListener((request, sender, sendResponse) => {
  if (request.type === 'toggleMode' && modeManager) {
    const currentMode = modeManager.getCurrentMode()
    const targetMode = currentMode.type === 'browse' ? 'edit' : 'browse'

    modeManager
      .switchMode(targetMode)
      .then(() => {
        sendResponse({ success: true, mode: targetMode })
      })
      .catch((error) => {
        console.error('Error switching mode:', error)
        sendResponse({ success: false, error: error.message })
      })

    return true // Keep message channel open for async response
  }

  if (request.type === 'getMode' && modeManager) {
    const currentMode = modeManager.getCurrentMode()
    sendResponse({ mode: currentMode.type })
    return true
  }
})

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (modeManager) {
    modeManager.dispose()
  }

  // Remove toggle controls
  const toggleContainer = document.getElementById('mdx-mode-toggle')
  if (toggleContainer) {
    console.log('MDX Extension: Cleaning up toggle button')
    toggleContainer.remove()
  }
})

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  console.log('MDX Extension: Document still loading, waiting for DOMContentLoaded')
  document.addEventListener('DOMContentLoaded', initializeExtension)
} else {
  console.log('MDX Extension: Document ready, initializing immediately')
  initializeExtension()
}
