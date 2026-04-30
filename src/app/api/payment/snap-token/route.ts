import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { snapClient, generateOrderId, TIER_PRICES, getEnabledPayments } from '@/lib/midtrans'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier } = await request.json()
    
    if (!tier || !['BASIC', 'PRO', 'PRO_RESEARCHER'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Check existing pending subscription
    const { data: existingSubs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .eq('tier', tier)
      .limit(1)

    const existingSub = existingSubs?.[0]
    const grossAmount = TIER_PRICES[tier]
    const orderId = generateOrderId(tier)

    // Create or update subscription
    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update({
          midtrans_order_id: orderId,
          status: 'pending',
        })
        .eq('id', existingSub.id)
    } else {
      await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          tier,
          status: 'pending',
          period: 'MONTHLY',
          midtrans_order_id: orderId,
        })
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single()

    const customerDetails = {
      first_name: profile?.name?.split(' ')[0] || 'GipsyAI',
      last_name: profile?.name?.split(' ').slice(1).join(' ') || 'User',
      email: profile?.email || user.email,
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