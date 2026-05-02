'use client'
import type { User } from '@supabase/supabase-js'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

export default function GeneratorJudulPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [keywords, setKeywords] = useState('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/generator-judul')
      } else {
        setUser(result.data.user)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/generator-judul')
      return
    }
    
    setLoading(true)
    setError('')
    setResults([])

    try {
      const response = await fetch('/api/tools/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, count }),
      })

      const data = await response.json()
      if (response.ok) {
        setResults(data.titles)
        // Track usage
        trackUsage('Generator Judul Penelitian', keywords)
      } else {
        setError(data.error || 'Gagal menghasilkan judul')
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
            <h1 className="text-3xl font-bold mb-2">Generator Judul Penelitian</h1>
            <p className="text-gray-400">Masukkan kata kunci topik penelitian Anda, dan AI akan menghasilkan judul penelitian yang sesuai.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="keywords" className="block text-sm font-medium mb-2">Kata Kunci Topik Penelitian</label>
              <textarea
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Contoh: pengaruh media sosial terhadap prestasi belajar mahasiswa"
                required
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="count" className="block text-sm font-medium mb-2">Jumlah Judul</label>
              <select
                id="count"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
              >
                <option value={3}>3 judul</option>
                <option value={5}>5 judul</option>
                <option value={7}>7 judul</option>
                <option value={10}>10 judul</option>
              </select>
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
              {loading ? 'Menghasilkan...' : 'Hasilkan Judul'}
            </button>
          </form>

          {results.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4">Hasil Judul Penelitian</h2>
              <ul className="space-y-4">
                {results.map((title, index) => (
                  <li key={index} className="flex items-start gap-3 p-4 bg-gray-800 rounded-xl">
                    <span className="text-purple-400 font-bold">{index + 1}.</span>
                    <span className="text-gray-200">{title}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  const text = results.map((t, i) => `${i + 1}. ${t}`).join('\n')
                  navigator.clipboard.writeText(text)
                }}
                className="mt-4 w-full py-2 border border-gray-700 hover:border-gray-600 rounded-xl font-medium transition"
              >
                Salin Semua
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}