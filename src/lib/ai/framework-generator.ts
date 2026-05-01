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

interface FrameworkResult {
  framework_description: string
  variables_identified: {
    name: string
    type: 'independent' | 'dependent' | 'moderating' | 'mediating'
    hypothesis: string
  }[]
  relationships: string[]
  diagram_mermaid: string
}

export async function generateFramework(
  title: string,
  variables: string,
  methodology: string
): Promise<FrameworkResult> {
  if (!title?.trim()) {
    throw new Error('Title is required')
  }

  const client = getAnthropicClient()

  const prompt = `Buatkan kerangka konseptual untuk penelitian dengan detail berikut:

Judul Penelitian: "${title}"
Variabel Penelitian: ${variables}
Metodologi: ${methodology}

Output dalam format JSON dengan struktur:
{
  "framework_description": "Deskripsi kerangka konseptual dalam 2-3 kalimat",
  "variables_identified": [
    {"name": "Nama Variabel", "type": "independent/dependent/moderating/mediating", "hypothesis": "Hipotesis untuk variabel ini"}
  ],
  "relationships": ["Hubungan 1 antara variabel", "Hubungan 2 antara variabel"],
  "diagram_mermaid": "Kode diagram Mermaid yang merepresentasikan kerangka"
}

Hanya output JSON valid, tanpa penjelasan tambahan.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as FrameworkResult
    }

    throw new Error('Failed to parse framework response')
  } catch (error) {
    console.error('Framework generation error:', error)
    throw new Error('Failed to generate conceptual framework')
  }
}

export function resetAnthropicClient(): void {
  _anthropic = null
}