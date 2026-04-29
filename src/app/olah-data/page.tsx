'use client'

import Link from 'next/link'
import { useState } from 'react'

const serviceSpecs = [
  'File Output dari Software (SPSS, Smart PLS, Minitab, EViews, Lisrel, Amos, dll.)',
  'Gratis Konsultasi',
  'Interpretasi Data',
  'Pencarian Data',
  'Rekaman Pengerjaan',
]

const features = [
  {
    emoji: '💻',
    title: 'File Output dari Software',
    desc: 'Dapatkan hasil pengolahan data dari sumber olahan software langsung',
  },
  {
    emoji: '📊',
    title: 'Interpretasi Data',
    desc: 'Penjelasan hasil olah data secara detail dan mudah dipahami',
  },
  {
    emoji: '💬',
    title: 'Gratis Konsultasi',
    desc: 'Konsultasi gratis selama proses pengerjaan',
  },
]

const testimonials = [
  { name: 'Rina Susanti', role: 'Mahasiswa S2', text: 'Selesai skripsi 2 bulan lebih cepat dari yang diperkirakan!', rating: 5 },
  { name: 'Budi Santoso', role: 'Dosen', text: 'Tool yang sangat membantu untuk penelitian saya.', rating: 5 },
  { name: 'Siti Nurhaliza', role: 'Researcher', text: 'GipsyAI jadi asisten riset andalan saya.', rating: 4.8 },
  { name: 'Ahmad Rizki', role: 'Mahasiswa S1', text: 'Bimbingannya sangat detail dan sabar, rekomendasi banget!', rating: 5 },
]

const faqs = [
  {
    q: 'Apakah jasa & produk Gipsy Research dikhususkan hanya untuk mahasiswa?',
    a: 'Tidak, juga terbuka untuk dosen, karyawan swasta, pemilik bisnis, dll.',
  },
  {
    q: 'Apa saja produk dan jasa yang disediakan?',
    a: 'Konsultasi riset, Olah data statistik, Pembuatan artikel ilmiah, Kelas online, GipsyAI',
  },
  {
    q: 'Bagaimana cara melakukan pemesanan?',
    a: 'Pilih layanan, hubungi via WhatsApp, lakukan pembayaran, terima hasil',
  },
  {
    q: 'Bagaimana mekanisme pembayaran?',
    a: 'Transfer bank, bisa dicicil untuk paket tertentu',
  },
  {
    q: 'Apakah data klien dijamin kerahasiaannya?',
    a: 'Ya, semua data klien dijamin kerahasiaannya',
  },
]

export default function OlahDataPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <span className="text-purple-400">📊</span>
            <span className="text-purple-300 text-sm font-medium">Layanan Olah Data Statistik</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Sajikan Penelitian dengan<br />Olah Data Berkualitas
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Hasil olah data akurat dari software statistik profesional, lengkap dengan interpretasi yang mudah dipahami.
          </p>
          <Link
            href="https://s.id/OlahDataGipsy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition"
          >
            Kontak Kami via WhatsApp →
          </Link>
        </div>
      </section>

      {/* Service Specifications */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Yang Termasuk dalam Layanan</h2>
            <p className="text-gray-400 text-lg">Semua yang Anda butuhkan untuk olah data penelitian</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <ul className="space-y-4">
              {serviceSpecs.map((spec, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <span className="text-purple-400 text-xl">✓</span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kenapa Pilih Layanan Kami?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">{f.emoji}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kata Mereka yang Sudah Pakai</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(t.rating) ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4 text-sm">&quot;{t.text}&quot;</p>
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-medium">{faq.q}</span>
                  <span className="text-purple-400 text-xl shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-400">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sudah Siap Menghasilkan Riset Berkualitas?</h2>
          <p className="text-gray-400 text-lg mb-8">Hubungi kami sekarang dan dapatkan olah data terbaik untuk penelitian Anda.</p>
          <Link
            href="https://s.id/OlahDataGipsy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition"
          >
            Kontak Kami via WhatsApp
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
