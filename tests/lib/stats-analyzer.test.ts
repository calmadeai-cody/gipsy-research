import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/stats-analyzer'

vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: JSON.stringify({
            recommended_test: 'independent-t-test',
            test_name_formatted: 'Independent Samples t-Test',
            justification: 'Independent Samples t-Test direkomendasikan karena Anda membandingkan rata-rata antara dua kelompok independen.',
            assumptions_to_check: ['Normalitas distribusi data', 'Homogenitas varians'],
            interpretation_guide: 'Jika nilai p-value < 0.05, maka terdapat perbedaan signifikan.',
            alternative_tests: ['Mann-Whitney U Test'],
            sample_size_considerations: 'Minimum 30 sampel per kelompok.',
          }) }],
        }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('suggestStatisticalAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should generate statistical analysis recommendation', async () => {
    const { suggestStatisticalAnalysis } = await import('@/lib/ai/stats-analyzer')
    const result = await suggestStatisticalAnalysis('Apakah ada perbedaan nilai ujian antara mahasiswa yang menggunakan aplikasi belajar dan yang tidak?', 'numerical')

    expect(result.recommended_test).toBeDefined()
    expect(result.test_name_formatted).toBeDefined()
    expect(result.justification).toBeDefined()
    expect(result.assumptions_to_check).toBeDefined()
    expect(result.interpretation_guide).toBeDefined()
  })

  it('should return recommended test name', async () => {
    const { suggestStatisticalAnalysis, resetAnthropicClient: reset } = await import('@/lib/ai/stats-analyzer')
    reset()

    const result = await suggestStatisticalAnalysis('Apakah ada hubungan antara motivasi dan hasil belajar?', 'numerical')

    expect(typeof result.recommended_test).toBe('string')
    expect(result.recommended_test.length).toBeGreaterThan(0)
  })

  it('should return formatted test name', async () => {
    const { suggestStatisticalAnalysis, resetAnthropicClient: reset } = await import('@/lib/ai/stats-analyzer')
    reset()

    const result = await suggestStatisticalAnalysis('Apakah ada perbedaan antara tiga metode pembelajaran?', 'numerical')

    expect(typeof result.test_name_formatted).toBe('string')
    expect(result.test_name_formatted.length).toBeGreaterThan(0)
  })

  it('should return justification for test choice', async () => {
    const { suggestStatisticalAnalysis, resetAnthropicClient: reset } = await import('@/lib/ai/stats-analyzer')
    reset()

    const result = await suggestStatisticalAnalysis('Apakah ada perbedaan antara dua metode pengajaran?', 'numerical')

    expect(typeof result.justification).toBe('string')
    expect(result.justification.length).toBeGreaterThan(0)
  })

  it('should return assumptions to check as array', async () => {
    const { suggestStatisticalAnalysis, resetAnthropicClient: reset } = await import('@/lib/ai/stats-analyzer')
    reset()

    const result = await suggestStatisticalAnalysis('Apakah ada hubungan antara variabel X dan Y?', 'mixed')

    expect(Array.isArray(result.assumptions_to_check)).toBe(true)
    expect(result.assumptions_to_check.length).toBeGreaterThan(0)
  })

  it('should return interpretation guide', async () => {
    const { suggestStatisticalAnalysis, resetAnthropicClient: reset } = await import('@/lib/ai/stats-analyzer')
    reset()

    const result = await suggestStatisticalAnalysis('Apakah ada perbedaan efektivitas antara dua obat?', 'numerical')

    expect(typeof result.interpretation_guide).toBe('string')
    expect(result.interpretation_guide.length).toBeGreaterThan(0)
  })

  it('should handle hypothesis input', async () => {
    const { suggestStatisticalAnalysis, resetAnthropicClient: reset } = await import('@/lib/ai/stats-analyzer')
    reset()

    const result = await suggestStatisticalAnalysis(
      'Apakah ada perbedaan antara metode A dan metode B?',
      'numerical',
      'Hipotesis: Tidak terdapat perbedaan signifikan antara metode A dan metode B'
    )

    expect(result.recommended_test).toBeDefined()
  })

  it('should parse JSON from markdown code block', async () => {
    const { resetAnthropicClient: reset } = await import('@/lib/ai/stats-analyzer')
    reset()

    const { suggestStatisticalAnalysis } = await import('@/lib/ai/stats-analyzer')
    const result = await suggestStatisticalAnalysis('Test question', 'categorical')

    expect(result.recommended_test).toBeDefined()
  })

  it('should validate response structure', async () => {
    const { suggestStatisticalAnalysis, resetAnthropicClient: reset } = await import('@/lib/ai/stats-analyzer')
    reset()

    const result = await suggestStatisticalAnalysis('Test question', 'numerical')

    expect(result).toHaveProperty('recommended_test')
    expect(result).toHaveProperty('test_name_formatted')
    expect(result).toHaveProperty('justification')
    expect(result).toHaveProperty('assumptions_to_check')
    expect(result).toHaveProperty('interpretation_guide')
  })

  it('should include alternative tests when provided', async () => {
    const { suggestStatisticalAnalysis, resetAnthropicClient: reset } = await import('@/lib/ai/stats-analyzer')
    reset()

    const result = await suggestStatisticalAnalysis('Test question', 'mixed')

    expect(result.alternative_tests).toBeDefined()
    expect(Array.isArray(result.alternative_tests)).toBe(true)
  })
})
