// src/app/api/player/[playerId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// TypeScript interfaces
interface PlayerDetails {
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
  // Stats
  stats: {
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
  } | null
  // Progress
  progress: {
    quest_completed: number | null
    pvp_victory: number | null
    events_participated: number | null
    achievements_points: number | null
  } | null
}

/**
 * GET /api/player/[playerId]
 * Get detailed information about a specific player
 * Includes validation that player belongs to authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } },
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { playerId } = params

    console.log('🔍 Fetching player details:', playerId)

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

    // 2. Get player with all related data
    const { data: player, error: playerError } = await supabase
      .from('player')
      .select(
        `
        player_id,
        user_id,
        adventure_id,
        role_id,
        level,
        xp_total,
        skill_point_available,
        gender,
        birth_date,
        join_date,
        house_id,
        region,
        adventure:adventure_id (
          adventure_id,
          name
        ),
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
      .eq('player_id', playerId)
      .single()

    console.log('👤 Player query result:', {
      playerId,
      found: !!player,
      error: playerError?.message,
    })

    if (playerError || !player) {
      console.error('❌ Player not found:', playerId)
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // 3. CRITICAL: Verify player belongs to authenticated user
    if (player.user_id !== user.id) {
      console.error('🚫 Unauthorized access attempt:', {
        playerId,
        playerUserId: player.user_id,
        requestUserId: user.id,
      })
      return NextResponse.json(
        { error: 'Unauthorized access to player' },
        { status: 403 },
      )
    }

    console.log('✅ Player ownership verified')

    // 4. Get player stats
    const { data: stats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId)
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      // PGRST116 = not found, which is okay
      console.warn('⚠️ Error fetching player stats:', statsError)
    }

    // 5. Get player progress
    const { data: progress, error: progressError } = await supabase
      .from('player_progress')
      .select('*')
      .eq('player_id', playerId)
      .single()

    if (progressError && progressError.code !== 'PGRST116') {
      console.warn('⚠️ Error fetching player progress:', progressError)
    }

    // 6. Transform the data structure
    const adventureData = Array.isArray(player.adventure)
      ? player.adventure[0]
      : player.adventure

    const roleData = Array.isArray(player.role) ? player.role[0] : player.role

    const houseData = Array.isArray(player.house)
      ? player.house[0]
      : player.house

    const playerDetails: PlayerDetails = {
      player_id: player.player_id,
      user_id: player.user_id,
      adventure_id: player.adventure_id,
      adventure_name: adventureData?.name || 'Unknown Adventure',
      role_id: player.role_id,
      role_name: roleData?.role_name || null,
      level: player.level,
      xp_total: player.xp_total,
      skill_point_available: player.skill_point_available,
      gender: player.gender,
      birth_date: player.birth_date,
      join_date: player.join_date,
      house_id: player.house_id,
      house_name: houseData?.name || null,
      region: player.region,
      stats: stats
        ? {
            current_hp: stats.current_hp,
            max_hp: stats.max_hp,
            current_mana: stats.current_mana,
            max_mana: stats.max_mana,
            strength: stats.strength,
            dexterity: stats.dexterity,
            intelligence: stats.intelligence,
            wisdom: stats.wisdom,
            charisma: stats.charisma,
            constitution: stats.constitution,
            status_effect: stats.status_effect,
          }
        : null,
      progress: progress
        ? {
            quest_completed: progress.quest_completed,
            pvp_victory: progress.pvp_victory,
            events_participated: progress.events_participated,
            achievements_points: progress.achievements_points,
          }
        : null,
    }

    console.log('✅ Player details compiled:', {
      playerId,
      adventureName: playerDetails.adventure_name,
      role: playerDetails.role_name,
      level: playerDetails.level,
      hasStats: !!playerDetails.stats,
      hasProgress: !!playerDetails.progress,
    })

    return NextResponse.json({ data: playerDetails })
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
 * PATCH /api/player/[playerId]
 * Update player information
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { playerId: string } },
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { playerId } = params

    console.log('✏️ Updating player:', playerId)

    // 1. Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify player exists and belongs to user
    const { data: existingPlayer, error: checkError } = await supabase
      .from('player')
      .select('user_id')
      .eq('player_id', playerId)
      .single()

    if (checkError || !existingPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    if (existingPlayer.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to player' },
        { status: 403 },
      )
    }

    // 3. Parse request body
    const body = await request.json()
    const allowedFields = [
      'role_id',
      'gender',
      'house_id',
      'region',
      'accessibility_mode',
    ]

    // Filter to only allowed fields
    const updateData: any = {}
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 },
      )
    }

    // 4. Update player
    const { data: updatedPlayer, error: updateError } = await supabase
      .from('player')
      .update(updateData)
      .eq('player_id', playerId)
      .select()
      .single()

    if (updateError || !updatedPlayer) {
      console.error('❌ Error updating player:', updateError)
      return NextResponse.json(
        { error: updateError?.message || 'Failed to update player' },
        { status: 500 },
      )
    }

    console.log('✅ Player updated:', playerId)

    return NextResponse.json({
      data: updatedPlayer,
      message: 'Player updated successfully',
    })
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
 * DELETE /api/player/[playerId]
 * Delete a player (soft delete recommended, but this is hard delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { playerId: string } },
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { playerId } = params

    console.log('🗑️ Deleting player:', playerId)

    // 1. Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify player exists and belongs to user
    const { data: existingPlayer, error: checkError } = await supabase
      .from('player')
      .select('user_id')
      .eq('player_id', playerId)
      .single()

    if (checkError || !existingPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    if (existingPlayer.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to player' },
        { status: 403 },
      )
    }

    // 3. Delete player (cascade should handle related records)
    const { error: deleteError } = await supabase
      .from('player')
      .delete()
      .eq('player_id', playerId)

    if (deleteError) {
      console.error('❌ Error deleting player:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    console.log('✅ Player deleted:', playerId)

    return NextResponse.json({
      message: 'Player deleted successfully',
    })
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
