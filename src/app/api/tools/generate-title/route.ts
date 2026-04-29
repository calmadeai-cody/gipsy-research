import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateResearchTitle } from '@/lib/ai'

async function checkDailyLimit(userId: string, tier: string, toolName: string): Promise<{ allowed: boolean; remaining: number }> {
  const limits: Record<string, number> = {
    FREE: 5,
    LITE: 50,
    PRO: Infinity,
  }
  const limit = limits[tier] || 5
  
  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity }
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

    const { keywords, count = 5 } = await request.json()
    
    if (!keywords) {
      return NextResponse.json({ error: 'Keywords required' }, { status: 400 })
    }

    const userEmail = session.user.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tier = (session.user as { tier?: string })?.tier || 'FREE'
    const limitCheck = await checkDailyLimit(user.id, tier, 'generate-title')
    
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: 'Batas penggunaan harian tercapai. Upgrade ke paket yang lebih tinggi.' 
      }, { status: 429 })
    }

    const titles = await generateResearchTitle(keywords, count)
    
    // Log usage
    await prisma.toolUsage.create({
      data: {
        userId: user.id,
        toolName: 'generate-title',
        inputText: keywords,
        outputText: titles.join('\n'),
      },
    })

    return NextResponse.json({
      titles,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Generate title error:', error)
    return NextResponse.json({ error: 'Failed to generate titles' }, { status: 500 })
  }
}