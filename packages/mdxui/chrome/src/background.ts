// Import types (which includes global window extensions)
import './types/index.js'

chrome.runtime.onInstalled.addListener(() => {
  console.log('@mdxui/chrome extension installed')
})

chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  if (tab.id && tab.url?.startsWith('file://')) {                
    chrome.tabs.reload(tab.id)
  }
})

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('file://')) {
    console.log('File URL detected:', tab.url)
  }
})

async function injectMonaco(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      // Configure Monaco Environment to avoid CORS issues with workers
      window.MonacoEnvironment = {
        getWorkerUrl: function () {
          // Disable workers to avoid CORS issues
          return undefined
        },
        getWorker: function () {
          // Disable workers completely to avoid CORS issues
          return undefined
        },
      }

      // Load Monaco from CDN in main world (not subject to extension CSP)
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js'
      script.onload = () => {
        if (window.require) {
          window.require.config({
            paths: {
              vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs',
            },
          })
          window.require(['vs/editor/editor.main'], () => {
            console.log('Monaco loaded in main world')

            // Set up event listeners for communication with isolated world
            window.addEventListener('setup-monaco-theme', (event: Event) => {
              const customEvent = event as CustomEvent
              const { name, theme } = customEvent.detail
              window.monaco?.editor.defineTheme(name, theme)
            })

            window.addEventListener('create-monaco-editor', (event: Event) => {
              const customEvent = event as CustomEvent
              const { editorId, containerId, options } = customEvent.detail

              console.log('Main world: Creating editor with ID:', editorId, 'for container:', containerId)

              try {
                const container = document.getElementById(containerId)
                if (!container) {
                  console.error('Main world: Container not found:', containerId)
                  window.dispatchEvent(
                    new CustomEvent('monaco-editor-error', {
                      detail: { editorId, error: `Container ${containerId} not found` },
                    }),
                  )
                  return
                }

                console.log('Main world: Creating Monaco editor with options:', options)
                const editor = window.monaco?.editor.create(container, options)

                if (!editor) {
                  console.error('Main world: Failed to create Monaco editor - monaco not available')
                  window.dispatchEvent(
                    new CustomEvent('monaco-editor-error', {
                      detail: { editorId, error: 'Monaco editor not available' },
                    }),
                  )
                  return
                }

                // Store editor reference globally for future operations
                if (!window.__monacoEditors) {
                  window.__monacoEditors = {}
                }
                window.__monacoEditors[editorId] = editor

                console.log('Main world: Editor created successfully, dispatching success event')
                // Only pass serializable data - not the editor object itself
                window.dispatchEvent(
                  new CustomEvent('monaco-editor-created', {
                    detail: {
                      editorId,
                      success: true,
                      // Don't pass the editor object - it's not serializable across worlds
                    },
                  }),
                )

                // Set up editor operation handlers
                window.addEventListener(`monaco-editor-${editorId}-resize`, () => {
                  const editorInstance = window.__monacoEditors?.[editorId]
                  if (editorInstance && editorInstance.layout) {
                    editorInstance.layout()
                  }
                })

                window.addEventListener(`monaco-editor-${editorId}-dispose`, () => {
                  const editorInstance = window.__monacoEditors?.[editorId]
                  if (editorInstance && editorInstance.dispose) {
                    editorInstance.dispose()
                    delete window.__monacoEditors![editorId]
                  }
                })
              } catch (error) {
                console.error('Main world: Failed to create Monaco editor:', error)
                const errorMessage = error instanceof Error ? error.message : 'Unknown error creating Monaco editor'
                window.dispatchEvent(
                  new CustomEvent('monaco-editor-error', {
                    detail: { editorId, error: errorMessage },
                  }),
                )
              }
            })

            // Signal that Monaco is ready
            window.dispatchEvent(new CustomEvent('monaco-ready'))
          })
        }
      }
      script.onerror = (error) => {
        console.error('Main world: Failed to load Monaco script:', error)
        window.dispatchEvent(new CustomEvent('monaco-load-error', { detail: { error: 'Failed to load Monaco script' } }))
      }
      document.head.appendChild(script)
    },
  })
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'initializeMonaco' && sender.tab?.id) {
    injectMonaco(sender.tab.id)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        console.error('Failed to inject Monaco:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep message channel open for async response
  }

  if (request.type === 'checkExtensionEnabled') {
    // Check if extension is enabled for this tab/url
    chrome.storage.sync.get(['extensionEnabled'], (result) => {
      const isEnabled = result.extensionEnabled !== false // Default to enabled
      sendResponse({ enabled: isEnabled })
    })
    return true // Keep message channel open for async response
  }
})

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Get current state
    const result = await chrome.storage.sync.get(['extensionEnabled'])
    const currentState = result.extensionEnabled !== false // Default to enabled
    const newState = !currentState

    // Save new state
    await chrome.storage.sync.set({ extensionEnabled: newState })

    // Update icon badge
    await updateExtensionBadge(newState)

    // Reload the current tab to apply changes
    if (tab.id) {
      await chrome.tabs.reload(tab.id)
    }

    console.log(`MDX Extension: ${newState ? 'Enabled' : 'Disabled'}`)
  } catch (error) {
    console.error('Error toggling extension:', error)
  }
})

// Update badge to show current state
async function updateExtensionBadge(enabled: boolean) {
  if (enabled) {
    // When enabled, no badge at all - clean icon
    await chrome.action.setBadgeText({
      text: '',
    })
  } else {
    // When disabled, show a minimal indicator
    await chrome.action.setBadgeText({
      text: '○', // Empty circle to indicate disabled
    })

    await chrome.action.setBadgeBackgroundColor({
      color: '#6b7280', // Gray for disabled
    })
  }

  // Update the title to show current state
  await chrome.action.setTitle({
    title: `MDX File Viewer: ${enabled ? 'Enabled' : 'Disabled'} (Click to toggle)`,
  })
}

// Initialize badge on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.sync.get(['extensionEnabled'])
  const isEnabled = result.extensionEnabled !== false
  await updateExtensionBadge(isEnabled)
})

// Initialize badge on installation
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({ extensionEnabled: true })
  await updateExtensionBadge(true)
})
