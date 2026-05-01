import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockResponse = JSON.stringify({
  background: 'Penelitian ini dilatarbelakangi oleh semakin meningkatnya penggunaan teknologi digital di kalangan mahasiswa. Di era transformasi digital, literasi digital menjadi keterampilan yang esensial untuk mendukung proses pembelajaran dan kinerja akademik. Meskipun demikian, masih banyak ditemukan ketimpangan dalam kemampuan literasi digital mahasiswa yang dapat memengaruhi hasil belajar mereka.',
  objectives: [
    'Menganalisis tingkat literasi digital mahasiswa pada institusi penelitian',
    'Mengidentifikasi pengaruh literasi digital terhadap kinerja akademik mahasiswa',
    'Mengembangkan model intervensi untuk meningkatkan literasi digital mahasiswa',
    'Mengevaluasi efektivitas program peningkatan literasi digital',
    'Merumuskan rekomendasi kebijakan untuk peningkatan literasi digital mahasiswa',
  ],
  methodology: 'Penelitian ini menggunakan pendekatan kuantitatif dengan metode survei. Data dikumpulkan melalui kuesioner yang disebarkan kepada mahasiswa menggunakan teknik stratified random sampling. Analisis data menggunakan Structural Equation Modeling (SEM) dengan bantuan software AMOS untuk menguji hipotesis penelitian.',
  expected_outcomes: [
    'Terdapat gambaran komprehensif mengenai tingkat literasi digital mahasiswa',
    'Ditemukan hubungan signifikan antara literasi digital dan kinerja akademik',
    'Teridentifikasinya faktor-faktor yang memengaruhi literasi digital mahasiswa',
    'Tersusunnya model intervensi berbasis teknologi untuk peningkatan literasi digital',
    'Terbentuknya rekomendasi kebijakan untuk institusi pendidikan dalam meningkatkan literasi digital',
  ],
  timeline: 'Fase 1 (Persiapan): 1 bulan - Studi literatur dan penyusunan instrumen\nFase 2 (Pengumpulan Data): 3 bulan - Validitas instrumen dan pengumpulan data\nFase 3 (Analisis): 2 bulan - Pengolahan dan analisis data\nFase 4 (Penulisan): 2 bulan - Penyusunan laporan dan publikasi',
  references: [
    'Hargittai, E., & Hsieh, Y. P. (2023). Digital inequality. In The Oxford Handbook of Internet and Society.',
    'Van Dijk, J. (2020). The digital divide in internet use and online skills. Journal of Information Policy, 10(1), 45-63.',
    'Chen, W., & Wellman, B. (2022). The effects of internet use on educational outcomes. Computers & Education, 180, 104-119.',
    'Gui, M., & Argentin, G. (2021). Digital skills of internet users. New Media & Society, 23(9), 2716-2741.',
    'Kuppens, L., & Yzerbyt, V. (2022). Social influence and technology adoption. Journal of Applied Psychology, 107(5), 789-804.',
  ],
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

describe('generateProposal', () => {
  let resetAnthropicClient: () => void

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('@/lib/ai/proposal-generator')
    resetAnthropicClient = module.resetAnthropicClient
  })

  afterEach(() => {
    resetAnthropicClient?.()
  })

  it('should return all required proposal fields', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    const result = await generateProposal('Test Title', 'Test Problem')

    expect(result).toHaveProperty('background')
    expect(result).toHaveProperty('objectives')
    expect(result).toHaveProperty('methodology')
    expect(result).toHaveProperty('expected_outcomes')
    expect(result).toHaveProperty('timeline')
    expect(result).toHaveProperty('references')
  })

  it('should parse background as non-empty string', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    const result = await generateProposal('Test Title', 'Test Problem')

    expect(typeof result.background).toBe('string')
    expect(result.background.length).toBeGreaterThan(0)
  })

  it('should parse objectives as string array with 3-5 items', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    const result = await generateProposal('Test Title', 'Test Problem')

    expect(Array.isArray(result.objectives)).toBe(true)
    expect(result.objectives.length).toBeGreaterThanOrEqual(3)
    expect(result.objectives.length).toBeLessThanOrEqual(5)
    expect(typeof result.objectives[0]).toBe('string')
  })

  it('should parse methodology as non-empty string', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    const result = await generateProposal('Test Title', 'Test Problem')

    expect(typeof result.methodology).toBe('string')
    expect(result.methodology.length).toBeGreaterThan(0)
  })

  it('should parse expected_outcomes as string array with 3-5 items', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    const result = await generateProposal('Test Title', 'Test Problem')

    expect(Array.isArray(result.expected_outcomes)).toBe(true)
    expect(result.expected_outcomes.length).toBeGreaterThanOrEqual(3)
    expect(result.expected_outcomes.length).toBeLessThanOrEqual(5)
    expect(typeof result.expected_outcomes[0]).toBe('string')
  })

  it('should parse timeline as non-empty string', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    const result = await generateProposal('Test Title', 'Test Problem')

    expect(typeof result.timeline).toBe('string')
    expect(result.timeline.length).toBeGreaterThan(0)
  })

  it('should parse references as string array with 3-5 items', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    const result = await generateProposal('Test Title', 'Test Problem')

    expect(Array.isArray(result.references)).toBe(true)
    expect(result.references.length).toBeGreaterThanOrEqual(3)
    expect(result.references.length).toBeLessThanOrEqual(5)
    expect(typeof result.references[0]).toBe('string')
  })

  it('should throw error when research title is empty', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    await expect(generateProposal('', 'Some problem')).rejects.toThrow('Research title is required')
  })

  it('should throw error when research title is whitespace only', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    await expect(generateProposal('   ', 'Some problem')).rejects.toThrow('Research title is required')
  })

  it('should throw error when research problem is empty', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    await expect(generateProposal('Valid Title', '')).rejects.toThrow('Research problem is required')
  })

  it('should throw error when research problem is whitespace only', async () => {
    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    await expect(generateProposal('Valid Title', '   ')).rejects.toThrow('Research problem is required')
  })

  it('should throw error when response is missing required fields', async () => {
    vi.resetModules()
    vi.doMock('@anthropic-ai/sdk', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
        this.messages = {
          create: vi.fn().mockImplementation(async () => {
            return {
              content: [{ type: 'text', text: JSON.stringify({ background: 'only background' }) }],
            }
          }),
        }
      }
      return { Anthropic: MockAnthropic }
    })

    const { generateProposal } = await import('@/lib/ai/proposal-generator')
    await expect(generateProposal('Title', 'Problem')).rejects.toThrow('Invalid proposal response structure')
  })
})