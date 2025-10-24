// src/app/api/adventures/[adventureId]/players/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// TypeScript interfaces
interface Player {
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

interface PlayersResponse {
  players: Player[]
  total_count: number
  adventure_id: string
  adventure_name: string
}

/**
 * GET /api/adventures/[adventureId]/players
 * Get all players for authenticated user in a specific adventure
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { adventureId: string } },
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { adventureId } = params

    console.log('🎯 Fetching players for adventure:', adventureId)

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

    // 2. Verify adventure exists
    const { data: adventureData, error: adventureError } = await supabase
      .from('adventure')
      .select('adventure_id, name, description')
      .eq('adventure_id', adventureId)
      .single()

    if (adventureError || !adventureData) {
      console.error('❌ Adventure not found:', adventureId)
      return NextResponse.json(
        { error: 'Adventure not found' },
        { status: 404 },
      )
    }

    console.log('✅ Adventure found:', adventureData.name)

    // 3. Get all players for this user in this adventure
    const { data: players, error: playersError } = await supabase
      .from('player')
      .select(
        `
        player_id,
        adventure_id,
        role_id,
        level,
        xp_total,
        gender,
        join_date,
        house_id,
        region,
        role:role_id (
          role_id,
          role_name
        ),
        house:house_id (
          house_id,
          name
        )
      `,
      )
      .eq('user_id', user.id)
      .eq('adventure_id', adventureId)
      .order('join_date', { ascending: false })

    console.log('👥 Players query result:', {
      userId: user.id,
      adventureId,
      count: players?.length || 0,
      error: playersError?.message,
    })

    if (playersError) {
      console.error('❌ Error fetching players:', playersError)
      return NextResponse.json({ error: playersError.message }, { status: 500 })
    }

    // If no players exist in this adventure, return empty array
    if (!players || players.length === 0) {
      console.log('⚠️ No players found for user in adventure:', adventureId)
      return NextResponse.json({
        data: {
          players: [],
          total_count: 0,
          adventure_id: adventureId,
          adventure_name: adventureData.name,
        },
      })
    }

    // 4. Transform the data structure
    const transformedPlayers: Player[] = players.map((player) => {
      // Handle nested structure from Supabase
      const roleData = Array.isArray(player.role) ? player.role[0] : player.role

      const houseData = Array.isArray(player.house)
        ? player.house[0]
        : player.house

      return {
        player_id: player.player_id,
        adventure_id: player.adventure_id,
        role_id: player.role_id,
        role_name: roleData?.role_name || null,
        level: player.level,
        xp_total: player.xp_total,
        gender: player.gender,
        join_date: player.join_date,
        house_id: player.house_id,
        house_name: houseData?.name || null,
        region: player.region,
      }
    })

    console.log('✅ Players processed:', {
      count: transformedPlayers.length,
      players: transformedPlayers.map((p) => ({
        role: p.role_name,
        level: p.level,
      })),
    })

    // 5. Return response
    const responseData: PlayersResponse = {
      players: transformedPlayers,
      total_count: transformedPlayers.length,
      adventure_id: adventureId,
      adventure_name: adventureData.name,
    }

    return NextResponse.json({ data: responseData })
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

/**
 * POST /api/adventures/[adventureId]/players
 * Create a new player in the specified adventure
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { adventureId: string } },
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { adventureId } = params

    console.log('🆕 Creating new player in adventure:', adventureId)

    // 1. Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify adventure exists
    const { data: adventureData, error: adventureError } = await supabase
      .from('adventure')
      .select('adventure_id, name')
      .eq('adventure_id', adventureId)
      .single()

    if (adventureError || !adventureData) {
      return NextResponse.json(
        { error: 'Adventure not found' },
        { status: 404 },
      )
    }

    // 3. Parse request body
    const body = await request.json()
    const { role_id, gender, house_id, region } = body

    // 4. Check if user already has max players in this adventure (optional limit)
    const { data: existingPlayers, error: countError } = await supabase
      .from('player')
      .select('player_id')
      .eq('user_id', user.id)
      .eq('adventure_id', adventureId)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    const MAX_PLAYERS_PER_ADVENTURE = 5 // Configurable limit
    if (
      existingPlayers &&
      existingPlayers.length >= MAX_PLAYERS_PER_ADVENTURE
    ) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_PLAYERS_PER_ADVENTURE} players per adventure reached`,
        },
        { status: 400 },
      )
    }

    // 5. Create new player
    const { data: newPlayer, error: createError } = await supabase
      .from('player')
      .insert({
        user_id: user.id,
        adventure_id: adventureId,
        role_id: role_id || null,
        gender: gender || null,
        house_id: house_id || null,
        region: region || null,
        level: 1,
        xp_total: 0,
        skill_point_available: 0,
        join_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError || !newPlayer) {
      console.error('❌ Error creating player:', createError)
      return NextResponse.json(
        { error: createError?.message || 'Failed to create player' },
        { status: 500 },
      )
    }

    console.log('✅ Player created:', newPlayer.player_id)

    // 6. Create default inventory for the new player
    const { error: inventoryError } = await supabase.from('inventory').insert({
      player_id: newPlayer.player_id,
      inventory_capacity: 20, // Default capacity
      inventory_type: 'backpack',
    })

    if (inventoryError) {
      console.warn('⚠️ Failed to create default inventory:', inventoryError)
      // Don't fail the request, just log the warning
    }

    return NextResponse.json(
      {
        data: newPlayer,
        message: 'Player created successfully',
      },
      { status: 201 },
    )
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
