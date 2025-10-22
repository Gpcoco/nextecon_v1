// Tipo per la tabella items di Supabase
export interface Item {
  item_id: string;
  item_name: string | null;
  item_description: string | null;
  item_category: string | null;
  item_rarity: string | null;
  item_base_value: number | null;
  is_city_key: boolean;
  created_at?: string; // Aggiungiamo per ordinamento
}

// Tipo per creare un nuovo item (solo campi richiesti)
export interface CreateItemInput {
  item_name: string;
  item_description?: string;
}

// Tipo per la risposta dell'API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Tipo per la cache
export interface CachedData<T> {
  data: T;
  timestamp: number;
  etag?: string;
}