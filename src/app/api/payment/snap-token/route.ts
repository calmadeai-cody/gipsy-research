import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { snapClient, generateOrderId, TIER_PRICES, getEnabledPayments } from '@/lib/midtrans'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier } = await request.json()
    
    if (!tier || !['BASIC', 'PRO', 'PRO_RESEARCHER'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const userEmail = session.user.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check existing pending subscription
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'pending',
        tier,
      },
    })

    const grossAmount = TIER_PRICES[tier]
    const orderId = generateOrderId(tier)

    // Create or update subscription
    await prisma.subscription.upsert({
      where: { id: existingSub?.id || 'temp' },
      create: {
        id: existingSub?.id || undefined,
        userId: user.id,
        tier,
        status: 'pending',
        period: 'MONTHLY',
        midtransOrderId: orderId,
      },
      update: {
        midtransOrderId: orderId,
        status: 'pending',
      },
    })

    // Create Snap token
    const customerDetails = {
      first_name: user.name?.split(' ')[0] || 'GipsyAI',
      last_name: user.name?.split(' ').slice(1).join(' ') || 'User',
      email: user.email,
      phone: '',
    }

    const transactionParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: customerDetails,
      enabled_payments: getEnabledPayments(tier),
      credit_card: {
        secure: true,
      },
      expiry: {
        start_time: new Date().toISOString(),
        duration: 30,
        unit: 'minutes',
      },
    }

    const response = await snapClient.createTransaction(transactionParams)
    
    return NextResponse.json({
      token: response.token,
      redirectUrl: response.redirect_url,
    })
  } catch (error) {
    console.error('Snap token error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}