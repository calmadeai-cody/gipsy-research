import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMethodology } from '@/lib/ai/methodology-generator'
import { sanitizeInput } from '@/lib/sanitize'
import { ApiError, ErrorCodes } from '@/lib/api-error'
import { generateCacheKey, getCache, setCache } from '@/lib/cache'

const MAX_TYPE_LENGTH = 100
const MAX_TOPIC_LENGTH = 500

async function checkDailyLimit(userId: string, tier: string, toolName: string): Promise<{ allowed: boolean; remaining: number }> {
  const limits: Record<string, number> = {
    BASIC: 5,
    PRO: Infinity,
    PRO_RESEARCHER: Infinity,
  }
  const limit = limits[tier] || 5

  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity }
  }

  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('tool_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('tool_name', toolName)
    .gte('created_at', today.toISOString())

  return {
    allowed: (count || 0) < limit,
    remaining: Math.max(0, limit - (count || 0)),
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(new ApiError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401).toJSON(), { status: 401 })
    }

    const { research_type, research_topic } = await request.json()

    const sanitizedType = sanitizeInput(research_type, MAX_TYPE_LENGTH)
    if (!sanitizedType) {
      return NextResponse.json(
        new ApiError('Jenis penelitian diperlukan', ErrorCodes.VALIDATION_ERROR, 400).toJSON(),
        { status: 400 }
      )
    }

    const sanitizedTopic = sanitizeInput(research_topic, MAX_TOPIC_LENGTH)
    if (!sanitizedTopic) {
      return NextResponse.json(
        new ApiError('Topik penelitian diperlukan', ErrorCodes.VALIDATION_ERROR, 400).toJSON(),
        { status: 400 }
      )
    }

    // Get subscription to check tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const tier = subscription?.tier || 'BASIC'
    const toolName = 'pemilihan-metode'
    const limitCheck = await checkDailyLimit(user.id, tier, toolName)

    if (!limitCheck.allowed) {
      return NextResponse.json(
        new ApiError('Batas penggunaan harian tercapai. Upgrade ke paket PRO untuk unlimited.', ErrorCodes.RATE_LIMIT_EXCEEDED, 429).toJSON(),
        { status: 429 }
      )
    }

    // Check cache first
    const cacheKey = generateCacheKey(toolName, sanitizedType + ':' + sanitizedTopic)
    const cachedResult = getCache(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        ...JSON.parse(cachedResult),
        remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
        cached: true,
      })
    }

    const result = await generateMethodology(sanitizedType, sanitizedTopic)

    // Log usage
    await supabase.from('tool_usage').insert({
      user_id: user.id,
      tool_name: toolName,
      input_text: sanitizedTopic.substring(0, 500),
      output_text: JSON.stringify(result),
    })

    // Cache successful response (1 hour TTL)
    setCache(cacheKey, JSON.stringify(result), 3600)

    return NextResponse.json({
      ...result,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Methodology Generator error:', error)
    return NextResponse.json(
      new ApiError('Failed to generate methodology recommendations', ErrorCodes.INTERNAL_ERROR, 500).toJSON(),
      { status: 500 }
    )
  }
}