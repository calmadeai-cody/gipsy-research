import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { convertToArticle } from '@/lib/ai/article-converter'
import { sanitizeInput, validateAIInput } from '@/lib/sanitize'
import { ApiError, ErrorCodes } from '@/lib/api-error'
import { generateCacheKey, getCache, setCache } from '@/lib/cache'

const MAX_DRAFT_LENGTH = 3000
const MAX_JOURNAL_LENGTH = 200

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

    const { draft, journal, style } = await request.json()

    const sanitizedDraft = sanitizeInput(draft, MAX_DRAFT_LENGTH)

    if (!sanitizedDraft || sanitizedDraft.length < 50) {
      return NextResponse.json(
        new ApiError('Draft artikel diperlukan (minimal 50 karakter)', ErrorCodes.VALIDATION_ERROR, 400).toJSON(),
        { status: 400 }
      )
    }

    const validation = validateAIInput(sanitizedDraft)
    if (!validation.valid) {
      return NextResponse.json(
        new ApiError(validation.reason || 'Input tidak valid', ErrorCodes.VALIDATION_ERROR, 400).toJSON(),
        { status: 400 }
      )
    }

    const sanitizedJournal = journal ? sanitizeInput(journal, MAX_JOURNAL_LENGTH) : undefined
    const validStyles = ['IEEE', 'APA', 'Chicago']
    const sanitizedStyle = style && validStyles.includes(style) ? style : 'IEEE'

    // Get subscription to check tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const tier = subscription?.tier || 'BASIC'
    const toolName = 'konversi-artikel'
    const limitCheck = await checkDailyLimit(user.id, tier, toolName)

    if (!limitCheck.allowed) {
      return NextResponse.json(
        new ApiError('Batas penggunaan harian tercapai. Upgrade ke paket PRO untuk unlimited.', ErrorCodes.RATE_LIMIT_EXCEEDED, 429).toJSON(),
        { status: 429 }
      )
    }

    // Check cache first
    const cacheKey = generateCacheKey(toolName, sanitizedDraft + ':' + (sanitizedJournal || '') + ':' + sanitizedStyle)
    const cachedResult = getCache(cacheKey)
    if (cachedResult) {
      const parsed = JSON.parse(cachedResult)
      return NextResponse.json({
        ...parsed,
        remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
        cached: true,
      })
    }

    const result = await convertToArticle(sanitizedDraft, sanitizedJournal, sanitizedStyle)

    // Log usage
    await supabase.from('tool_usage').insert({
      user_id: user.id,
      tool_name: toolName,
      input_text: sanitizedDraft.substring(0, 500),
      output_text: JSON.stringify(result.article),
    })

    // Cache successful response (1 hour TTL)
    setCache(cacheKey, JSON.stringify(result), 3600)

    return NextResponse.json({
      article: result.article,
      sections_count: result.sections_count,
      total_references_needed: result.total_references_needed,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Article Converter error:', error)
    return NextResponse.json(
      new ApiError('Failed to convert article', ErrorCodes.INTERNAL_ERROR, 500).toJSON(),
      { status: 500 }
    )
  }
}