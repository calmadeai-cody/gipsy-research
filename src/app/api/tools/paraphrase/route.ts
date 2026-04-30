import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { paraphraseParagraph } from '@/lib/ai'
import { ApiError, ErrorCodes } from '@/lib/api-error'

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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const usageToday = await prisma.toolUsage.count({
    where: {
      userId,
      toolName,
      createdAt: { gte: today },
    },
  })

  return {
    allowed: usageToday < limit,
    remaining: Math.max(0, limit - usageToday),
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(new ApiError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401).toJSON(), { status: 401 })
    }

    const { paragraph } = await request.json()
    
    if (!paragraph) {
      return NextResponse.json(new ApiError('Paragraph required', ErrorCodes.VALIDATION_ERROR, 400).toJSON(), { status: 400 })
    }

    const userEmail = session.user.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json(new ApiError('User not found', ErrorCodes.USER_NOT_FOUND, 404).toJSON(), { status: 404 })
    }

    const tier = (session.user as { tier?: string })?.tier || 'BASIC'
    
    if (tier === 'BASIC') {
      return NextResponse.json(
        new ApiError('Tool ini hanya tersedia untuk paket Pro dan Pro Researcher. Upgrade sekarang!', ErrorCodes.TIER_ACCESS_DENIED, 403).toJSON(),
        { status: 403 }
      )
    }

    const limitCheck = await checkDailyLimit(user.id, tier, 'paraphrase')
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        new ApiError('Batas penggunaan harian tercapai. Upgrade ke paket yang lebih tinggi.', ErrorCodes.RATE_LIMIT_EXCEEDED, 429).toJSON(),
        { status: 429 }
      )
    }

    const paraphrased = await paraphraseParagraph(paragraph)
    
    // Log usage
    await prisma.toolUsage.create({
      data: {
        userId: user.id,
        toolName: 'paraphrase',
        inputText: paragraph.substring(0, 500),
        outputText: paraphrased,
      },
    })

    return NextResponse.json({
      paraphrased,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Paraphrase error:', error)
    return NextResponse.json(new ApiError('Failed to paraphrase', ErrorCodes.INTERNAL_ERROR, 500).toJSON(), { status: 500 })
  }
}