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

  // Actions
  refreshAdventures: () => Promise<void>
  refreshPlayers: () => Promise<void>
  clearSelection: () => void
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
        } else {
          // Saved adventure not found, select first one
          console.log('⚠️ Saved adventure not found, selecting first')
          setSelectedAdventure(data.adventures[0])
        }
      } else if (data.adventures.length === 1) {
        // Auto-select if only one adventure
        console.log('✅ Auto-selecting single adventure')
        setSelectedAdventure(data.adventures[0])
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
        } else {
          // Saved player not found, select first one
          console.log('⚠️ Saved player not found, selecting first')
          setSelectedPlayer(data.players[0])
        }
      } else if (data.players.length === 1) {
        // Auto-select if only one player
        console.log('✅ Auto-selecting single player')
        setSelectedPlayer(data.players[0])
      }
    } catch (error) {
      console.error('❌ Error fetching players:', error)
    } finally {
      setLoadingPlayers(false)
    }
  }, [selectedAdventure])

  // Load from localStorage on mount
  useEffect(() => {
    const savedAdventureId = localStorage.getItem('selectedAdventureId')
    const savedPlayerId = localStorage.getItem('selectedPlayerId')

    console.log('🔄 Loading saved selections from localStorage:', {
      savedAdventureId,
      savedPlayerId,
    })

    if (savedAdventureId || savedPlayerId) {
      // We'll restore these after fetching data
    }
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

  // Select adventure
  const selectAdventure = (adventure: Adventure) => {
    console.log('🎮 Selecting adventure:', adventure.name)
    setSelectedAdventure(adventure)
    setSelectedPlayer(null) // Reset player selection
  }

  // Select player
  const selectPlayer = (player: Player) => {
    console.log('⚔️ Selecting player:', player.role_name || player.player_id)
    setSelectedPlayer(player)
  }

  // Clear all selections
  const clearSelection = () => {
    console.log('🧹 Clearing all selections')
    setSelectedAdventure(null)
    setSelectedPlayer(null)
    localStorage.removeItem('selectedAdventureId')
    localStorage.removeItem('selectedPlayerId')
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
    refreshAdventures,
    refreshPlayers,
    clearSelection,
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
