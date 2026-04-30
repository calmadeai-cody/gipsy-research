import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  cache,
  generateCacheKey,
  getCache,
  setCache,
  clearCache,
  getCacheStats,
} from '@/lib/cache'

describe('Cache Module', () => {
  beforeEach(() => {
    clearCache()
  })

  afterEach(() => {
    clearCache()
  })

  describe('generateCacheKey', () => {
    it('should generate consistent keys for same input', () => {
      const key1 = generateCacheKey('paraphrase', 'Hello world')
      const key2 = generateCacheKey('paraphrase', 'Hello world')
      expect(key1).toBe(key2)
    })

    it('should generate different keys for different tool names', () => {
      const key1 = generateCacheKey('paraphrase', 'Hello world')
      const key2 = generateCacheKey('generate-title', 'Hello world')
      expect(key1).not.toBe(key2)
    })

    it('should generate different keys for different inputs', () => {
      const key1 = generateCacheKey('paraphrase', 'Hello world')
      const key2 = generateCacheKey('paraphrase', 'Hello there')
      expect(key1).not.toBe(key2)
    })

    it('should normalize whitespace in inputs', () => {
      const key1 = generateCacheKey('paraphrase', 'Hello   world')
      const key2 = generateCacheKey('paraphrase', 'Hello world')
      expect(key1).toBe(key2)
    })

    it('should be case insensitive', () => {
      const key1 = generateCacheKey('paraphrase', 'HELLO WORLD')
      const key2 = generateCacheKey('paraphrase', 'hello world')
      expect(key1).toBe(key2)
    })

    it('should trim whitespace', () => {
      const key1 = generateCacheKey('paraphrase', '  Hello world  ')
      const key2 = generateCacheKey('paraphrase', 'Hello world')
      expect(key1).toBe(key2)
    })

    it('should generate 32 character hex strings', () => {
      const key = generateCacheKey('paraphrase', 'test input')
      expect(key).toMatch(/^[a-f0-9]{32}$/)
    })
  })

  describe('setCache and getCache', () => {
    it('should store and retrieve string values', () => {
      const key = 'test-key'
      const value = 'test-value'
      setCache(key, value)
      expect(getCache(key)).toBe(value)
    })

    it('should return null for missing keys', () => {
      expect(getCache('non-existent-key')).toBeNull()
    })

    it('should return null for deleted keys', () => {
      const key = 'test-key'
      setCache(key, 'value')
      cache.delete(key)
      expect(getCache(key)).toBeNull()
    })
  })

  describe('TTL expiration', () => {
    it('should return value within TTL', () => {
      const key = 'ttl-test'
      setCache(key, 'value', 10) // 10 seconds
      expect(getCache(key)).toBe('value')
    })

    it('should return null after TTL expires', async () => {
      vi.useFakeTimers()
      try {
        const key = 'ttl-expire-test'
        setCache(key, 'value', 5) // 5 seconds
        
        // Advance time by 6 seconds
        vi.advanceTimersByTime(6000)
        
        expect(getCache(key)).toBeNull()
      } finally {
        vi.useRealTimers()
      }
    })

    it('should use default TTL of 3600 seconds', () => {
      const key = 'default-ttl'
      setCache(key, 'value') // no TTL specified
      const entry = (cache as Map<string, { value: string; expiresAt: number }>).get(key)
      expect(entry).toBeDefined()
      const ttlMs = entry!.expiresAt - Date.now()
      expect(ttlMs).toBeGreaterThan(3590000) // ~3600 seconds in ms
      expect(ttlMs).toBeLessThanOrEqual(3600000)
    })
  })

  describe('LRU eviction', () => {
    it('should evict oldest entry when max size is reached', () => {
      // Fill cache to max size (500)
      for (let i = 0; i < 500; i++) {
        setCache(`key-${i}`, `value-${i}`)
      }

      // Add one more - should evict first entry
      setCache('key-501', 'value-501')

      // First key should be evicted
      expect(getCache('key-0')).toBeNull()
      // Most recent should still be there
      expect(getCache('key-501')).toBe('value-501')
    })

    it('should not evict when updating existing key within bounds', () => {
      // Add 499 entries (leaving room for 1 more within limit)
      for (let i = 0; i < 499; i++) {
        setCache(`key-${i}`, `value-${i}`)
      }
      // Add same-key - this is the 500th entry
      setCache('same-key', 'value-1')
      // Now cache is at max size
      // Updating same-key should not cause eviction
      setCache('same-key', 'updated-value')
      expect(getCache('same-key')).toBe('updated-value')
    })
  })

  describe('clearCache', () => {
    it('should remove all entries', () => {
      setCache('key1', 'value1')
      setCache('key2', 'value2')
      clearCache()
      expect(getCache('key1')).toBeNull()
      expect(getCache('key2')).toBeNull()
    })
  })

  describe('getCacheStats', () => {
    it('should return correct size after adding entries', () => {
      setCache('key1', 'value1')
      setCache('key2', 'value2')
      const stats = getCacheStats()
      expect(stats.size).toBe(2)
      expect(stats.maxSize).toBe(500)
    })

    it('should return size 0 after clearCache', () => {
      setCache('key1', 'value1')
      clearCache()
      const stats = getCacheStats()
      expect(stats.size).toBe(0)
    })
  })
})