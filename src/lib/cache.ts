import { createHash } from 'node:crypto'

interface CacheEntry {
  value: string
  expiresAt: number
}

const MAX_CACHE_SIZE = 500
export const cache = new Map<string, CacheEntry>()

/**
 * Generate a cache key from tool name and normalized input
 */
export function generateCacheKey(toolName: string, input: string): string {
  const normalized = input.toLowerCase().trim().replace(/\s+/g, ' ')
  const raw = `${toolName}:${normalized}`
  return createHash('sha256').update(raw).digest('hex').substring(0, 32)
}

/**
 * Get cached value if it exists and hasn't expired
 */
export function getCache(key: string): string | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.value
}

/**
 * Set a cache entry with TTL in seconds
 */
export function setCache(key: string, value: string, ttlSeconds: number = 3600): void {
  // LRU eviction if at max size
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): { size: number; maxSize: number } {
  return { size: cache.size, maxSize: MAX_CACHE_SIZE }
}