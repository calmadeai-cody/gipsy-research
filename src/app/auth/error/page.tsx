import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold mb-4">Terjadi Kesalahan</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Terjadi kesalahan saat autentikasi. Silakan coba lagi atau hubungi support.
        </p>
        <Link href="/auth/signin" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition">
          Coba Lagi
        </Link>
      </div>
    </div>
  )
}