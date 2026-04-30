import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBibliography } from '@/lib/ai'
import { sanitizeInput } from '@/lib/sanitize'
import { ApiError, ErrorCodes } from '@/lib/api-error'
import { generateCacheKey, getCache, setCache } from '@/lib/cache'

async function checkDailyLimit(userId: string, tier: string, toolName: string): Promise<{ allowed: boolean; remaining: number }> {
  const limits: Record<string, number> = {
    BASIC: 0, // Not available for BASIC
    PRO: Infinity,
    PRO_RESEARCHER: Infinity,
  }
  const limit = limits[tier] || 0
  
  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity }
  }
  
  if (limit === 0) {
    return { allowed: false, remaining: 0 }
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

    const { content, style = 'APA' } = await request.json()
    
    const sanitizedContent = sanitizeInput(content)
    
    if (!sanitizedContent) {
      return NextResponse.json(new ApiError('Invalid content input', ErrorCodes.VALIDATION_ERROR, 400).toJSON(), { status: 400 })
    }

    // Get subscription to check tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const tier = subscription?.tier || 'BASIC'
    
    if (tier === 'BASIC') {
      return NextResponse.json(
        new ApiError('Tool ini hanya tersedia untuk paket Pro dan Pro Researcher. Upgrade sekarang!', ErrorCodes.TIER_ACCESS_DENIED, 403).toJSON(),
        { status: 403 }
      )
    }

    const limitCheck = await checkDailyLimit(user.id, tier, 'generate-references')
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        new ApiError('Batas penggunaan harian tercapai. Upgrade ke paket yang lebih tinggi.', ErrorCodes.RATE_LIMIT_EXCEEDED, 429).toJSON(),
        { status: 429 }
      )
    }

    // Check cache first (before AI call)
    const cacheKey = generateCacheKey('generate-references', sanitizedContent + ':' + style)
    const cachedResult = getCache(cacheKey)
    if (cachedResult) {
      return NextResponse.json({
        references: JSON.parse(cachedResult),
        remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
        cached: true,
      })
    }

    const references = await generateBibliography(sanitizedContent, style)
    
    // Log usage
    await supabase.from('tool_usage').insert({
      user_id: user.id,
      tool_name: 'generate-references',
      input_text: sanitizedContent.substring(0, 500),
      output_text: references.join('\n'),
    })

    // Cache successful response (1 hour TTL)
    setCache(cacheKey, JSON.stringify(references), 3600)

    return NextResponse.json({
      references,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Generate references error:', error)
    return NextResponse.json(new ApiError('Failed to generate references', ErrorCodes.INTERNAL_ERROR, 500).toJSON(), { status: 500 })
  }
}