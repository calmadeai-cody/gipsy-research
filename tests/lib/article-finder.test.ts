import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/article-finder'

// Mock responses
const mockArticlesResponse = JSON.stringify([
  {
    title: "The Impact of Social Media on Mental Health in Adolescents",
    journal: "Google Scholar",
    description: "A comprehensive review of social media's effects on teenage mental health.",
    keywords: ["social media", "mental health", "adolescents", "psychology"]
  },
  {
    title: "Digital Technology and Youth Wellbeing: A Longitudinal Study",
    journal: "PubMed",
    description: "Examines the long-term effects of digital device usage on youth wellbeing.",
    keywords: ["digital technology", "youth", "wellbeing", "longitudinal"]
  },
  {
    title: "Social Media Usage Patterns Among University Students",
    journal: "DOAJ",
    description: "Analyzes social media consumption patterns and academic performance.",
    keywords: ["social media", "university students", "academic performance"]
  }
])

const mockManyArticlesResponse = JSON.stringify(
  Array.from({ length: 15 }, (_, i) => ({
    title: `Article ${i + 1}`,
    journal: "Test Journal",
    description: "Test description",
    keywords: ["test"]
  }))
)

// Use a factory function for proper constructor mocking (same pattern as abstract-generator.test.ts)
vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: mockArticlesResponse }],
        }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('findArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return an array of articles', async () => {
    const { findArticles } = await import('@/lib/ai/article-finder')
    const result = await findArticles('social media mental health')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('should return articles with correct structure', async () => {
    const { findArticles } = await import('@/lib/ai/article-finder')
    const result = await findArticles('social media mental health')
    
    if (result.length > 0) {
      const article = result[0]
      expect(article).toHaveProperty('title')
      expect(article).toHaveProperty('journal')
      expect(article).toHaveProperty('description')
      expect(article).toHaveProperty('keywords')
      expect(Array.isArray(article.keywords)).toBe(true)
    }
  })

  it('should handle empty topic gracefully', async () => {
    const { findArticles } = await import('@/lib/ai/article-finder')
    const result = await findArticles('')
    expect(Array.isArray(result)).toBe(true)
  })

  it('should handle topic with special characters', async () => {
    const { findArticles } = await import('@/lib/ai/article-finder')
    const result = await findArticles('social media & mental health (adolescents)')
    expect(Array.isArray(result)).toBe(true)
  })

  it('should call Anthropic API with valid response', async () => {
    const { findArticles } = await import('@/lib/ai/article-finder')
    const result = await findArticles('test topic')
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })

  it('should limit results to 10 articles', async () => {
    vi.doUnmock('@anthropic-ai/sdk')
    vi.mock('@anthropic-ai/sdk', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
        this.messages = {
          create: vi.fn().mockImplementation(async () => {
            return {
              content: [{ type: 'text', text: mockManyArticlesResponse }],
            }
          }),
        }
      }
      return { Anthropic: MockAnthropic }
    })
    
    resetAnthropicClient()
    const { findArticles, resetAnthropicClient: reset } = await import('@/lib/ai/article-finder')
    reset()
    const result = await findArticles('test')
    expect(result.length).toBeLessThanOrEqual(10)
  })
})

describe('ArticleSuggestion interface', () => {
  it('should have correct type structure', () => {
    const article = {
      title: "Test Title",
      journal: "Test Journal",
      description: "Test Description",
      keywords: ["keyword1", "keyword2"]
    }
    
    expect(article.title).toBe("Test Title")
    expect(article.journal).toBe("Test Journal")
    expect(article.description).toBe("Test Description")
    expect(article.keywords).toHaveLength(2)
    expect(article.keywords[0]).toBe("keyword1")
  })
})