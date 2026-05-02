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

export async function generateTheory(title: string, topic?: string): Promise<string> {
  if (!title?.trim()) {
    throw new Error('Research title is required')
  }

  const client = getAnthropicClient()

  const topicSection = topic
    ? `\nTopik Penelitian: "${topic}"`
    : ''

  const prompt = `Buatkan landasan teori penelitian yang komprehensif dalam Bahasa Indonesia berdasarkan:

Judul Penelitian: "${title}"${topicSection}

Landasan teori harus mencakup:
1. Pengenalan teori yang mendasari penelitian dan konteks relevansinya
2. Konsep-konsep kunci dan definisi operasional yang jelas
3. Penerapan teori pada konteks penelitian spesifik
4. Referensi dan kutipan dari para teoretikus terkait

Gunakan bahasa akademik formal dengan struktur yang logis dan koheren. Pastikan penjelasan mendalam namun ringkas (800-1200 kata). Hanya output landasan teori saja, tanpa judul atau penjelasan tambahan.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    return message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (error) {
    console.error('Theory generation error:', error)
    throw error instanceof Error ? error : new Error('Failed to generate theoretical foundation')
  }
}

export function resetAnthropicClient(): void {
  _anthropic = null
}