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

export async function convertToHumanText(text: string): Promise<string> {
  const client = getAnthropicClient()
  const prompt = `Konversikan teks berikut yang terlihat seperti hasil AI menjadi tulisan yang lebih natural dan manusiawi:

"${text}"

Aturan:
- Hilangkan pola bahasa yang kaku dan formal过度
- Gunakan struktur kalimat yang bervariasi
- Jaga makna dan informasi asli
- Hasilkan teks yang terdengar seperti ditulis manusia biasa
- Bahasa Indonesia formal

Hanya output teks yang sudah dikonversi, tanpa kutipan atau penjelasan.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export function resetAnthropicClient(): void {
  _anthropic = null
}