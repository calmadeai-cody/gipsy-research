import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suggestVisualization, ChartType } from '@/lib/ai/data-viz'
import { sanitizeInput } from '@/lib/sanitize'
import { validateAIInput } from '@/lib/sanitize'
import { ApiError, ErrorCodes } from '@/lib/api-error'
import { getCache, setCache } from '@/lib/cache'
import { createHash } from 'node:crypto'

const MAX_DESCRIPTION_LENGTH = 1000
const MAX_DATA_VALUES_LENGTH = 500

const VALID_CHART_TYPES: ChartType[] = ['bar', 'line', 'pie', 'scatter', 'histogram']

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

    const { description, chartType, dataValues } = await request.json()

    const sanitizedDescription = sanitizeInput(description, MAX_DESCRIPTION_LENGTH)
    if (!sanitizedDescription) {
      return NextResponse.json(new ApiError('Deskripsi data diperlukan', ErrorCodes.VALIDATION_ERROR, 400).toJSON(), { status: 400 })
    }

    const descriptionValidation = validateAIInput(sanitizedDescription)
    if (!descriptionValidation.valid) {
      return NextResponse.json(new ApiError(descriptionValidation.reason || 'Deskripsi tidak valid', ErrorCodes.VALIDATION_ERROR, 400).toJSON(), { status: 400 })
    }

    if (!chartType || !VALID_CHART_TYPES.includes(chartType as ChartType)) {
      return NextResponse.json(new ApiError('Jenis chart tidak valid. Pilih: bar, line, pie, scatter, atau histogram', ErrorCodes.VALIDATION_ERROR, 400).toJSON(), { status: 400 })
    }

    const sanitizedDataValues = dataValues ? sanitizeInput(dataValues, MAX_DATA_VALUES_LENGTH) : undefined

    // Get subscription to check tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const tier = subscription?.tier || 'BASIC'
    const toolName = 'visualisasi-data'
    const limitCheck = await checkDailyLimit(user.id, tier, toolName)

    if (!limitCheck.allowed) {
      return NextResponse.json(
        new ApiError('Batas penggunaan harian tercapai. Upgrade ke paket PRO untuk unlimited.', ErrorCodes.RATE_LIMIT_EXCEEDED, 429).toJSON(),
        { status: 429 }
      )
    }

    // Check cache first
    const cacheInput = `${sanitizedDescription}|${chartType}|${sanitizedDataValues || ''}`
    const cacheKey = `viz:${createHash('sha256').update(cacheInput).digest('hex').substring(0, 32)}`
    const cachedResult = getCache(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        visualization: JSON.parse(cachedResult),
        remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
        cached: true,
      })
    }

    const visualization = await suggestVisualization(
      sanitizedDescription,
      chartType as ChartType,
      sanitizedDataValues
    )

    // Log usage
    await supabase.from('tool_usage').insert({
      user_id: user.id,
      tool_name: toolName,
      input_text: sanitizedDescription.substring(0, 500),
      output_text: JSON.stringify(visualization).substring(0, 1000),
    })

    // Cache successful response (1 hour TTL)
    setCache(cacheKey, JSON.stringify(visualization), 3600)

    return NextResponse.json({
      visualization,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Visualisasi Data error:', error)
    return NextResponse.json(new ApiError('Failed to generate visualization', ErrorCodes.INTERNAL_ERROR, 500).toJSON(), { status: 500 })
  }
}
