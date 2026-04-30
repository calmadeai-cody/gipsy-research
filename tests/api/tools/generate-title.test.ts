import { describe, it, expect, vi, beforeEach } from 'vitest'

// Define mocks at module level so they can be accessed with vi.mocked
const mockPrismaUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  tier: 'PRO',
}

// Create mock functions at the top level
const mockFindUnique = vi.fn()
const mockToolUsageCount = vi.fn()
const mockToolUsageCreate = vi.fn()
const mockGetServerSession = vi.fn()

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}))

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: mockFindUnique },
    toolUsage: { count: mockToolUsageCount, create: mockToolUsageCreate },
  },
}))

// Mock AI functions
vi.mock('@/lib/ai', () => ({
  generateResearchTitle: vi.fn().mockResolvedValue([
    'Pengaruh Machine Learning terhadap Prediksi Cuaca',
    'Analisis Sentimen NLP untuk Bahasa Indonesia',
    'Deep Learning dalam Deteksi Obfuscated Malware',
  ]),
}))

// Set default mocks
function resetMocks() {
  vi.clearAllMocks()
  mockGetServerSession.mockResolvedValue({
    user: { email: 'test@example.com', name: 'Test User' },
  })
  mockFindUnique.mockResolvedValue(mockPrismaUser)
  mockToolUsageCount.mockResolvedValue(0)
  mockToolUsageCreate.mockResolvedValue({ id: 'usage-123' })
}

describe('POST /api/tools/generate-title', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('should return 401 when no session', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)
    
    const { POST } = await import('@/app/api/tools/generate-title/route')
    
    const request = new Request('http://localhost/api/tools/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: 'machine learning' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should return 400 when keywords missing', async () => {
    const { POST } = await import('@/app/api/tools/generate-title/route')
    
    const request = new Request('http://localhost/api/tools/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error.message).toContain('Keywords')
  })

  it('should return titles on success', async () => {
    const { POST } = await import('@/app/api/tools/generate-title/route')
    
    const request = new Request('http://localhost/api/tools/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: 'machine learning' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.titles).toBeDefined()
    expect(Array.isArray(data.titles)).toBe(true)
    expect(data.titles.length).toBeGreaterThan(0)
  })

  it('should return 429 when BASIC tier exceeds daily limit', async () => {
    mockFindUnique.mockResolvedValueOnce({ ...mockPrismaUser, tier: 'BASIC' })
    mockToolUsageCount.mockResolvedValueOnce(5) // Already at limit for BASIC
    
    const { POST } = await import('@/app/api/tools/generate-title/route')
    
    const request = new Request('http://localhost/api/tools/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: 'test' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(429)
  })

  it('should allow unlimited for PRO tier even with high usage', async () => {
    // For PRO tier, the code returns early with Infinity limit
    // So toolUsage.count is NOT called - but we still mock it in case
    
    const { POST } = await import('@/app/api/tools/generate-title/route')
    
    const request = new Request('http://localhost/api/tools/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: 'test' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})