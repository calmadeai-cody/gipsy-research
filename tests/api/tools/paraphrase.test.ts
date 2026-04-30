import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Define mock functions at module level
const mockFindUnique = vi.fn()
const mockToolUsageCount = vi.fn()
const mockToolUsageCreate = vi.fn()
const mockGetServerSession = vi.fn()
const mockParaphraseParagraph = vi.fn()

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
  paraphraseParagraph: mockParaphraseParagraph,
}))

describe('POST /api/tools/paraphrase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementations - PRO tier has access
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com', name: 'Test User', tier: 'PRO' },
    })
    mockFindUnique.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      tier: 'PRO',
    })
    mockToolUsageCount.mockResolvedValue(0)
    mockToolUsageCreate.mockResolvedValue({ id: 'usage-123' })
    mockParaphraseParagraph.mockResolvedValue('Ini adalah teks parafrase yang sudah diubah.')
  })

  it('should return 401 when no session', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)
    
    const { POST } = await import('@/app/api/tools/paraphrase/route')
    
    const request = new NextRequest('http://localhost/api/tools/paraphrase', {
      method: 'POST',
      body: JSON.stringify({ paragraph: 'Teks asli untuk parafrase.' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should return 400 when paragraph missing', async () => {
    const { POST } = await import('@/app/api/tools/paraphrase/route')
    
    const request = new NextRequest('http://localhost/api/tools/paraphrase', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('should return 403 when BASIC tier tries to access', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { email: 'test@example.com', name: 'Test User', tier: 'BASIC' },
    })
    
    const { POST } = await import('@/app/api/tools/paraphrase/route')
    
    const request = new NextRequest('http://localhost/api/tools/paraphrase', {
      method: 'POST',
      body: JSON.stringify({ paragraph: 'Teks asli.' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  it('should return paraphrased text on success for PRO tier', async () => {
    const { POST } = await import('@/app/api/tools/paraphrase/route')
    
    const request = new NextRequest('http://localhost/api/tools/paraphrase', {
      method: 'POST',
      body: JSON.stringify({ paragraph: 'Teks asli untuk parafrase.' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.paraphrased).toBeDefined()
    expect(typeof data.paraphrased).toBe('string')
  })
})