// src/app/home/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@/utils/supabase'
import { handleLogout } from '@/utils/authHelpers'
import { useGame } from '@/contexts/GameContext'
import { AdventureCard } from '@/components/AdventureCard'
import { PlayerCard, EmptyPlayerCard } from '@/components/PlayerCard'
import { InventoryCard } from '@/components/InventoryCard'
import { ItemCard, EmptyItemsState } from '@/components/ItemCard'

function HomeContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const {
    adventures,
    selectedAdventure,
    selectAdventure,
    loadingAdventures,
    players,
    selectedPlayer,
    selectPlayer,
    loadingPlayers,
    inventories,
    selectedInventory,
    selectInventory,
    loadingInventories,
    viewState,
    isAnimating,
    goBack,
    clearSelection,
  } = useGame()

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
        console.log('🚪 User signed out')
        router.push('/login')
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('👋 User signed in')
        setUser(session.user)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  // Loading state for auth check
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent"
          />
          <p className="font-medium text-gray-600">Authenticating...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="sticky top-0 z-50 border-b border-white/50 bg-white/80 shadow-lg backdrop-blur-lg"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-2xl">
                🎮
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                  Habylon
                </h1>
                <p className="text-xs text-gray-600">Welcome, {user?.email}</p>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Back button */}
              {viewState !== 'selecting-adventure' && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goBack}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </motion.button>
              )}

              {/* Reset button */}
              {(selectedAdventure || selectedPlayer || selectedInventory) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSelection}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100 hover:shadow-md"
                >
                  🔄 Reset
                </motion.button>
              )}

              {/* Logout button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  await handleLogout()
                  router.push('/login')
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
              >
                Logout
              </motion.button>
            </div>
          </div>

          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 flex items-center gap-2 text-sm"
          >
            <span
              className={
                viewState === 'selecting-adventure'
                  ? 'font-medium text-blue-600'
                  : 'text-gray-500'
              }
            >
              🎮 Adventures
            </span>
            {selectedAdventure && (
              <>
                <span className="text-gray-400">›</span>
                <span
                  className={
                    viewState === 'selecting-player'
                      ? 'font-medium text-purple-600'
                      : 'text-gray-500'
                  }
                >
                  ⚔️ Characters
                </span>
              </>
            )}
            {selectedPlayer && (
              <>
                <span className="text-gray-400">›</span>
                <span
                  className={
                    viewState === 'selecting-inventory'
                      ? 'font-medium text-amber-600'
                      : 'text-gray-500'
                  }
                >
                  🎒 Inventories
                </span>
              </>
            )}
            {selectedInventory && (
              <>
                <span className="text-gray-400">›</span>
                <span className="font-medium text-green-600">📦 Items</span>
              </>
            )}
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Section 1: Adventures */}
          <motion.section layout className="relative">
            {/* Section Header */}
            <motion.div
              layout
              className="mb-4 flex items-center justify-between"
            >
              <motion.h2
                layout
                className={`flex items-center gap-2 font-bold ${
                  viewState === 'selecting-adventure' ? 'text-2xl' : 'text-lg'
                }`}
              >
                <span>🎮</span>
                {viewState === 'selecting-adventure'
                  ? 'Choose Your Adventure'
                  : selectedAdventure?.name}
              </motion.h2>
              {selectedAdventure && viewState !== 'selecting-adventure' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectAdventure(selectedAdventure)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Change
                </motion.button>
              )}
            </motion.div>

            {/* Adventures Grid */}
            <AnimatePresence mode="wait">
              {loadingAdventures ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse rounded-xl bg-gray-200"
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="adventures"
                  layout
                  className={`grid gap-4 ${
                    viewState === 'selecting-adventure'
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  }`}
                >
                  {adventures.map((adventure, index) => (
                    <AdventureCard
                      key={adventure.adventure_id}
                      adventure={adventure}
                      onClick={() => !isAnimating && selectAdventure(adventure)}
                      isSelected={
                        selectedAdventure?.adventure_id ===
                        adventure.adventure_id
                      }
                      isCompressed={viewState !== 'selecting-adventure'}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Section 2: Players */}
          <AnimatePresence>
            {selectedAdventure && (
              <motion.section
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* Section Header */}
                <motion.div
                  layout
                  className="mb-4 flex items-center justify-between"
                >
                  <motion.h2
                    layout
                    className={`flex items-center gap-2 font-bold ${
                      viewState === 'selecting-player' ? 'text-2xl' : 'text-lg'
                    }`}
                  >
                    <span>⚔️</span>
                    {viewState === 'selecting-player'
                      ? 'Choose Your Character'
                      : selectedPlayer?.role_name}
                  </motion.h2>
                  {selectedPlayer && viewState !== 'selecting-player' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => selectPlayer(selectedPlayer)}
                      className="text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      Change
                    </motion.button>
                  )}
                </motion.div>

                {/* Players Grid */}
                <AnimatePresence mode="wait">
                  {loadingPlayers ? (
                    <motion.div
                      key="loading-players"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4"
                    >
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-48 animate-pulse rounded-xl bg-gray-200"
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="players"
                      layout
                      className={`grid gap-4 ${
                        viewState === 'selecting-player'
                          ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
                          : 'grid-cols-1'
                      }`}
                    >
                      {players.map((player, index) => (
                        <PlayerCard
                          key={player.player_id}
                          player={player}
                          onClick={() => !isAnimating && selectPlayer(player)}
                          isSelected={
                            selectedPlayer?.player_id === player.player_id
                          }
                          isCompressed={viewState !== 'selecting-player'}
                          index={index}
                        />
                      ))}
                      {viewState === 'selecting-player' && <EmptyPlayerCard />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Section 3: Inventories */}
          <AnimatePresence>
            {selectedPlayer && (
              <motion.section
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  delay: 0.1,
                }}
              >
                {/* Section Header */}
                <motion.div
                  layout
                  className="mb-4 flex items-center justify-between"
                >
                  <motion.h2
                    layout
                    className={`flex items-center gap-2 font-bold ${
                      viewState === 'selecting-inventory'
                        ? 'text-2xl'
                        : 'text-lg'
                    }`}
                  >
                    <span>🎒</span>
                    {viewState === 'selecting-inventory'
                      ? 'Choose Your Inventory'
                      : selectedInventory?.inventory_type || 'Inventory'}
                  </motion.h2>
                  {selectedInventory && viewState !== 'selecting-inventory' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => selectInventory(selectedInventory)}
                      className="text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      Change
                    </motion.button>
                  )}
                </motion.div>

                {/* Inventories Grid */}
                <AnimatePresence mode="wait">
                  {loadingInventories ? (
                    <motion.div
                      key="loading-inventories"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4"
                    >
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-48 animate-pulse rounded-xl bg-gray-200"
                        />
                      ))}
                    </motion.div>
                  ) : inventories.length === 0 ? (
                    <motion.div
                      key="no-inventories"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center"
                    >
                      <div className="mb-4 text-5xl">🎒</div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">
                        No Inventories
                      </h3>
                      <p className="text-gray-600">
                        This character does not have any inventories yet.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="inventories"
                      layout
                      className={`grid gap-4 ${
                        viewState === 'selecting-inventory'
                          ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
                          : 'grid-cols-1'
                      }`}
                    >
                      {inventories.map((inventory, index) => (
                        <InventoryCard
                          key={inventory.inventory_id}
                          inventory={inventory}
                          onClick={() =>
                            !isAnimating && selectInventory(inventory)
                          }
                          isSelected={
                            selectedInventory?.inventory_id ===
                            inventory.inventory_id
                          }
                          isCompressed={viewState !== 'selecting-inventory'}
                          index={index}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Section 4: Items */}
          <AnimatePresence>
            {selectedInventory && viewState === 'viewing-items' && (
              <motion.section
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                  delay: 0.2,
                }}
              >
                {/* Section Header */}
                <motion.div layout className="mb-4">
                  <motion.h2
                    layout
                    className="flex items-center gap-2 text-2xl font-bold"
                  >
                    <span>📦</span>
                    Items in {selectedInventory.inventory_type || 'Inventory'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-1 text-sm text-gray-600"
                  >
                    {selectedInventory.items?.length || 0} items total
                  </motion.p>
                </motion.div>

                {/* Items Grid */}
                {selectedInventory.items &&
                selectedInventory.items.length > 0 ? (
                  <motion.div
                    key="items"
                    layout
                    className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  >
                    {selectedInventory.items.map((item, index) => (
                      <ItemCard key={item.item_id} item={item} index={index} />
                    ))}
                  </motion.div>
                ) : (
                  <EmptyItemsState />
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

// Wrap in Suspense
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
