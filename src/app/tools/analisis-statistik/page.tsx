'use client'
import type { User } from '@supabase/supabase-js'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

export default function AnalisisStatistikPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [question, setQuestion] = useState('')
  const [dataType, setDataType] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    recommendation: {
      recommended_test: string
      test_name_formatted: string
      justification: string
      assumptions_to_check: string[]
      interpretation_guide: string
      alternative_tests: string[]
      sample_size_considerations: string
    }
  } | null>(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | 'unlimited' | null>(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/analisis-statistik')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/analisis-statistik')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)
    setCached(false)

    try {
      const response = await fetch('/api/tools/analyze-statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          dataType,
          hypothesis: hypothesis || undefined,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setResults(data)
        setRemaining(data.remaining)
        setCached(data.cached || false)
        trackUsage('Asisten Analisis Statistik', question)
      } else {
        setError(data.error?.message || data.error || 'Gagal menghasilkan rekomendasi analisis statistik')
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
              <span className="text-4xl">📊</span>
              <div>
                <h1 className="text-3xl font-bold">Asisten Analisis Statistik</h1>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full">PRO</span>
            </div>
            <p className="text-gray-400">Rekomendasikan uji statistik yang tepat untuk pertanyaan penelitian Anda.</p>
            {remaining !== null && (
              <p className="text-sm text-purple-400 mt-2">
                Sisa penggunaan hari ini: {remaining === 'unlimited' ? 'Unlimited' : remaining}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="question" className="block text-sm font-medium mb-2">
                Pertanyaan Penelitian <span className="text-red-400">*</span>
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Jelaskan pertanyaan atau tujuan penelitian Anda. Contoh: Apakah ada perbedaan efektivitas antara metode pembelajaran konvensional dan metode pembelajaran berbasis teknologi pada mahasiswa tingkat pertama?"
                required
                rows={4}
                maxLength={300}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{question.length}/300 karakter</p>
            </div>

            <div className="mb-6">
              <label htmlFor="dataType" className="block text-sm font-medium mb-2">
                Jenis Data <span className="text-red-400">*</span>
              </label>
              <select
                id="dataType"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
              >
                <option value="">Pilih jenis data...</option>
                <option value="categorical">Kategorikal (Contoh: jenis kelamin, kelompok usia,Ya/Tidak)</option>
                <option value="numerical">Numerik (Contoh: nilai ujian, tinggi badan, pendapatan)</option>
                <option value="mixed">Mixed (Gabungan kategorikal dan numerik)</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="hypothesis" className="block text-sm font-medium mb-2">
                Hipotesis <span className="text-gray-500">(opsional)</span>
              </label>
              <textarea
                id="hypothesis"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="Tuliskan hipotesis penelitian Anda jika ada. Contoh: Tidak terdapat perbedaan signifikan efektivitas antara metode pembelajaran konvensional dan berbasis teknologi."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{hypothesis.length}/500 karakter</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !question.trim() || !dataType}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Menganalisis...' : 'Rekomendasikan Analisis Statistik'}
            </button>
          </form>

          {results && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8">
              {cached && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                  Hasil dari cache (kueri serupa telah diproses sebelumnya)
                </div>
              )}

              {/* Recommended Test */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-purple-300">💡 Uji Statistik yang Direkomendasikan</h2>
                  <button
                    onClick={() => copyToClipboard(results.recommendation.test_name_formatted)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <p className="text-2xl font-bold text-white mb-2">{results.recommendation.test_name_formatted}</p>
              </div>

              {/* Justification */}
              <div>
                <h3 className="text-lg font-bold mb-3">📝 Justifikasi</h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed bg-zinc-800 rounded-xl p-4">
                  {results.recommendation.justification}
                </p>
              </div>

              {/* Assumptions to Check */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">✅ Asumsi yang Perlu Diperiksa</h3>
                  <button
                    onClick={() => copyToClipboard(results.recommendation.assumptions_to_check.join('\n'))}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <ul className="space-y-2">
                  {results.recommendation.assumptions_to_check.map((assumption, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-zinc-800 rounded-xl">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className="text-gray-300">{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interpretation Guide */}
              <div>
                <h3 className="text-lg font-bold mb-3">📖 Panduan Interpretasi</h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed bg-zinc-800 rounded-xl p-4">
                  {results.recommendation.interpretation_guide}
                </p>
              </div>

              {/* Sample Size Considerations */}
              {results.recommendation.sample_size_considerations && (
                <div>
                  <h3 className="text-lg font-bold mb-3">👥 Pertimbangan Ukuran Sampel</h3>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed bg-zinc-800 rounded-xl p-4">
                    {results.recommendation.sample_size_considerations}
                  </p>
                </div>
              )}

              {/* Alternative Tests */}
              {results.recommendation.alternative_tests && results.recommendation.alternative_tests.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">🔄 Alternatif Uji Statistik</h3>
                  <ul className="space-y-2">
                    {results.recommendation.alternative_tests.map((alt, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-zinc-800 rounded-xl">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span className="text-gray-300">{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
