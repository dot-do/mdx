/**
 * Authentication utilities for @mdxdb/core
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
 * Get auth headers for HTTP requests
 * Automatically includes token if user is authenticated
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    }
  }
  return {}
}
