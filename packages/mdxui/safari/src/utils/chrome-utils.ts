// Safari extension utilities
import type { ExtensionMessage, ExtensionResponse } from '../types/index.js'

/**
 * Checks if the Safari extension is enabled
 */
export async function checkExtensionEnabled(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    try {
      chrome.runtime.sendMessage({ type: 'checkExtensionEnabled' }, (response: ExtensionResponse) => {
        if (chrome.runtime.lastError) {
          console.error('Error checking extension state:', chrome.runtime.lastError.message)
          resolve(true) // Default to enabled if error
        } else {
          resolve(response?.enabled !== false)
        }
      })
    } catch (error) {
      console.error('Error sending message to background script:', error)
      resolve(true) // Default to enabled if error
    }
  })
}

/**
 * Sends a message to the background script and returns a promise
 */
export function sendMessageToBackground(message: ExtensionMessage): Promise<ExtensionResponse> {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(response)
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Safely gets the current tab's URL
 */
export function getCurrentUrl(): string {
  try {
    return window.location.href
  } catch (error) {
    console.error('Error getting current URL:', error)
    return ''
  }
}

/**
 * Safely gets the document's MIME type
 */
export function getDocumentMimeType(): string {
  try {
    return document.contentType || ''
  } catch (error) {
    console.error('Error getting document MIME type:', error)
    return ''
  }
}

/**
 * Sets up a Safari extension message listener with error handling
 */
export function setupMessageListener(
  handler: (request: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: ExtensionResponse) => void) => boolean | void,
): void {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      console.log('Safari Extension: Received message:', request)
      return handler(request, sender, sendResponse)
    } catch (error) {
              console.error('Error handling Safari message:', error)
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      return false
    }
  })
}

/**
 * Creates a custom event with Safari extension specific details
 */
export function createCustomEvent<T>(type: string, detail: T): CustomEvent<T> {
  return new CustomEvent(type, {
    detail,
    bubbles: true,
    cancelable: true,
  })
}
