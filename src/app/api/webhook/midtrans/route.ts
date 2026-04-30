import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ''

function verifySignature(payload: Record<string, string>): boolean {
  const { order_id, status_code, gross_amount, signature_key } = payload
  
  const mySignature = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
    .digest('hex')
  
  return mySignature === signature_key
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const payload = await request.json()
    
    // Verify signature
    if (!verifySignature(payload)) {
      console.error('Invalid Midtrans signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { order_id, transaction_status, transaction_id, gross_amount } = payload
    
    console.log('Midtrans webhook:', { order_id, transaction_status, gross_amount })

    // Find subscription by order_id
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, user_id')
      .eq('midtrans_order_id', order_id)
      .single()

    if (!subscription) {
      console.error('Subscription not found for order:', order_id)
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Process based on transaction status
    switch (transaction_status) {
      case 'capture':
      case 'settlement':
        // Payment successful
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            midtrans_transaction_id: transaction_id,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          })
          .eq('id', subscription.id)
        console.log('Subscription activated:', subscription.user_id)
        break

      case 'pending':
        // Payment pending - keep as is
        console.log('Payment pending for:', order_id)
        break

      case 'expire':
        // Payment expired
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscription.id)
        console.log('Subscription expired:', order_id)
        break

      case 'cancel':
      case 'deny':
        // Payment failed
        await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('id', subscription.id)
        console.log('Subscription cancelled:', order_id)
        break

      default:
        console.log('Unknown transaction status:', transaction_status)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}