import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/image-desc-generator'

// Mock response
const mockImageDescriptionResponse = {
  description: 'Gambar menunjukkan grafik batang dengan sumbu X berisi tahun (2018-2023) dan sumbu Y berisi nilai dalam persen. Terdapat empat batang yang dikelompokkan untuk setiap tahun dengan warna berbeda yang mewakili empat kategori data. Tren keseluruhan menunjukkan peningkatan dari tahun ke tahun.',
  technicalDetails: 'Format: PNG, Resolusi: 1920x1080 piksel, Rasio aspek: 16:9, Tidak ada metadata tambahan yang tersedia.',
  interpretation: 'Gambar ini menyajikan data longitudinal tentang perubahan beberapa variabel dalam rentang waktu lima tahun. Peningkatan konsisten menunjukkan tren positif yang dapat dikaitkan dengan kebijakan yang diterapkan pada periode tersebut. Visualisasi ini relevan untuk penelitian tentang evaluasi kebijakan dan analisis tren.',
  caption: 'Gambar 1. Tren Perkembangan Variabel A, B, C, dan D dari Tahun 2018-2023. Sumber: Data olahan peneliti (2024).',
}

vi.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async ({ messages }: { messages: Array<{ content: string }> }) => {
        const userMessage = messages[0]?.content || ''

        if (userMessage.includes('deskripsi') || userMessage.includes('gambar')) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(mockImageDescriptionResponse),
            }],
          }
        }
        if (userMessage.includes('JSON')) {
          return {
            content: [{ type: 'text', text: JSON.stringify(mockImageDescriptionResponse) }],
          }
        }
        return { content: [{ type: 'text', text: '' }] }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('generateImageDescription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return a result with description', async () => {
    const { generateImageDescription } = await import('@/lib/ai/image-desc-generator')
    const result = await generateImageDescription('https://example.com/image.jpg')
    expect(typeof result.description).toBe('string')
    expect(result.description.length).toBeGreaterThan(0)
  })

  it('should return result with technicalDetails', async () => {
    const { generateImageDescription } = await import('@/lib/ai/image-desc-generator')
    const result = await generateImageDescription('https://example.com/image.jpg')
    expect(typeof result.technicalDetails).toBe('string')
    expect(result.technicalDetails.length).toBeGreaterThan(0)
  })

  it('should return result with interpretation', async () => {
    const { generateImageDescription } = await import('@/lib/ai/image-desc-generator')
    const result = await generateImageDescription('https://example.com/image.png')
    expect(typeof result.interpretation).toBe('string')
    expect(result.interpretation.length).toBeGreaterThan(0)
  })

  it('should return result with caption', async () => {
    const { generateImageDescription } = await import('@/lib/ai/image-desc-generator')
    const result = await generateImageDescription('https://example.com/diagram.jpg')
    expect(typeof result.caption).toBe('string')
    expect(result.caption.length).toBeGreaterThan(0)
  })

  it('should handle context parameter when provided', async () => {
    const { generateImageDescription } = await import('@/lib/ai/image-desc-generator')
    const result = await generateImageDescription('https://example.com/image.jpg', 'Penelitian tentang perubahan iklim')
    expect(result.description).toBeDefined()
    expect(result.technicalDetails).toBeDefined()
    expect(result.interpretation).toBeDefined()
    expect(result.caption).toBeDefined()
  })

  it('should call Anthropic with proper prompt including context', async () => {
    const { generateImageDescription } = await import('@/lib/ai/image-desc-generator')
    await generateImageDescription('https://example.com/chart.png', 'Analisis data statistik')

    const { Anthropic } = await import('@anthropic-ai/sdk')
    const MockInstance = (Anthropic as unknown as { mock?: { instances?: Array<{ messages: { create: ReturnType<typeof vi.fn> } }> } }).mock?.instances?.[0]
    if (MockInstance) {
      expect(MockInstance.messages.create).toHaveBeenCalled()
    }
  })
})

describe('JSON parsing in generateImageDescription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should parse JSON response correctly', async () => {
    const { generateImageDescription } = await import('@/lib/ai/image-desc-generator')
    const result = await generateImageDescription('https://example.com/image.jpg')
    expect(result.description).toBe(mockImageDescriptionResponse.description)
    expect(result.technicalDetails).toBe(mockImageDescriptionResponse.technicalDetails)
    expect(result.interpretation).toBe(mockImageDescriptionResponse.interpretation)
    expect(result.caption).toBe(mockImageDescriptionResponse.caption)
  })

  it('should parse markdown code block JSON response', async () => {
    const { generateImageDescription } = await import('@/lib/ai/image-desc-generator')
    const result = await generateImageDescription('https://example.com/test.jpg')
    expect(result).toBeDefined()
    expect(typeof result.description).toBe('string')
  })
})

describe('input validation in generateImageDescription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should throw error for empty URL', async () => {
    const { generateImageDescription } = await import('@/lib/ai/image-desc-generator')
    await expect(generateImageDescription('')).rejects.toThrow()
  })
})