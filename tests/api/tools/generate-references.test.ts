import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Define mock functions at module level
const mockFindUnique = vi.fn()
const mockToolUsageCount = vi.fn()
const mockToolUsageCreate = vi.fn()
const mockGetServerSession = vi.fn()
const mockGenerateBibliography = vi.fn()

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
  generateBibliography: mockGenerateBibliography,
}))

describe('POST /api/tools/generate-references', () => {
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
    mockGenerateBibliography.mockResolvedValue([
      'Nama, A. (2024). Judul Artikel. Jurnal, 1(1), 1-10.',
      'Nama, B. (2023). Judul Lain. Jurnal, 2(2), 20-30.',
    ])
  })

  it('should return 401 when no session', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)
    
    const { POST } = await import('@/app/api/tools/generate-references/route')
    
    const request = new NextRequest('http://localhost/api/tools/generate-references', {
      method: 'POST',
      body: JSON.stringify({ content: 'Article content here' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should return 400 when content missing', async () => {
    const { POST } = await import('@/app/api/tools/generate-references/route')
    
    const request = new NextRequest('http://localhost/api/tools/generate-references', {
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
    
    const { POST } = await import('@/app/api/tools/generate-references/route')
    
    const request = new NextRequest('http://localhost/api/tools/generate-references', {
      method: 'POST',
      body: JSON.stringify({ content: 'Article content here' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  it('should return references on success for PRO tier', async () => {
    const { POST } = await import('@/app/api/tools/generate-references/route')
    
    const request = new NextRequest('http://localhost/api/tools/generate-references', {
      method: 'POST',
      body: JSON.stringify({ content: 'Article content here', style: 'APA' }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.references).toBeDefined()
    expect(Array.isArray(data.references)).toBe(true)
  })
})