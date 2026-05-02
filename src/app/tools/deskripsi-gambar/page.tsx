'use client'
import type { User } from '@supabase/supabase-js'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

const MAX_URL_LENGTH = 500
const MAX_CONTEXT_LENGTH = 300

interface DescriptionResult {
  description: string
  technicalDetails: string
  interpretation: string
  caption: string
}

export default function DeskripsiGambarPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DescriptionResult | null>(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | 'unlimited' | null>(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/deskripsi-gambar')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/deskripsi-gambar')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)
    setCached(false)

    try {
      const response = await fetch('/api/tools/generate-image-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          context,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setResults(data.description)
        setRemaining(data.remaining)
        setCached(data.cached || false)
        trackUsage('Deskripsi Gambar', imageUrl)
      } else {
        if (response.status === 429) {
          setError('Batas penggunaan harian tercapai. Upgrade ke paket PRO untuk penggunaan unlimited.')
        } else {
          setError(data.error?.message || data.error || 'Gagal menghasilkan deskripsi gambar')
        }
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

  const urlCharCount = imageUrl.length
  const contextCharCount = context.length
  const isValidUrl = urlCharCount >= 5

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
              <span className="text-4xl">🖼️</span>
              <div>
                <h1 className="text-3xl font-bold">Generator Deskripsi Gambar</h1>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full">PRO</span>
            </div>
            <p className="text-gray-400">Hasilkan deskripsi akademis untuk gambar dengan detail visual, informasi teknis, interpretasi, dan caption untuk jurnal.</p>
            {remaining !== null && (
              <p className="text-sm text-emerald-400 mt-2">
                Sisa penggunaan hari ini: {remaining === 'unlimited' ? 'Unlimited' : remaining}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
                URL Gambar <span className="text-red-400">*</span>
                <span className={`ml-2 text-xs ${urlCharCount > MAX_URL_LENGTH ? 'text-red-400' : 'text-gray-500'}`}>
                  {urlCharCount}/{MAX_URL_LENGTH}
                </span>
              </label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
                maxLength={MAX_URL_LENGTH + 50}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition"
              />
              {urlCharCount > 0 && !isValidUrl && (
                <p className="text-xs text-yellow-400 mt-1">URL minimal 5 karakter</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="context" className="block text-sm font-medium mb-2">
                Konteks Penelitian <span className="text-gray-500 text-xs">(opsional)</span>
                <span className={`ml-2 text-xs ${contextCharCount > MAX_CONTEXT_LENGTH ? 'text-red-400' : 'text-gray-500'}`}>
                  {contextCharCount}/{MAX_CONTEXT_LENGTH}
                </span>
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Contoh: Penelitian tentang perubahan iklim, analisis data statistik, tinjauan pustaka..."
                rows={4}
                maxLength={MAX_CONTEXT_LENGTH + 50}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isValidUrl}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed rounded-xl font-medium transition"
            >
              {loading ? 'Menghasilkan deskripsi...' : 'Hasilkan Deskripsi'}
            </button>
          </form>

          {results && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
              {cached && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                  Hasil dari cache (kueri serupa telah diproses sebelumnya)
                </div>
              )}

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold">Deskripsi Visual</h2>
                  <button
                    onClick={() => copyToClipboard(results.description)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {results.description}
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold">Detail Teknis</h2>
                  <button
                    onClick={() => copyToClipboard(results.technicalDetails)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {results.technicalDetails}
                </div>
              </div>

              {/* Interpretation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold">Interpretasi Akademik</h2>
                  <button
                    onClick={() => copyToClipboard(results.interpretation)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {results.interpretation}
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold">Caption untuk Jurnal</h2>
                  <button
                    onClick={() => copyToClipboard(results.caption)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <div className="p-4 bg-zinc-800 rounded-xl text-gray-200 whitespace-pre-wrap leading-relaxed italic">
                  {results.caption}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}