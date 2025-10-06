/**
 * Authentication utilities for mdxai
 *
 * Uses token.do for shared token storage across all .do packages
 */

import { hasValidToken, getToken, getUserInfo } from 'token.do'

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return hasValidToken()
}

/**
 * Get current user information
 */
export async function getCurrentUser() {
  return getUserInfo()
}

/**
 * Get access token for API requests
 */
export async function getAccessToken(): Promise<string | null> {
  return await getToken()
}

/**
 * Ensure user is authenticated for AI operations
 */
export async function ensureAuthenticated(): Promise<boolean> {
  if (!isAuthenticated()) {
    console.error('\n⚠️  Authentication required')
    console.error('Please run: do login')
    return false
  }
  return true
}
