'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function KontakPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Pesan terkirim! Kami akan segera menghubungi Anda.')
    setForm({ name: '', email: '', message: '' })
  }

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hubungi Kami</h1>
          <p className="text-gray-400 text-lg">Kami siap membantu Anda 24/7</p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp */}
          <a href="https://s.id/gipsyresearch" target="_blank" rel="noopener noreferrer"
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition group text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition">WhatsApp</h3>
            <p className="text-gray-400 text-sm">Chat WhatsApp</p>
          </a>
          {/* Email */}
          <a href="mailto:info@gipsyresearch.id"
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition group text-center">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition">Email</h3>
            <p className="text-gray-400 text-sm">info@gipsyresearch.id</p>
          </a>
          {/* Website */}
          <a href="https://gipsyresearch.id" target="_blank" rel="noopener noreferrer"
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition group text-center">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition">Website</h3>
            <p className="text-gray-400 text-sm">gipsyresearch.id</p>
          </a>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Kirim Pesan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nama</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                  placeholder="Nama lengkap Anda"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pesan</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
              >
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 inline-block">
            <h3 className="text-lg font-semibold mb-2">🕐 Jam Operasional</h3>
            <p className="text-gray-400">Senin - Sabtu, 09.00 - 17.00 WIB</p>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="pb-32 px-6 text-center">
        <p className="text-gray-400">
          Pertanyaan yang sering diajukan?{' '}
          <Link href="/faq" className="text-purple-400 hover:text-purple-300 transition">
            Lihat FAQ
          </Link>
        </p>
      </section>
    </div>
  )
}