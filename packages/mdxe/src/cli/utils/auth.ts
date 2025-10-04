/**
 * Authentication utilities for mdxe CLI
 *
 * Checks if user is authenticated via cli.do and prompts login if needed
 */

import chalk from 'chalk'

// Optional import of cli.do (since it's an optional dependency)
let cliDo: any = null
try {
  cliDo = await import('cli.do')
} catch {
  // cli.do not installed, continue without authentication
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (!cliDo) return true // If cli.do not available, skip auth check

  try {
    return cliDo.isAuthenticated()
  } catch {
    return false
  }
}

/**
 * Get current user information
 */
export async function getCurrentUser() {
  if (!cliDo) return null

  try {
    return await cliDo.whoami()
  } catch {
    return null
  }
}

/**
 * Check authentication and prompt user to login if not authenticated
 *
 * @param skipAuth - Skip authentication check (for commands that don't need it)
 * @returns true if authenticated or skipped, false if not authenticated
 */
export async function ensureAuthenticated(skipAuth: boolean = false): Promise<boolean> {
  // Skip auth check if not available or explicitly skipped
  if (!cliDo || skipAuth) return true

  // Check if already authenticated
  if (isAuthenticated()) {
    try {
      const user = await getCurrentUser()
      if (user) {
        console.log(chalk.dim(`\n✓ Authenticated as ${user.email}`))
        return true
      }
    } catch {
      // Ignore errors, will prompt below
    }
  }

  // Not authenticated - prompt user
  console.log(chalk.yellow('\n⚠️  Authentication required'))
  console.log(chalk.dim('Please run: ') + chalk.cyan('cli.do login'))
  console.log(chalk.dim('\nTo continue without authentication, use: ') + chalk.cyan('--skip-auth'))
  console.log()

  return false
}

/**
 * Get access token for API requests
 */
export async function getAccessToken(): Promise<string | null> {
  if (!cliDo) return null

  try {
    const tokenManager = new cliDo.TokenManager()
    return await tokenManager.getAccessToken()
  } catch {
    return null
  }
}
