// src/app/home/page.tsx
'use client'

import { useInventories } from '@/hooks/useInventories'
import { InventoriesList } from '@/components/InventoriesList'
import { AdventureSelector } from '@/components/AdventureSelector'
import { PlayerSelector } from '@/components/PlayerSelector'
import { useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createBrowserClient } from '@/utils/supabase'
import { handleLogout } from '@/utils/authHelpers'
import { useGame } from '@/contexts/GameContext'

function HomeContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Get selected player from context
  const { selectedPlayer, selectedAdventure } = useGame()

  // Hook to fetch inventories - now uses selectedPlayer from context
  const { data, loading, error, refresh, clearCache } = useInventories({
    autoRefresh: false,
  })

  // Verify authentication
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

  // Setup auth state listener
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
          {/* Top row: Logo and user actions */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Habylon</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refresh}
                disabled={loading || !selectedPlayer}
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

          {/* Bottom row: Selectors */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1">
              <AdventureSelector />
            </div>
            <div className="min-w-[200px] flex-1">
              <PlayerSelector />
            </div>
          </div>

          {/* Context display */}
          {selectedAdventure && selectedPlayer && (
            <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
              <span className="font-medium">Playing as:</span>{' '}
              {selectedPlayer.role_name || 'Character'} (Level{' '}
              {selectedPlayer.level || 1}) in {selectedAdventure.name}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!selectedAdventure ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Select an Adventure
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Choose an adventure from the dropdown above to get started
            </p>
          </div>
        ) : !selectedPlayer ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Select a Character
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Choose your character from the dropdown above
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Adventure: {selectedAdventure.name}
            </p>
          </div>
        ) : (
          <InventoriesList data={data} loading={loading} error={error} />
        )}
      </main>
    </div>
  )
}

// Wrap in Suspense for useSearchParams (even though we removed it)
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
