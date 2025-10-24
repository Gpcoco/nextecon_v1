// src/types/api.ts
/**
 * Centralized TypeScript type definitions for API responses
 * These types are shared between frontend and backend
 */

// ============================================================================
// Adventure Types
// ============================================================================

export interface Adventure {
  adventure_id: string
  name: string
  description: string | null
  player_count: number
  last_played_at: string | null
}

export interface AdventuresResponse {
  adventures: Adventure[]
  total_count: number
}

// ============================================================================
// Player Types
// ============================================================================

export interface Player {
  player_id: string
  adventure_id: string
  role_id: string | null
  role_name: string | null
  level: number | null
  xp_total: number | null
  gender: string | null
  join_date: string | null
  house_id: string | null
  house_name: string | null
  region: string | null
}

export interface PlayersResponse {
  players: Player[]
  total_count: number
  adventure_id: string
  adventure_name: string
}

export interface PlayerStats {
  current_hp: number | null
  max_hp: number | null
  current_mana: number | null
  max_mana: number | null
  strength: number | null
  dexterity: number | null
  intelligence: number | null
  wisdom: number | null
  charisma: number | null
  constitution: number | null
  status_effect: string | null
}

export interface PlayerProgress {
  quest_completed: number | null
  pvp_victory: number | null
  events_participated: number | null
  achievements_points: number | null
}

export interface PlayerDetails {
  player_id: string
  user_id: string
  adventure_id: string
  adventure_name: string
  role_id: string | null
  role_name: string | null
  level: number | null
  xp_total: number | null
  skill_point_available: number | null
  gender: string | null
  birth_date: string | null
  join_date: string | null
  house_id: string | null
  house_name: string | null
  region: string | null
  stats: PlayerStats | null
  progress: PlayerProgress | null
}

export interface CreatePlayerInput {
  role_id?: string
  gender?: string
  house_id?: string
  region?: string
}

export interface UpdatePlayerInput {
  role_id?: string
  gender?: string
  house_id?: string
  region?: string
  accessibility_mode?: Record<string, any>
}

// ============================================================================
// Inventory Types
// ============================================================================

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

export interface Inventory {
  inventory_id: string
  inventory_type: string | null
  inventory_capacity: number | null
  current_usage: number
  items: Item[]
}

export interface InventoriesResponse {
  inventories: Inventory[]
  total_items: number
  player_id: string
  adventure_id: string
  adventure_name: string
}

// ============================================================================
// Generic API Response Wrappers
// ============================================================================

export interface ApiSuccessResponse<T> {
  data: T
  message?: string
}

export interface ApiErrorResponse {
  error: string
  details?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================================================
// Type Guards
// ============================================================================

export function isApiError(
  response: ApiResponse<any>,
): response is ApiErrorResponse {
  return 'error' in response
}

export function isApiSuccess<T>(
  response: ApiResponse<T>,
): response is ApiSuccessResponse<T> {
  return 'data' in response
}
