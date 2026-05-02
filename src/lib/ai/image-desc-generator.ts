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

export interface ImageDescription {
  description: string
  technicalDetails: string
  interpretation: string
  caption: string
}

export async function generateImageDescription(
  imageUrl: string,
  context?: string
): Promise<ImageDescription> {
  const validation = validateAIInput(imageUrl)
  if (!validation.valid) {
    throw new Error(validation.reason || 'Invalid image URL')
  }

  const client = getAnthropicClient()

  const prompt = `Sebagai ahli analisis gambar akademik, berikan deskripsi komprehensif untuk gambar berikut.

URL Gambar: ${imageUrl}
Konteks Penelitian: ${context || 'Tidak ada'}

Instruksi:
- Berikan deskripsi visual yang detail dan sistematis
- Identifikasi elemen-elemen utama dalam gambar
- Catat detail teknis jika memungkinkan (format, dimensi, resolusi jika terlihat)
- Sajikan interpretasi akademik dan signifikansi gambar
- Buat caption yang sesuai untuk论文 jurnal akademik

format JSON:
{
  "description": "deskripsi detail elemen visual...",
  "technicalDetails": "detail teknis gambar (format, resolusi, dimensi jika terlihat)...",
  "interpretation": "interpretasi akademik dan signifikansi...",
  "caption": "caption yang disarankan untuk jurnal akademik..."
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert academic image analysis specialist for Indonesian academic research.
Always respond in Indonesian with structured JSON output.
Provide detailed, systematic visual descriptions appropriate for Indonesian academic standards (journal nasional/seminar nasional minimum).
Format captions suitable for journal publications.`,
    messages: [{ role: 'user', content: prompt }],
  })

  const response = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from response - handle markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response

  try {
    const parsed = JSON.parse(jsonStr.trim())
    // Validate structure
    if (!parsed.description || typeof parsed.description !== 'string') {
      throw new Error('Invalid description response structure')
    }
    return {
      description: parsed.description || '',
      technicalDetails: parsed.technicalDetails || 'Tidak ada informasi teknis yang tersedia',
      interpretation: parsed.interpretation || '',
      caption: parsed.caption || '',
    }
  } catch (e) {
    throw new Error(`Invalid image description response: ${e instanceof Error ? e.message : 'Parse error'}`)
  }
}

// For testing - reset client
export function resetAnthropicClient() {
  _anthropic = null
}