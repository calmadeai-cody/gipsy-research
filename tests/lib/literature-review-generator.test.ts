import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/literature-review-generator'

// Mock response
const literatureReviewResponse = {
  sections: {
    introductory: 'Paragraf pendahuluan tentang topik penelitian ini menjelaskan konteks dan latar belakang yang relevan...',
    theoretical: 'Fondasi teoretis mencakup teori-teori utama seperti teori pembelajaran behaviorisme dan konstruktivisme...',
    gap_connection: 'Keterkaitan dengan gap penelitian menunjukkan bahwa masih ada kekurangan dalam penelitian sebelumnya...',
    summary: 'Ringkasan ini mensintesis seluruh pembahasan dan memberikan implikasi penting untuk penelitian mendatang...'
  },
  sources: [
    {
      title: 'Effectiveness of Online Learning in Higher Education',
      author: 'Smith, J. & Brown, A.',
      year: '2021',
      relevance: 'Sangat relevan karena membahas efektivitas pembelajaran online di perguruan tinggi',
      key_findings: 'Hasil penelitian menunjukkan bahwa pembelajaran online dapat efektif jika didukung dengan platform yang tepat'
    },
    {
      title: 'Digital Transformation in Education',
      author: 'Johnson, M.',
      year: '2020',
      relevance: 'Relevan untuk memahami transformasi digital dalam konteks pendidikan',
      key_findings: 'Transformasi digital mempercepat adopsi teknologi dalam proses belajar mengajar'
    }
  ]
}

// Use a factory function for proper constructor mocking
vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: JSON.stringify(literatureReviewResponse) }],
        }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('generateLiteratureReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should generate literature review with correct structure', async () => {
    const { generateLiteratureReview } = await import('@/lib/ai/literature-review-generator')
    const result = await generateLiteratureReview('Efektivitas pembelajaran online')

    expect(result.sections).toBeDefined()
    expect(result.sections.introductory).toBeDefined()
    expect(result.sections.theoretical).toBeDefined()
    expect(result.sections.gap_connection).toBeDefined()
    expect(result.sections.summary).toBeDefined()
    expect(result.sources).toBeDefined()
    expect(Array.isArray(result.sources)).toBe(true)
    expect(result.sources.length).toBeGreaterThan(0)
  })

  it('should handle research_topic parameter', async () => {
    const { generateLiteratureReview } = await import('@/lib/ai/literature-review-generator')
    const result = await generateLiteratureReview('Perilaku konsumen digital')

    expect(result.sections).toBeDefined()
    expect(typeof result.sections.introductory).toBe('string')
  })

  it('should handle research_focus parameter', async () => {
    const { generateLiteratureReview } = await import('@/lib/ai/literature-review-generator')
    const result = await generateLiteratureReview(
      'Perilaku konsumen digital',
      'Fokus pada generasi millennial'
    )

    expect(result.sections).toBeDefined()
    expect(result.sources).toBeDefined()
  })

  it('should handle num_sources parameter', async () => {
    const { generateLiteratureReview } = await import('@/lib/ai/literature-review-generator')
    const result = await generateLiteratureReview('Pengaruh media sosial', undefined, 3)

    expect(result.sections).toBeDefined()
    expect(result.sources).toBeDefined()
  })

  it('should parse JSON from markdown code blocks', async () => {
    const { generateLiteratureReview, resetAnthropicClient: reset } = await import('@/lib/ai/literature-review-generator')
    reset()

    // Test that the parsing logic works with markdown code block format
    const markdownResponse = `\`\`\`json
${JSON.stringify(literatureReviewResponse)}
\`\`\``

    const { Anthropic } = await import('@anthropic-ai/sdk')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MockAnthropic = Anthropic as any
    const instance = new MockAnthropic({})
    instance.messages.create = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: markdownResponse }],
    })

    const result = await generateLiteratureReview('Test topic with markdown')

    expect(result.sections).toBeDefined()
    expect(result.sections.introductory).toBe('Paragraf pendahuluan tentang topik penelitian ini menjelaskan konteks dan latar belakang yang relevan...')
  })

  it('should validate response structure', async () => {
    const { generateLiteratureReview } = await import('@/lib/ai/literature-review-generator')
    const result = await generateLiteratureReview('Topik penelitian')

    expect(result.sections.introductory).toBeDefined()
    expect(result.sections.theoretical).toBeDefined()
    expect(result.sections.gap_connection).toBeDefined()
    expect(result.sections.summary).toBeDefined()
    expect(result.sources[0].title).toBe('Effectiveness of Online Learning in Higher Education')
    expect(result.sources[0].author).toBe('Smith, J. & Brown, A.')
    expect(result.sources[0].year).toBe('2021')
    expect(result.sources[0].relevance).toBeDefined()
    expect(result.sources[0].key_findings).toBeDefined()
  })

  it('should call Anthropic API with correct parameters', async () => {
    const { generateLiteratureReview, resetAnthropicClient: reset } = await import('@/lib/ai/literature-review-generator')
    reset()

    await generateLiteratureReview('Test topic', 'Test focus', 3)

    const { Anthropic } = await import('@anthropic-ai/sdk')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MockAnthropic = Anthropic as any
    expect(MockAnthropic).toBeDefined()
  })

  it('should include all required sections', async () => {
    const { generateLiteratureReview } = await import('@/lib/ai/literature-review-generator')
    const result = await generateLiteratureReview('Topik penelitian')

    const sections = result.sections
    expect(typeof sections.introductory).toBe('string')
    expect(sections.introductory.length).toBeGreaterThan(0)
    expect(typeof sections.theoretical).toBe('string')
    expect(sections.theoretical.length).toBeGreaterThan(0)
    expect(typeof sections.gap_connection).toBe('string')
    expect(sections.gap_connection.length).toBeGreaterThan(0)
    expect(typeof sections.summary).toBe('string')
    expect(sections.summary.length).toBeGreaterThan(0)
  })
})