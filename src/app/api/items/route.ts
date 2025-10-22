import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/utils/supabase';
import { Item, ApiResponse, CreateItemInput } from '@/types/items';

// Cache configuration
const CACHE_DURATION = 60 * 1000; // 60 secondi di cache
const STALE_WHILE_REVALIDATE = 30 * 1000; // 30 secondi di stale-while-revalidate

// In-memory cache (per Edge Runtime)
let memoryCache: {
  data: Item[] | null;
  timestamp: number;
  etag: string | null;
} = {
  data: null,
  timestamp: 0,
  etag: null,
};

export async function GET(request: NextRequest) {
  try {
    // Controlla header If-None-Match per ETag
    const clientEtag = request.headers.get('If-None-Match');
    
    // Controlla cache in memoria
    const now = Date.now();
    const cacheAge = now - memoryCache.timestamp;
    const isStale = cacheAge > CACHE_DURATION;
    const isVeryStale = cacheAge > (CACHE_DURATION + STALE_WHILE_REVALIDATE);
    
    // Se il client ha già i dati aggiornati (stesso ETag), ritorna 304
    if (clientEtag && clientEtag === memoryCache.etag && !isVeryStale) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'Cache-Control': `public, max-age=${CACHE_DURATION / 1000}, stale-while-revalidate=${STALE_WHILE_REVALIDATE / 1000}`,
          'ETag': memoryCache.etag,
        },
      });
    }
    
    // Se la cache è valida, la ritorna immediatamente
    if (memoryCache.data && !isStale) {
      return NextResponse.json<ApiResponse<Item[]>>(
        { data: memoryCache.data },
        {
          headers: {
            'Cache-Control': `public, max-age=${CACHE_DURATION / 1000}, stale-while-revalidate=${STALE_WHILE_REVALIDATE / 1000}`,
            'ETag': memoryCache.etag || '',
            'X-Cache': 'HIT',
            'X-Cache-Age': String(cacheAge),
          },
        }
      );
    }
    
    // Se la cache è stale ma non troppo vecchia, ritorna i dati stale e aggiorna in background
    if (memoryCache.data && isStale && !isVeryStale) {
      // Ritorna i dati stale immediatamente
      const staleResponse = NextResponse.json<ApiResponse<Item[]>>(
        { data: memoryCache.data },
        {
          headers: {
            'Cache-Control': `public, max-age=${CACHE_DURATION / 1000}, stale-while-revalidate=${STALE_WHILE_REVALIDATE / 1000}`,
            'ETag': memoryCache.etag || '',
            'X-Cache': 'STALE',
            'X-Cache-Age': String(cacheAge),
          },
        }
      );
      
      // Aggiorna in background (non bloccare la risposta)
      updateCache().catch(console.error);
      
      return staleResponse;
    }
    
    // Altrimenti, recupera i dati freschi da Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    // Ottimizzazione query: seleziona solo i campi necessari e limita i risultati
    const { data: items, error } = await supabase
      .from('items')
      .select('item_id, item_name, item_description, item_category, item_rarity, item_base_value, is_city_key, created_at')
      .order('created_at', { ascending: false })
      .limit(100); // Limita a 100 items per ridurre il payload
    
    if (error) {
      console.error('Supabase error:', error);
      
      // Se c'è un errore ma abbiamo dati in cache vecchi, ritornali
      if (memoryCache.data) {
        return NextResponse.json<ApiResponse<Item[]>>(
          { data: memoryCache.data },
          {
            headers: {
              'Cache-Control': 'no-cache',
              'X-Cache': 'ERROR-FALLBACK',
            },
          }
        );
      }
      
      return NextResponse.json<ApiResponse<Item[]>>(
        { error: 'Failed to fetch items' },
        { status: 500 }
      );
    }
    
    // Genera ETag basato sul contenuto
    const newEtag = generateEtag(items || []);
    
    // Aggiorna cache in memoria
    memoryCache = {
      data: items || [],
      timestamp: now,
      etag: newEtag,
    };
    
    return NextResponse.json<ApiResponse<Item[]>>(
      { data: items || [] },
      {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_DURATION / 1000}, stale-while-revalidate=${STALE_WHILE_REVALIDATE / 1000}`,
          'ETag': newEtag,
          'X-Cache': 'MISS',
          'X-Total-Count': String(items?.length || 0),
        },
      }
    );
  } catch (error) {
    console.error('API error:', error);
    
    // Fallback to cached data if available
    if (memoryCache.data) {
      return NextResponse.json<ApiResponse<Item[]>>(
        { data: memoryCache.data },
        {
          headers: {
            'Cache-Control': 'no-cache',
            'X-Cache': 'ERROR-FALLBACK',
          },
        }
      );
    }
    
    return NextResponse.json<ApiResponse<Item[]>>(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Funzione helper per aggiornare la cache in background
async function updateCache() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: items } = await supabase
      .from('items')
      .select('item_id, item_name, item_description, item_category, item_rarity, item_base_value, is_city_key, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (items) {
      memoryCache = {
        data: items,
        timestamp: Date.now(),
        etag: generateEtag(items),
      };
    }
  } catch (error) {
    console.error('Background cache update failed:', error);
  }
}

// Funzione helper per generare ETag
function generateEtag(items: Item[]): string {
  if (!items.length) return '"empty"';
  
  // Genera un hash semplice basato su numero items e primi/ultimi ID
  const firstId = items[0]?.item_id || '';
  const lastId = items[items.length - 1]?.item_id || '';
  const count = items.length;
  
  return `"${count}-${firstId.slice(0, 8)}-${lastId.slice(0, 8)}"`;
}

// Configurazione per Edge Runtime (più veloce e scalabile)
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalida ogni 60 secondi

// POST: Crea un nuovo item
export async function POST(request: NextRequest) {
  try {
    // Parse del body della richiesta
    const body = await request.json() as CreateItemInput;
    
    // Validazione input
    if (!body.item_name || typeof body.item_name !== 'string') {
      return NextResponse.json<ApiResponse<Item>>(
        { error: 'Item name is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Sanitizzazione input
    const itemName = body.item_name.trim().slice(0, 255);
    const itemDescription = body.item_description?.trim().slice(0, 1000) || null;
    
    if (itemName.length === 0) {
      return NextResponse.json<ApiResponse<Item>>(
        { error: 'Item name cannot be empty' },
        { status: 400 }
      );
    }
    
    // Crea client Supabase con autenticazione
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    // Verifica che l'utente sia autenticato
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse<Item>>(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Inserisci il nuovo item nel database
    const { data: newItem, error: insertError } = await supabase
      .from('items')
      .insert({
        item_name: itemName,
        item_description: itemDescription,
        item_category: null,
        item_rarity: 'common',
        item_base_value: 1,
        is_city_key: false,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      
      if (insertError.code === '23505') {
        return NextResponse.json<ApiResponse<Item>>(
          { error: 'An item with this name already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json<ApiResponse<Item>>(
        { error: 'Failed to create item' },
        { status: 500 }
      );
    }
    
    // Invalida la cache dopo l'inserimento
    memoryCache.timestamp = 0; // Forza refresh al prossimo GET
    
    return NextResponse.json<ApiResponse<Item>>(
      { 
        data: newItem,
        message: 'Item created successfully'
      },
      { 
        status: 201,
        headers: {
          'Cache-Control': 'no-cache',
        }
      }
    );
    
  } catch (error) {
    console.error('POST error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json<ApiResponse<Item>>(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json<ApiResponse<Item>>(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}