import Link from 'next/link'

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="text-center">
        <div className="text-5xl mb-6">📧</div>
        <h1 className="text-2xl font-bold mb-4">Cek Email Anda</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Kami telah mengirim link masuk ke email Anda. Silakan klik link tersebut untuk masuk ke GipsyAI.
        </p>
        <Link href="/" className="text-purple-400 hover:text-purple-300 transition">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}