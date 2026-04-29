import Link from 'next/link'

const tiers = [
  {
    name: 'BASIC',
    originalPrice: null,
    price: 'Rp 19.000',
    period: '/bulan',
    description: 'Untuk mahasiswa yang baru mulai riset',
    features: [
      '7 AI tools',
      'Free trial 3 hari',
      'Basic support',
      'Basic templates',
      'Save 3 projects',
    ],
    cta: 'Mulai Basic',
    href: '/payment?tier=BASIC',
    highlight: false,
    badge: null,
    tools: ['Generator Judul Penelitian', 'Parafrase Paragraf', 'Pembuatan Daftar Pustaka', 'AI to Human', 'Generator Deskripsi Gambar', 'Pencari Artikel Ilmiah', 'Pemilihan Metode Penelitian'],
    toolsLabel: '7 AI Tools',
  },
  {
    name: 'PRO',
    originalPrice: 'Rp 39.000',
    price: 'Rp 19.000',
    period: '/bulan',
    description: 'FLASH SALE 50% - Akses semua tool!',
    features: [
      '40+ AI tools',
      'Semua fitur Basic',
      'Priority support',
      'Advanced templates',
      'Unlimited projects',
      'Early access fitur baru',
    ],
    cta: 'Berlangganan PRO',
    href: '/payment?tier=PRO',
    highlight: true,
    badge: '🔥 FLASH SALE 50%',
    toolsLabel: '40+ AI Tools',
  },
  {
    name: 'PRO Researcher',
    originalPrice: 'Rp 49.000',
    price: 'Rp 29.000',
    period: '/bulan',
    description: 'Untuk peneliti profesional yang serius',
    features: [
      '40+ AI tools',
      '10+ certified classes',
      'Semua fitur PRO',
      'Personal mentoring (1x/month)',
      'Sertifikat completion',
      'Private research group access',
    ],
    cta: 'Berlangganan Pro Researcher',
    href: '/payment?tier=PRO_RESEARCHER',
    highlight: false,
    badge: null,
    toolsLabel: '40+ AI Tools + 10+ Classes',
  },
]

const faqs = [
  { q: 'Apakah ada free trial?', a: 'Ya! Paket BASIC memiliki free trial 3 hari tanpa perlu kartu kredit.' },
  { q: 'Bagaimana cara pembayarannya?', a: 'Kami menggunakan Midtrans untuk pembayaran via bank transfer, e-wallet, atau kartu kredit.' },
  { q: 'Apakah bisa cancel kapan saja?', a: 'Ya, Anda bisa cancel kapan saja dan tidak akan dikenakan biaya lagi setelah periode berjalan.' },
  { q: 'Apa bedanya dengan ChatGPT?', a: 'GipsyAI dirancang khusus untuk akademisi Indonesia dengan tool terstruktur yang tidak perlu prompt engineering.' },
]

export default function PricingPage() {
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
            <Link href="/pricing" className="text-white font-medium">Harga</Link>
            <Link href="/auth/signin" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Paket Berlangganan</h1>
          <p className="text-xl text-gray-400">Pilih paket yang sesuai dengan kebutuhan riset Anda</p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-gray-900 border rounded-2xl p-8 flex flex-col ${
                  tier.highlight ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-800'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-sm font-bold whitespace-nowrap">
                    {tier.badge}
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  {tier.originalPrice && (
                    <div className="text-gray-500 line-through">{tier.originalPrice}</div>
                  )}
                  <div className="text-4xl font-bold text-white">{tier.price}</div>
                  <div className="text-gray-500 text-sm mt-1">{tier.period}</div>
                </div>

                <p className="text-gray-400 text-sm mb-6 text-center">{tier.description}</p>
                
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                  <div className="text-purple-400 font-medium text-sm mb-2">{tier.toolsLabel}</div>
                  {tier.name !== 'PRO' && (
                    <ul className="space-y-1">
                      {(tier.tools ?? []).slice(0, 4).map((tool) => (
                        <li key={tool} className="text-gray-400 text-sm flex items-center gap-2">
                          <span className="text-purple-400">•</span>
                          {tool}
                        </li>
                      ))}
                      {(tier.tools ?? []).length > 4 && (
                        <li className="text-gray-500 text-sm">+ {(tier.tools ?? []).length - 4} more...</li>
                      )}
                    </ul>
                  )}
                  {tier.name === 'PRO' && (
                    <div className="text-gray-400 text-sm">Lihat semua 40+ tools →</div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="text-purple-400">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`block text-center py-3.5 rounded-xl font-medium transition ${
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

      {/* FAQs */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Pertanyaan Umum</h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-medium mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Still unsure?</h2>
          <p className="text-gray-400 text-lg mb-8">Mulai dengan free trial 3 hari di paket BASIC.</p>
          <Link href="/auth/signin" className="inline-block px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition">
            Mulai Free Trial
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