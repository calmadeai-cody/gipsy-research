import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ''

function verifySignature(payload: Record<string, any>): boolean {
  const { order_id, status_code, gross_amount, signature_key } = payload
  
  const mySignature = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
    .digest('hex')
  
  return mySignature === signature_key
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // Verify signature
    if (!verifySignature(payload)) {
      console.error('Invalid Midtrans signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { order_id, transaction_status, transaction_id, gross_amount, payment_type } = payload
    
    console.log('Midtrans webhook:', { order_id, transaction_status, gross_amount })

    // Find subscription by order_id
    const subscription = await prisma.subscription.findFirst({
      where: { midtransOrderId: order_id },
    })

    if (!subscription) {
      console.error('Subscription not found for order:', order_id)
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Process based on transaction status
    switch (transaction_status) {
      case 'capture':
      case 'settlement':
        // Payment successful
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'active',
            midtransTransactionId: transaction_id,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        })
        console.log('Subscription activated:', subscription.userId)
        break

      case 'pending':
        // Payment pending - keep as is
        console.log('Payment pending for:', order_id)
        break

      case 'expire':
        // Payment expired
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'cancelled' },
        })
        console.log('Subscription expired:', order_id)
        break

      case 'cancel':
      case 'deny':
        // Payment failed
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'inactive' },
        })
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