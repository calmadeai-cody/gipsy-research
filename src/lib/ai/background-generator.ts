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

export async function generateBackground(title: string, problem?: string): Promise<string> {
  if (!title?.trim()) {
    throw new Error('Research title is required')
  }

  const client = getAnthropicClient()

  const problemSection = problem
    ? `\nMasalah Penelitian: "${problem}"`
    : ''

  const prompt = `Buatkan latar belakang penelitian yang komprehensif dalam Bahasa Indonesia berdasarkan:

Judul Penelitian: "${title}"${problemSection}

Latar belakang harus:
- 300-500 kata
- Paragraf pembuka yang menjelaskan konteks umum penelitian
- Deskripsi masalah yang mengidentifikasi gap atau keperluan penelitian
- Pernyataan gap yang jelas menunjukkan kekosongan pengetahuan
- Justifikasi penelitian yang menjelaskan mengapa penelitian ini penting dan diperlukan

Gunakan bahasa akademik formal dan hindari frasa generik seperti "di era modern". Hanya output latar belakang saja, tanpa judul atau penjelasan tambahan.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    return message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (error) {
    console.error('Background generation error:', error)
    throw error instanceof Error ? error : new Error('Failed to generate research background')
  }
}

export function resetAnthropicClient(): void {
  _anthropic = null
}