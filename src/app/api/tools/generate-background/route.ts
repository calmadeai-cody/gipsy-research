import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBackground } from '@/lib/ai/background-generator'
import { sanitizeInput } from '@/lib/sanitize'
import { ApiError, ErrorCodes } from '@/lib/api-error'
import { generateCacheKey, getCache, setCache } from '@/lib/cache'

const MAX_TITLE_LENGTH = 300
const MAX_PROBLEM_LENGTH = 1000

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

    const { title, problem } = await request.json()

    const sanitizedTitle = sanitizeInput(title, MAX_TITLE_LENGTH)
    if (!sanitizedTitle) {
      return NextResponse.json(
        new ApiError('Judul penelitian diperlukan', ErrorCodes.VALIDATION_ERROR, 400).toJSON(),
        { status: 400 }
      )
    }

    const sanitizedProblem = problem ? sanitizeInput(problem, MAX_PROBLEM_LENGTH) : undefined

    // Get subscription to check tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const tier = subscription?.tier || 'BASIC'
    const toolName = 'generator-latar-belakang'
    const limitCheck = await checkDailyLimit(user.id, tier, toolName)

    if (!limitCheck.allowed) {
      return NextResponse.json(
        new ApiError('Batas penggunaan harian tercapai. Upgrade ke paket PRO untuk unlimited.', ErrorCodes.RATE_LIMIT_EXCEEDED, 429).toJSON(),
        { status: 429 }
      )
    }

    // Check cache first
    const cacheKey = generateCacheKey(toolName, sanitizedTitle + ':' + (sanitizedProblem || ''))
    const cachedResult = getCache(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        background: JSON.parse(cachedResult),
        remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
        cached: true,
      })
    }

    const background = await generateBackground(sanitizedTitle, sanitizedProblem)

    // Log usage
    await supabase.from('tool_usage').insert({
      user_id: user.id,
      tool_name: toolName,
      input_text: sanitizedTitle.substring(0, 500),
      output_text: background,
    })

    // Cache successful response (1 hour TTL)
    setCache(cacheKey, JSON.stringify(background), 3600)

    return NextResponse.json({
      background,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Generator Latar Belakang error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate research background'
    return NextResponse.json(
      new ApiError(message, ErrorCodes.INTERNAL_ERROR, 500).toJSON(),
      { status: 500 }
    )
  }
}