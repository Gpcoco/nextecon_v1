// src/components/ItemCard.tsx
import React from 'react'
import { Item } from '@/hooks/useInventories'

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  const getRarityColor = (rarity: string | null) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
      case 'epic':
        return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
      case 'rare':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
      case 'uncommon':
        return 'bg-gradient-to-br from-green-500 to-green-600 text-white'
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
    }
  }

  const getRarityBadgeColor = (rarity: string | null) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'uncommon':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getDurabilityColor = (durability: number | null) => {
    if (!durability) return 'bg-gray-300'
    if (durability >= 70) return 'bg-green-500'
    if (durability >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Item Header with Rarity Color */}
      <div className={`px-4 py-3 ${getRarityColor(item.item_rarity)}`}>
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-1 text-sm font-semibold">
            {item.item_name}
          </h3>
          {item.is_city_key && (
            <span className="ml-2 text-lg" title="City Key">
              🔑
            </span>
          )}
        </div>
      </div>

      {/* Item Body */}
      <div className="p-4">
        {/* Description */}
        {item.item_description && (
          <p className="mb-3 line-clamp-2 text-xs text-gray-600">
            {item.item_description}
          </p>
        )}

        {/* Item Stats */}
        <div className="space-y-2">
          {/* Category & Rarity */}
          <div className="flex flex-wrap items-center gap-2">
            {item.item_category && (
              <span className="inline-flex items-center rounded border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                {item.item_category}
              </span>
            )}
            {item.item_rarity && (
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${getRarityBadgeColor(
                  item.item_rarity,
                )}`}
              >
                {item.item_rarity}
              </span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-semibold text-gray-900">
              ×{item.quantity}
            </span>
          </div>

          {/* Durability */}
          {item.durability !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Durability:</span>
                <span className="font-semibold text-gray-900">
                  {item.durability}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${getDurabilityColor(
                    item.durability,
                  )}`}
                  style={{ width: `${item.durability}%` }}
                />
              </div>
            </div>
          )}

          {/* Value */}
          {item.item_base_value !== null && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
              <span className="text-gray-600">Value:</span>
              <span className="font-semibold text-yellow-600">
                {item.item_base_value} 💰
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-5" />
    </div>
  )
}
