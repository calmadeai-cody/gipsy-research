'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackUsage } from '@/lib/analytics'
import { ChartType } from '@/lib/ai/data-viz'

const MAX_DESCRIPTION_LENGTH = 1000
const MAX_DATA_VALUES_LENGTH = 500

interface ChartConfig {
  xAxis?: string
  yAxis?: string
  title?: string
  colors?: string[]
  labels?: string[]
  legend?: boolean
  grid?: boolean
}

interface VisualizationSuggestion {
  recommendedChartType: ChartType
  recommendation: string
  config: ChartConfig
  mermaidCode: string
  interpretation: string[]
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'histogram', label: 'Histogram' },
]

export default function VisualisasiDataPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [description, setDescription] = useState('')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [dataValues, setDataValues] = useState('')
  const [loading, setLoading] = useState(false)
  const [visualization, setVisualization] = useState<VisualizationSuggestion | null>(null)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then((result: { data: { user: any } }) => {
      if (!result.data.user) {
        router.push('/auth/signin?callbackUrl=/tools/visualisasi-data')
      } else {
        setUser(result.data.user)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?callbackUrl=/tools/visualisasi-data')
      return
    }

    setLoading(true)
    setError('')
    setVisualization(null)

    try {
      const response = await fetch('/api/tools/suggest-visualization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, chartType, dataValues }),
      })

      const data = await response.json()
      if (response.ok) {
        setVisualization(data.visualization)
        trackUsage('Asisten Visualisasi Data', description)
      } else if (response.status === 429) {
        setShowUpgradeModal(true)
      } else {
        setError(data.error?.message || data.error || 'Gagal membuat visualisasi')
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
            <div className="text-4xl mb-4">📊</div>
            <h1 className="text-3xl font-bold mb-2">Asisten Visualisasi Data</h1>
            <p className="text-gray-400">Deskripsikan data Anda dan dapatkan rekomendasi visualisasi optimal dengan kode Mermaid untuk penelitian akademik.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium mb-2">Deskripsi Data</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                placeholder="Contoh: Perbandingan tingkat kepuasan mahasiswa terhadap metode pembelajaran online vs offline di berbagai universitas di Indonesia"
                required
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{description.length}/{MAX_DESCRIPTION_LENGTH}</div>
            </div>

            <div className="mb-6">
              <label htmlFor="chartType" className="block text-sm font-medium mb-2">Jenis Chart</label>
              <select
                id="chartType"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartType)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 transition"
              >
                {CHART_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="dataValues" className="block text-sm font-medium mb-2">
                Contoh Data (Opsional)
              </label>
              <textarea
                id="dataValues"
                value={dataValues}
                onChange={(e) => setDataValues(e.target.value.slice(0, MAX_DATA_VALUES_LENGTH))}
                placeholder="Contoh: Kategori A: 35%, Kategori B: 25%, Kategori C: 20%, Kategori D: 15%, Kategori E: 5%"
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-purple-500 transition resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{dataValues.length}/{MAX_DATA_VALUES_LENGTH}</div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition"
            >
              {loading ? 'Membuat Visualisasi...' : 'Buat Visualisasi'}
            </button>
          </form>

          {visualization && (
            <div className="space-y-6">
              {/* Recommendation */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💡</span>
                  <h2 className="text-xl font-bold">Rekomendasi</h2>
                </div>
                <p className="text-gray-300 leading-relaxed">{visualization.recommendation}</p>
              </div>

              {/* Configuration */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⚙️</span>
                  <h2 className="text-xl font-bold">Konfigurasi Chart</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Judul</div>
                    <div className="text-white">{visualization.config.title || '-'}</div>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Sumbu X</div>
                    <div className="text-white">{visualization.config.xAxis || '-'}</div>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Sumbu Y</div>
                    <div className="text-white">{visualization.config.yAxis || '-'}</div>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Legend</div>
                    <div className="text-white">{visualization.config.legend ? 'Ya' : 'Tidak'}</div>
                  </div>
                </div>
              </div>

              {/* Mermaid Code */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📝</span>
                    <h2 className="text-xl font-bold">Kode Mermaid</h2>
                  </div>
                  <button
                    onClick={() => copyToClipboard(visualization.mermaidCode)}
                    className="px-4 py-2 text-sm border border-zinc-700 hover:border-zinc-600 rounded-lg transition"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
                  <code>{visualization.mermaidCode}</code>
                </pre>
              </div>

              {/* Interpretation */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🎯</span>
                  <h2 className="text-xl font-bold">Poin Interpretasi</h2>
                </div>
                <ul className="space-y-3">
                  {visualization.interpretation.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-purple-600/20 text-purple-400 rounded-full text-sm shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
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
