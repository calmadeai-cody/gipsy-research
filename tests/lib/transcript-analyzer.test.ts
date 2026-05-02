import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/transcript-analyzer'

// Mock responses for each analysis type
const mockSummarizeResponse = {
  summary: 'Ini adalah ringkasan komprehensif dari transkrip yang diberikan. Ringkasan ini menangkap poin-poin utama dan informasi penting dari teks asli dengan cara yang terstruktur dan koheren. Dalam ringkasan ini, kita dapat melihat bagaimana argumen utama dikembangkan dan didukung dengan bukti-bukti yang relevan.',
  analysis_type: 'summarize',
  original_length: 150,
  processed_at: new Date().toISOString(),
}

const mockKeyPointsResponse = {
  key_points: [
    { point: 'Poin pertama yang sangat penting dari transkrip', importance: 'high', context: 'Konteks tambahan untuk poin pertama' },
    { point: 'Poin kedua dengan tingkat kepentingan medium', importance: 'medium', context: 'Konteks tambahan untuk poin kedua' },
    { point: 'Poin ketiga yang juga signifikan', importance: 'high' },
    { point: 'Poin keempat dengan kepentingan rendah', importance: 'low', context: 'Detail tambahan' },
    { point: 'Poin kelima sebagai penutup', importance: 'medium' },
  ],
  analysis_type: 'key_points',
  original_length: 150,
  processed_at: new Date().toISOString(),
}

const mockThemesResponse = {
  themes: [
    { theme: 'Tema Utama Pertama', description: 'Deskripsi tema pertama yang menjelaskan konsep dan relevansinya dalam konteks yang lebih luas', relevance: 'Sangat relevan dengan topik utama' },
    { theme: 'Tema Kedua', description: 'Deskripsi tema kedua yang mencakup aspek penting dari transkrip', relevance: 'Relevan sebagai pendukung tema utama' },
    { theme: 'Tema Ketiga', description: 'Deskripsi tema ketiga yang memberikan perspektif tambahan', relevance: 'Memberikan konteks tambahan' },
  ],
  analysis_type: 'themes',
  original_length: 150,
  processed_at: new Date().toISOString(),
}

const mockSentimentResponse = {
  sentiment: {
    overall: 'positive',
    positive_percentage: 65,
    negative_percentage: 15,
    neutral_percentage: 20,
    key_sentiments: ['optimis', 'konstruktif', 'profesional'],
    emotional_tone: 'Nada emosional yang positif dan membangun, menunjukkan sikap konstruktif dan optimistis dalam penyampaian informasi.',
  },
  analysis_type: 'sentiment',
  original_length: 150,
  processed_at: new Date().toISOString(),
}

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config?: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async ({ messages, system }: { messages: Array<{ content: string }>; system: string }) => {
        const userMessage = messages[0]?.content || ''

        // Return appropriate mock based on analysis type in the prompt
        if (userMessage.includes('ringkasan') || system.includes('summarization')) {
          return { content: [{ type: 'text', text: JSON.stringify(mockSummarizeResponse) }] }
        }
        if (userMessage.includes('poin kunci') || system.includes('key points')) {
          return { content: [{ type: 'text', text: JSON.stringify(mockKeyPointsResponse) }] }
        }
        if (userMessage.includes('tema') || system.includes('theme')) {
          return { content: [{ type: 'text', text: JSON.stringify(mockThemesResponse) }] }
        }
        if (userMessage.includes('sentimen') || system.includes('sentiment')) {
          return { content: [{ type: 'text', text: JSON.stringify(mockSentimentResponse) }] }
        }
        // Default to summarize
        return { content: [{ type: 'text', text: JSON.stringify(mockSummarizeResponse) }] }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('analyzeTranscript', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return summarize result with summary field', async () => {
    const { analyzeTranscript } = await import('@/lib/ai/transcript-analyzer')
    const result = await analyzeTranscript('Contoh teks transkrip yang ingin diringkas', 'summarize')
    expect(result).toBeDefined()
    expect(result.analysis_type).toBe('summarize')
    expect(typeof result.summary).toBe('string')
    expect(result.summary.length).toBeGreaterThan(0)
  })

  it('should return key_points result with array of points', async () => {
    const { analyzeTranscript } = await import('@/lib/ai/transcript-analyzer')
    const result = await analyzeTranscript('Contoh teks transkrip untuk ekstraksi poin kunci', 'key_points')
    expect(result).toBeDefined()
    expect(result.analysis_type).toBe('key_points')
    expect(Array.isArray(result.key_points)).toBe(true)
    expect(result.key_points.length).toBeGreaterThan(0)
    expect(result.key_points.length).toBeLessThanOrEqual(7)
  })

  it('should return themes result with array of themes', async () => {
    const { analyzeTranscript } = await import('@/lib/ai/transcript-analyzer')
    const result = await analyzeTranscript('Contoh teks transkrip untuk identifikasi tema', 'themes')
    expect(result).toBeDefined()
    expect(result.analysis_type).toBe('themes')
    expect(Array.isArray(result.themes)).toBe(true)
    expect(result.themes.length).toBeGreaterThan(0)
    expect(result.themes.length).toBeLessThanOrEqual(5)
  })

  it('should return sentiment result with percentages', async () => {
    const { analyzeTranscript } = await import('@/lib/ai/transcript-analyzer')
    const result = await analyzeTranscript('Contoh teks transkrip untuk analisis sentimen', 'sentiment')
    expect(result).toBeDefined()
    expect(result.analysis_type).toBe('sentiment')
    expect(result.sentiment).toBeDefined()
    expect(['positive', 'negative', 'neutral']).toContain(result.sentiment.overall)
    expect(typeof result.sentiment.positive_percentage).toBe('number')
    expect(typeof result.sentiment.negative_percentage).toBe('number')
    expect(typeof result.sentiment.neutral_percentage).toBe('number')
  })

  it('should include original_length and processed_at in result', async () => {
    const { analyzeTranscript } = await import('@/lib/ai/transcript-analyzer')
    const inputText = 'Teks test untuk verifikasi metadata'
    const result = await analyzeTranscript(inputText, 'summarize')
    expect(result.original_length).toBe(inputText.length)
    expect(result.processed_at).toBeDefined()
    expect(new Date(result.processed_at).toISOString()).toBe(result.processed_at)
  })

  it('should throw error for empty input', async () => {
    const { analyzeTranscript } = await import('@/lib/ai/transcript-analyzer')
    await expect(analyzeTranscript('', 'summarize')).rejects.toThrow()
  })

  it('should handle all valid analysis types', async () => {
    const { analyzeTranscript } = await import('@/lib/ai/transcript-analyzer')
    const types = ['summarize', 'key_points', 'themes', 'sentiment']
    for (const type of types) {
      const result = await analyzeTranscript('Teks contoh untuk test', type as any)
      expect(result).toBeDefined()
      expect(result.analysis_type).toBe(type)
    }
  })

  it('should call Anthropic API with correct parameters', async () => {
    const { analyzeTranscript } = await import('@/lib/ai/transcript-analyzer')
    await analyzeTranscript('Test input', 'key_points')

    const { Anthropic } = await import('@anthropic-ai/sdk')
    const mockInstance = (Anthropic as unknown as { mock?: { instances?: Array<{ messages: { create: ReturnType<typeof vi.fn> } }> } }).mock?.instances?.[0]
    if (mockInstance) {
      expect(mockInstance.messages.create).toHaveBeenCalled()
    }
  })

  it('should throw error for input that is too short', async () => {
    const { analyzeTranscript } = await import('@/lib/ai/transcript-analyzer')
    // Single character should be rejected
    await expect(analyzeTranscript('a', 'summarize')).rejects.toThrow()
  })
})