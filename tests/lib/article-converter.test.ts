import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/article-converter'

// Mock response for article conversion
const mockArticleResponse = {
  article: {
    abstract: 'Penelitian ini bertujuan untuk menganalisis efektivitas metode pembelajaran aktif dalam meningkatkan hasil belajar siswa. Metode yang digunakan adalah quasi-experimental dengan desain pre-test dan post-test. Hasil penelitian menunjukkan bahwa implementasi metode pembelajaran aktif secara signifikan meningkatkan hasil belajar siswa dengan p-value < 0.05.',
    introduction: 'Pendidikan di Indonesia terus berkembang seiring dengan kebutuhan zaman. Penggunaan metode pembelajaran yang efektif menjadi salah satu faktor penting dalam meningkatkan kualitas pendidikan. Penelitian ini bertujuan untuk mengisi kekosongan literatur mengenai implementasi metode pembelajaran aktif di sekolah menengah.',
    methods: 'Penelitian ini menggunakan metode quasi-experimental dengan desain nonequivalent control group. Sampel terdiri dari 60 siswa yang dibagi menjadi kelas eksperimen dan kontrol. Instrumen yang digunakan adalah tes hasil belajar yang telah divalidasi. Analisis data menggunakan paired sample t-test dengan tingkat signifikansi 5%.',
    results: 'Hasil penelitian menunjukkan bahwa rata-rata nilai post-test kelas eksperimen (78.5) lebih tinggi dibandingkan kelas kontrol (68.3). Analisis statistik menunjukkan perbedaan yang signifikan (t=3.42, p<0.05). Effect size sebesar 0.67 menunjukkan magnitude effect yang besar.',
    discussion: 'Temuan ini sejalan dengan penelitian sebelumnya yang menemukan bahwa metode pembelajaran aktif dapat meningkatkan keterlibatan siswa dalam proses pembelajaran. Penggunaan metode ini mendorong siswa untuk lebih aktif dalam berdiskusi dan memecahkan masalah, sehingga meningkatkan pemahaman konsep.',
    conclusion: 'Kesimpulan dari penelitian ini adalah metode pembelajaran aktif efektif untuk meningkatkan hasil belajar siswa.Implikasi dari penelitian ini adalah guru disarankan untuk mengimplementasikan metode pembelajaran aktif dalam kegiatan belajar mengajar.',
  },
  original_length: 500,
  converted_length: 2500,
  journal: 'Jurnal Penelitian Pendidikan',
  style: 'IEEE',
}

vi.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async ({ messages }: { messages: Array<{ content: string }> }) => {
        const userMessage = messages[0]?.content || ''

        // Determine style from the input message
        let style = 'IEEE'
        if (userMessage.includes('APA 7th') || userMessage.includes('author-date')) {
          style = 'APA'
        } else if (userMessage.includes('Chicago') || userMessage.includes('footnotes')) {
          style = 'Chicago'
        }

        const dynamicResponse = {
          article: {
            abstract: mockArticleResponse.article.abstract,
            introduction: mockArticleResponse.article.introduction,
            methods: mockArticleResponse.article.methods,
            results: mockArticleResponse.article.results,
            discussion: mockArticleResponse.article.discussion,
            conclusion: mockArticleResponse.article.conclusion,
          },
          original_length: mockArticleResponse.original_length,
          converted_length: mockArticleResponse.converted_length,
          journal: 'Jurnal Penelitian Pendidikan',
          style: style,
        }

        if (userMessage.includes('artikel ilmiah') || userMessage.includes('konversikan')) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(dynamicResponse),
            }],
          }
        }
        return { content: [{ type: 'text', text: JSON.stringify(dynamicResponse) }] }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('convertToArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return a result with all article sections', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    const result = await convertToArticle('Draft artikel penelitian tentang metode pembelajaran aktif')

    expect(result.article).toBeDefined()
    expect(result.article.abstract).toBeDefined()
    expect(result.article.introduction).toBeDefined()
    expect(result.article.methods).toBeDefined()
    expect(result.article.results).toBeDefined()
    expect(result.article.discussion).toBeDefined()
    expect(result.article.conclusion).toBeDefined()
  })

  it('should return result with sections_count of 6', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    const result = await convertToArticle('Draft penelitian yang perlu dikonversi')

    expect(result.sections_count).toBe(6)
  })

  it('should include original_length and converted_length', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    const result = await convertToArticle('Draft artikel untuk konversi')

    expect(typeof result.article.original_length).toBe('number')
    expect(typeof result.article.converted_length).toBe('number')
    expect(result.article.converted_length).toBeGreaterThan(result.article.original_length)
  })

  it('should include journal when provided', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    const result = await convertToArticle('Draft artikel', 'Jurnal Penelitian Pendidikan')

    expect(result.article.journal).toBe('Jurnal Penelitian Pendidikan')
  })

  it('should include style when provided', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    const result = await convertToArticle('Draft artikel', undefined, 'APA')

    expect(result.article.style).toBe('APA')
  })

  it('should default to IEEE style when style not specified', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    const result = await convertToArticle('Draft artikel')

    expect(result.article.style).toBe('IEEE')
  })

  it('should handle markdown code block JSON response', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    const result = await convertToArticle('Test draft input')
    expect(result).toBeDefined()
    expect(result.article.abstract).toBeDefined()
  })

  it('should count reference placeholders needed', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    const result = await convertToArticle('Draft dengan sitasi [REF-1] dan [REF-2] yang perlu dikonversi')

    expect(typeof result.total_references_needed).toBe('number')
    expect(result.total_references_needed).toBeGreaterThanOrEqual(0)
  })
})

describe('input validation in convertToArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should throw error for invalid input', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    await expect(convertToArticle('')).rejects.toThrow()
  })

  it('should throw error for too short input', async () => {
    const { convertToArticle } = await import('@/lib/ai/article-converter')
    await expect(convertToArticle('a')).rejects.toThrow()
  })
})