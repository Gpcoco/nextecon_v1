// src/components/AdventureSelector.tsx
'use client'

import { useGame } from '@/contexts/GameContext'
import { Adventure } from '@/types/api'

export function AdventureSelector() {
  const { adventures, selectedAdventure, selectAdventure, loadingAdventures } =
    useGame()

  if (loadingAdventures) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Loading adventures...</span>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (adventures.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
        No adventures available
      </div>
    )
  }

  return (
    <div className="relative">
      <label
        htmlFor="adventure-select"
        className="mb-1 block text-xs font-medium text-gray-600"
      >
        Adventure
      </label>
      <select
        id="adventure-select"
        value={selectedAdventure?.adventure_id || ''}
        onChange={(e) => {
          const adventure = adventures.find(
            (a) => a.adventure_id === e.target.value,
          )
          if (adventure) selectAdventure(adventure)
        }}
        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {!selectedAdventure && <option value="">Select an adventure...</option>}
        {adventures.map((adventure) => (
          <option key={adventure.adventure_id} value={adventure.adventure_id}>
            🎮 {adventure.name} ({adventure.player_count}{' '}
            {adventure.player_count === 1 ? 'player' : 'players'})
          </option>
        ))}
      </select>
    </div>
  )
}
