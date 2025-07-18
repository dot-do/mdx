// Import types (which includes global window extensions)
import './types/index.js'

chrome.runtime.onInstalled.addListener(() => {
  console.log('@mdxui/chrome extension installed')
})

// Extension icon click handler - removed duplicate, see main handler below

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('file://')) {
    console.log('File URL detected:', tab.url)
  }
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
