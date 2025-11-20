/**
 * Authentication utilities for mdxdb CLI
 * Uses cli.do for OAuth-based authentication
 */

// Optional import of cli.do (since it's an optional dependency)
let cliDo: any = null
try {
  // @ts-ignore - Dynamic import of optional dependency
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

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{ email: string } | null> {
  if (!cliDo) return null

  try {
    return await cliDo.getCurrentUser()
  } catch {
    return null
  }
}

/**
 * Check authentication and prompt user to login if not authenticated
 */
export async function ensureAuthenticated(skipAuth: boolean = false): Promise<boolean> {
  // Skip auth check if not available or explicitly skipped
  if (!cliDo || skipAuth) return true

  // Check if already authenticated
  if (isAuthenticated()) {
    try {
      const user = await getCurrentUser()
      if (user) {
        console.log(`\n✓ Authenticated as ${user.email}`)
        return true
      }
    } catch {
      // Ignore errors, will prompt below
    }
  }

  // Not authenticated - prompt user
  console.log('\n⚠️  Authentication required')
  console.log('Please run: cli.do login')
  console.log('\nTo continue without authentication, use: --skip-auth')
  console.log()

  return false
}
