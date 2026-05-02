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

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'histogram'

export interface ChartConfig {
  xAxis?: string
  yAxis?: string
  title?: string
  colors?: string[]
  labels?: string[]
  legend?: boolean
  grid?: boolean
}

export interface VisualizationSuggestion {
  recommendedChartType: ChartType
  recommendation: string
  config: ChartConfig
  mermaidCode: string
  interpretation: string[]
}

function generateMermaidCode(chartType: ChartType, config: ChartConfig): string {
  switch (chartType) {
    case 'bar':
      return '%%{init: {\'theme\': \'base\', \'themeVariables\': { \'primaryColor\': \'#6366f1\'}}}%%\n' +
        `chart RL\n    title "${config.title || 'Bar Chart'}"\n    x-axis [${config.xAxis || 'Label 1'}, ${config.xAxis || 'Label 2'}, ${config.xAxis || 'Label 3'}]\n    y-axis "${config.yAxis || 'Value'}"\n    [120, 180, 90, 150, 200]`
    case 'line':
      return '%%{init: {\'theme\': \'base\', \'themeVariables\': { \'primaryColor\': \'#6366f1\'}}}%%\n' +
        `chart LR\n    title "${config.title || 'Line Chart'}"\n    x-axis ["Jan", "Feb", "Mar", "Apr", "May"]\n    y-axis "${config.yAxis || 'Value'}"\n    line[120, 180, 90, 150, 200]`
    case 'pie':
      return '%%{init: {\'theme\': \'base\', \'themeVariables\': { \'pie1\': \'#6366f1\', \'pie2\': \'#8b5cf6\', \'pie3\': \'#a855f7\', \'pie4\': \'#d946ef\', \'pie5\': \'#ec4899\'}}}%%\n' +
        `pie title ${config.title || 'Distribution'}\n    "Category A" : 35\n    "Category B" : 25\n    "Category C" : 20\n    "Category D" : 15\n    "Category E" : 5`
    case 'scatter':
      return '%%{init: {\'theme\': \'base\', \'themeVariables\': { \'primaryColor\': \'#6366f1\'}}}%%\n' +
        `chart TD\n    title "${config.title || 'Scatter Plot'}"\n    x-axis "${config.xAxis || 'X Value'}"\n    y-axis "${config.yAxis || 'Y Value'}"\n    15,25 --> point1\n    25,40 --> point2\n    35,30 --> point3\n    45,55 --> point4\n    55,45 --> point5`
    case 'histogram':
      return '%%{init: {\'theme\': \'base\', \'themeVariables\': { \'primaryColor\': \'#6366f1\'}}}%%\n' +
        `chart RL\n    title "${config.title || 'Histogram'}"\n    x-axis "${config.xAxis || 'Ranges'}"\n    y-axis "${config.yAxis || 'Frequency'}"\n    [10-20] : 25\n    [20-30] : 45\n    [30-40] : 30\n    [40-50] : 20\n    [50-60] : 15`
    default:
      return '%%{init: {\'theme\': \'base\', \'themeVariables\': { \'primaryColor\': \'#6366f1\'}}}%%\n' +
        `chart TD\n    title "${config.title || 'Chart'}"\n    [Data visualization placeholder]`
  }
}

function parseInterpretationFromText(text: string): string[] {
  const interpretation: string[] = []
  const lowerText = text.toLowerCase()
  
  if (!lowerText.includes('interpretation')) {
    return interpretation
  }
  
  const interpretationIndex = lowerText.indexOf('interpretation')
  const interpretationSection = text.substring(interpretationIndex, interpretationIndex + 500)
  const lines = interpretationSection.split('\n').slice(0, 10)
  
  for (const line of lines) {
    const match = line.match(/^\d+\.\s*(.+)/)
    if (match && match[1]) {
      const clean = match[1].trim()
      if (clean) interpretation.push(clean)
    }
  }
  
  return interpretation
}

function parseVisualizationResponse(text: string, chartType: ChartType): VisualizationSuggestion {
  // Try to parse JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        recommendedChartType: parsed.recommendedChartType || chartType,
        recommendation: parsed.recommendation || '',
        config: parsed.config || {},
        mermaidCode: parsed.mermaidCode || generateMermaidCode(chartType, parsed.config || {}),
        interpretation: parsed.interpretation || [],
      }
    } catch {
      // Fall through to text parsing
    }
  }

  // Extract sections from text
  const lines = text.split('\n').filter(l => l.trim())
  const recommendation = lines.find(l => l.match(/recommendation|rekomendasi|saran/i))?.replace(/^[^:]+:\s*/, '') || ''
  const xAxis = lines.find(l => l.match(/x.?axis/i))?.split(':')[1]?.trim() || 'X Axis'
  const yAxis = lines.find(l => l.match(/y.?axis/i))?.split(':')[1]?.trim() || 'Y Axis'
  const title = lines.find(l => l.match(/title|judul/i))?.split(':')[1]?.trim() || 'Data Visualization'

  const config: ChartConfig = {
    xAxis,
    yAxis,
    title,
    colors: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
    legend: true,
    grid: true,
  }

  const interpretation = parseInterpretationFromText(text)

  if (interpretation.length === 0) {
    interpretation.push('Perhatikan pola umum dalam data yang divisualisasikan')
    interpretation.push('Identifikasi outliers atau nilai ekstrem jika ada')
    interpretation.push('Bandingkan dengan benchmark atau target jika relevan')
    interpretation.push('Gunakan insight untuk pengambilan keputusan')
  }

  return {
    recommendedChartType: chartType,
    recommendation: recommendation || `Chart типа ${chartType} cocok untuk data seperti ini karena memungkinkan perbandingan antar kategori secara visual.`,
    config,
    mermaidCode: generateMermaidCode(chartType, config),
    interpretation,
  }
}

export async function suggestVisualization(
  description: string,
  chartType: ChartType,
  dataValues?: string
): Promise<VisualizationSuggestion> {
  const client = getAnthropicClient()

  const dataValuesSection = dataValues
    ? `\n\nContoh data yang disediakan:\n${dataValues}`
    : ''

  const prompt = `Anda adalah asisten visualisasi data untuk penelitian akademik. Analisis deskripsi data berikut dan rekomendasikan visualisasi yang optimal.

Deskripsi Data: "${description}"${dataValuesSection}

Jenis Chart yang Diminta: ${chartType}

Tugas Anda:
1. Berikan rekomendasi mengapa ${chartType} chart cocok atau tidak cocok
2. Sarankan konfigurasi chart (axis labels, judul, warna, dll)
3. Buat kode Mermaid untuk visualisasi
4. Berikan 3-4 poin interpretasi

Format output必须是 JSON object dengan struktur:
{
  "recommendedChartType": "${chartType}",
  "recommendation": "Penjelasan kenapa chart ini cocok (dalam Bahasa Indonesia)",
  "config": {
    "xAxis": "Label sumbu X",
    "yAxis": "Label sumbu Y", 
    "title": "Judul chart",
    "colors": ["#hex1", "#hex2", dll],
    "labels": ["label1", "label2", dll],
    "legend": true/false,
    "grid": true/false
  },
  "mermaidCode": "kode mermaid untuk chart",
  "interpretation": ["poin interpretasi 1", "poin interpretasi 2", "poin interpretasi 3", "poin interpretasi 4"]
}

Hanya output JSON object saja, tidak ada penjelasan lain.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const result = parseVisualizationResponse(responseText, chartType)
    return result
  } catch {
    // Fallback to default response
    return {
      recommendedChartType: chartType,
      recommendation: `Chart типа ${chartType} direkomendasikan berdasarkan deskripsi data yang diberikan.`,
      config: {
        xAxis: 'X Axis',
        yAxis: 'Y Axis',
        title: 'Data Visualization',
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
        legend: true,
        grid: true,
      },
      mermaidCode: generateMermaidCode(chartType, {
        xAxis: 'X Axis',
        yAxis: 'Y Axis',
        title: 'Data Visualization',
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
        legend: true,
        grid: true,
      }),
      interpretation: [
        'Perhatikan pola umum dalam data yang divisualisasikan',
        'Identifikasi outliers atau nilai ekstrem jika ada',
        'Gunakan insight untuk pengambilan keputusan',
      ],
    }
  }
}

export function resetAnthropicClient(): void {
  _anthropic = null
}
