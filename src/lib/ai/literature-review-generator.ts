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

export interface LiteratureReviewSource {
  title: string
  author: string
  year: string
  relevance: string
  key_findings: string
}

export interface LiteratureReviewSections {
  introductory: string
  theoretical: string
  gap_connection: string
  summary: string
}

export interface LiteratureReviewResult {
  sections: LiteratureReviewSections
  sources: LiteratureReviewSource[]
}

export async function generateLiteratureReview(
  researchTopic: string,
  researchFocus?: string,
  numSources: number = 5,
): Promise<LiteratureReviewResult> {
  const validated = validateAIInput(researchTopic)
  if (!validated.valid) {
    throw new Error(validated.reason || 'Invalid research topic')
  }

  const client = getAnthropicClient()

  const focusText = researchFocus ? `\nFokus Penelitian: ${researchFocus}` : ''

  const prompt = `Sebagai ahli tinjauan pustaka akademik, buatlah tinjauan pustaka untuk:

Topik Penelitian: ${researchTopic}${focusText}
Jumlah Sumber: ${numSources}

Tinjauan pustaka harus mencakup 4 bagian utama:
1. Paragraf Pendahuluan - Latar belakang dan konteks topik penelitian (150-250 kata dalam bahasa Indonesia)
2. Fondasi Teoretis - Landasan teori utama dan konsep-konsep kunci yang relevan (200-300 kata dalam bahasa Indonesia)
3. Keterkaitan dengan Gap Penelitian - Hubungan antara teori dengan gap/kosong dalam penelitian yang ada (150-250 kata dalam bahasa Indonesia)
4. Ringkasan - Sintesis keseluruhan dan implikasi untuk penelitian (100-150 kata dalam bahasa Indonesia)

Kemudian berikan ${numSources} sumber pustaka relevan dengan:
- Judul lengkap
- Penulis
- Tahun publikasi
- Relevance terhadap topik penelitian (1-2 kalimat)
- Temuan utama yang relevan (2-3 kalimat)

Format JSON:
{
  "sections": {
    "introductory": "...",
    "theoretical": "...",
    "gap_connection": "...",
    "summary": "..."
  },
  "sources": [
    {
      "title": "...",
      "author": "...",
      "year": "...",
      "relevance": "...",
      "key_findings": "..."
    }
  ]
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert academic literature review advisor for Indonesian academic research.
Always respond in Indonesian with structured JSON output.
Provide sources that are appropriate for Indonesian academic standards (journal nasional/seminar nasional minimum).
Ensure all text is in Bahasa Indonesia with proper academic tone.`,
    messages: [{ role: 'user', content: prompt }],
  })

  const response = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from response - handle markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response

  try {
    const parsed = JSON.parse(jsonStr.trim())
    // Validate structure
    if (!parsed.sections || !parsed.sources || !Array.isArray(parsed.sources)) {
      throw new Error('Invalid literature review response structure')
    }
    if (!parsed.sections.introductory || !parsed.sections.theoretical ||
        !parsed.sections.gap_connection || !parsed.sections.summary) {
      throw new Error('Missing required sections in literature review')
    }
    return parsed as LiteratureReviewResult
  } catch (e) {
    throw new Error(`Invalid literature review response: ${e instanceof Error ? e.message : 'Parse error'}`)
  }
}

// For testing - reset client
export function resetAnthropicClient() {
  _anthropic = null
}