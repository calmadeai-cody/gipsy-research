'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

const MAX_LENGTH = 5000

const ANALYSIS_TYPES = [
  { value: 'summarize', label: 'Ringkasan', description: 'Buat ringkasan 200-300 kata dari transkrip' },
  { value: 'key_points', label: 'Poin Kunci', description: 'Ekstrak 5-7 poin penting dari transkrip' },
  { value: 'themes', label: 'Tema Utama', description: 'Identifikasi 3-5 tema utama dalam transkrip' },
  { value: 'sentiment', label: 'Sentimen', description: 'Analisis sentimen dan emosi dalam transkrip' },
]

export default function AnalisisTranskripPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [transcriptText, setTranscriptText] = useState('')
  const [analysisType, setAnalysisType] = useState<string>('summarize')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((res: { data: { user: any } }) => {
      if (!res.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/analisis-transkrip')
      } else {
        setUser(res.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/analisis-transkrip')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcriptText, type: analysisType }),
      })

      const data = await response.json()

      if (response.status === 429 && data.error?.code === 'RATE_LIMIT_EXCEEDED') {
        setShowUpgradeModal(true)
        setLoading(false)
        return
      }

      if (response.ok) {
        setResult(data.result)
        trackUsage('Analisis Transkrip', transcriptText)
      } else {
        setError(data.error?.message || 'Gagal menganalisis transkrip')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const renderResult = () => {
    if (!result) return null

    switch (analysisType) {
      case 'summarize':
        return (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3">Ringkasan</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{result.summary}</p>
            <p className="text-gray-500 text-sm mt-4">
              Diproses pada: {new Date(result.processed_at).toLocaleString('id-ID')}
            </p>
          </div>
        )

      case 'key_points':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Poin Kunci</h3>
            {result.key_points?.map((point: any, index: number) => (
              <div key={index} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    point.importance === 'high' ? 'bg-red-500' :
                    point.importance === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="text-gray-200">{point.point}</p>
                    {point.context && (
                      <p className="text-gray-500 text-sm mt-1">{point.context}</p>
                    )}
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
                      point.importance === 'high' ? 'bg-red-500/20 text-red-400' :
                      point.importance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {point.importance}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'themes':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tema Utama</h3>
            {result.themes?.map((theme: any, index: number) => (
              <div key={index} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📌</span>
                  <h4 className="text-lg font-medium text-white">{theme.theme}</h4>
                </div>
                <p className="text-gray-400 text-sm mb-2">{theme.description}</p>
                <p className="text-gray-500 text-xs">Relevansi: {theme.relevance}</p>
              </div>
            ))}
          </div>
        )

      case 'sentiment':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Analisis Sentimen</h3>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Sentimen Keseluruhan</span>
                <span className={`text-2xl font-bold ${
                  result.sentiment?.overall === 'positive' ? 'text-green-400' :
                  result.sentiment?.overall === 'negative' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {result.sentiment?.overall?.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-400">Positif</span>
                    <span className="text-gray-400">{result.sentiment?.positive_percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${result.sentiment?.positive_percentage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-400">Negatif</span>
                    <span className="text-gray-400">{result.sentiment?.negative_percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${result.sentiment?.negative_percentage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-yellow-400">Netral</span>
                    <span className="text-gray-400">{result.sentiment?.neutral_percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${result.sentiment?.neutral_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Nada Emosional:</p>
                <p className="text-white">{result.sentiment?.emotional_tone}</p>
              </div>

              {result.sentiment?.key_sentiments?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Sentimen Kunci:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.sentiment.key_sentiments.map((sent: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                        {sent}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Memuat...</div>
      </div>
    )
  }

  const charCount = transcriptText.length
  const isOverLimit = charCount > MAX_LENGTH

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
            <div className="text-4xl mb-4">📝</div>
            <h1 className="text-3xl font-bold mb-2">Analisis Teks Transkrip</h1>
            <p className="text-gray-400">
              Analisis transkrip dengan berbagai metode: ringkasan, poin kunci, tema, atau sentimen.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="transcript" className="block text-sm font-medium mb-2">
                Teks Transkrip
                <span className={`ml-2 text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
                  {charCount}/{MAX_LENGTH}
                </span>
              </label>
              <textarea
                id="transcript"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Tempel teks transkrip yang ingin dianalisis di sini..."
                required
                rows={8}
                maxLength={MAX_LENGTH + 500}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Tipe Analisis</label>
              <div className="grid grid-cols-2 gap-3">
                {ANALYSIS_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setAnalysisType(type.value)}
                    className={`p-4 rounded-xl border text-left transition ${
                      analysisType === type.value
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isOverLimit}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-xl font-medium transition"
            >
              {loading ? 'Menganalisis...' : 'Analisis Transkrip'}
            </button>
          </form>

          {result && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4">Hasil Analisis</h2>
              {renderResult()}
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
            <div className="text-4xl mb-4 text-center">🚀</div>
            <h2 className="text-2xl font-bold mb-2 text-center">Upgrade ke PRO</h2>
            <p className="text-gray-400 text-center mb-6">
              Batas penggunaan harian tercapai. Upgrade ke paket PRO untuk penggunaan unlimited.
            </p>
            <div className="space-y-3">
              <Link
                href="/pricing"
                className="block w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-center transition"
              >
                Lihat Paket PRO
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="block w-full py-2 border border-zinc-700 hover:border-zinc-600 rounded-xl font-medium transition"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}