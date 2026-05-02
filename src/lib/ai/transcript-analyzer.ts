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

export type AnalysisType = 'summarize' | 'key_points' | 'themes' | 'sentiment'

export interface KeyPoint {
  point: string
  importance: 'high' | 'medium' | 'low'
  context?: string
}

export interface Theme {
  theme: string
  description: string
  relevance: string
}

export interface SentimentResult {
  overall: 'positive' | 'negative' | 'neutral'
  positive_percentage: number
  negative_percentage: number
  neutral_percentage: number
  key_sentiments: string[]
  emotional_tone: string
}

export interface TranscriptAnalysisResult {
  summary?: string
  key_points?: KeyPoint[]
  themes?: Theme[]
  sentiment?: SentimentResult
  analysis_type: AnalysisType
  original_length: number
  processed_at: string
}

export async function analyzeTranscript(
  text: string,
  type: AnalysisType
): Promise<TranscriptAnalysisResult> {
  const validation = validateAIInput(text)
  if (!validation.valid) {
    throw new Error(validation.reason || 'Invalid input text')
  }

  const client = getAnthropicClient()

  let systemPrompt = ''
  let userPrompt = ''

  switch (type) {
    case 'summarize':
      systemPrompt = `You are an expert academic analyst specializing in text summarization.
Always respond in Indonesian with structured JSON output.
Create a comprehensive 200-300 word summary of the transcript that captures the main points, key information, and essential details.
Maintain academic tone and ensure the summary is coherent and well-structured.`
      userPrompt = `Buat ringkasan komprehensif (200-300 kata) dari transkrip berikut:

"${text}"

Ringkasan harus:
- Menangkap poin-poin utama dan informasi penting
- Terstruktur dengan baik dan koheren
- Menggunakan bahasa akademik formal Indonesia
- 200-300 kata

Format JSON:
{
  "summary": "teks ringkasan 200-300 kata...",
  "analysis_type": "summarize",
  "original_length": jumlah_karakter_asli,
  "processed_at": "ISO timestamp"
}`
      break

    case 'key_points':
      systemPrompt = `You are an expert academic analyst specializing in extracting key points from transcripts.
Always respond in Indonesian with structured JSON output.
Extract 5-7 most important key points from the transcript. Each key point should be meaningful, specific, and capture significant information or arguments.
Rate each point by importance (high, medium, low).`
      userPrompt = `Ekstrak 5-7 poin kunci utama dari transkrip berikut:

"${text}"

Instruksi:
- Setiap poin kunci harus bermakna dan spesifik
- Tangkap informasi atau argumen yang signifikan
- Berikan konteks yang relevan jika diperlukan
- Nilai kepentingan setiap poin (high, medium, low)

Format JSON:
{
  "key_points": [
    {"point": "deskripsi poin kunci...", "importance": "high", "context": "konteks tambahan (opsional)"},
    ...
  ],
  "analysis_type": "key_points",
  "original_length": jumlah_karakter_asli,
  "processed_at": "ISO timestamp"
}`
      break

    case 'themes':
      systemPrompt = `You are an expert academic analyst specializing in theme identification.
Always respond in Indonesian with structured JSON output.
Identify and analyze 3-5 main themes present in the transcript. Each theme should be clearly described with its relevance and significance.`
      userPrompt = `Identifikasi 3-5 tema utama dari transkrip berikut:

"${text}"

Instruksi:
- Setiap tema harus jelas dan distinct
- Berikan deskripsi yang menjelaskan tema
- Jelaskan relevansi dan signifikansi setiap tema
- Tema harus mencerminkan ide-ide besar dalam transkrip

Format JSON:
{
  "themes": [
    {"theme": "nama tema...", "description": "penjelasan tema...", "relevance": "relevansi tema..."},
    ...
  ],
  "analysis_type": "themes",
  "original_length": jumlah_karakter_asli,
  "processed_at": "ISO timestamp"
}`
      break

    case 'sentiment':
      systemPrompt = `You are an expert academic analyst specializing in sentiment and emotional analysis.
Always respond in Indonesian with structured JSON output.
Analyze the sentiment of the transcript and provide a comprehensive sentiment breakdown including positive, negative, and neutral percentages.
Identify key sentiments and describe the overall emotional tone.`
      userPrompt = `Analisis sentimen dari transkrip berikut:

"${text}"

Instruksi:
- Tentukan sentimen keseluruhan (positive, negative, neutral)
- Hitung persentase untuk setiap kategori sentimen
- Identifikasi sentimen-sentimen kunci yang muncul
- Deskripsikan nada emosional keseluruhan

Format JSON:
{
  "sentiment": {
    "overall": "positive/negative/neutral",
    "positive_percentage": angka_0_100,
    "negative_percentage": angka_0_100,
    "neutral_percentage": angka_0_100,
    "key_sentiments": ["sentimen 1", "sentimen 2", ...],
    "emotional_tone": "deskripsi nada emosional..."
  },
  "analysis_type": "sentiment",
  "original_length": jumlah_karakter_asli,
  "processed_at": "ISO timestamp"
}`
      break
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const response = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON from response - handle markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response

  try {
    const parsed = JSON.parse(jsonStr.trim())

    // Validate structure based on type
    if (type === 'summarize' && !parsed.summary) {
      throw new Error('Invalid summarize response: missing summary field')
    }
    if (type === 'key_points' && !parsed.key_points) {
      throw new Error('Invalid key_points response: missing key_points field')
    }
    if (type === 'themes' && !parsed.themes) {
      throw new Error('Invalid themes response: missing themes field')
    }
    if (type === 'sentiment' && !parsed.sentiment) {
      throw new Error('Invalid sentiment response: missing sentiment field')
    }

    return {
      ...parsed,
      analysis_type: type,
      original_length: text.length,
      processed_at: new Date().toISOString(),
    }
  } catch (e) {
    throw new Error(`Invalid transcript analysis response: ${e instanceof Error ? e.message : 'Parse error'}`)
  }
}

export function resetAnthropicClient(): void {
  _anthropic = null
}