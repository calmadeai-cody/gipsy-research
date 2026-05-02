'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

const MAX_TOPIC_LENGTH = 300

interface Article {
  title: string
  journal: string
  description: string
  keywords: string[]
}

export default function PencariArtikelPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: any } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/pencari-artikel')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/pencari-artikel')
      return
    }

    setLoading(true)
    setError('')
    setArticles([])

    try {
      const response = await fetch('/api/tools/find-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      const data = await response.json()
      if (response.ok) {
        setArticles(data.articles)
        trackUsage('Pencari Artikel Ilmiah', topic)
      } else if (response.status === 429) {
        setShowUpgradeModal(true)
      } else {
        setError(data.error?.message || data.error || 'Gagal mencari artikel')
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

  const exportArticles = () => {
    const text = articles
      .map((a, i) => `${i + 1}. ${a.title}\n   Jurnal: ${a.journal}\n   Deskripsi: ${a.description}\n   Kata Kunci: ${a.keywords.join(', ')}\n`)
      .join('\n')
    const fullText = `DAFTAR ARTIKEL UNTUK: ${topic}\n\n${text}`
    navigator.clipboard.writeText(fullText)
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
            <div className="text-4xl mb-4">📚</div>
            <h1 className="text-3xl font-bold mb-2">Pencari Artikel Ilmiah</h1>
            <p className="text-gray-400">Masukkan topik penelitian Anda, dan AI akan menyarankan artikel-artikel ilmiah yang relevan untuk Tinajauan Pustaka.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="topic" className="block text-sm font-medium mb-2">Topik Penelitian</label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value.slice(0, MAX_TOPIC_LENGTH))}
                placeholder="Contoh: Pengaruh penggunaan media sosial terhadap kesehatan mental remaja"
                required
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{topic.length}/{MAX_TOPIC_LENGTH}</div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Mencari Artikel...' : 'Cari Artikel'}
            </button>
          </form>

          {articles.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Hasil Pencarian ({articles.length} Artikel)</h2>
                <button
                  onClick={exportArticles}
                  className="px-4 py-2 text-sm border border-zinc-700 hover:border-zinc-600 rounded-lg transition"
                >
                  Export Semua
                </button>
              </div>

              <div className="space-y-4">
                {articles.map((article, index) => (
                  <div key={index} className="p-4 bg-zinc-800 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white">{article.title}</h3>
                      <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full ml-2 shrink-0">
                        {article.journal}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{article.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {article.keywords.map((keyword, ki) => (
                        <span key={ki} className="text-xs px-2 py-1 bg-zinc-700 text-gray-300 rounded">
                          {keyword}
                        </span>
                      ))}
                      <button
                        onClick={() => copyToClipboard(`${article.title} | ${article.journal} | ${article.keywords.join(', ')}`)}
                        className="text-xs px-2 py-1 border border-zinc-600 hover:border-zinc-500 rounded text-gray-400 hover:text-white transition ml-auto"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Batas Penggunaan Tercapai</h3>
              <p className="text-gray-400 mb-6">
                Anda telah menggunakan 5 dari 5 penggunaan harian untuk paket BASIC. 
                Upgrade ke PRO untuk penggunaan unlimited!
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-2 border border-zinc-700 hover:border-zinc-600 rounded-xl transition"
                >
                  Nanti Saja
                </button>
                <Link
                  href="/pricing"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-center transition"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}