'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

interface ResearchGapItem {
  title: string
  explanation: string
}

interface ResearchGapResult {
  research_gaps: ResearchGapItem[]
  novelty_points: ResearchGapItem[]
  suggested_directions: string[]
  remaining?: string
  cached?: boolean
}

const MAX_TOPIC_LENGTH = 500
const MAX_TIMELINE_LENGTH = 1000

export default function GeneratorResearchGapPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [topic, setTopic] = useState('')
  const [timeline, setTimeline] = useState('')
  const [result, setResult] = useState<ResearchGapResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((res: { data: { user: any } }) => {
      if (!res.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/generator-research-gap')
      } else {
        setUser(res.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/generator-research-gap')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/generate-research-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research_topic: topic, research_timeline: timeline }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data)
        trackUsage('Generator Research Gap & Novelty', topic)
      } else {
        setError(data.error?.message || data.error || 'Gagal menghasilkan gap penelitian')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="text-4xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold mb-2">Generator Research Gap & Kebaruan</h1>
            <p className="text-gray-400">
              Identifikasi gap penelitian dan titik kebaruan dari topik yang Anda teliti.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8 space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-2">
                Topik Penelitian <span className="text-red-400">*</span>
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value.slice(0, MAX_TOPIC_LENGTH))}
                placeholder="Contoh: Deteksi dini penyakit diabetes menggunakan machine learning dengan data wearable device"
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{topic.length}/{MAX_TOPIC_LENGTH}</div>
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium mb-2">
                Konteks/Timeline Penelitian <span className="text-gray-500">(opsional)</span>
              </label>
              <textarea
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value.slice(0, MAX_TIMELINE_LENGTH))}
                placeholder="Contoh: Penelitian sebelumnya fokus pada deteksi menggunakan CNN pada data laboratorium. Ada gap pada penggunaan data real-time dari wearable device."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{timeline.length}/{MAX_TIMELINE_LENGTH}</div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Menganalisis...' : 'Identifikasi Gap & Kebaruan'}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">🔍 Research Gaps</h2>
                <ul className="space-y-4">
                  {result.research_gaps.map((gap, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-cyan-600/30 text-cyan-400 rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white">{gap.title}</p>
                        <p className="text-sm text-gray-400 mt-1">{gap.explanation}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-emerald-400 mb-4">✨ Kebaruan (Novelty Points)</h2>
                <ul className="space-y-4">
                  {result.novelty_points.map((point, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-emerald-600/30 text-emerald-400 rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white">{point.title}</p>
                        <p className="text-sm text-gray-400 mt-1">{point.explanation}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-amber-400 mb-4">🎯 Arah Penelitian yang Disarankan</h2>
                <ul className="space-y-3">
                  {result.suggested_directions.map((direction, index) => (
                    <li key={index} className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-8 h-8 bg-amber-600/30 text-amber-400 rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-300">{direction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center text-gray-500 text-sm">
                {result.remaining && <p className="text-cyan-500">📊 Sisa penggunaan: {result.remaining}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}