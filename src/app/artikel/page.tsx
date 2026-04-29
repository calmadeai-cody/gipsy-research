'use client'

import Link from 'next/link'
import { useState } from 'react'

const categories = ['Semua Kategori', 'Penulisan', 'Olah Data', 'Pengembangan Diri', 'Gipsy Update']

const articles = [
  {
    category: 'Penulisan',
    title: '40+ Tools GipsyAI: Senjata Rahasia Selesaikan Skripsi Mulai dari Bab 1 hingga Bab 5',
    excerpt: 'GipsyAI menyediakan lebih dari 40 tools AI yang dirancang khusus untuk membantu #PejuangRiset menyelesaikan skripsi dari awal hingga akhir.',
    date: '6 Feb 2026',
  },
  {
    category: 'Penulisan',
    title: 'Kenalan dengan GipsyAI: AI Tanpa Prompt untuk Tugas Akhir',
    excerpt: 'Tidak perlu repot membuat prompt yang rumit. GipsyAI hadir dengan input terstruktur yang siap pakai untuk berbagai kebutuhan tugas akhir.',
    date: '2 Feb 2026',
  },
  {
    category: 'Olah Data',
    title: 'Kualitatif vs Kuantitatif: Bedah Tuntas Dua Pendekatan Riset',
    excerpt: 'Memahami perbedaan mendasar antara pendekatan kualitatif dan kuantitatif sangat penting dalam memilih metode penelitian yang tepat.',
    date: '27 Jan 2026',
  },
  {
    category: 'Gipsy Update',
    title: 'DECOMPE 4.0 Jadi Wadah Inovasi Fintech',
    excerpt: 'DECOMPE 4.0 kembali hadir sebagai wadah inovasi teknologi keuangan yang mempertemukan berbagai startup dan institusi finansial.',
    date: '15 Des 2025',
  },
  {
    category: 'Gipsy Update',
    title: 'SEMRESTEK 2025 Universitas Pancasila',
    excerpt: 'SEMRESTEK 2025 di Universitas Pancasila mempertemukan peneliti dan akademisi untuk mendiskusikan berbagai topik riset terkini.',
    date: '15 Des 2025',
  },
]

const categoryColors: Record<string, string> = {
  'Penulisan': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Olah Data': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Pengembangan Diri': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Gipsy Update': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function ArtikelPage() {
  const [activeCategory, setActiveCategory] = useState('Semua Kategori')

  const filteredArticles = activeCategory === 'Semua Kategori'
    ? articles
    : articles.filter((a) => a.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold">GipsyAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#tools" className="text-gray-400 hover:text-white transition">AI Tools</Link>
            <Link href="/#cara-pakai" className="text-gray-400 hover:text-white transition">Cara Pakai</Link>
            <Link href="/konsultasi" className="text-gray-400 hover:text-white transition">Konsultasi</Link>
            <Link href="/artikel" className="text-gray-400 hover:text-white transition">Artikel</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">Harga</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="px-4 py-2 text-gray-300 hover:text-white transition">Masuk</Link>
            <Link href="/auth/signin" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <section className="pt-40 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Artikel Menarik #PejuangRiset</h1>
          <p className="text-xl text-gray-400">Tips, tutorial, dan wawasan riset untuk #PejuangRiset Indonesia</p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition border ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {filteredArticles.map((article, i) => (
              <Link
                key={i}
                href="#"
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition group"
              >
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-4 ${
                  categoryColors[article.category] || 'bg-gray-800 text-gray-400 border-gray-700'
                }`}>
                  {article.category}
                </div>
                <h3 className="text-lg font-bold mb-3 group-hover:text-purple-400 transition">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{article.excerpt}</p>
                <div className="text-gray-500 text-sm">{article.date}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="text-lg font-bold">GipsyAI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/about" className="hover:text-white transition">About</Link>
              <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
              <Link href="/classes" className="hover:text-white transition">Classes</Link>
              <Link href="/auth/signin" className="hover:text-white transition">Login</Link>
            </div>
            <p className="text-gray-500 text-sm">© 2025 GipsyAI. Academic AI Assistant untuk Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
