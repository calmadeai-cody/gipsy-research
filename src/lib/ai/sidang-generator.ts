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

export async function generateSidangQuestions(title: string, methodology: string, findings: string): Promise<string[]> {
  const client = getAnthropicClient()
  
  const prompt = `Buatkan pertanyaan-pertanyaan untuk sidang/skripsi berdasarkan:

Judul: "${title}"
Metodologi: ${methodology}
Temuan Utama: ${findings}

Pertanyaan harus:
- Berjumlah 5-8 pertanyaan
- Mencakup aspek metodologi, temuan, kontribusi, dan kelemahan penelitian
- Menggunakan bahasa Indonesia formal
- Bersifat kritis dan membangun

Format output: JSON array of questions, contoh: ["Pertanyaan 1", "Pertanyaan 2", dst]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  
  // Parse JSON array from response
  try {
    // Try to extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    // Fallback: split by newlines and clean up
    return text.split('\n').filter(line => line.trim().length > 10)
  } catch {
    return text.split('\n').filter(line => line.trim().length > 10)
  }
}

export function resetAnthropicClient(): void {
  _anthropic = null
}