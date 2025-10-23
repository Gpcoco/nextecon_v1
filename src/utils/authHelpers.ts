// src/utils/authHelpers.ts
import { createBrowserClient } from '@/utils/supabase'
import { CacheManager } from '@/utils/cacheManager'

/**
 * Handles user logout with proper cleanup
 */
export async function handleLogout(): Promise<void> {
  try {
    const supabase = createBrowserClient()

    // Clear all caches BEFORE signing out
    CacheManager.clearAllCaches()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      throw error
    }

    console.log('✅ User logged out successfully')

    // Force a hard reload to clear any remaining state
    // Small delay to ensure cleanup completes
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  } catch (error) {
    console.error('Error during logout:', error)
    // Even if there's an error, try to clear caches and redirect
    CacheManager.clearAllCaches()
    window.location.href = '/login'
  }
}

/**
 * Handles successful login with cache clearing
 */
export function handleLoginSuccess(): void {
  // Clear any cached data from previous sessions
  CacheManager.clearUserData()
  console.log('✅ Login successful, cache cleared')
}
