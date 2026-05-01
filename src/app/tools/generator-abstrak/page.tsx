'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

const MAX_TITLE_LENGTH = 300
const MAX_KEYWORDS_LENGTH = 500

export default function GeneratorAbstrakPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [title, setTitle] = useState('')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: any } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/generator-abstrak')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/generator-abstrak')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/tools/generate-abstract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, keywords }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data.abstract)
        trackUsage('Generator Abstrak Penelitian', title)
      } else {
        setError(data.error?.message || data.error || 'Gagal menghasilkan abstrak')
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
            <div className="text-4xl mb-4">📄</div>
            <h1 className="text-3xl font-bold mb-2">Generator Abstrak Penelitian</h1>
            <p className="text-gray-400">Masukkan judul dan kata kunci penelitian Anda, dan AI akan menghasilkan abstrak yang sesuai.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium mb-2">Judul Penelitian</label>
              <textarea
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                placeholder="Contoh: Pengaruh Media Sosial terhadap Prestasi Belajar Mahasiswa"
                required
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{title.length}/{MAX_TITLE_LENGTH}</div>
            </div>

            <div className="mb-6">
              <label htmlFor="keywords" className="block text-sm font-medium mb-2">Kata Kunci <span className="text-gray-500">(opsional)</span></label>
              <input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value.slice(0, MAX_KEYWORDS_LENGTH))}
                placeholder="Contoh: media sosial, prestasi belajar, mahasiswa"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{keywords.length}/{MAX_KEYWORDS_LENGTH}</div>
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
              {loading ? 'Menghasilkan...' : 'Hasilkan Abstrak'}
            </button>
          </form>

          {result && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4">Hasil Abstrak</h2>
              <div className="p-4 bg-gray-800 rounded-xl">
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="mt-4 w-full py-2 border border-gray-700 hover:border-gray-600 rounded-xl font-medium transition"
              >
                Salin Abstrak
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}