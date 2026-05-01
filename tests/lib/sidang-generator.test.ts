import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/sidang-generator'

// Mock responses
const questionsResponse = JSON.stringify([
  'Bagaimana hubungan antara variable X dan Y dalam penelitian ini?',
  'Apakah sample yang digunakan sudah representatif untuk populasi target?',
  'Metode apa yang digunakan untuk validitas dan reliabilitas instrument?',
  'Bagaimana cara menghindari bias dalam pengumpulan data?',
  'Apa kontribusi penelitian ini terhadap perkembangan ilmu pengetahuan?',
])

// Use a factory function for proper constructor mocking
vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: questionsResponse }],
        }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('generateSidangQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return array of questions', async () => {
    const { generateSidangQuestions } = await import('@/lib/ai/sidang-generator')
    const result = await generateSidangQuestions(
      'Pengaruh Media Sosial terhadap Prestasi Belajar',
      'Kuantitatif dengan survei',
      'Terdapat korelasi positif signifikan'
    )
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle empty methodology', async () => {
    const { generateSidangQuestions } = await import('@/lib/ai/sidang-generator')
    const result = await generateSidangQuestions(
      'Judul Test',
      '',
      'Temuan utama'
    )
    expect(Array.isArray(result)).toBe(true)
  })

  it('should parse JSON response correctly', async () => {
    const { generateSidangQuestions } = await import('@/lib/ai/sidang-generator')
    const result = await generateSidangQuestions(
      'Test Title',
      'Test Methodology',
      'Test Findings'
    )
    // Verify the mock response parsing
    expect(result).toContain('Bagaimana hubungan antara variable X dan Y dalam penelitian ini?')
  })

  it('should reset Anthropic client', () => {
    // Test that resetAnthropicClient doesn't throw
    expect(() => resetAnthropicClient()).not.toThrow()
  })
})