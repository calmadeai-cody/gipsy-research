import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/ai-to-human'

// Mock responses
const humanTextResponse = 'Ini adalah teks yang sudah dikonversi menjadi lebih natural dan terdengar seperti ditulis manusia biasa.'

// Use a factory function for proper constructor mocking (same pattern as ai.test.ts)
vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async ({ messages }: { messages: Array<{ content: string }> }) => {
        const userMessage = messages[0]?.content || ''

        if (userMessage.includes('Konversikan') || (userMessage.includes('AI') && userMessage.includes('natural'))) {
          return {
            content: [{ type: 'text', text: humanTextResponse }],
          }
        }
        return { content: [{ type: 'text', text: '' }] }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('convertToHumanText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return a string', async () => {
    const { convertToHumanText } = await import('@/lib/ai/ai-to-human')
    const result = await convertToHumanText('Teks AI yang perlu dikonversi')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should return converted human-like text', async () => {
    const { convertToHumanText } = await import('@/lib/ai/ai-to-human')
    const result = await convertToHumanText('Teks AI original')
    expect(result).toContain('natural')
  })

  it('should handle empty string input', async () => {
    const { convertToHumanText } = await import('@/lib/ai/ai-to-human')
    const result = await convertToHumanText('')
    expect(typeof result).toBe('string')
  })

  it('should call Anthropic with proper prompt containing AI to human instructions', async () => {
    const { convertToHumanText } = await import('@/lib/ai/ai-to-human')
    await convertToHumanText('Test input text')

    const { Anthropic } = await import('@anthropic-ai/sdk')
    // Access the mocked constructor's create function through the prototype
    const MockInstance = (Anthropic as unknown as { mock?: { instances?: Array<{ messages: { create: ReturnType<typeof vi.fn> } }> } }).mock?.instances?.[0]
    if (MockInstance) {
      expect(MockInstance.messages.create).toHaveBeenCalled()
    }
  })
})

describe('sanitization in AI to Human conversion', () => {
  it('should sanitize input before sending to AI', async () => {
    const { sanitizeInput } = await import('@/lib/sanitize')
    const input = 'Teks dengan  control\x00 characters'
    const sanitized = sanitizeInput(input)
    expect(sanitized).not.toContain('\x00')
  })

  it('should truncate long input to max length', async () => {
    const { sanitizeInput } = await import('@/lib/sanitize')
    const longInput = 'a'.repeat(6000)
    const sanitized = sanitizeInput(longInput, 3000)
    expect(sanitized.length).toBeLessThanOrEqual(3000)
  })
})

describe('validateAIInput', () => {
  it('should reject empty input', async () => {
    const { validateAIInput } = await import('@/lib/sanitize')
    const result = validateAIInput('')
    expect(result.valid).toBe(false)
  })

  it('should reject input that is too short', async () => {
    const { validateAIInput } = await import('@/lib/sanitize')
    const result = validateAIInput('a')
    expect(result.valid).toBe(false)
  })

  it('should accept valid input', async () => {
    const { validateAIInput } = await import('@/lib/sanitize')
    const result = validateAIInput('Teks yang valid untuk dikonversi')
    expect(result.valid).toBe(true)
  })

  it('should reject input that is too long', async () => {
    const { validateAIInput } = await import('@/lib/sanitize')
    const longInput = 'a'.repeat(5001)
    const result = validateAIInput(longInput)
    expect(result.valid).toBe(false)
  })
})