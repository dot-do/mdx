'use client'

import * as React from 'react'
import { AuthProvider, AuthModal, useAuth } from 'oauth.do'

/**
 * AuthWrapper - Wraps the application with .do platform authentication
 * Uses the .do platform's WorkOS OAuth - no user configuration needed!
 */
export function AuthWrapper({ children }: { children: React.ReactNode }) {
  // .do platform WorkOS client ID (shared across all mdxe projects)
  const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || 'client_01JGQHQ9KZP59W7SGXB7HQMXKD'

  // Auto-detect redirect URI based on environment
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || `${siteUrl}/callback`

  return (
    <AuthProvider clientId={clientId} redirectUri={redirectUri}>
      {children}
      <LoginButton />
    </AuthProvider>
  )
}

/**
 * LoginButton - Floating login button that appears when user is not authenticated
 */
function LoginButton() {
  const { user, isLoading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = React.useState(false)

  // Don't show anything while loading
  if (isLoading) {
    return null
  }

  // Show logout button if user is authenticated
  if (user) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg border border-gray-200">
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-500">Signed in as</span>
          <span className="text-sm font-medium text-gray-900">{user.email}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  // Show login button if user is not authenticated
  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="fixed bottom-4 right-4 z-50 rounded-lg bg-black px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-gray-800 transition-colors"
      >
        Sign in
      </button>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        title="Sign in to mdxe"
        description="Authenticate to access all features and save your work"
        ctaText="Sign in with WorkOS"
        secondaryText="Secure authentication powered by WorkOS"
      />
    </>
  )
}
