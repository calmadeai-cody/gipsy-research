'use client'

import { useEffect, useState } from 'react'
import { getUsageStats, getPopularTools, getMostActiveTime } from '@/lib/analytics'

interface PopularTool {
  toolName: string
  count: number
}

export default function UsageChart() {
  const [stats, setStats] = useState<{
    totalCount: number
    dailyUsage: Array<{ date: string; count: number }>
  }>({
    totalCount: 0,
    dailyUsage: [],
  })
  const [popularTools, setPopularTools] = useState<PopularTool[]>([])
  const [mostActiveTime, setMostActiveTime] = useState<'morning' | 'afternoon' | 'evening'>('evening')
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMounted(true)
    const usageStats = getUsageStats()
    setStats({
      totalCount: usageStats.totalCount,
      dailyUsage: usageStats.dailyUsage,
    })
    setPopularTools(getPopularTools())
    setMostActiveTime(getMostActiveTime())
  }, [])

  if (!mounted) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const maxDailyCount = Math.max(...stats.dailyUsage.map((d) => d.count), 1)

  const timeLabels = {
    morning: 'Pagi (5-11)',
    afternoon: 'Siang (12-17)',
    evening: 'Malam (18-23)',
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-4">📊 Statistik Penggunaan</h3>

      {/* Total Uses */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-1">Total Penggunaan</div>
        <div className="text-3xl font-bold gradient-text">{stats.totalCount}</div>
      </div>

      {/* Daily Usage Bar Chart */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">Penggunaan 7 Hari Terakhir</div>
        <div className="flex items-end gap-2 h-24">
          {stats.dailyUsage.map((day, idx) => {
            const height = Math.max((day.count / maxDailyCount) * 100, day.count > 0 ? 8 : 4)
            const date = new Date(day.date)
            const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' })
            const isToday = day.date === new Date().toISOString().split('T')[0]

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                  <div
                    className={`w-full max-w-8 rounded-t transition-all ${isToday ? 'bg-purple-600' : 'bg-purple-500/60'}`}
                    style={{ height: `${height}%` }}
                    title={`${day.count} penggunaan`}
                  />
                </div>
                <span className={`text-xs ${isToday ? 'text-purple-400 font-medium' : 'text-gray-500'}`}>
                  {dayName}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top 3 Tools */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">Tool Populer</div>
        {popularTools.length === 0 ? (
          <div className="text-sm text-gray-500">Belum ada data</div>
        ) : (
          <div className="space-y-2">
            {popularTools.map((tool, idx) => (
              <div key={tool.toolName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">#{idx + 1}</span>
                  <span className="text-sm truncate max-w-[150px]">{tool.toolName}</span>
                </div>
                <span className="text-sm text-gray-400">{tool.count}x</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Most Active Time */}
      <div>
        <div className="text-sm text-gray-400 mb-1">Waktu Paling Aktif</div>
        <div className="text-sm font-medium">{timeLabels[mostActiveTime]}</div>
      </div>
    </div>
  )
}
