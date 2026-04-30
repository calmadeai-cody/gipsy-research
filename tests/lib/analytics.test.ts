import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock localStorage before importing analytics module
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

import {
  trackUsage,
  getUsageStats,
  getPopularTools,
  clearUsage,
} from '@/lib/analytics'

describe('analytics', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('trackUsage', () => {
    it('saves usage entry to localStorage', () => {
      trackUsage('Generator Judul', 'test input')
      
      const stored = localStorage.getItem('gipsyai_analytics')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.entries).toHaveLength(1)
      expect(parsed.entries[0].toolName).toBe('Generator Judul')
      expect(parsed.entries[0].inputText).toBe('test input')
      expect(parsed.entries[0].timestamp).toBeDefined()
    })

    it('appends multiple entries', () => {
      trackUsage('Tool A', 'input 1')
      trackUsage('Tool B', 'input 2')
      trackUsage('Tool A', 'input 3')
      
      const stored = JSON.parse(localStorage.getItem('gipsyai_analytics')!)
      expect(stored.entries).toHaveLength(3)
    })
  })

  describe('getUsageStats', () => {
    it('returns correct structure', () => {
      const stats = getUsageStats()
      
      expect(stats).toHaveProperty('totalCount')
      expect(stats).toHaveProperty('usesByTool')
      expect(stats).toHaveProperty('dailyUsage')
      expect(typeof stats.totalCount).toBe('number')
      expect(typeof stats.usesByTool).toBe('object')
      expect(Array.isArray(stats.dailyUsage)).toBe(true)
    })

    it('returns empty stats when no data', () => {
      const stats = getUsageStats()
      
      expect(stats.totalCount).toBe(0)
      expect(Object.keys(stats.usesByTool).length).toBe(0)
      expect(stats.dailyUsage).toHaveLength(7)
    })

    it('counts usage correctly', () => {
      trackUsage('Tool A', 'input 1')
      trackUsage('Tool A', 'input 2')
      trackUsage('Tool B', 'input 3')
      
      const stats = getUsageStats()
      
      expect(stats.totalCount).toBe(3)
      expect(stats.usesByTool['Tool A']).toBe(2)
      expect(stats.usesByTool['Tool B']).toBe(1)
    })

    it('returns 7 days of daily usage', () => {
      const stats = getUsageStats()
      
      expect(stats.dailyUsage).toHaveLength(7)
      // Each day should have date and count
      stats.dailyUsage.forEach((day) => {
        expect(day).toHaveProperty('date')
        expect(day).toHaveProperty('count')
        expect(typeof day.count).toBe('number')
      })
    })
  })

  describe('getPopularTools', () => {
    it('returns top 3 most-used tools', () => {
      trackUsage('Tool A', 'input')
      trackUsage('Tool A', 'input')
      trackUsage('Tool A', 'input')
      trackUsage('Tool B', 'input')
      trackUsage('Tool B', 'input')
      trackUsage('Tool C', 'input')
      trackUsage('Tool D', 'input')
      
      const popular = getPopularTools()
      
      expect(popular).toHaveLength(3)
      expect(popular[0].toolName).toBe('Tool A')
      expect(popular[0].count).toBe(3)
      expect(popular[1].toolName).toBe('Tool B')
      expect(popular[1].count).toBe(2)
      expect(popular[2].toolName).toBe('Tool C')
      expect(popular[2].count).toBe(1)
    })

    it('returns empty array when no usage', () => {
      const popular = getPopularTools()
      
      expect(popular).toHaveLength(0)
    })

    it('returns less than 3 when fewer tools used', () => {
      trackUsage('Tool A', 'input')
      trackUsage('Tool B', 'input')
      
      const popular = getPopularTools()
      
      expect(popular).toHaveLength(2)
    })
  })

  describe('clearUsage', () => {
    it('clears all analytics data', () => {
      trackUsage('Tool A', 'input')
      trackUsage('Tool B', 'input')
      
      clearUsage()
      
      const stored = localStorage.getItem('gipsyai_analytics')
      expect(stored).toBeNull()
    })

    it('returns correct stats after clearing', () => {
      trackUsage('Tool A', 'input')
      clearUsage()
      
      const stats = getUsageStats()
      expect(stats.totalCount).toBe(0)
    })
  })

  describe('daily usage calculation', () => {
    it('correctly calculates daily counts', () => {
      // Add entries with known timestamps
      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000
      
      // Manually inject entries for testing
      const entries = [
        { toolName: 'Tool', inputText: 'input', timestamp: now - oneDayMs }, // yesterday
        { toolName: 'Tool', inputText: 'input', timestamp: now - oneDayMs }, // yesterday
        { toolName: 'Tool', inputText: 'input', timestamp: now }, // today
      ]
      
      localStorage.setItem('gipsyai_analytics', JSON.stringify({ entries }))
      
      const stats = getUsageStats()
      
      // Today should have 1, yesterday should have 2
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(now - oneDayMs).toISOString().split('T')[0]
      
      const todayEntry = stats.dailyUsage.find(d => d.date === today)
      const yesterdayEntry = stats.dailyUsage.find(d => d.date === yesterday)
      
      expect(todayEntry?.count).toBe(1)
      expect(yesterdayEntry?.count).toBe(2)
    })
  })
})
