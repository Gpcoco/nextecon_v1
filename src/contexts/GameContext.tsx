// src/contexts/GameContext.tsx
'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { Adventure, Player } from '@/types/api'

export type ViewState =
  | 'selecting-adventure'
  | 'selecting-player'
  | 'selecting-inventory'
  | 'viewing-items'

export interface Inventory {
  inventory_id: string
  inventory_type: string | null
  inventory_capacity: number | null
  current_usage: number
  items: Item[]
}

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

interface GameContextType {
  // Adventures
  adventures: Adventure[]
  selectedAdventure: Adventure | null
  selectAdventure: (adventure: Adventure) => void
  loadingAdventures: boolean

  // Players
  players: Player[]
  selectedPlayer: Player | null
  selectPlayer: (player: Player) => void
  loadingPlayers: boolean

  // Inventories
  inventories: Inventory[]
  selectedInventory: Inventory | null
  selectInventory: (inventory: Inventory) => void
  loadingInventories: boolean

  // View State
  viewState: ViewState
  setViewState: (state: ViewState) => void
  isAnimating: boolean
  setIsAnimating: (animating: boolean) => void

  // Actions
  refreshAdventures: () => Promise<void>
  refreshPlayers: () => Promise<void>
  refreshInventories: () => Promise<void>
  clearSelection: () => void
  goBack: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

interface GameProviderProps {
  children: React.ReactNode
}

export function GameProvider({ children }: GameProviderProps) {
  // Adventure state
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(
    null,
  )
  const [loadingAdventures, setLoadingAdventures] = useState(true)

  // Player state
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [loadingPlayers, setLoadingPlayers] = useState(false)

  // Inventory state
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(
    null,
  )
  const [loadingInventories, setLoadingInventories] = useState(false)

  // View state
  const [viewState, setViewState] = useState<ViewState>('selecting-adventure')
  const [isAnimating, setIsAnimating] = useState(false)

  // Fetch adventures
  const refreshAdventures = async () => {
    try {
      setLoadingAdventures(true)
      console.log('📡 Fetching adventures...')

      const response = await fetch('/api/adventures', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch adventures')
      }

      const { data } = await response.json()
      console.log('✅ Adventures loaded:', data.adventures.length)

      setAdventures(data.adventures)

      // Try to restore saved adventure
      const savedAdventureId = localStorage.getItem('selectedAdventureId')
      if (savedAdventureId && data.adventures.length > 0) {
        const savedAdventure = data.adventures.find(
          (a: Adventure) => a.adventure_id === savedAdventureId,
        )
        if (savedAdventure) {
          console.log('✅ Restored saved adventure:', savedAdventure.name)
          setSelectedAdventure(savedAdventure)
          setViewState('selecting-player')
        } else {
          console.log('⚠️ Saved adventure not found, selecting first')
          setSelectedAdventure(data.adventures[0])
          setViewState('selecting-player')
        }
      } else if (data.adventures.length === 1) {
        console.log('✅ Auto-selecting single adventure')
        setSelectedAdventure(data.adventures[0])
        setViewState('selecting-player')
      }
    } catch (error) {
      console.error('❌ Error fetching adventures:', error)
    } finally {
      setLoadingAdventures(false)
    }
  }

  // Fetch players for selected adventure
  const refreshPlayers = useCallback(async () => {
    if (!selectedAdventure) {
      console.log('⚠️ No adventure selected, skipping player fetch')
      return
    }

    try {
      setLoadingPlayers(true)
      console.log('📡 Fetching players for adventure:', selectedAdventure.name)

      const response = await fetch(
        `/api/adventures/${selectedAdventure.adventure_id}/players`,
        {
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }

      const { data } = await response.json()
      console.log('✅ Players loaded:', data.players.length)

      setPlayers(data.players)

      // Try to restore saved player
      const savedPlayerId = localStorage.getItem('selectedPlayerId')
      if (savedPlayerId && data.players.length > 0) {
        const savedPlayer = data.players.find(
          (p: Player) => p.player_id === savedPlayerId,
        )
        if (savedPlayer) {
          console.log('✅ Restored saved player:', savedPlayer.role_name)
          setSelectedPlayer(savedPlayer)
          setViewState('selecting-inventory')
        } else {
          console.log('⚠️ Saved player not found')
        }
      }
    } catch (error) {
      console.error('❌ Error fetching players:', error)
    } finally {
      setLoadingPlayers(false)
    }
  }, [selectedAdventure])

  // Fetch inventories for selected player
  const refreshInventories = useCallback(async () => {
    if (!selectedPlayer) {
      console.log('⚠️ No player selected, skipping inventory fetch')
      return
    }

    try {
      setLoadingInventories(true)
      console.log(
        '📡 Fetching inventories for player:',
        selectedPlayer.player_id,
      )

      const response = await fetch(
        `/api/player/${selectedPlayer.player_id}/inventories`,
        {
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch inventories')
      }

      const { data } = await response.json()
      console.log('✅ Inventories loaded:', data.inventories.length)

      setInventories(data.inventories)

      // Try to restore saved inventory
      const savedInventoryId = localStorage.getItem('selectedInventoryId')
      if (savedInventoryId && data.inventories.length > 0) {
        const savedInventory = data.inventories.find(
          (inv: Inventory) => inv.inventory_id === savedInventoryId,
        )
        if (savedInventory) {
          console.log('✅ Restored saved inventory')
          setSelectedInventory(savedInventory)
          setViewState('viewing-items')
        }
      }
    } catch (error) {
      console.error('❌ Error fetching inventories:', error)
    } finally {
      setLoadingInventories(false)
    }
  }, [selectedPlayer])

  // Load from localStorage on mount
  useEffect(() => {
    const savedAdventureId = localStorage.getItem('selectedAdventureId')
    const savedPlayerId = localStorage.getItem('selectedPlayerId')

    console.log('🔄 Loading saved selections from localStorage:', {
      savedAdventureId,
      savedPlayerId,
    })
  }, [])

  // Fetch adventures on mount
  useEffect(() => {
    refreshAdventures()
  }, [])

  // Fetch players when adventure is selected
  useEffect(() => {
    if (selectedAdventure) {
      console.log(
        '🎮 Adventure selected, fetching players:',
        selectedAdventure.name,
      )
      refreshPlayers()
    } else {
      setPlayers([])
      setSelectedPlayer(null)
    }
  }, [selectedAdventure, refreshPlayers])

  // Fetch inventories when player is selected
  useEffect(() => {
    if (selectedPlayer) {
      console.log(
        '⚔️ Player selected, fetching inventories:',
        selectedPlayer.player_id,
      )
      refreshInventories()
    } else {
      setInventories([])
      setSelectedInventory(null)
    }
  }, [selectedPlayer, refreshInventories])

  // Save selections to localStorage
  useEffect(() => {
    if (selectedAdventure) {
      localStorage.setItem(
        'selectedAdventureId',
        selectedAdventure.adventure_id,
      )
      console.log('💾 Saved adventure to localStorage:', selectedAdventure.name)
    }
  }, [selectedAdventure])

  useEffect(() => {
    if (selectedPlayer) {
      localStorage.setItem('selectedPlayerId', selectedPlayer.player_id)
      console.log('💾 Saved player to localStorage:', selectedPlayer.role_name)
    }
  }, [selectedPlayer])

  useEffect(() => {
    if (selectedInventory) {
      localStorage.setItem(
        'selectedInventoryId',
        selectedInventory.inventory_id,
      )
      console.log('💾 Saved inventory to localStorage')
    }
  }, [selectedInventory])

  // Select adventure with animation
  const selectAdventure = (adventure: Adventure) => {
    console.log('🎮 Selecting adventure:', adventure.name)
    setIsAnimating(true)
    setSelectedAdventure(adventure)
    setSelectedPlayer(null)
    setSelectedInventory(null)

    // Small delay for animation to complete
    setTimeout(() => {
      setViewState('selecting-player')
      setIsAnimating(false)
    }, 300)
  }

  // Select player with animation
  const selectPlayer = (player: Player) => {
    console.log('⚔️ Selecting player:', player.role_name || player.player_id)
    setIsAnimating(true)
    setSelectedPlayer(player)
    setSelectedInventory(null)

    // Small delay for animation to complete
    setTimeout(() => {
      setViewState('selecting-inventory')
      setIsAnimating(false)
    }, 400)
  }

  // Select inventory with animation
  const selectInventory = (inventory: Inventory) => {
    console.log('🎒 Selecting inventory:', inventory.inventory_id)
    setIsAnimating(true)
    setSelectedInventory(inventory)

    // Small delay for animation to complete
    setTimeout(() => {
      setViewState('viewing-items')
      setIsAnimating(false)
    }, 400)
  }

  // Go back navigation
  const goBack = () => {
    if (viewState === 'viewing-items') {
      setSelectedInventory(null)
      setViewState('selecting-inventory')
      localStorage.removeItem('selectedInventoryId')
    } else if (viewState === 'selecting-inventory') {
      setSelectedPlayer(null)
      setViewState('selecting-player')
      localStorage.removeItem('selectedPlayerId')
    } else if (viewState === 'selecting-player') {
      setSelectedAdventure(null)
      setViewState('selecting-adventure')
      localStorage.removeItem('selectedAdventureId')
    }
  }

  // Clear all selections
  const clearSelection = () => {
    console.log('🧹 Clearing all selections')
    setSelectedAdventure(null)
    setSelectedPlayer(null)
    setSelectedInventory(null)
    setViewState('selecting-adventure')
    localStorage.removeItem('selectedAdventureId')
    localStorage.removeItem('selectedPlayerId')
    localStorage.removeItem('selectedInventoryId')
  }

  const value: GameContextType = {
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
    setViewState,
    isAnimating,
    setIsAnimating,
    refreshAdventures,
    refreshPlayers,
    refreshInventories,
    clearSelection,
    goBack,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// Custom hook to use the game context
export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

// Convenience hooks
export function useAdventure() {
  const { selectedAdventure, selectAdventure, adventures, loadingAdventures } =
    useGame()
  return { selectedAdventure, selectAdventure, adventures, loadingAdventures }
}

export function usePlayer() {
  const { selectedPlayer, selectPlayer, players, loadingPlayers } = useGame()
  return { selectedPlayer, selectPlayer, players, loadingPlayers }
}
