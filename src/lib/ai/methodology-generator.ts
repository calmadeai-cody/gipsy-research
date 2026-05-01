import { Anthropic } from '@anthropic-ai/sdk'
import { validateAIInput } from '@/lib/sanitize'

let _anthropic: Anthropic | null = null

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return _anthropic
}

export interface MethodologyResult {
  methodologies: Array<{
    name: string
    suitability: string
    description: string
    key_characteristics: string[]
    data_collection: string[]
    examples: string[]
  }>
  recommendation: string
  considerations: string[]
}

export async function generateMethodology(
  researchType: string,
  researchTopic: string,
): Promise<MethodologyResult> {
  const validatedTopic = validateAIInput(researchTopic)

  const client = getAnthropicClient()
  
  const prompt = `Sebagai ahli metodologi penelitian, rekomendasikan metodologi penelitian yang tepat untuk:

Jenis Penelitian: ${researchType}
Topik/Fokus Penelitian: ${validatedTopic}

Berikan 3-4 opsi metodologi yang relevan dengan:
- Deskripsi metodologi (100-200 kata dalam bahasa Indonesia)
- Karakteristik utama (3-5 poin)
- Metode pengumpulan data (2-4 opsi)
- Contoh penelitian yang menggunakan metodologi ini
- Tingkat kesesuaian dengan jenis dan topik penelitian

Pilih 1-2 metodologi yang paling direkomendasikan dengan alasan spesifik.

format JSON:
{
  "methodologies": [...],
  "recommendation": "...",
  "considerations": [...]
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert research methodology advisor for Indonesian academic research.
Always respond in Indonesian with structured JSON output.
Provide methodologies that are appropriate for Indonesian academic standards (journal nasional/seminar nasional minimum).`,
    messages: [{ role: 'user', content: prompt }],
  })

  const response = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from response - handle markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response

  try {
    const parsed = JSON.parse(jsonStr.trim())
    // Validate structure
    if (!parsed.methodologies || !Array.isArray(parsed.methodologies) ||
        !parsed.recommendation || !parsed.considerations) {
      throw new Error('Invalid methodology response structure')
    }
    return parsed as MethodologyResult
  } catch (e) {
    throw new Error(`Invalid methodology response: ${e instanceof Error ? e.message : 'Parse error'}`)
  }
}

// For testing - reset client
export function resetAnthropicClient() {
  _anthropic = null
}