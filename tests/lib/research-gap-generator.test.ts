import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockResponse = JSON.stringify({
  research_gaps: [
    { title: 'Keterbatasan metodologis dalam penelitian sebelumnya', explanation: 'Mayoritas studi hanya menggunakan pendekatan kuantitatif tanpa triangulasi data.' },
    { title: 'Gap populasi sampel', explanation: 'Penelitian terdahulu fokus pada mahasiswa perkotaan,忽略了 daerah rural.' },
    { title: 'Konteks sosio-kultural terbatas', explanation: 'Kurang eksplorasi dimensi budaya dan konteks lokal Indonesia.' }
  ],
  novelty_points: [
    { title: 'Pendekatan mixed-method yang inovatif', explanation: 'Kombinasi kualitatif dan kuantitatif untuk pemahaman holistik.' },
    { title: 'Populasi yang belum pernah diteliti', explanation: 'Fokus pada mahasiswa semester awal dari berbagai daerah.' },
    { title: 'Kerangka konseptual integratif', explanation: 'Menggabungkan teori multiple Disciplines untuk analisis yang lebih kaya.' }
  ],
  suggested_directions: [
    'Mengembangkan desain mixed-method dengan validitas tinggi',
    'Melakukan studi komparatif antar daerah di Indonesia',
    'Membuat kerangka teoritis yang mengintegrasikan aspek sosio-kultural'
  ]
})

vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: mockResponse }],
        }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('generateResearchGaps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return research_gaps, novelty_points, and suggested_directions', async () => {
    const { generateResearchGaps } = await import('@/lib/ai/research-gap-generator')
    const result = await generateResearchGaps('Pengaruh media sosial terhadap prestasi akademik')

    expect(result).toHaveProperty('research_gaps')
    expect(result).toHaveProperty('novelty_points')
    expect(result).toHaveProperty('suggested_directions')
    expect(Array.isArray(result.research_gaps)).toBe(true)
    expect(Array.isArray(result.novelty_points)).toBe(true)
    expect(Array.isArray(result.suggested_directions)).toBe(true)
  })

  it('should parse research_gaps with title and explanation', async () => {
    const { generateResearchGaps } = await import('@/lib/ai/research-gap-generator')
    const result = await generateResearchGaps('Test topic')

    expect(result.research_gaps.length).toBeGreaterThan(0)
    expect(result.research_gaps[0]).toHaveProperty('title')
    expect(result.research_gaps[0]).toHaveProperty('explanation')
  })

  it('should parse novelty_points with title and explanation', async () => {
    const { generateResearchGaps } = await import('@/lib/ai/research-gap-generator')
    const result = await generateResearchGaps('Test topic')

    expect(result.novelty_points.length).toBeGreaterThan(0)
    expect(result.novelty_points[0]).toHaveProperty('title')
    expect(result.novelty_points[0]).toHaveProperty('explanation')
  })

  it('should parse suggested_directions as string array', async () => {
    const { generateResearchGaps } = await import('@/lib/ai/research-gap-generator')
    const result = await generateResearchGaps('Test topic')

    expect(result.suggested_directions.length).toBeGreaterThan(0)
    expect(typeof result.suggested_directions[0]).toBe('string')
  })

  it('should throw error when topic is empty', async () => {
    const { generateResearchGaps } = await import('@/lib/ai/research-gap-generator')
    await expect(generateResearchGaps('')).rejects.toThrow('Topic is required')
  })

  it('should throw error when topic is whitespace only', async () => {
    const { generateResearchGaps } = await import('@/lib/ai/research-gap-generator')
    await expect(generateResearchGaps('   ')).rejects.toThrow('Topic is required')
  })

  it('should handle topic with timeline context', async () => {
    const { generateResearchGaps } = await import('@/lib/ai/research-gap-generator')
    const result = await generateResearchGaps(
      'Digital literacy mahasiswa',
      '2015-2020: penelitian fokus pada akses teknologi; 2021-2024: fokus pada penggunaan plataformas'
    )
    
    expect(result).toHaveProperty('research_gaps')
    expect(result).toHaveProperty('novelty_points')
    expect(result).toHaveProperty('suggested_directions')
  })
})