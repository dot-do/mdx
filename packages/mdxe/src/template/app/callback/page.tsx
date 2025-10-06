'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from 'oauth.do'

/**
 * OAuth callback page - handles redirect from WorkOS
 */
export default function CallbackPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to complete
    if (!isLoading) {
      if (user) {
        // Successfully authenticated, redirect to home
        router.push('/')
      } else {
        // Authentication failed, redirect to home
        router.push('/')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 animate-spin text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Completing sign in...</h1>
        <p className="mt-2 text-sm text-gray-500">Please wait while we authenticate your account</p>
      </div>
    </div>
  )
}
