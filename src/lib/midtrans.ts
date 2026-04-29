import Midtrans from 'midtrans-client'

const isProduction = process.env.MIDTRANS_ENV === 'production'

export const snapClient = new Midtrans.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
})

export function generateOrderId(tier: string): string {
  return `GIPSYAI-${tier}-${Date.now()}`
}

export const TIER_PRICES: Record<string, number> = {
  LITE: 199000,
  PRO: 499000,
}

export const TIER_NAMES: Record<string, string> = {
  LITE: 'Lite',
  PRO: 'Pro',
}

export function getEnabledPayments(tier: string): string[] {
  if (tier === 'PRO') {
    return [
      'credit_card',
      'gopay',
      'shopeepay',
      'bca_va',
      'bni_va',
      'bri_va',
      'permata_va',
      'mandiri_va',
      'cimb_va',
      'other_va',
      'indomaret',
      'alfamart',
      'qris',
    ]
  }
  return [
    'credit_card',
    'gopay',
    'bca_va',
    'bni_va',
    'bri_va',
    'permata_va',
    'indomaret',
    'qris',
  ]
}