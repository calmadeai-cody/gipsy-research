/**
 * Client-side usage analytics tracking using localStorage
 */

const STORAGE_KEY = 'gipsyai_analytics'

export interface UsageEntry {
  toolName: string
  inputText: string
  timestamp: number
}

export interface UsageStats {
  totalCount: number
  usesByTool: Record<string, number>
  dailyUsage: Array<{ date: string; count: number }>
}

interface StoredAnalytics {
  entries: UsageEntry[]
}

/**
 * Track a tool usage event
 */
export function trackUsage(toolName: string, inputText: string): void {
  // Check for localStorage availability (works in both browser and test environments)
  if (typeof localStorage === 'undefined') return

  const entry: UsageEntry = {
    toolName,
    inputText,
    timestamp: Date.now(),
  }

  try {
    const stored = getStoredAnalytics()
    stored.entries.push(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // localStorage might be full or disabled
  }
}

/**
 * Get comprehensive usage statistics
 */
export function getUsageStats(): UsageStats {
  const stored = getStoredAnalytics()
  const entries = stored.entries

  // Total count
  const totalCount = entries.length

  // Uses by tool
  const usesByTool: Record<string, number> = {}
  for (const entry of entries) {
    usesByTool[entry.toolName] = (usesByTool[entry.toolName] || 0) + 1
  }

  // Daily usage for last 7 days
  const dailyUsage = getDailyUsage(entries, 7)

  return {
    totalCount,
    usesByTool,
    dailyUsage,
  }
}

/**
 * Get top 3 most-used tools
 */
export function getPopularTools(): Array<{ toolName: string; count: number }> {
  const stats = getUsageStats()
  const sorted = Object.entries(stats.usesByTool)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([toolName, count]) => ({ toolName, count }))

  return sorted
}

/**
 * Get the most active time of day (morning/afternoon/evening)
 */
export function getMostActiveTime(): 'morning' | 'afternoon' | 'evening' {
  const stored = getStoredAnalytics()
  const entries = stored.entries

  const timeBuckets = {
    morning: 0,    // 5-11
    afternoon: 0, // 12-17
    evening: 0,   // 18-23
  }

  for (const entry of entries) {
    const hour = new Date(entry.timestamp).getHours()
    if (hour >= 5 && hour < 12) {
      timeBuckets.morning++
    } else if (hour >= 12 && hour < 18) {
      timeBuckets.afternoon++
    } else {
      timeBuckets.evening++
    }
  }

  const maxBucket = Object.entries(timeBuckets).reduce(
    (max, [key, val]) => (val > max[1] ? [key, val] : max),
    ['evening', 0] as [string, number]
  )

  return maxBucket[0] as 'morning' | 'afternoon' | 'evening'
}

/**
 * Clear all usage analytics
 */
export function clearUsage(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// Helper functions

function getStoredAnalytics(): StoredAnalytics {
  if (typeof localStorage === 'undefined') {
    return { entries: [] }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { entries: [] }
    return JSON.parse(stored) as StoredAnalytics
  } catch {
    return { entries: [] }
  }
}

function getDailyUsage(entries: UsageEntry[], days: number): Array<{ date: string; count: number }> {
  const result: Array<{ date: string; count: number }> = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const count = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0]
      return entryDate === dateStr
    }).length

    result.push({ date: dateStr, count })
  }

  return result
}
