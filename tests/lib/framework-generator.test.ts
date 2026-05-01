import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockResponse = JSON.stringify({
  framework_description: 'Kerangka konseptual ini memodelkan hubungan kausal antara literasi digital dan kinerja akademik dengan motivasi belajar sebagai variabel mediasi.',
  variables_identified: [
    { name: 'Literasi Digital', type: 'independent', hypothesis: 'Literasi digital memiliki pengaruh positif dan signifikan terhadap kinerja akademik mahasiswa' },
    { name: 'Motivasi Belajar', type: 'mediating', hypothesis: 'Motivasi belajar memediasi pengaruh literasi digital terhadap kinerja akademik' },
    { name: 'Kinerja Akademik', type: 'dependent', hypothesis: 'Kinerja akademik dipengaruhi oleh literasi digital baik secara langsung maupun tidak langsung melalui motivasi belajar' },
    { name: 'Dukungan Sosial', type: 'moderating', hypothesis: 'Dukungan sosial memperkuat hubungan antara literasi digital dan motivasi belajar' }
  ],
  relationships: [
    'Literasi Digital (X1) → Motivasi Belajar (Mediator)',
    'Motivasi Belajar (Mediator) → Kinerja Akademik (Y)',
    'Literasi Digital (X1) → Kinerja Akademik (Y)',
    'Dukungan Sosial (Z) memoderasi hubungan X1 → Motivasi Belajar'
  ],
  diagram_mermaid: `flowchart TD
    X1[Literasi Digital] -->|H1| M[Motivasi Belajar]
    M -->|H2| Y[Kinerja Akademik]
    X1 -->|H3| Y
    Z[Dukungan Sosial] -.->|H4| M
    style X1 fill:#3b82f6,color:#fff
    style Y fill:#10b981,color:#fff
    style M fill:#8b5cf6,color:#fff
    style Z fill:#f59e0b,color:#fff`
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

describe('generateFramework', () => {
  let resetAnthropicClient: () => void

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('@/lib/ai/framework-generator')
    resetAnthropicClient = module.resetAnthropicClient
  })

  afterEach(() => {
    resetAnthropicClient?.()
  })

  it('should return framework_description, variables_identified, relationships, and diagram_mermaid', async () => {
    const { generateFramework } = await import('@/lib/ai/framework-generator')
    const result = await generateFramework('Pengaruh Literasi Digital terhadap Kinerja Akademik', 'Literasi Digital, Motivasi Belajar, Kinerja Akademik', 'Kuantitatif')

    expect(result).toHaveProperty('framework_description')
    expect(result).toHaveProperty('variables_identified')
    expect(result).toHaveProperty('relationships')
    expect(result).toHaveProperty('diagram_mermaid')
  })

  it('should parse variables_identified with correct structure', async () => {
    const { generateFramework } = await import('@/lib/ai/framework-generator')
    const result = await generateFramework('Test Title', 'Test Variables', 'Test Methodology')

    expect(result.variables_identified.length).toBeGreaterThan(0)
    expect(result.variables_identified[0]).toHaveProperty('name')
    expect(result.variables_identified[0]).toHaveProperty('type')
    expect(result.variables_identified[0]).toHaveProperty('hypothesis')
    expect(['independent', 'dependent', 'moderating', 'mediating']).toContain(result.variables_identified[0].type)
  })

  it('should parse relationships as string array', async () => {
    const { generateFramework } = await import('@/lib/ai/framework-generator')
    const result = await generateFramework('Test Title', 'Test Variables', 'Test Methodology')

    expect(Array.isArray(result.relationships)).toBe(true)
    expect(result.relationships.length).toBeGreaterThan(0)
    expect(typeof result.relationships[0]).toBe('string')
  })

  it('should parse diagram_mermaid as string', async () => {
    const { generateFramework } = await import('@/lib/ai/framework-generator')
    const result = await generateFramework('Test Title', 'Test Variables', 'Test Methodology')

    expect(typeof result.diagram_mermaid).toBe('string')
    expect(result.diagram_mermaid.length).toBeGreaterThan(0)
  })

  it('should throw error when title is empty', async () => {
    const { generateFramework } = await import('@/lib/ai/framework-generator')
    await expect(generateFramework('', 'Variables', 'Methodology')).rejects.toThrow('Title is required')
  })

  it('should throw error when title is whitespace only', async () => {
    const { generateFramework } = await import('@/lib/ai/framework-generator')
    await expect(generateFramework('   ', 'Variables', 'Methodology')).rejects.toThrow('Title is required')
  })

  it('should handle all variable types correctly', async () => {
    const { generateFramework } = await import('@/lib/ai/framework-generator')
    const result = await generateFramework('Test Title', 'X1, X2, Y, Z', 'Survey')

    const validTypes = ['independent', 'dependent', 'moderating', 'mediating']
    result.variables_identified.forEach((variable) => {
      expect(validTypes).toContain(variable.type)
    })
  })
})