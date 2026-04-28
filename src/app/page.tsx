import Link from 'next/link'

const features = [
  {
    name: 'Generator Judul Penelitian',
    description: 'Buatkan judul penelitian akademik yang tepat berdasarkan kata kunci Anda.',
    icon: '📚',
  },
  {
    name: 'Parafrase Paragraf',
    description: 'Parafrase paragraf dengan AI sambil menjaga makna asli dan menghindari plagiarisme.',
    icon: '✍️',
  },
  {
    name: 'Generator Daftar Pustaka',
    description: 'Buatkan referensi bibliografi otomatis dari artikel atau konten penelitian.',
    icon: '📖',
  },
]

const pricingTiers = [
  {
    name: 'GRATIS',
    price: 'Gratis',
    period: 'selamanya',
    description: 'Untuk pengguna baru yang ingin mencoba',
    features: [
      'Generator Judul Penelitian (5x/hari)',
      'Akses dasar AI',
      'Simpan hasil ke file',
    ],
    cta: 'Mulai Gratis',
    href: '/auth/signin',
    highlight: false,
  },
  {
    name: 'LITE',
    price: 'Rp 199.000',
    period: 'per bulan',
    description: 'Untuk mahasiswa dan peneliti aktif',
    features: [
      'Semua tools AI (50x/hari)',
      'Generator Judul Penelitian',
      'Parafrase Paragraf',
      'Generator Daftar Pustaka',
      'Riwayat penggunaan',
      'Support priority',
    ],
    cta: 'Berlangganan Lite',
    href: '/payment?tier=LITE',
    highlight: true,
  },
  {
    name: 'PRO',
    price: 'Rp 499.000',
    period: 'per bulan',
    description: 'Untuk akademisi dan profesional',
    features: [
      'Semua fitur Lite',
      'Akses tak terbatas',
      'Semua metode pembayaran',
      'Export ke berbagai format',
      'API access',
      'Dedicated support',
    ],
    cta: 'Berlangganan Pro',
    href: '/payment?tier=PRO',
    highlight: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold gradient-text">GipsyAI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#fitur" className="text-gray-400 hover:text-white transition">Fitur</Link>
            <Link href="#harga" className="text-gray-400 hover:text-white transition">Harga</Link>
            <Link href="/auth/signin" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full mb-8">
            <span className="text-purple-400">✨</span>
            <span className="text-purple-300 text-sm">Academic AI Assistant untuk Indonesia</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Tulis Penelitian Lebih{' '}
            <span className="gradient-text">Cepat & Tepat</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            GipsyAI membantu mahasiswa dan peneliti Indonesia menghasilkan judul penelitian,
            memparafrase paragraf, dan membuat daftar pustaka dengan bantuan AI canggih.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signin" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition">
              Mulai Sekarang - Gratis
            </Link>
            <Link href="#fitur" className="px-8 py-4 border border-gray-700 hover:border-gray-600 rounded-xl text-lg transition">
              Pelajari Fitur
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tool AI untuk Akademisi</h2>
            <p className="text-gray-400 text-lg">Tiga tool powerful untuk kebutuhan penelitian Anda</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.name}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Paket Berlangganan</h2>
            <p className="text-gray-400 text-lg">Pilih paket yang sesuai dengan kebutuhan Anda</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-gray-900 border rounded-2xl p-8 ${
                  tier.highlight
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-gray-800'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-sm font-medium">
                    Populer
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold gradient-text">{tier.price}</div>
                  <div className="text-gray-500 text-sm mt-1">{tier.period}</div>
                </div>
                <p className="text-gray-400 text-sm mb-6 text-center">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="text-green-400">✓</span>
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

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-bold gradient-text">GipsyAI</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 GipsyAI. Academic AI Assistant untuk Indonesia.
          </p>
        </div>
      </footer>
    </div>
  )
}