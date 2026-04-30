import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsageChart from '@/components/dashboard/UsageChart'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  const userEmail = session.user.email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { subscription: true }
  })

  const tier = (session.user as { tier?: string })?.tier || 'BASIC'
  const subscriptionStatus = (session.user as { subscriptionStatus?: string })?.subscriptionStatus || 'inactive'

  const dailyLimits: Record<string, number> = {
    BASIC: 10,
    PRO: Infinity,
    PRO_RESEARCHER: Infinity,
  }
  const dailyLimit = dailyLimits[tier] ?? 10

  const tools = [
    {
      name: 'Generator Judul Penelitian',
      slug: 'generator-judul',
      description: 'Buatkan judul penelitian akademik',
      icon: '📚',
      available: true,
    },
    {
      name: 'Parafrase Paragraf',
      slug: 'paraphrase',
      description: 'Parafrase paragraf dengan AI',
      icon: '✍️',
      available: tier !== 'BASIC' || subscriptionStatus === 'active',
      limitNote: tier === 'BASIC' && subscriptionStatus !== 'active' ? 'Free trial habis' : null,
    },
    {
      name: 'Generator Daftar Pustaka',
      slug: 'daftar-pustaka',
      description: 'Buatkan referensi bibliografi',
      icon: '📖',
      available: tier !== 'BASIC' || subscriptionStatus === 'active',
      limitNote: tier === 'BASIC' && subscriptionStatus !== 'active' ? 'Free trial habis' : null,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold gradient-text">GipsyAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{userEmail}</span>
            <Link href="/api/auth/signout" className="px-4 py-2 text-sm border border-gray-700 hover:border-gray-600 rounded-lg transition">
              Keluar
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Selamat datang di GipsyAI, {user?.name || userEmail}</p>
          </div>

          {/* Subscription Status + Analytics */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="text-sm text-gray-400 mb-2">Paket Aktif</div>
                <div className="text-2xl font-bold gradient-text">{tier}</div>
                <div className={`text-sm mt-1 ${subscriptionStatus === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {subscriptionStatus === 'active' ? '● Aktif' : '○ Pending'}
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="text-sm text-gray-400 mb-2">Batas Harian</div>
                <div className="text-2xl font-bold">{dailyLimit === Infinity ? '∞' : dailyLimit}</div>
                <div className="text-sm text-gray-500 mt-1">kali/hari</div>
              </div>
            </div>
            <UsageChart />
          </div>

          {/* Tools */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Tool AI</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <div key={tool.slug} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="text-3xl mb-3">{tool.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{tool.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{tool.description}</p>
                  {tool.available ? (
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="block text-center py-2 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition"
                    >
                      Gunakan
                    </Link>
                  ) : (
                    <div className="text-center">
                      <span className="text-sm text-gray-500">{tool.limitNote}</span>
                      <Link
                        href="/payment?tier=BASIC"
                        className="block mt-2 py-2 border border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded-xl font-medium transition text-sm"
                      >
                        Upgrade
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
