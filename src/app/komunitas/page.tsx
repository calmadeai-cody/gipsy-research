import Link from 'next/link'

export default function KomunitasPage() {
  const features = [
    {
      emoji: '👥',
      title: 'Forum Diskusi',
      desc: 'Tanya jawab dan diskusi dengan sesama peneliti',
    },
    {
      emoji: '📚',
      title: 'Resource分享',
      desc: 'Akses materi dan dokumentasi riset',
    },
    {
      emoji: '🤝',
      title: 'Mentoring',
      desc: 'Temui mentor yang berpengalaman di bidangnya',
    },
  ]

  const stats = [
    { value: '10.000+', label: 'Anggota' },
    { value: '500+', label: 'Diskusi Aktif' },
    { value: '50+', label: 'Mentor' },
  ]

  const steps = [
    { num: '1', text: 'Login ke GipsyAI' },
    { num: '2', text: 'Akses menu Komunitas di dashboard' },
    { num: '3', text: 'Mulai diskusi dan belajar bersama' },
  ]

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
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">Harga</Link>
            <Link href="/komunitas" className="text-gray-400 hover:text-white transition">Komunitas</Link>
            <Link href="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="px-4 py-2 text-gray-400 hover:text-white transition">Login</Link>
            <Link href="/auth/signin" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">Mulai Gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Komunitas <span className="text-purple-400">#PejuangRiset</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Bergabung dengan ribuan peneliti Indonesia yang sedang menyelesaikan riset mereka
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center hover:border-purple-500/30 transition">
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">{s.value}</div>
                  <div className="text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Cara Bergabung</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
                  {step.num}
                </div>
                <p className="text-lg">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-32 px-6 text-center">
        <Link
          href="/auth/signin"
          className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-lg transition"
        >
          Bergabung Sekarang
        </Link>
      </section>
    </div>
  )
}