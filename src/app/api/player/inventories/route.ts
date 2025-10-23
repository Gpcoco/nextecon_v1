// src/app/api/player/inventories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Define TypeScript interfaces for type safety
interface Item {
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

interface Inventory {
  inventory_id: string
  inventory_type: string | null
  inventory_capacity: number | null
  current_usage: number
  items: Item[]
}

interface InventoriesResponse {
  inventories: Inventory[]
  total_items: number
  player_id: string
}

// GET /api/player/inventories - Fetch all inventories for authenticated user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // 1. Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('🔐 Auth check:', {
      userId: user?.id,
      email: user?.email,
      hasError: !!authError,
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get player_id from user_id
    const { data: playerData, error: playerError } = await supabase
      .from('player')
      .select('player_id')
      .eq('user_id', user.id)
      .single()

    console.log('👤 Player lookup:', {
      userId: user.id,
      playerData,
      playerError: playerError?.message,
    })

    if (playerError || !playerData) {
      console.error('❌ Player not found for user:', user.id)
      return NextResponse.json(
        {
          error: 'Player not found. Please create a character first.',
          details: playerError?.message,
          userId: user.id,
        },
        { status: 404 },
      )
    }

    const playerId = playerData.player_id
    console.log('✅ Player ID found:', playerId)

    // 3. Get all inventories for this player
    const { data: inventories, error: inventoriesError } = await supabase
      .from('inventory')
      .select('inventory_id, inventory_type, inventory_capacity')
      .eq('player_id', playerId)
      .order('inventory_type', { ascending: true })

    console.log('📦 Inventories query result:', {
      count: inventories?.length || 0,
      inventories,
      error: inventoriesError?.message,
    })

    if (inventoriesError) {
      console.error('❌ Error fetching inventories:', inventoriesError)
      return NextResponse.json(
        { error: inventoriesError.message },
        { status: 500 },
      )
    }

    // If no inventories exist, return empty array
    if (!inventories || inventories.length === 0) {
      console.log('⚠️ No inventories found for player:', playerId)
      return NextResponse.json({
        data: {
          inventories: [],
          total_items: 0,
          player_id: playerId,
        },
      })
    }

    // 4. For each inventory, get all items
    const inventoriesWithItems: Inventory[] = await Promise.all(
      inventories.map(async (inventory) => {
        console.log(
          `🔍 Fetching items for inventory: ${inventory.inventory_id}`,
        )

        // Query player_items joined with items table
        const { data: playerItems, error: itemsError } = await supabase
          .from('player_items')
          .select(
            `
            quantity,
            durability,
            items (
              item_id,
              item_name,
              item_description,
              item_category,
              item_rarity,
              item_base_value,
              is_city_key
            )
          `,
          )
          .eq('inventory_id', inventory.inventory_id)
          .order('items(item_name)', { ascending: true })

        console.log(`📋 Items for inventory ${inventory.inventory_id}:`, {
          count: playerItems?.length || 0,
          error: itemsError?.message,
        })

        if (itemsError) {
          console.error(
            `❌ Error fetching items for inventory ${inventory.inventory_id}:`,
            itemsError,
          )
          return {
            ...inventory,
            current_usage: 0,
            items: [],
          }
        }

        // Transform the data structure
        const items: Item[] = (playerItems || [])
          .filter((pi) => pi.items) // Filter out any null items
          .map((playerItem) => {
            // Handle the nested structure from Supabase
            const itemData = Array.isArray(playerItem.items)
              ? playerItem.items[0]
              : playerItem.items

            return {
              item_id: itemData.item_id,
              item_name: itemData.item_name,
              item_description: itemData.item_description,
              item_category: itemData.item_category,
              item_rarity: itemData.item_rarity,
              item_base_value: itemData.item_base_value,
              is_city_key: itemData.is_city_key,
              quantity: playerItem.quantity,
              durability: playerItem.durability,
            }
          })

        // Calculate current usage (sum of quantities)
        const currentUsage = items.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0,
        )

        console.log(
          `✅ Processed ${items.length} items for inventory ${inventory.inventory_id}`,
        )

        return {
          inventory_id: inventory.inventory_id,
          inventory_type: inventory.inventory_type,
          inventory_capacity: inventory.inventory_capacity,
          current_usage: currentUsage,
          items: items,
        }
      }),
    )

    // 5. Calculate total items across all inventories
    const totalItems = inventoriesWithItems.reduce(
      (sum, inv) => sum + inv.items.length,
      0,
    )

    console.log('📊 Final summary:', {
      inventoriesCount: inventoriesWithItems.length,
      totalItems,
      playerId,
    })

    // 6. Generate ETag for caching
    const responseData: InventoriesResponse = {
      inventories: inventoriesWithItems,
      total_items: totalItems,
      player_id: playerId,
    }

    const etag = `"${Buffer.from(JSON.stringify(responseData))
      .toString('base64')
      .slice(0, 27)}"`

    // Check if client has cached version
    const clientEtag = request.headers.get('If-None-Match')
    if (clientEtag && clientEtag === etag) {
      return new NextResponse(null, { status: 304 })
    }

    // Return response with proper headers
    const response = NextResponse.json({ data: responseData })
    response.headers.set('ETag', etag)
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate',
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('X-User-Id', playerId)

    return response
  } catch (error) {
    console.error('💥 API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
