'use client'
import type { User } from '@supabase/supabase-js'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

export default function GeneratorProposalPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [researchTitle, setResearchTitle] = useState('')
  const [researchProblem, setResearchProblem] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    background: string
    objectives: string[]
    methodology: string
    expected_outcomes: string[]
    timeline: string
    references: string[]
  } | null>(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | 'unlimited' | null>(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/generator-proposal')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/generator-proposal')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)
    setCached(false)

    try {
      const response = await fetch('/api/tools/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_title: researchTitle,
          research_problem: researchProblem,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setResults({
          background: data.background,
          objectives: data.objectives,
          methodology: data.methodology,
          expected_outcomes: data.expected_outcomes,
          timeline: data.timeline,
          references: data.references,
        })
        setRemaining(data.remaining)
        setCached(data.cached || false)
        trackUsage('Generator Proposal Penelitian', researchTitle)
      } else {
        setError(data.error?.message || data.error || 'Gagal menghasilkan proposal')
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
            <div className="text-4xl mb-4">📋</div>
            <h1 className="text-3xl font-bold mb-2">Generator Proposal Penelitian</h1>
            <p className="text-gray-400">Masukkan judul dan masalah penelitian untuk menghasilkan proposal penelitian yang komprehensif.</p>
            {remaining !== null && (
              <p className="text-sm text-purple-400 mt-2">
                Sisa penggunaan hari ini: {remaining === 'unlimited' ? 'Unlimited' : remaining}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="researchTitle" className="block text-sm font-medium mb-2">
                Judul Penelitian <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="researchTitle"
                value={researchTitle}
                onChange={(e) => setResearchTitle(e.target.value)}
                placeholder="Contoh: Pengaruh Literasi Digital terhadap Kinerja Akademik Mahasiswa"
                required
                maxLength={300}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">{researchTitle.length}/300 karakter</p>
            </div>

            <div className="mb-6">
              <label htmlFor="researchProblem" className="block text-sm font-medium mb-2">
                Masalah Penelitian <span className="text-red-400">*</span>
              </label>
              <textarea
                id="researchProblem"
                value={researchProblem}
                onChange={(e) => setResearchProblem(e.target.value)}
                placeholder="Jelaskan masalah penelitian yang akan diselesaikan. Contoh: Di era digital saat ini, mahasiswa menghadapi tantangan dalam mengembangkan literasi digital yang memadai sementara dampaknya terhadap kinerja akademik masih belum optimal."
                required
                rows={5}
                maxLength={500}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{researchProblem.length}/500 karakter</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !researchTitle.trim() || !researchProblem.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Menghasilkan...' : 'Hasilkan Proposal'}
            </button>
          </form>

          {results && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-8">
              {cached && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                  Hasil dari cache (kueri serupa telah diproses sebelumnya)
                </div>
              )}

              {/* Background */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Latar Belakang</h2>
                  <button
                    onClick={() => copyToClipboard(results.background)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <div className="p-4 bg-gray-800 rounded-xl text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {results.background}
                </div>
              </div>

              {/* Objectives */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Tujuan Penelitian</h2>
                  <button
                    onClick={() => copyToClipboard(results.objectives.join('\n'))}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <ul className="space-y-2">
                  {results.objectives.map((obj, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-xl">
                      <span className="text-purple-400 font-bold">{index + 1}.</span>
                      <span className="text-gray-300">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Methodology */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Metodologi</h2>
                  <button
                    onClick={() => copyToClipboard(results.methodology)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <div className="p-4 bg-gray-800 rounded-xl text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {results.methodology}
                </div>
              </div>

              {/* Expected Outcomes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Hasil yang Diharapkan</h2>
                  <button
                    onClick={() => copyToClipboard(results.expected_outcomes.join('\n'))}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <ul className="space-y-2">
                  {results.expected_outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-xl">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Timeline Penelitian</h2>
                  <button
                    onClick={() => copyToClipboard(results.timeline)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <div className="p-4 bg-gray-800 rounded-xl text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {results.timeline}
                </div>
              </div>

              {/* References */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Referensi</h2>
                  <button
                    onClick={() => copyToClipboard(results.references.join('\n'))}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <ul className="space-y-2">
                  {results.references.map((ref, index) => (
                    <li key={index} className="p-3 bg-gray-800 rounded-xl text-gray-300 text-sm">
                      {ref}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  const fullText = `LATAR BELAKANG\n${results.background}\n\nTUJUAN PENELITIAN\n${results.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nMETODOLOGI\n${results.methodology}\n\nHASIL YANG DIHARAPKAN\n${results.expected_outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nTIMELINE\n${results.timeline}\n\nREFERENSI\n${results.references.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
                  navigator.clipboard.writeText(fullText)
                }}
                className="w-full py-2 border border-gray-700 hover:border-gray-600 rounded-xl font-medium transition"
              >
                Salin Proposal Lengkap
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}