import Link from 'next/link'

const categories = [
  { name: 'Penelitian Dasar', count: 5, emoji: '📖' },
  { name: 'Statistik & Data', count: 4, emoji: '📊' },
  { name: 'Penulisan Akademik', count: 6, emoji: '✍️' },
  { name: 'Publication & Journals', count: 5, emoji: '📚' },
]

const features = [
  { icon: '🎥', text: 'Video lecture berkualitas tinggi' },
  { icon: '📝', text: 'Materi dan template siap pakai' },
  { icon: '🏆', text: 'Sertifikat completion' },
  { icon: '💬', text: 'Q&A dengan mentor' },
]

const classes = [
  { 
    title: 'Dasar-Dasar Penelitian Kuantitatif', 
    desc: 'Pelajari fundamental penelitian kuantitatif dari desain hingga analisis data.',
    level: 'Beginner',
    rating: 9.5,
    students: 1250,
  },
  { 
    title: 'Analisis Data dengan SPSS', 
    desc: 'Kuasai analisis statistik menggunakan SPSS untuk penelitian akademik.',
    level: 'Intermediate',
    rating: 9.7,
    students: 890,
  },
  { 
    title: 'Penulisan Jurnal Ilmiah SCOPUS', 
    desc: 'Langkah demi langkah menulis jurnal yang terindeks SCOPUS.',
    level: 'Advanced',
    rating: 9.8,
    students: 560,
  },
  { 
    title: 'Metode Penelitian Kualitatif', 
    desc: 'Pendekatan kualitatif untuk penelitian di bidang sosial dan humaniora.',
    level: 'Intermediate',
    rating: 9.4,
    students: 780,
  },
]

export default function ClassesPage() {
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
            <Link href="/about" className="text-gray-400 hover:text-white transition">About</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">Harga</Link>
            <Link href="/classes" className="text-white font-medium">Classes</Link>
            <Link href="/auth/signin" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <span className="text-purple-400">🎓</span>
            <span className="text-purple-300 text-sm font-medium">10+ Certified Classes</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kelas Riset & Akademik</h1>
          <p className="text-xl text-gray-400">
            Tingkatkan kemampuan riset Anda dengan kelas-kelas berkualitas dari mentor berpengalaman.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <span className="text-yellow-400">⭐</span>
            <span className="text-yellow-300 text-sm font-medium">Rating 9.6/10</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Kategori Kelas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 transition">
                <div className="text-3xl mb-3">{cat.emoji}</div>
                <div className="font-medium mb-1">{cat.name}</div>
                <div className="text-purple-400 text-sm">{cat.count} kelas</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Apa yang Kamu Dapat</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-lg">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classes List */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Kelas Populer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {classes.map((c) => (
              <div key={c.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">{c.level}</span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <span>⭐</span>
                    <span>{c.rating}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{c.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{c.desc}</p>
                <div className="text-gray-500 text-sm">{c.students.toLocaleString()} siswa</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Dapatkan Akses ke Semua Kelas</h2>
          <p className="text-gray-400 text-lg mb-8">
            Bergabung dengan paket PRO Researcher untuk akses ke semua kelas dan sertifikasi.
          </p>
          <Link href="/payment?tier=PRO_RESEARCHER" className="inline-block px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition">
            Berlangganan Sekarang
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