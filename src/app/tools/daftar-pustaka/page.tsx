'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function DaftarPustakaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState('')
  const [style, setStyle] = useState('APA')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: any } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/daftar-pustaka')
      } else {
        setUser(result.data.user)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/daftar-pustaka')
      return
    }
    
    setLoading(true)
    setError('')
    setResults([])

    try {
      const response = await fetch('/api/tools/generate-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, style }),
      })

      const data = await response.json()
      if (response.ok) {
        setResults(data.references)
      } else {
        setError(data.error || 'Gagal menghasilkan daftar pustaka')
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
            <div className="text-4xl mb-4">📖</div>
            <h1 className="text-3xl font-bold mb-2">Generator Daftar Pustaka</h1>
            <p className="text-gray-400">Masukkan konten artikel atau informasi pustaka untuk generate daftar pustaka otomatis.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium mb-2">Konten Artikel atau Informasi Pustaka</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Masukkan judul artikel, nama penulis, tahun terbit, nama jurnal, volume, nomor, dan halaman..."
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="style" className="block text-sm font-medium mb-2">Format Daftar Pustaka</label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
              >
                <option value="APA">APA Style</option>
                <option value="MLA">MLA Style</option>
                <option value="Chicago">Chicago Style</option>
                <option value="Harvard">Harvard Style</option>
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
              {loading ? 'Menghasilkan...' : 'Hasilkan Daftar Pustaka'}
            </button>
          </form>

          {results.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4">Hasil Daftar Pustaka (Format {style})</h2>
              <ul className="space-y-3">
                {results.map((ref, index) => (
                  <li key={index} className="p-4 bg-gray-800 rounded-xl text-gray-200 text-sm">
                    {ref}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  const text = results.join('\n\n')
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