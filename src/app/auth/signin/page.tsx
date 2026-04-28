'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      })
      
      if (result?.error) {
        setError('Gagal mengirim email. Silakan coba lagi.')
      } else {
        setEmail('')
        window.location.href = result?.url || callbackUrl
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🤖</span>
            <span className="text-2xl font-bold gradient-text">GipsyAI</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Masuk ke GipsyAI</h1>
          <p className="text-gray-400">Masukkan email Anda untuk menerima link magic</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition"
          >
            {loading ? 'Mengirim...' : 'Kirim Link Masuk'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Belum punya akun? Kami akan otomatis membuat akun baru saat Anda masuk.
        </p>
      </div>
    </div>
  )
}