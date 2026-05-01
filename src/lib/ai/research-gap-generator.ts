import { Anthropic } from '@anthropic-ai/sdk'

let _anthropic: Anthropic | null = null

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return _anthropic
}

interface ResearchGapResult {
  research_gaps: Array<{ title: string; explanation: string }>;
  novelty_points: Array<{ title: string; explanation: string }>;
  suggested_directions: string[];
}

export async function generateResearchGaps(
  topic: string,
  timeline?: string
): Promise<ResearchGapResult> {
  if (!topic?.trim()) {
    throw new Error('Topic is required')
  }

  const client = getAnthropicClient()

  const prompt = `You are an academic research advisor. Analyze the following research topic and identify gaps and novelty points.

Research Topic: ${topic}
${timeline ? `Research Timeline/Context: ${timeline}` : ''}

Provide a JSON response with exactly this structure:
{
  "research_gaps": [
    {"title": "gap title", "explanation": "1-2 sentence explanation of this gap"}
  ],
  "novelty_points": [
    {"title": "novelty title", "explanation": "1-2 sentence explanation of why this is novel"}
  ],
  "suggested_directions": ["direction 1", "direction 2", "direction 3"]
}

Rules:
- research_gaps: 3-5 items identifying underexplored areas, methodological gaps, population gaps, contextual gaps
- novelty_points: 3-5 items showing potential original contributions
- suggested_directions: 2-3 actionable research directions
- Output in Indonesian language (gap titles can be bilingual)
- Be specific and academic, avoid generic statements`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        research_gaps: parsed.research_gaps || [],
        novelty_points: parsed.novelty_points || [],
        suggested_directions: parsed.suggested_directions || [],
      }
    }

    throw new Error('Failed to parse research gap response')
  } catch (error) {
    console.error('Research gap generation error:', error)
    throw new Error('Failed to generate research gaps')
  }
}

export function resetAnthropicClient(): void {
  _anthropic = null
}