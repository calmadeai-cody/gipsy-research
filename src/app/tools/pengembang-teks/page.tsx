'use client'
import type { User } from '@supabase/supabase-js'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

const MAX_TEXT_LENGTH = 2000
const MAX_FOCUS_LENGTH = 300

export default function PengembangTeksPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [originalText, setOriginalText] = useState('')
  const [focusArea, setFocusArea] = useState('')
  const [style, setStyle] = useState('comprehensive')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    developed_text: string
    original_length: number
    developed_length: number
    focus_area?: string
    style: string
  } | null>(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | 'unlimited' | null>(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/pengembang-teks')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/pengembang-teks')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)
    setCached(false)

    try {
      const response = await fetch('/api/tools/develop-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_text: originalText,
          focus_area: focusArea,
          style: style,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setResults(data)
        setRemaining(data.remaining)
        setCached(data.cached || false)
        trackUsage('Pengembang Teks', originalText)
      } else {
        setError(data.error?.message || data.error || 'Gagal mengembangkan teks')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Memuat...</div>
      </div>
    )
  }

  const charCount = originalText.length
  const isOverLimit = charCount > MAX_TEXT_LENGTH
  const isTooShort = charCount > 0 && charCount < 10
  const expansionRatio = results ? (results.developed_length / results.original_length).toFixed(1) : null

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
            <form action="/auth/signout" method="POST">
              <button type="submit" className="px-4 py-2 text-sm border border-gray-700 hover:border-gray-600 rounded-lg transition">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">📝</span>
              <div>
                <h1 className="text-3xl font-bold">Pengembang Teks</h1>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full">PRO</span>
            </div>
            <p className="text-gray-400">Kembangkan dan perluas teks akademik menjadi lebih lengkap dengan penjelasan, contoh, dan elaborasi yang mendalam.</p>
            {remaining !== null && (
              <p className="text-sm text-emerald-400 mt-2">
                Sisa penggunaan hari ini: {remaining === 'unlimited' ? 'Unlimited' : remaining}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="originalText" className="block text-sm font-medium mb-2">
                Teks Asli <span className="text-red-400">*</span>
                <span className={`ml-2 text-xs ${isOverLimit ? 'text-red-400' : isTooShort ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {charCount}/{MAX_TEXT_LENGTH}
                </span>
              </label>
              <textarea
                id="originalText"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Tempel teks yang ingin dikembangkan di sini. Teks akan diperluas 2-3x lipat dengan penjelasan dan elaborasi akademik..."
                required
                rows={8}
                maxLength={MAX_TEXT_LENGTH + 500}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 transition resize-none"
              />
              {isTooShort && charCount > 0 && (
                <p className="text-xs text-yellow-400 mt-1">Minimal 10 karakter untuk mengembangkan teks</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="focusArea" className="block text-sm font-medium mb-2">
                Fokus Pengembangan <span className="text-gray-500 text-xs">(opsional)</span>
                <span className="ml-2 text-xs text-gray-500">
                  {focusArea.length}/{MAX_FOCUS_LENGTH}
                </span>
              </label>
              <input
                type="text"
                id="focusArea"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="Contoh: metodologi, temuan, diskusi, kesimpulan"
                maxLength={MAX_FOCUS_LENGTH}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="style" className="block text-sm font-medium mb-2">
                Gaya Pengembangan <span className="text-gray-500 text-xs">(opsional)</span>
              </label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="comprehensive">Komprehensif — Lengkap dan menyeluruh</option>
                <option value="detailed">Detail — Sangat mendetail dan teknis</option>
                <option value="concise">Ringkas — Padat namun informatif</option>
              </select>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isOverLimit || isTooShort}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed rounded-xl font-medium transition"
            >
              {loading ? 'Mengembangkan teks...' : 'Kembangkan Teks'}
            </button>
          </form>

          {results && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
              {cached && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                  Hasil dari cache (kueri serupa telah diproses sebelumnya)
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-400">{results.original_length}</div>
                  <div className="text-xs text-gray-500">Karakter Asli</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{results.developed_length}</div>
                  <div className="text-xs text-gray-500">Karakter Hasil</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{expansionRatio}x</div>
                  <div className="text-xs text-gray-500">Ekspansi</div>
                </div>
              </div>

              {/* Developed Text */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold">Teks yang Dikembangkan</h2>
                  <button
                    onClick={() => copyToClipboard(results.developed_text)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <div className="p-4 bg-gray-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {results.developed_text}
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {results.focus_area && (
                  <span className="px-3 py-1 bg-gray-800 rounded-full">
                    Fokus: {results.focus_area}
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-800 rounded-full capitalize">
                  Gaya: {results.style}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
