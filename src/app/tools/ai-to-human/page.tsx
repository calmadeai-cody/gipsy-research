'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

const MAX_LENGTH = 3000

export default function AIToHumanPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: any } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/ai-to-human')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/ai-to-human')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/tools/ai-to-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data.text)
        // Track usage
        trackUsage('AI to Human', inputText)
      } else {
        setError(data.error || 'Gagal mengkonversi teks')
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

  const charCount = inputText.length
  const isOverLimit = charCount > MAX_LENGTH

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
            <div className="text-4xl mb-4">✨</div>
            <h1 className="text-3xl font-bold mb-2">AI to Human</h1>
            <p className="text-gray-400">Konversikan teks yang terlihat seperti hasil AI menjadi tulisan natural yang terdengar seperti ditulis manusia biasa.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="inputText" className="block text-sm font-medium mb-2">
                Teks AI
                <span className={`ml-2 text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
                  {charCount}/{MAX_LENGTH}
                </span>
              </label>
              <textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tempel teks yang terlihat seperti hasil AI di sini..."
                required
                rows={8}
                maxLength={MAX_LENGTH + 500}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isOverLimit}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-xl font-medium transition"
            >
              {loading ? 'Mengkonversi...' : 'Konversikan ke Teks Manusia'}
            </button>
          </form>

          {result && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4">Hasil Konversi</h2>
              <div className="p-4 bg-gray-800 rounded-xl text-gray-200 whitespace-pre-wrap mb-4">
                {result}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="w-full py-2 border border-gray-700 hover:border-gray-600 rounded-xl font-medium transition"
              >
                Salin Hasil
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}