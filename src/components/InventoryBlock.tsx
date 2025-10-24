// src/components/InventoryBlock.tsx
import React from 'react'
import { Inventory } from '@/hooks/useInventories'
import { ItemCard } from './ItemCard'

interface InventoryBlockProps {
  inventory: Inventory
}

export function InventoryBlock({ inventory }: InventoryBlockProps) {
  const capacityPercentage = inventory.inventory_capacity
    ? Math.round((inventory.current_usage / inventory.inventory_capacity) * 100)
    : 0

  const getCapacityColor = () => {
    if (capacityPercentage >= 90) return 'bg-red-500'
    if (capacityPercentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const isEmpty = inventory.items.length === 0

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      {/* Inventory Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {inventory.inventory_type || 'Unnamed Inventory'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {inventory.items.length}{' '}
              {inventory.items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Capacity Badge */}
          {inventory.inventory_capacity && (
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">
                {inventory.current_usage} / {inventory.inventory_capacity}
              </div>
              <div className="text-xs text-gray-500">slots used</div>
            </div>
          )}
        </div>

        {/* Capacity Bar */}
        {inventory.inventory_capacity && (
          <div className="mt-3">
            <div className="h-2.5 w-full rounded-full bg-gray-200">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${getCapacityColor()}`}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-xs text-gray-500">
                {capacityPercentage}% full
              </span>
              {capacityPercentage >= 90 && (
                <span className="text-xs font-semibold text-red-600">
                  ⚠️ Nearly full!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="p-6">
        {isEmpty ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Empty inventory
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No items in this inventory yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inventory.items.map((item, index) => (
              <ItemCard key={item.item_id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
