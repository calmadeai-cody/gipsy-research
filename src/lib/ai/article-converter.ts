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

export interface ConvertedArticle {
  abstract: string
  introduction: string
  methods: string
  results: string
  discussion: string
  conclusion: string
  original_length: number
  converted_length: number
  journal: string | null
  style: string
}

export interface ConversionResult {
  article: ConvertedArticle
  sections_count: number
  total_references_needed: number
}

const STYLE_GUIDES: Record<string, string> = {
  IEEE: 'IEEE referencing style - numbered citations [1], double-column format, abstract under 150 words',
  APA: 'APA 7th edition style - author-date citations (Smith, 2024), single-spaced, abstract under 250 words',
  Chicago: 'Chicago manual of style - footnotes preferred, 15th edition format',
}

export async function convertToArticle(
  draft: string,
  journal?: string,
  style: string = 'IEEE'
): Promise<ConversionResult> {
  const validation = validateAIInput(draft)
  if (!validation.valid) {
    throw new Error(validation.reason || 'Invalid input draft')
  }

  const client = getAnthropicClient()

  const styleGuide = STYLE_GUIDES[style] || STYLE_GUIDES.IEEE
  const journalContext = journal ? `Target journal/format: ${journal}. ` : ''

  const prompt = `Sebagai ahli penulisan artikel ilmiah, konversikan draft berikut menjadi artikel ilmiah yang terstruktur dengan proper.

${journalContext}
Referencing style: ${styleGuide}

Draft asli:
"${draft}"

Instruksi konversi:
- Buat artikel dengan struktur lengkap: Abstract, Introduction, Methods, Results, Discussion, Conclusion
- Perbaiki bahasa menjadi bahasa akademik formal Indonesia yang sesuai untuk publikasi
- Tambahkan placeholder sitasi [REF-X] di tempat yang membutuhkan referensi
- Pastikan setiap section memiliki kedalaman yang sesuai untuk artikel ilmiah
- Abstract harus ringkas (150-250 kata) dan mencakup semua aspek penting
- Introduction harus mencakup: konteks, gap research, dan tujuan penelitian
- Methods harus detail dan reprodusibel
- Results fokus pada temuan tanpa interpretasi berlebihan
- Discussion interpretasi temuan dengan literatur yang ada
- Conclusion ringkasan temuan dan keterbatasan

Format JSON respons:
{
  "article": {
    "abstract": "teks abstract lengkap...",
    "introduction": "teks introduction lengkap...",
    "methods": "teks methods lengkap...",
    "results": "teks results lengkap...",
    "discussion": "teks discussion lengkap...",
    "conclusion": "teks conclusion lengkap..."
  },
  "original_length": jumlah_karakter_asli,
  "converted_length": jumlah_karakter_hasil,
  "journal": "nama_journal atau null",
  "style": "gaya yang digunakan"
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: `You are an expert academic writing specialist for Indonesian research.
Always respond in Indonesian with structured JSON output.
Create scientifically rigorous articles with proper academic structure.
Use [REF-1], [REF-2], etc. as citation placeholders.
Ensure each section is substantive (minimum 300 characters per section for substantial drafts).`,
    messages: [{ role: 'user', content: prompt }],
  })

  const response = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from response - handle markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response

  try {
    const parsed = JSON.parse(jsonStr.trim())

    if (!parsed.article || !parsed.article.abstract || !parsed.article.introduction) {
      throw new Error('Invalid article conversion response structure')
    }

    const article: ConvertedArticle = {
      abstract: parsed.article.abstract || '',
      introduction: parsed.article.introduction || '',
      methods: parsed.article.methods || '',
      results: parsed.article.results || '',
      discussion: parsed.article.discussion || '',
      conclusion: parsed.article.conclusion || '',
      original_length: parsed.original_length || draft.length,
      converted_length: parsed.converted_length || 0,
      journal: parsed.journal || journal || null,
      style: parsed.style || style,
    }

    // Count approximate reference placeholders needed
    const refMatches = JSON.stringify(article).match(/\[REF-\d+\]/g) || []
    const uniqueRefs = new Set(refMatches).size

    return {
      article,
      sections_count: 6,
      total_references_needed: uniqueRefs,
    }
  } catch (e) {
    throw new Error(`Invalid article conversion response: ${e instanceof Error ? e.message : 'Parse error'}`)
  }
}

// For testing - reset client
export function resetAnthropicClient() {
  _anthropic = null
}