// src/utils/cacheManager.ts

/**
 * Cache Manager - Handles client-side cache invalidation
 */

const CACHE_KEYS = {
  INVENTORIES: 'inventories_cache',
  ITEMS: 'items_cache',
  PLAYER_DATA: 'player_data_cache',
} as const

export class CacheManager {
  /**
   * Clear all application caches
   */
  static clearAllCaches(): void {
    try {
      // Clear localStorage
      Object.values(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })

      // Clear sessionStorage
      sessionStorage.clear()

      // Clear any service worker caches if applicable
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name)
          })
        })
      }

      console.log('✅ All caches cleared successfully')
    } catch (error) {
      console.error('❌ Error clearing caches:', error)
    }
  }

  /**
   * Clear specific cache by key
   */
  static clearCache(key: keyof typeof CACHE_KEYS): void {
    try {
      localStorage.removeItem(CACHE_KEYS[key])
      console.log(`✅ Cache cleared: ${key}`)
    } catch (error) {
      console.error(`❌ Error clearing cache ${key}:`, error)
    }
  }

  /**
   * Clear user-specific data (inventories, player data)
   */
  static clearUserData(): void {
    try {
      this.clearCache('INVENTORIES')
      this.clearCache('PLAYER_DATA')
      console.log('✅ User data cleared')
    } catch (error) {
      console.error('❌ Error clearing user data:', error)
    }
  }

  /**
   * Force reload without cache
   */
  static hardReload(): void {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }
}
