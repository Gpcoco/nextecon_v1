'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Item, CreateItemInput, ApiResponse } from '@/types/items';

interface UseItemsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseItemsReturn {
  items: Item[];
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  refresh: () => Promise<void>;
  createItem: (input: CreateItemInput) => Promise<boolean>;
}

// Hook personalizzato per gestire gli items
export function useItems(options: UseItemsOptions = {}): UseItemsReturn {
  const { 
    autoRefresh = false, 
    refreshInterval = 60000 // 60 secondi default
  } = options;
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Ref per tracciare se il componente è montato
  const isMountedRef = useRef(true);
  const etagRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Funzione per recuperare gli items
  const fetchItems = useCallback(async (skipLoading = false) => {
    // Cancella richieste precedenti
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    try {
      abortControllerRef.current = new AbortController();
      
      if (!skipLoading) setLoading(true);
      setError(null);
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      // Aggiungi ETag se disponibile per risparmiare banda
      if (etagRef.current) {
        headers['If-None-Match'] = etagRef.current;
      }
      
      const response = await fetch('/api/items', {
        method: 'GET',
        headers,
        signal: abortControllerRef.current.signal,
        // Ottimizzazioni per cache del browser
        cache: 'default',
        credentials: 'same-origin',
      });
      
      // Se 304 Not Modified, i dati non sono cambiati
      if (response.status === 304) {
        return; // Mantieni i dati esistenti
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }
      
      // Salva nuovo ETag
      const newEtag = response.headers.get('ETag');
      if (newEtag) {
        etagRef.current = newEtag;
      }
      
      const result: ApiResponse<Item[]> = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (isMountedRef.current) {
        setItems(result.data || []);
      }
      
    } catch (err) {
      // Ignora errori di abort
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      console.error('Error fetching items:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);
  
  // Funzione per creare un nuovo item
  const createItem = useCallback(async (input: CreateItemInput): Promise<boolean> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        const result: ApiResponse<Item> = await response.json();
        throw new Error(result.error || 'Failed to create item');
      }
      
      const result: ApiResponse<Item> = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Aggiungi ottimisticamente il nuovo item alla lista
      if (result.data && isMountedRef.current) {
        setItems(prev => [result.data!, ...prev]);
        
        // Invalida ETag per forzare refresh al prossimo fetch
        etagRef.current = null;
        
        // Refresh in background dopo un breve delay
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchItems(true); // skipLoading = true per refresh silenzioso
          }
        }, 1000);
      }
      
      return true;
      
    } catch (err) {
      console.error('Error creating item:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to create item');
      }
      return false;
      
    } finally {
      if (isMountedRef.current) {
        setIsCreating(false);
      }
    }
  }, [fetchItems]);
  
  // Funzione di refresh manuale
  const refresh = useCallback(async () => {
    etagRef.current = null; // Resetta ETag per forzare refresh completo
    await fetchItems();
  }, [fetchItems]);
  
  // Effect per il fetch iniziale
  useEffect(() => {
    fetchItems();
    
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Solo al mount
  
  // Effect per auto-refresh opzionale
  useEffect(() => {
    if (!autoRefresh) return;
    
    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        fetchItems(true); // Refresh silenzioso
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchItems]);
  
  // Effect per gestire visibility change (ottimizzazione mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        // Refresh quando l'app torna in foreground
        fetchItems(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchItems]);
  
  // Effect per gestire online/offline (ottimizzazione mobile)
  useEffect(() => {
    const handleOnline = () => {
      if (isMountedRef.current) {
        fetchItems(true);
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchItems]);
  
  return {
    items,
    loading,
    error,
    isCreating,
    refresh,
    createItem,
  };
}