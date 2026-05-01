'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'

interface VariableItem {
  name: string
  type: 'independent' | 'dependent' | 'moderating' | 'mediating'
  hypothesis: string
}

interface FrameworkResult {
  framework_description: string
  variables_identified: VariableItem[]
  relationships: string[]
  diagram_mermaid: string
  remaining?: string
  cached?: boolean
}

const MAX_TITLE_LENGTH = 300
const MAX_VARIABLES_LENGTH = 500
const MAX_METHODOLOGY_LENGTH = 500

export default function DiagramKerangkaBerpikirPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [title, setTitle] = useState('')
  const [variables, setVariables] = useState('')
  const [methodology, setMethodology] = useState('')
  const [result, setResult] = useState<FrameworkResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((res: { data: { user: any } }) => {
      if (!res.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/diagram-kerangka-berpikir')
      } else {
        setUser(res.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/diagram-kerangka-berpikir')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/generate-framework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research_title: title, variables, methodology }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data)
        trackUsage('diagram-kerangka-berpikir', title)
      } else {
        setError(data.error?.message || data.error || 'Gagal menghasilkan kerangka berpikir')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const getVariableTypeColor = (type: string) => {
    switch (type) {
      case 'independent':
        return 'bg-blue-600/30 text-blue-400'
      case 'dependent':
        return 'bg-emerald-600/30 text-emerald-400'
      case 'moderating':
        return 'bg-amber-600/30 text-amber-400'
      case 'mediating':
        return 'bg-purple-600/30 text-purple-400'
      default:
        return 'bg-gray-600/30 text-gray-400'
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="text-4xl mb-4">🔗</div>
            <h1 className="text-3xl font-bold mb-2">Generator Kerangka Berpikir</h1>
            <p className="text-gray-400">
              Hasilkan kerangka konseptual dan diagram Mermaid berdasarkan judul, variabel, dan metodologi penelitian Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Judul Penelitian <span className="text-red-400">*</span>
              </label>
              <textarea
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                placeholder="Contoh: Pengaruh Literasi Digital terhadap Kinerja Akademik Mahasiswa"
                required
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{title.length}/{MAX_TITLE_LENGTH}</div>
            </div>

            <div>
              <label htmlFor="variables" className="block text-sm font-medium mb-2">
                Variabel Penelitian <span className="text-red-400">*</span>
              </label>
              <textarea
                id="variables"
                value={variables}
                onChange={(e) => setVariables(e.target.value.slice(0, MAX_VARIABLES_LENGTH))}
                placeholder="Contoh: Variabel Independen: Literasi Digital (X1), Motivasi Belajar (X2). Variabel Dependen: Kinerja Akademik (Y). Variabel Moderating: Dukungan Sosial (Z)."
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{variables.length}/{MAX_VARIABLES_LENGTH}</div>
            </div>

            <div>
              <label htmlFor="methodology" className="block text-sm font-medium mb-2">
                Metodologi Penelitian <span className="text-gray-500">(opsional)</span>
              </label>
              <textarea
                id="methodology"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value.slice(0, MAX_METHODOLOGY_LENGTH))}
                placeholder="Contoh: Kuantitatif dengan pendekatan ex post facto, menggunakan PLS-SEM untuk analisis data"
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{methodology.length}/{MAX_METHODOLOGY_LENGTH}</div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !title.trim() || !variables.trim()}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Menghasilkan...' : 'Buat Kerangka Berpikir'}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">📝 Deskripsi Kerangka Konseptual</h2>
                <p className="text-gray-300 leading-relaxed">{result.framework_description}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-emerald-400 mb-4">📊 Variabel yang Didentifikasi</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Variabel</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Tipe</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Hipotesis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.variables_identified.map((variable, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4 text-white font-medium">{variable.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVariableTypeColor(variable.type)}`}>
                              {variable.type.charAt(0).toUpperCase() + variable.type.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm">{variable.hypothesis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-amber-400 mb-4">🔗 Hubungan antar Variabel</h2>
                <ul className="space-y-3">
                  {result.relationships.map((relationship, index) => (
                    <li key={index} className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-8 h-8 bg-amber-600/30 text-amber-400 rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-300">{relationship}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-purple-400 mb-4">📈 Diagram Mermaid</h2>
                <pre className="bg-gray-950 border border-gray-800 rounded-xl p-4 overflow-x-auto text-sm text-gray-300">
                  <code>{result.diagram_mermaid}</code>
                </pre>
              </div>

              <div className="text-center text-gray-500 text-sm">
                {result.remaining && <p className="text-cyan-500">📊 Sisa penggunaan: {result.remaining}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}