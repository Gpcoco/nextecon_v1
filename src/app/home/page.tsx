// src/app/home/page.tsx
'use client'

import { useInventories } from '@/hooks/useInventories'
import { InventoriesList } from '@/components/InventoriesList'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@/utils/supabase'
import { handleLogout } from '@/utils/authHelpers'
import { CacheManager } from '@/utils/cacheManager'

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [shouldInitialize, setShouldInitialize] = useState(false)

  // Track if we've already cleared cache on this mount
  const hasClearedCacheRef = useRef(false)

  // Clear cache FIRST, before initializing the hook
  useEffect(() => {
    const shouldClearCache = searchParams.get('clearCache')
    if (shouldClearCache === 'true' && !hasClearedCacheRef.current) {
      console.log('🧹 Clearing cache after login')
      CacheManager.clearAllCaches()
      hasClearedCacheRef.current = true

      // Remove the query parameter from URL without reload
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }

    // After cache is cleared (or if no cache to clear), allow initialization
    setShouldInitialize(true)
  }, [searchParams])

  // Hook to fetch user's inventories - pass userId for cache tracking
  // Only initialize after cache clearing is done
  const { data, loading, error, refresh, clearCache } = useInventories({
    autoRefresh: false,
    userId: user?.id,
  })

  // Verify authentication
  useEffect(() => {
    if (!shouldInitialize) return // Wait until initialization is ready

    const checkUser = async () => {
      try {
        console.log('🔐 Checking user authentication...')
        const supabase = createBrowserClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          console.log('❌ No authenticated user, redirecting to login')
          router.push('/login')
          return
        }

        console.log('✅ User authenticated:', user.email)
        setUser(user)
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/login')
      } finally {
        setCheckingAuth(false)
      }
    }

    checkUser()
  }, [router, shouldInitialize])

  // Setup auth state listener - separate from initial check
  useEffect(() => {
    const supabase = createBrowserClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event)

      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out, clearing cache')
        clearCache()
        router.push('/login')
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('👋 User signed in')
        setUser(session.user)
      } else if (event === 'USER_UPDATED' && session?.user) {
        if (user && session.user.id !== user.id) {
          console.log('🔄 User changed, clearing cache')
          clearCache()
        }
        setUser(session.user)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router, clearCache, user])

  // Handle logout with proper cleanup
  const handleLogoutClick = async () => {
    await handleLogout()
  }

  // Loading state for initialization or auth check
  if (!shouldInitialize || checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">
            {!shouldInitialize ? 'Initializing...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                My Inventories
              </h1>
              {user && <p className="text-sm text-gray-500">{user.email}</p>}
            </div>

            <div className="flex items-center gap-2">
              {/* Manual refresh button */}
              <button
                onClick={refresh}
                disabled={loading}
                className="rounded-lg p-2 text-gray-600 transition-colors 
                         hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                aria-label="Refresh inventories"
                title="Refresh inventories"
              >
                <svg
                  className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogoutClick}
                className="rounded-lg px-3 py-1.5 text-sm text-gray-600 
                         transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <InventoriesList data={data} loading={loading} error={error} />

        {/* Footer with info */}
        <footer className="mt-12 border-t border-gray-200 pt-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              💡 Tip: This page uses smart caching to reduce server load and
              save mobile data.
            </p>
            <p className="mt-1">
              Data refreshes automatically when you return to the app.
            </p>
          </div>
        </footer>
      </main>

      {/* Offline indicator */}
      {typeof window !== 'undefined' && !navigator.onLine && (
        <div
          className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border 
                      border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 shadow-lg md:left-auto md:w-96"
        >
          <div className="flex items-center">
            <svg
              className="mr-2 h-5 w-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              You are offline. Changes will sync when connection is restored.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
