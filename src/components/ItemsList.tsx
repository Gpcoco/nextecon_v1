'use client';

import { Item } from '@/types/items';
import { memo } from 'react';

interface ItemsListProps {
  items: Item[];
  loading: boolean;
  error: string | null;
}

// Componente singolo item - memoizzato per evitare re-render
const ItemCard = memo(({ item }: { item: Item }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
        {item.item_name || 'Unnamed Item'}
      </h3>
      {item.item_description && (
        <p className="text-gray-600 text-sm line-clamp-2">
          {item.item_description}
        </p>
      )}
      <div className="mt-2 flex gap-2 flex-wrap">
        {item.item_category && (
          <span className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
            {item.item_category}
          </span>
        )}
        {item.item_rarity && (
          <span className="inline-block px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded">
            {item.item_rarity}
          </span>
        )}
        {item.is_city_key && (
          <span className="inline-block px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded">
            🗝️ City Key
          </span>
        )}
      </div>
    </div>
  );
});

ItemCard.displayName = 'ItemCard';

// Skeleton loader per migliorare perceived performance
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    <div className="mt-2 flex gap-2">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export const ItemsList = memo(({ items, loading, error }: ItemsListProps) => {
  // Stato di errore
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">Error loading items</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }
  
  // Stato di caricamento iniziale
  if (loading && items.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  
  // Lista vuota
  if (items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-gray-400 text-5xl mb-3">📦</div>
        <p className="text-gray-600 font-medium">No items yet</p>
        <p className="text-gray-500 text-sm mt-1">Create your first item to get started</p>
      </div>
    );
  }
  
  // Lista items con virtualizzazione per performance su mobile
  return (
    <div className="space-y-2">
      {/* Indicatore di caricamento in background */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center mb-4">
          <p className="text-blue-700 text-sm">Refreshing items...</p>
        </div>
      )}
      
      {/* Grid responsive con ottimizzazione CSS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.item_id} item={item} />
        ))}
      </div>
      
      {/* Contatore items */}
      <div className="text-center mt-6 text-sm text-gray-500">
        Showing {items.length} item{items.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
});

ItemsList.displayName = 'ItemsList';