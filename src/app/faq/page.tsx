'use client'

import Link from 'next/link'
import { useState } from 'react'

const faqs = [
  {
    q: 'Apakah jasa & produk Gipsy Research dikhususkan hanya untuk mahasiswa?',
    a: 'Tidak, Gipsy Research juga terbuka untuk melayani klien selain mahasiswa, seperti dosen, karyawan swasta, pemilik bisnis, dan lain-lain. Untuk informasi lebih lanjut, hubungi kami.',
  },
  {
    q: 'Apa saja produk dan jasa yang disediakan oleh Gipsy Research?',
    a: 'Konsultasi riset, Olah data statistik, Pembuatan artikel ilmiah, Kelas online, GipsyAI',
  },
  {
    q: 'Bagaimana cara melakukan pemesanan produk atau jasa dari Gipsy Research?',
    a: 'Pilih layanan yang diinginkan, hubungi kami via WhatsApp, lakukan pembayaran, terima hasil sesuai waktu yang ditentukan',
  },
  {
    q: 'Bagaimana mekanisme pembayaran produk atau jasa dari Gipsy Research?',
    a: 'Transfer bank, tersedia opsi cicilan untuk paket tertentu',
  },
  {
    q: 'Apakah Gipsy Research menjamin kerahasiaan data yang diperlukan dalam proses riset?',
    a: 'Ya, semua data klien dijamin kerahasiaannya',
  },
]

export default function FaqPage() {
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

      {/* Page Title */}
      <section className="pt-40 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <span className="text-purple-400">❓</span>
            <span className="text-purple-300 text-sm font-medium">FAQ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Pertanyaan Seputar Gipsy Research
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan yang sering diajukan tentang layanan kami.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
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
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sudah Siap Menghasilkan Riset Berkualitas untuk Segala Kebutuhan Anda?</h2>
          <p className="text-gray-400 text-lg mb-8">Hubungi kami sekarang dan mulai wujudkan penelitian terbaik Anda.</p>
          <Link
            href="https://s.id/gipsyresearch"
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
