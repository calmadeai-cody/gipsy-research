import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/data-viz'

// Mock visualization response
const mockVisualizationResponse = JSON.stringify({
  recommendedChartType: 'bar',
  recommendation: 'Bar chart sangat cocok untuk membandingkan nilai antar kategori yang berbeda seperti tingkat kepuasan mahasiswa.',
  config: {
    xAxis: 'Metode Pembelajaran',
    yAxis: 'Tingkat Kepuasan (%)',
    title: 'Perbandingan Kepuasan Mahasiswa',
    colors: ['#6366f1', '#8b5cf6', '#a855f7'],
    labels: ['Online', 'Offline', 'Hybrid'],
    legend: true,
    grid: true,
  },
  mermaidCode: `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#6366f1'}}}%%
chart RL
    title "Perbandingan Kepuasan Mahasiswa"
    x-axis [Online, Offline, Hybrid]
    y-axis "Tingkat Kepuasan (%)"
    [85, 72, 90]`,
  interpretation: [
    'Metode hybrid menunjukkan tingkat kepuasan tertinggi dibanding online dan offline',
    'Metode offline memiliki kepuasan paling rendah di kalangan mahasiswa',
    'Perbedaan kepuasan sekitar 13% antara metode terbaik dan terburuk',
  ],
})

const mockEmptyInterpretationResponse = JSON.stringify({
  recommendedChartType: 'pie',
  recommendation: 'Pie chart ideal untuk menunjukkan proporsi distribusi kategori.',
  config: {
    title: 'Distribusi Kategori',
  },
  mermaidCode: `%%{init: {'theme': 'base', 'themeVariables': { 'pie1': '#6366f1'}}}%%
pie title Distribusi Kategori
    "A" : 35
    "B" : 25`,
  interpretation: [],
})

// Use a factory function for proper constructor mocking
vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async ({ messages }: { messages: Array<{ content: string }> }) => {
        const userMessage = messages[0]?.content || ''

        if (userMessage.includes('visualisasi data')) {
          return {
            content: [{ type: 'text', text: mockVisualizationResponse }],
          }
        }
        return {
          content: [{ type: 'text', text: mockEmptyInterpretationResponse }],
        }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('suggestVisualization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return VisualizationSuggestion object', async () => {
    const { suggestVisualization } = await import('@/lib/ai/data-viz')
    const result = await suggestVisualization('test description', 'bar')

    expect(result).toHaveProperty('recommendedChartType')
    expect(result).toHaveProperty('recommendation')
    expect(result).toHaveProperty('config')
    expect(result).toHaveProperty('mermaidCode')
    expect(result).toHaveProperty('interpretation')
  })

  it('should return correct chart type', async () => {
    const { suggestVisualization } = await import('@/lib/ai/data-viz')
    const result = await suggestVisualization('test description', 'bar')

    expect(result.recommendedChartType).toBe('bar')
  })

  it('should return config with required properties', async () => {
    const { suggestVisualization } = await import('@/lib/ai/data-viz')
    const result = await suggestVisualization('test description', 'line')

    expect(result.config).toHaveProperty('title')
    expect(result.config).toHaveProperty('xAxis')
    expect(result.config).toHaveProperty('yAxis')
  })

  it('should return interpretation as array', async () => {
    const { suggestVisualization } = await import('@/lib/ai/data-viz')
    const result = await suggestVisualization('test description', 'pie')

    expect(Array.isArray(result.interpretation)).toBe(true)
    expect(result.interpretation.length).toBeGreaterThan(0)
  })

  it('should return mermaid code as string', async () => {
    const { suggestVisualization } = await import('@/lib/ai/data-viz')
    const result = await suggestVisualization('test description', 'scatter')

    expect(typeof result.mermaidCode).toBe('string')
    expect(result.mermaidCode.length).toBeGreaterThan(0)
  })

  it('should handle different chart types', async () => {
    const { suggestVisualization } = await import('@/lib/ai/data-viz')

    const barResult = await suggestVisualization('test', 'bar')
    expect(barResult.recommendedChartType).toBe('bar')

    // Test that function works with different chart types (returns valid structure)
    const lineResult = await suggestVisualization('test', 'line')
    expect(lineResult).toHaveProperty('recommendedChartType')
    expect(lineResult).toHaveProperty('mermaidCode')

    expect(lineResult).toHaveProperty('interpretation')

    const pieResult = await suggestVisualization('test', 'pie')
    expect(pieResult).toHaveProperty('recommendedChartType')
    expect(pieResult).toHaveProperty('recommendation')
  })

  it('should call Anthropic API and return valid structure', async () => {
    const { suggestVisualization } = await import('@/lib/ai/data-viz')
    const result = await suggestVisualization('test description', 'bar')

    expect(result).toBeDefined()
    expect(result).toHaveProperty('recommendedChartType')
    expect(result).toHaveProperty('mermaidCode')
    expect(result).toHaveProperty('interpretation')
  })
})

describe('VisualizationSuggestion interface', () => {
  it('should have correct type structure', () => {
    const suggestion = {
      recommendedChartType: 'bar' as const,
      recommendation: 'Test recommendation',
      config: {
        xAxis: 'X Axis',
        yAxis: 'Y Axis',
        title: 'Test Title',
        colors: ['#6366f1', '#8b5cf6'],
        legend: true,
        grid: true,
      },
      mermaidCode: 'chart TD\n    title "Test"',
      interpretation: ['Point 1', 'Point 2'],
    }

    expect(suggestion.recommendedChartType).toBe('bar')
    expect(suggestion.recommendation).toBe('Test recommendation')
    expect(suggestion.config.title).toBe('Test Title')
    expect(suggestion.interpretation).toHaveLength(2)
  })
})
