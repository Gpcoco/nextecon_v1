// src/app/home/page.tsx
'use client'

import { useInventories } from '@/hooks/useInventories'
import { InventoriesList } from '@/components/InventoriesList'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'
import { createBrowserClient } from '@/utils/supabase'
import { handleLogout } from '@/utils/authHelpers'
import { CacheManager } from '@/utils/cacheManager'

// 🔧 FIX: Wrap the component that uses useSearchParams in Suspense
function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

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
  }, [searchParams])

  // Verify authentication FIRST
  useEffect(() => {
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
  }, [router])

  // Hook to fetch user's inventories - ONLY initialize when user is ready
  const { data, loading, error, refresh, clearCache } = useInventories({
    autoRefresh: false,
    userId: user?.id,
    skip: !user || checkingAuth,
  })

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
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router, clearCache])

  // Loading state for auth check
  if (checkingAuth) {
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
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  // Auth check complete, render main content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Player Inventory
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refresh}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={async () => {
                  await handleLogout()
                  router.push('/login')
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <InventoriesList data={data} loading={loading} error={error} />
      </main>
    </div>
  )
}

// 🔧 FIX: Wrap in Suspense with fallback
export default function HomePage() {
  return (
    <Suspense
      fallback={
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
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
