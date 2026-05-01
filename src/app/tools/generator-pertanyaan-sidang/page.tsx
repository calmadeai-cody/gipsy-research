'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

const MAX_TITLE_LENGTH = 300
const MAX_METHODOLOGY_LENGTH = 500
const MAX_FINDINGS_LENGTH = 500

export default function GeneratorPertanyaanSidangPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [title, setTitle] = useState('')
  const [methodology, setMethodology] = useState('')
  const [findings, setFindings] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: any } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/generator-pertanyaan-sidang')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/generator-pertanyaan-sidang')
      return
    }

    setLoading(true)
    setError('')
    setResult([])

    try {
      const response = await fetch('/api/tools/generate-sidang-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, methodology, findings }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data.questions)
        trackUsage('Generator Pertanyaan Sidang', title)
      } else {
        setError(data.error?.message || data.error || 'Gagal menghasilkan pertanyaan')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.map((q, i) => `${i + 1}. ${q}`).join('\n'))
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
            <div className="text-4xl mb-4">🎓</div>
            <h1 className="text-3xl font-bold mb-2">Generator Pertanyaan Sidang</h1>
            <p className="text-gray-400">Masukkan judul, metodologi, dan temuan utama skripsi Anda untuk mendapatkan pertanyaan-pertanyaan yang kemungkinan akan ditanyakan saat sidang.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium mb-2">Judul Skripsi</label>
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
              <label htmlFor="methodology" className="block text-sm font-medium mb-2">Metodologi Penelitian</label>
              <textarea
                id="methodology"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value.slice(0, MAX_METHODOLOGY_LENGTH))}
                placeholder="Contoh: Metode kuantitatif dengan survei pada 200 mahasiswa menggunakan kuesioner Likert 5 skala"
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{methodology.length}/{MAX_METHODOLOGY_LENGTH}</div>
            </div>

            <div className="mb-6">
              <label htmlFor="findings" className="block text-sm font-medium mb-2">Temuan Utama</label>
              <textarea
                id="findings"
                value={findings}
                onChange={(e) => setFindings(e.target.value.slice(0, MAX_FINDINGS_LENGTH))}
                placeholder="Contoh: Terdapat korelasi positif signifikan antara penggunaan media sosial dan prestasi belajar dengan r=0.72"
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{findings.length}/{MAX_FINDINGS_LENGTH}</div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !title.trim() || !methodology.trim() || !findings.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Menghasilkan...' : 'Hasilkan Pertanyaan'}
            </button>
          </form>

          {result.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4">Pertanyaan untuk Sidang</h2>
              <div className="space-y-4">
                {result.map((question, index) => (
                  <div key={index} className="p-4 bg-gray-800 rounded-xl">
                    <p className="text-gray-200 font-medium">Pertanyaan #{index + 1}</p>
                    <p className="text-gray-300 mt-1">{question}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={copyToClipboard}
                className="mt-4 w-full py-2 border border-gray-700 hover:border-gray-600 rounded-xl font-medium transition"
              >
                Salin Semua Pertanyaan
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}