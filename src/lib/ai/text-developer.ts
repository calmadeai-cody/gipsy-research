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

export interface TextDeveloperResult {
  developed_text: string
  original_length: number
  developed_length: number
  focus_area?: string
  style: string
}

export async function developText(
  originalText: string,
  focusArea?: string,
  style: string = 'comprehensive'
): Promise<TextDeveloperResult> {
  const validation = validateAIInput(originalText)
  if (!validation.valid) {
    throw new Error(validation.reason || 'Invalid input text')
  }

  const client = getAnthropicClient()

  const styleDescriptions: Record<string, string> = {
    comprehensive: 'Menyajikan pengembangan yang lengkap dan menyeluruh dengan contoh-contoh detail dan penjelasan mendalam',
    detailed: 'Menyajikan pengembangan yang sangat mendetail dengan fokus pada aspek-aspek spesifik dan teknis',
    concise: 'Menyajikan pengembangan yang ringkas namun informatif, menghindari pengulangan yang tidak perlu',
  }

  const styleDesc = styleDescriptions[style] || styleDescriptions.comprehensive

  const prompt = `Sebagai ahli pengembangan teks akademik, kembangkan teks berikut dengan teknik pengembangan akademik yang tepat.

Teks Asli:
"${originalText}"

Fokus Pengembangan: ${focusArea || 'Pengembangan umum dengan penjelasan, contoh, dan elaborasi yang relevan'}
Gaya Pengembangan: ${styleDesc}

Instruksi Pengembangan:
- Perpanjang teks menjadi 2-3x lipat dari teks asli
- Tambahkan penjelasan, contoh, dan elaborasi yang relevan secara akademik
- Jaga koherensi dan alur paragraf yang logis
- Gunakan bahasa akademik formal Indonesia
- Tambahkan detail yang mendukung argumen utama
- Sertakan konteks dan penjelasan yang memperjelas konsep

format JSON:
{
  "developed_text": "teks yang sudah dikembangkan...",
  "original_length": jumlah_karakter_asli,
  "developed_length": jumlah_karakter_hasil,
  "focus_area": "fokus yang digunakan",
  "style": "gaya yang digunakan"
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert academic text development specialist for Indonesian academic research.
Always respond in Indonesian with structured JSON output.
Provide text expansions that are appropriate for Indonesian academic standards (journal nasional/seminar nasional minimum).
Expand text by 2-3x while maintaining academic tone and adding relevant details, examples, and explanations.`,
    messages: [{ role: 'user', content: prompt }],
  })

  const response = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from response - handle markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response

  try {
    const parsed = JSON.parse(jsonStr.trim())
    // Validate structure
    if (!parsed.developed_text || typeof parsed.developed_text !== 'string') {
      throw new Error('Invalid developed text response structure')
    }
    return {
      developed_text: parsed.developed_text,
      original_length: parsed.original_length || originalText.length,
      developed_length: parsed.developed_length || parsed.developed_text.length,
      focus_area: parsed.focus_area || focusArea,
      style: parsed.style || style,
    }
  } catch (e) {
    throw new Error(`Invalid text development response: ${e instanceof Error ? e.message : 'Parse error'}`)
  }
}

// For testing - reset client
export function resetAnthropicClient() {
  _anthropic = null
}
