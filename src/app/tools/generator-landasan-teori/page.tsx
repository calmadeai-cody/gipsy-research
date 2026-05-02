'use client'
import type { User } from '@supabase/supabase-js'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

const MAX_TITLE_LENGTH = 300
const MAX_TOPIC_LENGTH = 500

export default function GeneratorLandasanTeoriPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | 'unlimited' | null>(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/generator-landasan-teori')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/generator-landasan-teori')
      return
    }

    setLoading(true)
    setError('')
    setResult('')
    setCached(false)

    try {
      const response = await fetch('/api/tools/generate-theory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, topic }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data.theory)
        setRemaining(data.remaining)
        setCached(data.cached || false)
        trackUsage('Generator Landasan Teori', title)
      } else {
        setError(data.error?.message || data.error || 'Gagal menghasilkan landasan teori')
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
            <div className="text-4xl mb-4">📚</div>
            <h1 className="text-3xl font-bold mb-2">Generator Landasan Teori</h1>
            <p className="text-gray-400">Masukkan judul dan topik penelitian untuk menghasilkan landasan teori yang komprehensif dalam format akademik.</p>
            {remaining !== null && (
              <p className="text-sm text-purple-400 mt-2">
                Sisa penggunaan hari ini: {remaining === 'unlimited' ? 'Unlimited' : remaining}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Judul Penelitian <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                placeholder="Contoh: Pengaruh Literasi Digital terhadap Kinerja Akademik Mahasiswa"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/{MAX_TITLE_LENGTH} karakter</p>
            </div>

            <div className="mb-6">
              <label htmlFor="topic" className="block text-sm font-medium mb-2">
                Topik Penelitian <span className="text-gray-500">(opsional)</span>
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value.slice(0, MAX_TOPIC_LENGTH))}
                placeholder="Jelaskan topik atau bidang penelitian yang lebih spesifik untuk membantu AI menghasilkan landasan teori yang lebih tepat. Contoh: Penelitian ini berfokus pada konteks pendidikan tinggi di Indonesia, khususnya pada mahasiswa semester awal."
                rows={5}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{topic.length}/{MAX_TOPIC_LENGTH} karakter</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Menghasilkan...' : 'Hasilkan Landasan Teori'}
            </button>
          </form>

          {result && (
            <div className="bg-zinc-900 border border-gray-800 rounded-2xl p-8">
              {cached && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                  Hasil dari cache (kueri serupa telah diproses sebelumnya)
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Hasil Landasan Teori</h2>
                <button
                  onClick={() => copyToClipboard(result)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  Salin
                </button>
              </div>
              <div className="p-6 bg-gray-800 rounded-xl">
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}