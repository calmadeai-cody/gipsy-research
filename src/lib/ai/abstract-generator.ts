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

export async function generateAbstract(title: string, keywords: string): Promise<string> {
  const client = getAnthropicClient()
  
  const keywordsLine = keywords ? `\nKata kunci: ${keywords}` : ''
  
  const prompt = `Buatkan abstrak penelitian akademik dalam Bahasa Indonesia berdasarkan:

Judul: "${title}"${keywordsLine}

Abstrak harus:
- Pendek (150-250 kata)
- Mencakup latar belakang, tujuan, metode, dan hasil yang diharapkan
- Menggunakan bahasa akademik formal
- Menunjukkan kontribusi penelitian

Hanya output abstrak saja, tanpa judul atau penjelasan.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export function resetAnthropicClient(): void {
  _anthropic = null
}