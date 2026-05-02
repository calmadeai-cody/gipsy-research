import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suggestStatisticalAnalysis, DataType } from '@/lib/ai/stats-analyzer'
import { sanitizeInput } from '@/lib/sanitize'
import { ApiError, ErrorCodes } from '@/lib/api-error'
import { generateCacheKey, getCache, setCache } from '@/lib/cache'

const MAX_QUESTION_LENGTH = 300
const MAX_HYPOTHESIS_LENGTH = 500

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

    const { question, dataType, hypothesis } = await request.json()

    const sanitizedQuestion = sanitizeInput(question, MAX_QUESTION_LENGTH)
    if (!sanitizedQuestion) {
      return NextResponse.json(
        new ApiError('Pertanyaan penelitian diperlukan', ErrorCodes.VALIDATION_ERROR, 400).toJSON(),
        { status: 400 }
      )
    }

    if (!dataType || !['categorical', 'numerical', 'mixed'].includes(dataType)) {
      return NextResponse.json(
        new ApiError('Jenis data diperlukan (categorical, numerical, atau mixed)', ErrorCodes.VALIDATION_ERROR, 400).toJSON(),
        { status: 400 }
      )
    }

    const sanitizedHypothesis = hypothesis ? sanitizeInput(hypothesis, MAX_HYPOTHESIS_LENGTH) : undefined

    // Get subscription to check tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const tier = subscription?.tier || 'BASIC'
    const toolName = 'analisis-statistik'
    const limitCheck = await checkDailyLimit(user.id, tier, toolName)

    if (!limitCheck.allowed) {
      return NextResponse.json(
        new ApiError('Batas penggunaan harian tercapai. Upgrade ke paket PRO untuk unlimited.', ErrorCodes.RATE_LIMIT_EXCEEDED, 429).toJSON(),
        { status: 429 }
      )
    }

    // Check cache first
    const cacheKey = generateCacheKey(toolName, sanitizedQuestion + ':' + dataType + ':' + (sanitizedHypothesis || ''))
    const cachedResult = getCache(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        recommendation: JSON.parse(cachedResult),
        remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
        cached: true,
      })
    }

    const recommendation = await suggestStatisticalAnalysis(
      sanitizedQuestion,
      dataType as DataType,
      sanitizedHypothesis
    )

    // Log usage
    await supabase.from('tool_usage').insert({
      user_id: user.id,
      tool_name: toolName,
      input_text: sanitizedQuestion.substring(0, 500),
      output_text: JSON.stringify(recommendation),
    })

    // Cache successful response (1 hour TTL)
    setCache(cacheKey, JSON.stringify(recommendation), 3600)

    return NextResponse.json({
      recommendation,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Stats Analyzer error:', error)
    return NextResponse.json(
      new ApiError('Failed to generate statistical analysis recommendation', ErrorCodes.INTERNAL_ERROR, 500).toJSON(),
      { status: 500 }
    )
  }
}
