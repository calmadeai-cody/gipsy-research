'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ParaphrasePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [paragraph, setParagraph] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push('/auth/signin?callbackUrl=/tools/paraphrase')
      return
    }
    
    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/tools/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraph }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data.paraphrased)
      } else {
        setError(data.error || 'Gagal memparafrase')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold gradient-text">GipsyAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
            <Link href="/api/auth/signout" className="px-4 py-2 text-sm border border-gray-700 hover:border-gray-600 rounded-lg transition">
              Keluar
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="text-4xl mb-4">✍️</div>
            <h1 className="text-3xl font-bold mb-2">Parafrase Paragraf</h1>
            <p className="text-gray-400">Masukkan paragraf yang ingin diparafrase. AI akan menghasilkan versi baru dengan makna yang sama.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="paragraph" className="block text-sm font-medium mb-2">Paragraf Asli</label>
              <textarea
                id="paragraph"
                value={paragraph}
                onChange={(e) => setParagraph(e.target.value)}
                placeholder="Masukkan paragraf yang ingin diparafrase..."
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
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
              {loading ? 'Memparafrase...' : 'Parafrase'}
            </button>
          </form>

          {result && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4">Hasil Parafrase</h2>
              <div className="p-4 bg-gray-800 rounded-xl text-gray-200 whitespace-pre-wrap mb-4">
                {result}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="w-full py-2 border border-gray-700 hover:border-gray-600 rounded-xl font-medium transition"
              >
                Salin Hasil
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}