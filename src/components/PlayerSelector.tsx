// src/components/PlayerSelector.tsx
'use client'

import { useGame } from '@/contexts/GameContext'

export function PlayerSelector() {
  const {
    players,
    selectedPlayer,
    selectPlayer,
    loadingPlayers,
    selectedAdventure,
  } = useGame()

  // Don't show if no adventure selected
  if (!selectedAdventure) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
        Select an adventure first
      </div>
    )
  }

  if (loadingPlayers) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Loading players...</span>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
        No players in this adventure
      </div>
    )
  }

  return (
    <div className="relative">
      <label
        htmlFor="player-select"
        className="mb-1 block text-xs font-medium text-gray-600"
      >
        Character
      </label>
      <select
        id="player-select"
        value={selectedPlayer?.player_id || ''}
        onChange={(e) => {
          const player = players.find((p) => p.player_id === e.target.value)
          if (player) selectPlayer(player)
        }}
        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {!selectedPlayer && <option value="">Select a character...</option>}
        {players.map((player) => (
          <option key={player.player_id} value={player.player_id}>
            {player.role_name ? `⚔️ ${player.role_name}` : '👤 Character'} - Lv{' '}
            {player.level || 1}
          </option>
        ))}
      </select>
    </div>
  )
}
