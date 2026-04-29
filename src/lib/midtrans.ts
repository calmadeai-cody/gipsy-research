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
  BASIC: 19000,
  PRO: 19000, // FLASH SALE 50% — original was 39000
  PRO_RESEARCHER: 29000, // FLASH SALE — original was 49000
}

export const TIER_NAMES: Record<string, string> = {
  BASIC: 'Basic',
  PRO: 'Pro',
  PRO_RESEARCHER: 'Pro Researcher',
}

export function getEnabledPayments(tier: string): string[] {
  if (tier === 'PRO' || tier === 'PRO_RESEARCHER') {
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