import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateBibliography } from '@/lib/ai'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, style = 'APA' } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 })
    }

    const userEmail = session.user.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tier = (session.user as { tier?: string })?.tier || 'BASIC'
    
    if (tier === 'BASIC') {
      return NextResponse.json({ 
        error: 'Tool ini hanya tersedia untuk paket Pro dan Pro Researcher. Upgrade sekarang!' 
      }, { status: 403 })
    }

    const limitCheck = await checkDailyLimit(user.id, tier, 'generate-references')
    
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: 'Batas penggunaan harian tercapai. Upgrade ke paket yang lebih tinggi.' 
      }, { status: 429 })
    }

    const references = await generateBibliography(content, style)
    
    // Log usage
    await prisma.toolUsage.create({
      data: {
        userId: user.id,
        toolName: 'generate-references',
        inputText: content.substring(0, 500),
        outputText: references.join('\n'),
      },
    })

    return NextResponse.json({
      references,
      remaining: limitCheck.remaining === Infinity ? 'unlimited' : limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Generate references error:', error)
    return NextResponse.json({ error: 'Failed to generate references' }, { status: 500 })
  }
}