// src/app/api/adventures/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// TypeScript interfaces
interface Adventure {
  adventure_id: string
  name: string
  description: string | null
  player_count: number
  last_played_at: string | null
}

interface AdventuresResponse {
  adventures: Adventure[]
  total_count: number
}

/**
 * GET /api/adventures
 * Get all adventures that the authenticated user participates in
 * Returns adventures with player count for each
 */
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

    // 2. Get all distinct adventures where user has players
    // This includes counting players per adventure and getting last played info
    const { data: playerAdventures, error: playerError } = await supabase
      .from('player')
      .select(
        `
        adventure_id,
        join_date,
        adventure:adventure_id (
          adventure_id,
          name,
          description
        )
      `,
      )
      .eq('user_id', user.id)
      .order('join_date', { ascending: false })

    console.log('🎮 Player adventures query:', {
      userId: user.id,
      resultCount: playerAdventures?.length || 0,
      error: playerError?.message,
    })

    if (playerError) {
      console.error('❌ Error fetching player adventures:', playerError)
      return NextResponse.json({ error: playerError.message }, { status: 500 })
    }

    // If no players exist, return empty array
    if (!playerAdventures || playerAdventures.length === 0) {
      console.log('⚠️ No adventures found for user:', user.id)
      return NextResponse.json({
        data: {
          adventures: [],
          total_count: 0,
        },
      })
    }

    // 3. Group by adventure and count players
    const adventureMap = new Map<
      string,
      {
        adventure_id: string
        name: string
        description: string | null
        player_count: number
        last_played_at: string
      }
    >()

    playerAdventures.forEach((playerRecord) => {
      // Handle the nested structure from Supabase
      const adventureData = Array.isArray(playerRecord.adventure)
        ? playerRecord.adventure[0]
        : playerRecord.adventure

      if (!adventureData) {
        console.warn('⚠️ No adventure data for player record:', playerRecord)
        return
      }

      const adventureId = adventureData.adventure_id

      if (adventureMap.has(adventureId)) {
        // Increment player count
        const existing = adventureMap.get(adventureId)!
        existing.player_count++
        // Update last played if this is more recent
        if (
          playerRecord.join_date &&
          playerRecord.join_date > existing.last_played_at
        ) {
          existing.last_played_at = playerRecord.join_date
        }
      } else {
        // First player for this adventure
        adventureMap.set(adventureId, {
          adventure_id: adventureData.adventure_id,
          name: adventureData.name,
          description: adventureData.description,
          player_count: 1,
          last_played_at: playerRecord.join_date || new Date().toISOString(),
        })
      }
    })

    // 4. Convert map to array and sort by last played
    const adventures: Adventure[] = Array.from(adventureMap.values()).sort(
      (a, b) => {
        return (
          new Date(b.last_played_at).getTime() -
          new Date(a.last_played_at).getTime()
        )
      },
    )

    console.log('✅ Adventures processed:', {
      totalAdventures: adventures.length,
      adventures: adventures.map((a) => ({
        name: a.name,
        playerCount: a.player_count,
      })),
    })

    // 5. Return response
    const responseData: AdventuresResponse = {
      adventures,
      total_count: adventures.length,
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
