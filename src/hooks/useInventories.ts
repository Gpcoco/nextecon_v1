// src/hooks/useInventories.ts
// FIXED VERSION - Added skip option to prevent premature fetching
import { useState, useEffect, useRef } from 'react'

export interface Item {
  item_id: string
  item_name: string
  item_description: string | null
  item_category: string | null
  item_rarity: string | null
  item_base_value: number | null
  is_city_key: boolean
  quantity: number
  durability: number | null
}

export interface Inventory {
  inventory_id: string
  inventory_type: string | null
  inventory_capacity: number | null
  current_usage: number
  items: Item[]
}

export interface InventoriesData {
  inventories: Inventory[]
  total_items: number
  player_id: string
}

interface UseInventoriesOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  userId?: string
  skip?: boolean // 🔧 NEW: Skip fetching until ready
}

interface UseInventoriesReturn {
  data: InventoriesData | null
  loading: boolean
  error: string | null
  refresh: () => void
  clearCache: () => void
}

export function useInventories(
  options: UseInventoriesOptions = {},
): UseInventoriesReturn {
  const { autoRefresh = false, refreshInterval = 30000, skip = false } = options

  const [data, setData] = useState<InventoriesData | null>(null)
  const [loading, setLoading] = useState(!skip) // 🔧 Don't show loading if skipped
  const [error, setError] = useState<string | null>(null)

  // Use ref to track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false)
  // Track the last fetch timestamp to prevent too frequent fetches
  const lastFetchTimeRef = useRef<number>(0)
  const MIN_FETCH_INTERVAL = 2000 // Minimum 2 seconds between fetches

  // Trigger for manual refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  console.log('🎣 useInventories hook state:', {
    loading,
    hasData: !!data,
    hasError: !!error,
    refreshTrigger,
    skip, // 🔧 Log skip state
  })

  // Clear cache function
  const clearCache = () => {
    console.log('🧹 clearCache called')
    setData(null)
  }

  // Manual refresh function
  const refresh = () => {
    console.log('🔄 Manual refresh triggered')
    setRefreshTrigger((prev) => prev + 1)
  }

  // Main fetch effect - this is the ONLY place we fetch
  useEffect(() => {
    // 🔧 FIX: Don't fetch if skip is true
    if (skip) {
      console.log('⏭️ Skipping fetch (skip=true)')
      setLoading(false)
      return
    }

    console.log('🎯 Fetch effect triggered, refreshTrigger:', refreshTrigger)

    let abortController = new AbortController()

    const fetchInventories = async () => {
      // Check if we fetched too recently
      const now = Date.now()
      if (now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL) {
        console.log('⏸️ Fetch throttled (too soon)')
        return
      }

      // Prevent duplicate fetches
      if (isFetchingRef.current) {
        console.log('⏸️ Fetch already in progress')
        return
      }

      try {
        isFetchingRef.current = true
        lastFetchTimeRef.current = now

        console.log('📡 Starting fetch...')

        setLoading(true)
        setError(null)

        const response = await fetch('/api/player/inventories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          credentials: 'include',
          cache: 'no-store',
          signal: abortController.signal,
        })

        console.log('📥 Response received:', {
          status: response.status,
          ok: response.ok,
        })

        if (response.status === 304) {
          console.log('✅ Data not modified (304)')
          setLoading(false)
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          )
        }

        const result = await response.json()
        console.log('✅ Data parsed successfully:', result)

        console.log('💾 Setting data and loading to false')
        setData(result.data)
        setLoading(false)

        // Note: We removed the cachedUserId tracking as it was causing issues
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('⚠️ Fetch aborted')
          return
        }

        console.error('❌ Fetch error:', err)

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch inventories'
        console.log('🚨 Setting error state:', errorMessage)
        setError(errorMessage)
        setLoading(false)
      } finally {
        console.log('🏁 Fetch complete, resetting fetch flag')
        isFetchingRef.current = false
      }
    }

    fetchInventories()

    // Cleanup function - abort ongoing fetch if component unmounts
    return () => {
      console.log('🛑 Aborting fetch')
      abortController.abort()
    }
  }, [refreshTrigger, skip]) // 🔧 Added skip to dependencies

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || skip) {
      console.log('⏰ Auto-refresh disabled')
      return
    }

    console.log('⏰ Setting up auto-refresh')
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refresh triggered')
      setRefreshTrigger((prev) => prev + 1)
    }, refreshInterval)

    return () => {
      console.log('🛑 Clearing auto-refresh interval')
      clearInterval(intervalId)
    }
  }, [autoRefresh, refreshInterval, skip])

  // Refresh on window focus (user returns to tab)
  useEffect(() => {
    if (skip) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible again, refreshing...')
        setRefreshTrigger((prev) => prev + 1)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [skip])

  console.log('🎣 Returning from hook:', {
    hasData: !!data,
    loading,
    error,
    dataContent: data,
  })

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
  }
}
