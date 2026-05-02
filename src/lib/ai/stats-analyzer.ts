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

export type DataType = 'categorical' | 'numerical' | 'mixed'

export interface StatisticalRecommendation {
  recommended_test: string
  test_name_formatted: string
  justification: string
  assumptions_to_check: string[]
  interpretation_guide: string
  alternative_tests: string[]
  sample_size_considerations: string
}

export async function suggestStatisticalAnalysis(
  question: string,
  dataType: DataType,
  hypothesis?: string
): Promise<StatisticalRecommendation> {
  const validatedQuestion = validateAIInput(question)
  const validatedHypothesis = hypothesis ? validateAIInput(hypothesis) : undefined

  const client = getAnthropicClient()

  const prompt = `Sebagai ahli statistik penelitian, rekomendasikan analisis statistik yang tepat untuk:

Pertanyaan Penelitian: ${validatedQuestion}
Jenis Data: ${dataType}
Hipotesis (jika ada): ${validatedHypothesis || 'Tidak disebutkan'}

Berikan rekomendasi analisis statistik yang mencakup:
- Nama uji statistik yang direkomendasikan (t-test, ANOVA, Chi-square, Regresi, dll.)
- Nama uji dalam format yang mudah dibaca
- Justifikasi mengapa uji ini tepat untuk situasi Anda
- Asumsi-asumsi yang perlu diperiksa sebelum melakukan uji
- Panduan interpretasi hasil
- Alternative uji statistik yang bisa digunakan
- Pertimbangan ukuran sampel minimum

Format JSON:
{
  "recommended_test": "nama_uji_statistik_slug",
  "test_name_formatted": "Nama Uji Statistik (Bahasa Indonesia)",
  "justification": "Penjelasan mengapa uji ini tepat...",
  "assumptions_to_check": ["Asumsi 1", "Asumsi 2", ...],
  "interpretation_guide": "Panduan interpretasi hasil...",
  "alternative_tests": ["Alternatif 1", "Alternatif 2", ...],
  "sample_size_considerations": "Pertimbangan ukuran sampel..."
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert statistical analysis advisor for Indonesian academic research.
Always respond in Indonesian with structured JSON output.
Provide statistical tests appropriate for Indonesian academic standards (journal nasional/seminar nasional minimum).`,
    messages: [{ role: 'user', content: prompt }],
  })

  const response = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from response - handle markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response

  try {
    const parsed = JSON.parse(jsonStr.trim())
    // Validate structure
    if (!parsed.recommended_test || !parsed.test_name_formatted || !parsed.justification ||
        !parsed.assumptions_to_check || !parsed.interpretation_guide) {
      throw new Error('Invalid statistical analysis response structure')
    }
    return {
      recommended_test: parsed.recommended_test,
      test_name_formatted: parsed.test_name_formatted,
      justification: parsed.justification,
      assumptions_to_check: Array.isArray(parsed.assumptions_to_check) ? parsed.assumptions_to_check : [],
      interpretation_guide: parsed.interpretation_guide,
      alternative_tests: Array.isArray(parsed.alternative_tests) ? parsed.alternative_tests : [],
      sample_size_considerations: parsed.sample_size_considerations || '',
    }
  } catch (e) {
    throw new Error(`Invalid statistical analysis response: ${e instanceof Error ? e.message : 'Parse error'}`)
  }
}

// For testing - reset client
export function resetAnthropicClient() {
  _anthropic = null
}
