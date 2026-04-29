import Link from 'next/link'

const stats = [
  { value: '40+', label: 'AI Apps' },
  { value: '250jt+', label: 'Articles' },
  { value: '10+', label: 'Certified Classes' },
  { value: '20+', label: 'Materials' },
]

const painPoints = [
  { icon: '😤', title: 'Malas bikin prompt?', desc: 'GipsyAI siap pakai - tinggal pilih tool dan isi formulir' },
  { icon: '⏰', title: 'Tidak ada waktu?', desc: 'Hasil instan, tidak perlu menunggu berhari-hari' },
  { icon: '📝', title: 'Butuh hasil terstruktur?', desc: 'Input sederhana, output akademik berkualitas tinggi' },
]

const toolCategories = [
  {
    title: 'Perencanaan & Ide Penelitian',
    tools: ['Diagram Kerangka Berpikir (Beta) [PRO]', 'Generator Judul Penelitian', 'Generator Proposal Penelitian [PRO]', 'Pemilihan Metode Penelitian [PRO]'],
    emoji: '💡',
  },
  {
    title: 'Asistensi Penulisan Akademik',
    tools: ['Asisten Pengembang Teks [PRO]', 'Generator Latar Belakang [PRO]', 'Generator Landasan Teori [PRO]', 'Parafrase Paragraf'],
    emoji: '✍️',
  },
  {
    title: 'Literatur & Referensi',
    tools: ['Generator Research Gap & Novelty [PRO]', 'Generator Tinjauan Pustaka [PRO]', 'Pembuatan Daftar Pustaka [PRO]', 'Pencari Artikel Ilmiah [PRO]'],
    emoji: '📚',
  },
  {
    title: 'Pengolahan & Visualisasi Data',
    tools: ['Analisis Teks Transkrip [PRO]', 'Asisten Visualisasi Data [PRO]', 'Asisten Analisis Statistik [PRO]', 'Generator Deskripsi Gambar [PRO]'],
    emoji: '📊',
  },
  {
    title: 'Finalisasi Standar Akademik',
    tools: ['AI to Human', 'Generator Abstrak Penelitian [PRO]', 'Generator Pertanyaan Sidang [PRO]', 'Konversi ke Artikel Ilmiah [PRO]'],
    emoji: '✅',
  },
]

const comparisonFeatures = [
  'Tidak perlu prompt engineering',
  'Input terstruktur & hasil konsisten',
  'Dirancang khusus untuk akademisi',
  'Bahasa Indonesia & English',
  'Update fitur terbaru',
]

const pricingTiers = [
  {
    name: 'BASIC',
    originalPrice: null,
    price: 'Rp 19.000',
    period: '/bulan',
    description: 'Untuk mahasiswa yang baru mulai',
    features: ['7 AI tools', 'Free trial 3 hari', 'Basic support', 'Basic templates'],
    cta: 'Mulai Basic',
    href: '/payment?tier=BASIC',
    highlight: false,
    badge: null,
  },
  {
    name: 'PRO',
    originalPrice: 'Rp 39.000',
    price: 'Rp 19.000',
    period: '/bulan',
    description: 'Paling populer - FLASH SALE 50%',
    features: ['40+ AI tools', 'Semua fitur Basic', 'Priority support', 'Advanced templates', 'Unlimited usage'],
    cta: 'Berlangganan PRO',
    href: '/payment?tier=PRO',
    highlight: true,
    badge: '🔥 FLASH SALE',
  },
  {
    name: 'PRO Researcher',
    originalPrice: 'Rp 49.000',
    price: 'Rp 29.000',
    period: '/bulan',
    description: 'Untuk peneliti profesional',
    features: ['40+ AI tools', '10+ certified classes', 'Semua fitur PRO', 'Personal mentoring', 'Sertifikat completion'],
    cta: 'Berlangganan Pro Researcher',
    href: '/payment?tier=PRO_RESEARCHER',
    highlight: false,
    badge: null,
  },
]

const testimonials = [
  { name: 'Rina Susanti', role: 'Mahasiswa S2', text: 'Selesai skripsi 2 bulan lebih cepat dari yang diperkirakan!', rating: 5 },
  { name: 'Budi Santoso', role: 'Dosen', text: 'Tool yang sangat membantu untuk penelitian saya.', rating: 5 },
  { name: 'Siti Nurhaliza', role: 'Researcher', text: 'GipsyAI jadi asisten riset andalan saya.', rating: 4.8 },
]

export default function HomePage() {
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
            <Link href="#tools" className="text-gray-400 hover:text-white transition">AI Tools</Link>
            <Link href="#cara-pakai" className="text-gray-400 hover:text-white transition">Cara Pakai</Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition">About</Link>
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

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <span className="text-purple-400">🚀</span>
            <span className="text-purple-300 text-sm font-medium">Academic AI Assistant untuk Indonesia</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Selesaikan Riset &<br className="md:hidden" /> <span className="text-purple-400">Lulus 10x Lebih Cepat</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Tidak perlu bingung soal prompt. GipsyAI menyediakan 40+ tool AI yang siap pakai dengan input terstruktur untuk hasil akademik berkualitas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/auth/signin" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition">
              Mulai dari Rp 19.000/bulan
            </Link>
            <Link href="#tools" className="px-8 py-4 border border-gray-700 hover:border-gray-600 rounded-xl text-lg transition">
              Lihat Semua Tool →
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kenapa GipsyAI?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map((point) => (
              <div key={point.title} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">{point.icon}</div>
                <h3 className="text-xl font-bold mb-2">{point.title}</h3>
                <p className="text-gray-400">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Categories */}
      <section id="tools" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">40+ AI Tools untuk Riset</h2>
            <p className="text-gray-400 text-lg">Pilih tool yang sesuai kebutuhan penelitian Anda</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCategories.map((category) => (
              <div key={category.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.emoji}</span>
                  <h3 className="text-lg font-bold">{category.title}</h3>
                </div>
                <ul className="space-y-2">
                  {category.tools.map((tool) => (
                    <li key={tool} className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-purple-400">•</span>
                      {tool.includes('[PRO]') ? (
                        <span>{tool.replace(' [PRO]', '')} <span className="text-purple-400 text-xs ml-1">PRO</span></span>
                      ) : (
                        tool
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section id="cara-pakai" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Pakai</h2>
            <p className="text-gray-400 text-lg">3 langkah mudah untuk mulai</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Pilih Tool</h3>
              <p className="text-gray-400">Pilih tool AI yang sesuai dengan kebutuhan riset Anda</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Isi Formulir</h3>
              <p className="text-gray-400">Masukkan data sesuai kolom yang tersedia - tidak perlu prompt!</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Dapatkan Output</h3>
              <p className="text-gray-400">Hasil akademik berkualitas tinggi siap digunakan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">GipsyAI vs ChatGPT</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 text-purple-400">✨ GipsyAI</h3>
              <ul className="space-y-4">
                {comparisonFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-green-400 text-lg">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 opacity-70">
              <h3 className="text-xl font-bold mb-6 text-gray-400">❌ ChatGPT Biasa</h3>
              <ul className="space-y-4">
                {comparisonFeatures.map((_, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-red-400 text-lg">–</span>
                    <span className="text-gray-500">Butuh prompt engineering</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Paket Berlangganan</h2>
            <p className="text-gray-400 text-lg">Pilih paket yang sesuai dengan kebutuhan Anda</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-gray-900 border rounded-2xl p-8 ${
                  tier.highlight ? 'border-purple-500' : 'border-gray-800'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-bold">
                    {tier.badge}
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold mb-2">{tier.name}</h3>
                  {tier.originalPrice && (
                    <div className="text-gray-500 line-through text-sm">{tier.originalPrice}</div>
                  )}
                  <div className="text-3xl font-bold text-white">{tier.price}</div>
                  <div className="text-gray-500 text-sm">{tier.period}</div>
                </div>
                <p className="text-gray-400 text-sm mb-6 text-center">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="text-purple-400">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center py-3 rounded-xl font-medium transition ${
                    tier.highlight
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-4">
              <span className="text-yellow-400">⭐</span>
              <span className="text-yellow-300 text-sm font-medium">4.8/5.0 dari 70+ review</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kata Mereka yang Sudah Pakai</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(t.rating) ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">&quot;{t.text}&quot;</p>
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-gray-500 text-sm">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Selesaikan Riset Lebih Cepat?</h2>
          <p className="text-gray-400 text-lg mb-8">Mulai gratis hari ini dan rasakan bedanya.</p>
          <Link href="/auth/signin" className="inline-block px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition">
            Mulai Sekarang - Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
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