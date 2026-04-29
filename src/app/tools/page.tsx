import Link from 'next/link'

const allTools = [
  { slug: 'generator-judul-penelitian', name: 'Generator Judul Penelitian', category: 'Perencanaan & Ide Penelitian', pro: false },
  { slug: 'diagram-kerangka-berpikir', name: 'Diagram Kerangka Berpikir', category: 'Perencanaan & Ide Penelitian', pro: true },
  { slug: 'generator-proposal-penelitian', name: 'Generator Proposal Penelitian', category: 'Perencanaan & Ide Penelitian', pro: true },
  { slug: 'pemilihan-metode-penelitian', name: 'Pemilihan Metode Penelitian', category: 'Perencanaan & Ide Penelitian', pro: true },
  { slug: 'asisten-pengembang-teks', name: 'Asisten Pengembang Teks', category: 'Asistensi Penulisan Akademik', pro: true },
  { slug: 'generator-latar-belakang', name: 'Generator Latar Belakang', category: 'Asistensi Penulisan Akademik', pro: true },
  { slug: 'generator-landasan-teori', name: 'Generator Landasan Teori', category: 'Asistensi Penulisan Akademik', pro: true },
  { slug: 'parafrase-paragraf', name: 'Parafrase Paragraf', category: 'Asistensi Penulisan Akademik', pro: false },
  { slug: 'generator-research-gap', name: 'Generator Research Gap & Novelty', category: 'Literatur & Referensi', pro: true },
  { slug: 'generator-tinjauan-pustaka', name: 'Generator Tinjauan Pustaka', category: 'Literatur & Referensi', pro: true },
  { slug: 'pembuatan-daftar-pustaka', name: 'Pembuatan Daftar Pustaka', category: 'Literatur & Referensi', pro: true },
  { slug: 'pencari-artikel-ilmiah', name: 'Pencari Artikel Ilmiah', category: 'Literatur & Referensi', pro: true },
  { slug: 'analisis-teks-transkrip', name: 'Analisis Teks Transkrip', category: 'Pengolahan & Visualisasi Data', pro: true },
  { slug: 'asisten-visualisasi-data', name: 'Asisten Visualisasi Data', category: 'Pengolahan & Visualisasi Data', pro: true },
  { slug: 'asisten-analisis-statistik', name: 'Asisten Analisis Statistik', category: 'Pengolahan & Visualisasi Data', pro: true },
  { slug: 'generator-deskripsi-gambar', name: 'Generator Deskripsi Gambar', category: 'Pengolahan & Visualisasi Data', pro: true },
  { slug: 'ai-to-human', name: 'AI to Human', category: 'Finalisasi Standar Akademik', pro: false },
  { slug: 'generator-abstrak-penelitian', name: 'Generator Abstrak Penelitian', category: 'Finalisasi Standar Akademik', pro: true },
  { slug: 'generator-pertanyaan-sidang', name: 'Generator Pertanyaan Sidang', category: 'Finalisasi Standar Akademik', pro: true },
  { slug: 'konversi-artikel-ilmiah', name: 'Konversi ke Artikel Ilmiah', category: 'Finalisasi Standar Akademik', pro: true },
]

const categories = [...new Map(allTools.map(t => [t.category, { name: t.category, tools: [] }])).values()]
allTools.forEach(tool => {
  const cat = categories.find(c => c.name === tool.category)
  if (cat) cat.tools.push(tool)
})

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold">GipsyAI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition">Home</Link>
            <Link href="/tools" className="text-white font-medium">AI Tools</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">Harga</Link>
            <Link href="/auth/signin" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">40+ AI Tools untuk Riset</h1>
          <p className="text-xl text-gray-400">Pilih tool yang sesuai dengan kebutuhan penelitian Anda</p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {categories.map((cat) => (
            <div key={cat.name}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                {cat.name === 'Perencanaan & Ide Penelitian' && '💡'}
                {cat.name === 'Asistensi Penulisan Akademik' && '✍️'}
                {cat.name === 'Literatur & Referensi' && '📚'}
                {cat.name === 'Pengolahan & Visualisasi Data' && '📊'}
                {cat.name === 'Finalisasi Standar Akademik' && '✅'}
                <span>{cat.name}</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-500/50 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium mb-1 flex items-center gap-2">
                        {tool.name}
                        {tool.pro && (
                          <span className="px-2 py-0.5 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-400">
                            PRO
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-sm">{cat.name}</div>
                    </div>
                    <span className="text-gray-600 group-hover:text-purple-400 transition">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Siap memulai?</h2>
          <p className="text-gray-400 text-lg mb-8">Mulai dari Rp 19.000/bulan untuk akses semua tool.</p>
          <Link href="/pricing" className="inline-block px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition">
            Lihat Paket Harga
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-bold">GipsyAI</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 GipsyAI. Academic AI Assistant untuk Indonesia.</p>
        </div>
      </footer>
    </div>
  )
}