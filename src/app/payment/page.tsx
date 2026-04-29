'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'

const TIER_INFO = {
  LITE: {
    name: 'Lite',
    price: 199000,
    priceDisplay: 'Rp 199.000',
    period: 'per bulan',
    description: 'Akses semua tool AI dengan 50x penggunaan per hari.',
  },
  PRO: {
    name: 'Pro',
    price: 499000,
    priceDisplay: 'Rp 499.000',
    period: 'per bulan',
    description: 'Akses tak terbatas ke semua tool AI dan fitur premium.',
  },
}

interface SnapResult {
  order_id?: string
  transaction_id?: string
  transaction_status?: string
  status_message?: string
}

interface SnapCallbacks {
  onSuccess: (result: SnapResult) => void
  onPending: (result: SnapResult) => void
  onError: (result: SnapResult) => void
  onClose: () => void
}

// Extend Window interface for Midtrans Snap
interface SnapWindow extends Window {
  snap?: {
    pay(token: string, callbacks: SnapCallbacks): void
  }
}

function PaymentForm() {
  const searchParams = useSearchParams()
  const tierParam = searchParams.get('tier') || 'LITE'
  const tier = (tierParam.toUpperCase() === 'PRO' ? 'PRO' : 'LITE') as 'LITE' | 'PRO'
  const info = TIER_INFO[tier]
  const [, setSnapToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/v1/js/snap.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payment/snap-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()
      
      if (response.ok && data.token) {
        setSnapToken(data.token)
        const snapUrl = data.redirectUrl
        if (snapUrl) {
          window.location.href = snapUrl
        } else {
          if ((window as SnapWindow).snap) {
            (window as SnapWindow).snap!.pay(data.token, {
              onSuccess: (result: SnapResult) => {
                console.log('Payment success:', result)
                window.location.href = '/dashboard?payment=success'
              },
              onPending: (result: SnapResult) => {
                console.log('Payment pending:', result)
                window.location.href = '/dashboard?payment=pending'
              },
              onError: (result: SnapResult) => {
                console.error('Payment error:', result)
                setError('Pembayaran gagal. Silakan coba lagi.')
                setLoading(false)
              },
              onClose: () => {
                console.log('Snap closed')
                setLoading(false)
              },
            } as SnapCallbacks)
          }
        }
      } else {
        setError(data.error || 'Gagal membuat transaksi payment')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Order Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Paket {info.name}</h2>
            <p className="text-gray-400 text-sm">{info.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold gradient-text">{info.priceDisplay}</div>
            <div className="text-gray-500 text-sm">{info.period}</div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span>{info.priceDisplay}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-400">Total</span>
            <span className="font-bold text-lg">{info.priceDisplay}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium text-lg transition"
        >
          {loading ? 'Memproses...' : 'Bayar dengan Midtrans'}
        </button>

        <p className="text-center text-gray-500 text-xs mt-4">
          Pembayaran diproses oleh Midtrans. Kami tidak menyimpan data kartu kredit Anda.
        </p>
      </div>

      {/* Payment Methods Info */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h3 className="font-bold mb-4">Metode Pembayaran Tersedia</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
          <div>✓ Virtual Account (BCA, BNI, BRI, Mandiri)</div>
          <div>✓ GoPay</div>
          <div>✓ ShopeePay</div>
          <div>✓ Credit Card</div>
          <div>✓ QRIS</div>
          <div>✓ Convenience Store (Indomaret, Alfamart)</div>
        </div>
      </div>
    </>
  )
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold gradient-text">GipsyAI</span>
          </Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
        </div>
      </nav>

      <main className="pt-32 px-6 pb-12">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Konfirmasi Pembayaran</h1>
            <p className="text-gray-400">Pilih metode pembayaran yang Anda inginkan</p>
          </div>

          <Suspense fallback={<div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">Memuat...</div>}>
            <PaymentForm />
          </Suspense>

          <div className="text-center mt-8">
            <Link href="/" className="text-gray-400 hover:text-white transition text-sm">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
