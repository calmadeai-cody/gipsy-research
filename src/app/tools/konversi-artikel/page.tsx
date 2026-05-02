'use client'
import type { User } from '@supabase/supabase-js'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

const MAX_DRAFT_LENGTH = 3000
const MAX_JOURNAL_LENGTH = 200

interface ConvertedArticle {
  abstract: string
  introduction: string
  methods: string
  results: string
  discussion: string
  conclusion: string
  original_length: number
  converted_length: number
  journal: string | null
  style: string
}

interface ConversionResult {
  article: ConvertedArticle
  sections_count: number
  total_references_needed: number
}

export default function KonversiArtikelPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [draft, setDraft] = useState('')
  const [journal, setJournal] = useState('')
  const [style, setStyle] = useState('IEEE')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | 'unlimited' | null>(null)
  const [cached, setCached] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/konversi-artikel')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/konversi-artikel')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setCached(false)

    try {
      const response = await fetch('/api/tools/convert-to-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft,
          journal: journal || undefined,
          style,
        }),
      })

      const data = await response.json()

      if (response.status === 429 && data.error?.code === 'RATE_LIMIT_EXCEEDED') {
        setShowUpgradeModal(true)
        setLoading(false)
        return
      }

      if (response.ok) {
        setResult(data)
        setRemaining(data.remaining)
        setCached(data.cached || false)
        trackUsage('Konversi Artikel Ilmiah', draft)
      } else {
        setError(data.error?.message || data.error || 'Gagal mengkonversi artikel')
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
    if (!result) return
    const fullArticle = `ABSTRACT
${result.article.abstract}

INTRODUCTION
${result.article.introduction}

METHODS
${result.article.methods}

RESULTS
${result.article.results}

DISCUSSION
${result.article.discussion}

CONCLUSION
${result.article.conclusion}`
    navigator.clipboard.writeText(fullArticle)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Memuat...</div>
      </div>
    )
  }

  const charCount = draft.length
  const isOverLimit = charCount > MAX_DRAFT_LENGTH
  const isTooShort = charCount > 0 && charCount < 50

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
              <span className="text-4xl">📄</span>
              <div>
                <h1 className="text-3xl font-bold">Konversi ke Artikel Ilmiah</h1>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full">PRO</span>
            </div>
            <p className="text-gray-400">Konversikan draft penelitian menjadi artikel ilmiah dengan struktur lengkap: Abstract, Introduction, Methods, Results, Discussion, dan Conclusion.</p>
            {remaining !== null && (
              <p className="text-sm text-emerald-400 mt-2">
                Sisa penggunaan hari ini: {remaining === 'unlimited' ? 'Unlimited' : remaining}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="draft" className="block text-sm font-medium mb-2">
                Draft Artikel <span className="text-red-400">*</span>
                <span className={`ml-2 text-xs ${isOverLimit ? 'text-red-400' : isTooShort ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {charCount}/{MAX_DRAFT_LENGTH}
                </span>
              </label>
              <textarea
                id="draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Tempel draft artikel atau manuscript yang ingin dikonversi ke format artikel ilmiah..."
                required
                rows={10}
                maxLength={MAX_DRAFT_LENGTH + 500}
                className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 transition resize-none"
              />
              {isTooShort && charCount > 0 && (
                <p className="text-xs text-yellow-400 mt-1">Minimal 50 karakter untuk konversi artikel</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="journal" className="block text-sm font-medium mb-2">
                Target Jurnal <span className="text-gray-500 text-xs">(opsional)</span>
                <span className="ml-2 text-xs text-gray-500">
                  {journal.length}/{MAX_JOURNAL_LENGTH}
                </span>
              </label>
              <input
                type="text"
                id="journal"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="Contoh: Jurnal Penelitian Pendidikan, Seminar Nasional, dll"
                maxLength={MAX_JOURNAL_LENGTH}
                className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="style" className="block text-sm font-medium mb-2">
                Format Sitasi
              </label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="IEEE">IEEE - Sitasi bernomor [1]</option>
                <option value="APA">APA 7th Edition - Author-date (Smith, 2024)</option>
                <option value="Chicago">Chicago - Footnotes</option>
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
              {loading ? 'Mengkonversi artikel...' : 'Konversi ke Artikel Ilmiah'}
            </button>
          </form>

          {result && (
            <div className="bg-zinc-900 border border-gray-800 rounded-2xl p-8 space-y-6">
              {cached && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                  Hasil dari cache (kueri serupa telah diproses sebelumnya)
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-400">{result.article.original_length}</div>
                  <div className="text-xs text-gray-500">Karakter Asli</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{result.article.converted_length}</div>
                  <div className="text-xs text-gray-500">Karakter Hasil</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{result.sections_count}</div>
                  <div className="text-xs text-gray-500">Section</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{result.total_references_needed}</div>
                  <div className="text-xs text-gray-500">Sitasi [REF]</div>
                </div>
              </div>

              {/* Article Sections */}
              <div className="space-y-6">
                {/* Abstract */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-emerald-400">Abstract</h2>
                    <button
                      onClick={() => copyToClipboard(result.article.abstract)}
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Salin
                    </button>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {result.article.abstract}
                  </div>
                </div>

                {/* Introduction */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-blue-400">Introduction</h2>
                    <button
                      onClick={() => copyToClipboard(result.article.introduction)}
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Salin
                    </button>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {result.article.introduction}
                  </div>
                </div>

                {/* Methods */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-purple-400">Methods</h2>
                    <button
                      onClick={() => copyToClipboard(result.article.methods)}
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Salin
                    </button>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {result.article.methods}
                  </div>
                </div>

                {/* Results */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-yellow-400">Results</h2>
                    <button
                      onClick={() => copyToClipboard(result.article.results)}
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Salin
                    </button>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {result.article.results}
                  </div>
                </div>

                {/* Discussion */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-pink-400">Discussion</h2>
                    <button
                      onClick={() => copyToClipboard(result.article.discussion)}
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Salin
                    </button>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {result.article.discussion}
                  </div>
                </div>

                {/* Conclusion */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-cyan-400">Conclusion</h2>
                    <button
                      onClick={() => copyToClipboard(result.article.conclusion)}
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Salin
                    </button>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {result.article.conclusion}
                  </div>
                </div>
              </div>

              {/* Meta info and copy all */}
              <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-zinc-800 rounded-full">
                    Style: {result.article.style}
                  </span>
                  {result.article.journal && (
                    <span className="px-3 py-1 bg-zinc-800 rounded-full">
                      Journal: {result.article.journal}
                    </span>
                  )}
                </div>
                <button
                  onClick={copyAllSections}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition"
                >
                  Salin Semua Section
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <span className="text-5xl mb-4 block">📊</span>
              <h2 className="text-2xl font-bold mb-2">Batas Penggunaan Tercapai</h2>
              <p className="text-gray-400 mb-6">
                Anda telah menggunakan 5x konversi artikel hari ini. Upgrade ke paket PRO untuk penggunaan unlimited.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/pricing"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-medium transition text-center"
                >
                  Upgrade ke PRO
                </Link>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3 border border-gray-700 hover:border-gray-600 rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}