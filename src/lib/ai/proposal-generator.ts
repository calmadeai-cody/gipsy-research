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

export interface ProposalResult {
  background: string
  objectives: string[]
  methodology: string
  expected_outcomes: string[]
  timeline: string
  references: string[]
}

export async function generateProposal(
  researchTitle: string,
  researchProblem: string
): Promise<ProposalResult> {
  if (!researchTitle?.trim()) {
    throw new Error('Research title is required')
  }

  if (!researchProblem?.trim()) {
    throw new Error('Research problem is required')
  }

  const client = getAnthropicClient()

  const prompt = `Buatkan proposal penelitian yang komprehensif untuk topik berikut:

Judul Penelitian: "${researchTitle}"
Masalah Penelitian: "${researchProblem}"

Output dalam format JSON dengan struktur:
{
  "background": "Latar belakang penelitian dalam 2-3 paragraf yang menjelaskan konteks, alasan penting penelitian, dan gap yang ada",
  "objectives": ["Tujuan penelitian 1", "Tujuan penelitian 2", "Tujuan penelitian 3", "Tujuan penelitian 4", "Tujuan penelitian 5"],
  "methodology": "Metodologi penelitian yang direkomendasikan termasuk pendekatan, teknik pengumpulan data, dan analisis data",
  "expected_outcomes": ["Hasil yang diharapkan 1", "Hasil yang diharapkan 2", "Hasil yang diharapkan 3", "Hasil yang diharapkan 4"],
  "timeline": "Timeline penelitian dalam fase-fase (misalnya: Persiapan 1 bulan, Pengumpulan data 3 bulan, Analisis 2 bulan, Penulisan 2 bulan)",
  "references": ["Referensi 1 (Format APA)", "Referensi 2 (Format APA)", "Referensi 3 (Format APA)", "Referensi 4 (Format APA)", "Referensi 5 (Format APA)"]
}

Hanya output JSON valid, tanpa penjelasan tambahan.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ProposalResult
      // Validate required fields
      if (!parsed.background || !parsed.objectives || !parsed.methodology ||
          !parsed.expected_outcomes || !parsed.timeline || !parsed.references) {
        throw new Error('Invalid proposal response structure')
      }
      return parsed
    }

    throw new Error('Failed to parse proposal response')
  } catch (error) {
    console.error('Proposal generation error:', error)
    throw error instanceof Error ? error : new Error('Failed to generate research proposal')
  }
}

export function resetAnthropicClient(): void {
  _anthropic = null
}