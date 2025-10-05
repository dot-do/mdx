/**
 * Authentication utilities for mdxe CLI
 *
 * Uses token.do for shared token storage across all .do packages
 */

import chalk from 'chalk'

// Try to import token.do, but provide fallbacks if not available
let hasValidToken: (() => boolean) | null = null
let getToken: (() => Promise<string | null>) | null = null
let getUserInfo: (() => Promise<any>) | null = null

try {
  const tokenModule = await import('token.do')
  hasValidToken = tokenModule.hasValidToken
  getToken = tokenModule.getToken
  getUserInfo = tokenModule.getUserInfo
} catch (error) {
  // token.do not available - provide fallback implementations
  console.warn('[mdxe] token.do not available, authentication features disabled')
  hasValidToken = () => false
  getToken = async () => null
  getUserInfo = async () => null
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return hasValidToken ? hasValidToken() : false
}

/**
 * Get current user information
 */
export async function getCurrentUser() {
  return getUserInfo ? await getUserInfo() : null
}

/**
 * Check authentication and prompt user to login if not authenticated
 *
 * @param skipAuth - Skip authentication check (for commands that don't need it)
 * @returns true if authenticated or skipped, false if not authenticated
 */
export async function ensureAuthenticated(skipAuth: boolean = false): Promise<boolean> {
  // Skip auth check if explicitly skipped
  if (skipAuth) return true

  // Check if already authenticated
  if (isAuthenticated()) {
    try {
      const user = await getCurrentUser()
      if (user?.email) {
        console.log(chalk.dim(`\n✓ Authenticated as ${user.email}`))
        return true
      }
    } catch {
      // Ignore errors, will prompt below
    }
  }

  // Not authenticated - prompt user
  console.log(chalk.yellow('\n⚠️  Authentication required'))
  console.log(chalk.dim('Please run: ') + chalk.cyan('do login'))
  console.log(chalk.dim('\nTo continue without authentication, use: ') + chalk.cyan('--skip-auth'))
  console.log()

  return false
}

/**
 * Get access token for API requests
 */
export async function getAccessToken(): Promise<string | null> {
  return getToken ? await getToken() : null
}
