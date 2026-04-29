import Link from 'next/link'

const team = [
  { name: 'Dr. Ahmad Wijaya', role: 'Co-Founder & CEO', bio: 'PhD in Education Technology, 10+ years research experience' },
  { name: 'Sarah Putri', role: 'Co-Founder & CTO', bio: 'Former Senior Engineer di Gojek, Expert in AI/ML' },
  { name: 'Dr. Budi Santoso', role: 'Academic Advisor', bio: 'Professor di UI, Specialist in Research Methodology' },
]

const partners = [
  'Universitas Indonesia', 'Institut Teknologi Bandung', 'Universitas Gadjah Mada',
  'Universitas Airlangga', 'BRIN Indonesia', 'LIPI',
]

const achievements = [
  { number: '10,000+', label: 'Pengguna Aktif' },
  { number: '500+', label: 'Institusi Pendidikan' },
  { number: '4.8/5', label: 'Rating rata-rata' },
  { number: '98%', label: 'Tingkat Kepuasan' },
]

export default function AboutPage() {
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
            <Link href="/about" className="text-white font-medium">About</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">Harga</Link>
            <Link href="/auth/signin" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About GipsyAI</h1>
          <p className="text-xl text-gray-400">
            Kami membangun platform AI akademik untuk membantu peneliti dan mahasiswa Indonesia 
            menyelesaikan riset lebih cepat dengan hasil yang berkualitas.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Visi Kami</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <p className="text-lg text-gray-300 leading-relaxed">
              "Menjadi platform AI akademik terdepan di Asia Tenggara yang memberdayakan 
              setiap peneliti dan mahasiswa untuk menghasilkan penelitian berkualitas tinggi 
              dengan efisiensi tinggi dan akses yang merata."
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((a) => (
              <div key={a.label} className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">{a.number}</div>
                <div className="text-gray-500">{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Tim Kami</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                <div className="w-20 h-20 bg-purple-600/20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                  👤
                </div>
                <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                <p className="text-purple-400 text-sm mb-3">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Mitra Kami</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {partners.map((partner) => (
              <div key={partner} className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-400">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Bergabung dengan Kami</h2>
          <p className="text-gray-400 text-lg mb-8">
            Mulai gunakan GipsyAI hari ini dan rasakan bedanya dalam penelitian Anda.
          </p>
          <Link href="/auth/signin" className="inline-block px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition">
            Daftar Gratis
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