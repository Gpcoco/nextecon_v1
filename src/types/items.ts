// src/types/items.ts

// Type for the items table in Supabase
export interface Item {
  item_id: string; // UUID
  item_name: string | null;
  item_description: string | null;
  item_category: string | null;
  item_rarity: string | null;
  item_base_value: number | null;
  is_city_key: boolean;
  created_at?: string; // TIMESTAMPTZ - will be added after migration
  updated_at?: string; // TIMESTAMPTZ - will be added after migration
}

// Type for creating a new item (without auto-generated fields)
export interface CreateItemInput {
  item_name: string;
  item_description?: string;
  item_category?: string;
  item_rarity?: string;
  item_base_value?: number;
  is_city_key?: boolean;
}

// Type for updating an item (all fields optional)
export interface UpdateItemInput {
  item_name?: string;
  item_description?: string;
  item_category?: string;
  item_rarity?: string;
  item_base_value?: number;
  is_city_key?: boolean;
}

// Type for the API response
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Type for cache (if using client-side caching)
export interface CachedData<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

// Enum for item categories (optional, for better type safety)
export enum ItemCategory {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  QUEST = 'quest',
  KEY = 'key',
  COMMON = 'common'
}

// Enum for item rarities (optional, for better type safety)
export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}