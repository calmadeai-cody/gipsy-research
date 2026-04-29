import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai'

// Mock responses for different functions
const titleResponse = '["Pengaruh Machine Learning terhadap Akurasi Prediksi Cuaca", "Analisis Sentimen dengan NLP di Indonesia"]'
const paraphraseResponse = 'Ini adalah teks yang telah diparafrase ulang dengan struktur kalimat yang berbeda namun memiliki makna yang sama.'

// Use a factory function for proper constructor mocking
vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async ({ messages }: { messages: Array<{ content: string }> }) => {
        const userMessage = messages[0]?.content || ''
        
        // Return different responses based on prompt content
        if (userMessage.includes('judul penelitian')) {
          return {
            content: [{ type: 'text', text: titleResponse }],
          }
        } else if (userMessage.includes('Parafrase')) {
          return {
            content: [{ type: 'text', text: paraphraseResponse }],
          }
        } else if (userMessage.includes('daftar pustaka') || userMessage.includes('bibliografi')) {
          return {
            content: [{ type: 'text', text: '["Nama, A. (2024). Judul Artikel. Jurnal, 1(1), 1-10."]' }],
          }
        }
        return { content: [{ type: 'text', text: '[]' }] }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('generateResearchTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return array of strings', async () => {
    const { generateResearchTitle } = await import('@/lib/ai')
    const result = await generateResearchTitle('machine learning', 5)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('should contain machine learning keyword', async () => {
    const { generateResearchTitle } = await import('@/lib/ai')
    const result = await generateResearchTitle('machine learning', 5)
    const firstTitle = result[0]
    expect(firstTitle.toLowerCase()).toContain('machine')
  })

  it('should use default count of 5 when not specified', async () => {
    const { generateResearchTitle } = await import('@/lib/ai')
    const result = await generateResearchTitle('deep learning')
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('should return array with string items', async () => {
    const { generateResearchTitle } = await import('@/lib/ai')
    const result = await generateResearchTitle('nlp', 3)
    result.forEach((title) => {
      expect(typeof title).toBe('string')
      expect(title.length).toBeGreaterThan(5)
    })
  })
})

describe('paraphraseParagraph', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return a string', async () => {
    const { paraphraseParagraph } = await import('@/lib/ai')
    const result = await paraphraseParagraph('Ini adalah teks asli yang perlu diparafrase.')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should return paraphrased text', async () => {
    const { paraphraseParagraph } = await import('@/lib/ai')
    const result = await paraphraseParagraph('Ini adalah teks asli.')
    // Result is from mock, should contain Indonesian text
    expect(result).toContain('parafrase')
  })
})

describe('generateBibliography', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return array of bibliography entries', async () => {
    const { generateBibliography } = await import('@/lib/ai')
    const result = await generateBibliography('Article content here', 'APA')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('should return valid APA format entries', async () => {
    const { generateBibliography } = await import('@/lib/ai')
    const result = await generateBibliography('Content', 'APA')
    const entry = result[0]
    expect(entry).toContain('(')
    expect(entry).toContain(')')
  })
})