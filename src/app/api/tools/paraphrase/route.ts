import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { paraphraseParagraph } from '@/lib/ai'

async function checkDailyLimit(userId: string, tier: string, toolName: string): Promise<{ allowed: boolean; remaining: number }> {
  const limits: Record<string, number> = {
    FREE: 0, // Not available for FREE
    LITE: 50,
    PRO: Infinity,
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paragraph } = await request.json()
    
    if (!paragraph) {
      return NextResponse.json({ error: 'Paragraph required' }, { status: 400 })
    }

    const userEmail = session.user.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tier = (session.user as { tier?: string })?.tier || 'FREE'
    
    if (tier === 'FREE') {
      return NextResponse.json({ 
        error: 'Tool ini hanya tersedia untuk paket Lite dan Pro. Upgrade sekarang!' 
      }, { status: 403 })
    }

    const limitCheck = await checkDailyLimit(user.id, tier, 'paraphrase')
    
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: 'Batas penggunaan harian tercapai. Upgrade ke paket yang lebih tinggi.' 
      }, { status: 429 })
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
    return NextResponse.json({ error: 'Failed to paraphrase' }, { status: 500 })
  }
}