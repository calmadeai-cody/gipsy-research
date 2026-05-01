'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

export default function GeneratorMetodologiPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [researchType, setResearchType] = useState('')
  const [researchTopic, setResearchTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    methodologies: Array<{
      name: string
      suitability: string
      description: string
      key_characteristics: string[]
      data_collection: string[]
      examples: string[]
    }>
    recommendation: string
    considerations: string[]
  } | null>(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | 'unlimited' | null>(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: any } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/generator-metodologi')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/generator-metodologi')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)
    setCached(false)

    try {
      const response = await fetch('/api/tools/generate-methodology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_type: researchType,
          research_topic: researchTopic,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setResults(data)
        setRemaining(data.remaining)
        setCached(data.cached || false)
        trackUsage('Pemilihan Metode Penelitian', researchTopic)
      } else {
        setError(data.error?.message || data.error || 'Gagal menghasilkan rekomendasi metodologi')
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

  const copyAllMethodologies = () => {
    if (!results) return
    const text = results.methodologies.map(m => 
      `${m.name}\n${'='.repeat(m.name.length)}\n\n${m.description}\n\nKarakteristik Utama:\n${m.key_characteristics.map(c => `- ${c}`).join('\n')}\n\nMetode Pengumpulan Data:\n${m.data_collection.map(d => `- ${d}`).join('\n')}\n\nContoh Penelitian:\n${m.examples.map(e => `- ${e}`).join('\n')}\n\nKesimpulan: ${m.suitability}`
    ).join('\n\n' + '-'.repeat(50) + '\n\n')
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
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🔬</span>
              <div>
                <h1 className="text-3xl font-bold">Pemilihan Metode Penelitian</h1>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full">PRO</span>
            </div>
            <p className="text-gray-400">Pilih metode penelitian yang tepat berdasarkan jenis dan topik penelitian Anda.</p>
            {remaining !== null && (
              <p className="text-sm text-purple-400 mt-2">
                Sisa penggunaan hari ini: {remaining === 'unlimited' ? 'Unlimited' : remaining}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="researchType" className="block text-sm font-medium mb-2">
                Jenis Penelitian <span className="text-red-400">*</span>
              </label>
              <select
                id="researchType"
                value={researchType}
                onChange={(e) => setResearchType(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
              >
                <option value="">Pilih jenis penelitian...</option>
                <option value="Kuantitatif">Kuantitatif</option>
                <option value="Kualitatif">Kualitatif</option>
                <option value="Mixed Methods">Mixed Methods (Gabungan)</option>
                <option value="Kombinasi">Kombinasi</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="researchTopic" className="block text-sm font-medium mb-2">
                Topik/Fokus Penelitian <span className="text-red-400">*</span>
              </label>
              <textarea
                id="researchTopic"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="Jelaskan topik dan fokus penelitian Anda. Contoh: Penelitian tentang effektifitas pembelajaran daring pada mahasiswa perguruan tinggi di Indonesia, dengan fokus pada faktor-faktor yang mempengaruhi keberhasilan belajar."
                required
                rows={5}
                maxLength={500}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{researchTopic.length}/500 karakter</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !researchType || !researchTopic.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Menganalisis...' : 'Rekomendasikan Metodologi'}
            </button>
          </form>

          {results && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-8">
              {cached && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                  Hasil dari cache (kueri serupa telah diproses sebelumnya)
                </div>
              )}

              {/* Recommendation */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-purple-300">💡 Rekomendasi Utama</h2>
                  <button
                    onClick={() => copyToClipboard(results.recommendation)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{results.recommendation}</p>
              </div>

              {/* Methodologies */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Opsi Metodologi</h2>
                  <button
                    onClick={copyAllMethodologies}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin Semua
                  </button>
                </div>
                <div className="space-y-6">
                  {results.methodologies.map((method, index) => (
                    <div key={index} className="bg-gray-800 rounded-xl p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{method.name}</h3>
                          <p className="text-sm text-purple-400 italic">{method.suitability}</p>
                        </div>
                        <span className="text-2xl">
                          {method.name.toLowerCase().includes('kuantitatif') ? '📊' :
                           method.name.toLowerCase().includes('kualitatif') ? '📝' : '🔀'}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{method.description}</p>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Karakteristik Utama:</h4>
                        <ul className="space-y-1">
                          {method.key_characteristics.map((char, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-purple-400">•</span>
                              {char}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Metode Pengumpulan Data:</h4>
                        <ul className="space-y-1">
                          {method.data_collection.map((method, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-green-400">•</span>
                              {method}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Contoh Penelitian:</h4>
                        <ul className="space-y-1">
                          {method.examples.map((example, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-blue-400">•</span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Considerations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Pertimbangan Penting</h2>
                  <button
                    onClick={() => copyToClipboard(results.considerations.join('\n'))}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Salin
                  </button>
                </div>
                <ul className="space-y-2">
                  {results.considerations.map((consideration, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-xl">
                      <span className="text-yellow-400 font-bold">{index + 1}.</span>
                      <span className="text-gray-300">{consideration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}