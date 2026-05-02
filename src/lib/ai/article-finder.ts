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

export interface ArticleSuggestion {
  title: string
  journal: string
  description: string
  keywords: string[]
}

function extractJsonFromResponse(text: string): ArticleSuggestion[] {
  // Try to find JSON array in the response
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch {
      // Fall through to parsing
    }
  }
  
  // Fallback: parse line by line format
  const articles: ArticleSuggestion[] = []
  const lines = text.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    // Match patterns like "1. Title | Journal | Description | keywords"
    const match = line.match(/^\d+\.\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/)
    if (match) {
      articles.push({
        title: match[1].trim(),
        journal: match[2].trim(),
        description: match[3].trim(),
        keywords: match[4].split(',').map(k => k.trim()),
      })
    }
  }
  
  return articles
}

export async function findArticles(topic: string): Promise<ArticleSuggestion[]> {
  const client = getAnthropicClient()
  
  const prompt = `Buatkan daftar 5-10 artikel ilmiah yang relevan untuk topik penelitian: "${topic}"

Setiap artikel harus mencakup:
- Judul artikel (suggested title)
- Nama jurnal atau platform (Google Scholar, DOAJ, PubMed, Springer, dll)
- Deskripsi singkat tentang relevansi artikel tersebut dengan topik penelitian
- Kata kunci untuk pencarian (3-5 kata kunci)

Format output必须是 JSON array dengan struktur:
[
  {
    "title": "Judul artikel yang disarankan",
    "journal": "Nama jurnal atau platform",
    "description": "Deskripsi relevansi dalam 1-2 kalimat",
    "keywords": ["kata kunci 1", "kata kunci 2", "kata kunci 3"]
  }
]

Hanya output JSON array saja, tidak ada penjelasan lain.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  
  try {
    const articles = extractJsonFromResponse(responseText)
    if (articles.length > 0) {
      return articles.slice(0, 10) // Limit to 10
    }
  } catch {
    // Fallback parsing failed
  }
  
  // Return empty array if parsing fails
  return []
}

export function resetAnthropicClient(): void {
  _anthropic = null
}