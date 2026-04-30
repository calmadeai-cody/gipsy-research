import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateResearchTitle } from '@/lib/ai'
import { sanitizeInput } from '@/lib/sanitize'
import { ApiError, ErrorCodes } from '@/lib/api-error'
import { generateCacheKey, getCache, setCache } from '@/lib/cache'

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

    const { keywords, count = 5 } = await request.json()
    
    const sanitizedKeywords = sanitizeInput(keywords)
    
    if (!sanitizedKeywords) {
      return NextResponse.json(new ApiError('Keywords required', ErrorCodes.VALIDATION_ERROR, 400).toJSON(), { status: 400 })
    }

    // Get subscription to check tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const tier = subscription?.tier || 'BASIC'
    const limitCheck = await checkDailyLimit(user.id, tier, 'generate-title')
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        new ApiError('Batas penggunaan harian tercapai. Upgrade ke paket yang lebih tinggi.', ErrorCodes.RATE_LIMIT_EXCEEDED, 429).toJSON(),
        { status: 429 }
      )
    }

    // Check cache first
    const cacheKey = generateCacheKey('generate-title', sanitizedKeywords)
    const cachedResult = getCache(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        titles: JSON.parse(cachedResult),
        remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
        cached: true,
      })
    }

    const titles = await generateResearchTitle(sanitizedKeywords, count)
    
    // Log usage
    await supabase.from('tool_usage').insert({
      user_id: user.id,
      tool_name: 'generate-title',
      input_text: sanitizedKeywords,
      output_text: titles.join('\n'),
    })

    // Cache successful response
    setCache(cacheKey, JSON.stringify(titles), 3600)

    return NextResponse.json({
      titles,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Generate title error:', error)
    return NextResponse.json(new ApiError('Failed to generate titles', ErrorCodes.INTERNAL_ERROR, 500).toJSON(), { status: 500 })
  }
}