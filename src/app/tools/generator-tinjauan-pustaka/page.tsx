'use client'
import type { User } from '@supabase/supabase-js'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

export default function GeneratorTinjauanPustakaPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [researchTopic, setResearchTopic] = useState('')
  const [researchFocus, setResearchFocus] = useState('')
  const [numSources, setNumSources] = useState(5)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    sections: {
      introductory: string
      theoretical: string
      gap_connection: string
      summary: string
    }
    sources: Array<{
      title: string
      author: string
      year: string
      relevance: string
      key_findings: string
    }>
  } | null>(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | 'unlimited' | null>(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/generator-tinjauan-pustaka')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/generator-tinjauan-pustaka')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)
    setCached(false)

    try {
      const response = await fetch('/api/tools/generate-literature-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_topic: researchTopic,
          research_focus: researchFocus,
          num_sources: numSources,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setResults(data)
        setRemaining(data.remaining)
        setCached(data.cached || false)
        trackUsage('Tinjauan Pustaka', researchTopic)
      } else {
        setError(data.error?.message || data.error || 'Gagal menghasilkan tinjauan pustaka')
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

  const copyAllSections = () => {
    if (!results) return
    const text = `PARAGRAF PENDAHULUAN\n${'='.repeat(30)}\n${results.sections.introductory}\n\nFONDASI TEORETIS\n${'='.repeat(30)}\n${results.sections.theoretical}\n\nKETERKAITAN DENGAN GAP PENELITIAN\n${'='.repeat(30)}\n${results.sections.gap_connection}\n\nRINGKASAN\n${'='.repeat(30)}\n${results.sections.summary}`
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
              <span className="text-4xl">📚</span>
              <div>
                <h1 className="text-3xl font-bold">Generator Tinjauan Pustaka</h1>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full">PRO</span>
            </div>
            <p className="text-gray-400">Hasilkan tinjauan pustaka akademik untuk penelitian Anda berdasarkan topik dan fokus yang diberikan.</p>
            {remaining !== null && (
              <p className="text-sm text-purple-400 mt-2">
                Sisa penggunaan hari ini: {remaining === 'unlimited' ? 'Unlimited' : remaining}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="researchTopic" className="block text-sm font-medium mb-2">
                Topik Penelitian <span className="text-red-400">*</span>
              </label>
              <textarea
                id="researchTopic"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="Jelaskan topik penelitian Anda. Contoh: Efektivitas pembelajaran jarak jauh pada mahasiswa di Indonesia"
                required
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{researchTopic.length}/500 karakter</p>
            </div>

            <div className="mb-6">
              <label htmlFor="researchFocus" className="block text-sm font-medium mb-2">
                Fokus Penelitian <span className="text-gray-500">(opsional)</span>
              </label>
              <textarea
                id="researchFocus"
                value={researchFocus}
                onChange={(e) => setResearchFocus(e.target.value)}
                placeholder="Tentukan fokus spesifik penelitian Anda. Contoh: Fokus pada penggunaan platform LMS dan dampaknya terhadap hasil belajar"
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{researchFocus.length}/500 karakter</p>
            </div>

            <div className="mb-6">
              <label htmlFor="numSources" className="block text-sm font-medium mb-2">
                Jumlah Sumber
              </label>
              <input
                id="numSources"
                type="number"
                value={numSources}
                onChange={(e) => setNumSources(Math.min(Math.max(1, parseInt(e.target.value) || 1), 10))}
                min={1}
                max={10}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">1-10 sumber (default: 5)</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !researchTopic.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Menganalisis...' : 'Hasilkan Tinjauan Pustaka'}
            </button>
          </form>

          {results && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-8">
              {cached && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                  Hasil dari cache (kueri serupa telah diproses sebelumnya)
                </div>
              )}

              {/* Sections */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Bagian Tinjauan Pustaka</h2>
                  <button
                    onClick={copyAllSections}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin Semua
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Introductory */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-purple-300">📖 Paragraf Pendahuluan</h3>
                      <button
                        onClick={() => copyToClipboard(results.sections.introductory)}
                        className="text-sm text-purple-400 hover:text-purple-300 transition"
                      >
                        Salin
                      </button>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{results.sections.introductory}</p>
                  </div>

                  {/* Theoretical */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-blue-300">📚 Fondasi Teoretis</h3>
                      <button
                        onClick={() => copyToClipboard(results.sections.theoretical)}
                        className="text-sm text-purple-400 hover:text-purple-300 transition"
                      >
                        Salin
                      </button>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{results.sections.theoretical}</p>
                  </div>

                  {/* Gap Connection */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-yellow-300">🔍 Keterkaitan dengan Gap Penelitian</h3>
                      <button
                        onClick={() => copyToClipboard(results.sections.gap_connection)}
                        className="text-sm text-purple-400 hover:text-purple-300 transition"
                      >
                        Salin
                      </button>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{results.sections.gap_connection}</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-green-300">✨ Ringkasan</h3>
                      <button
                        onClick={() => copyToClipboard(results.sections.summary)}
                        className="text-sm text-purple-400 hover:text-purple-300 transition"
                      >
                        Salin
                      </button>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{results.sections.summary}</p>
                  </div>
                </div>
              </div>

              {/* Sources */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Sumber Pustaka</h2>
                </div>
                <div className="space-y-4">
                  {results.sources.map((source, index) => (
                    <div key={index} className="bg-gray-800 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-base font-semibold text-white">{source.title}</h4>
                        <span className="text-sm text-gray-500 shrink-0 ml-2">{source.year}</span>
                      </div>
                      <p className="text-sm text-purple-400 mb-2">{source.author}</p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">Relevansi:</span>
                          <p className="text-sm text-gray-300 mt-1">{source.relevance}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">Temuan Utama:</span>
                          <p className="text-sm text-gray-300 mt-1">{source.key_findings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}