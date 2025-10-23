// src/components/InventoriesList.tsx
import React from 'react'
import { InventoriesData } from '@/hooks/useInventories'
import { InventoryBlock } from './InventoryBlock'

interface InventoriesListProps {
  data: InventoriesData | null
  loading: boolean
  error: string | null
}

export function InventoriesList({
  data,
  loading,
  error,
}: InventoriesListProps) {
  // Loading state
  if (loading && !data) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md"
          >
            <div className="h-24 bg-gray-200 px-6 py-4" />
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-48 rounded-lg bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start">
          <svg
            className="mt-0.5 h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading inventories
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!data || data.inventories.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-yellow-400"
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
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No inventories found
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          You do not have any inventories yet. Create a character to get
          started!
        </p>
      </div>
    )
  }

  // Success state - render inventories
  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-md">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold">{data.inventories.length}</div>
            <div className="text-sm opacity-90">
              {data.inventories.length === 1 ? 'Inventory' : 'Inventories'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{data.total_items}</div>
            <div className="text-sm opacity-90">
              Unique {data.total_items === 1 ? 'Item' : 'Items'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {data.inventories.reduce(
                (sum, inv) => sum + inv.current_usage,
                0,
              )}
            </div>
            <div className="text-sm opacity-90">Total Items</div>
          </div>
        </div>
      </div>

      {/* Inventory Blocks */}
      {data.inventories.map((inventory) => (
        <InventoryBlock key={inventory.inventory_id} inventory={inventory} />
      ))}
    </div>
  )
}
