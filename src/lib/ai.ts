import { Anthropic } from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateResearchTitle(keywords: string, count: number = 5): Promise<string[]> {
  const prompt = `Buatkan ${count} judul penelitian akademik dalam Bahasa Indonesia berdasarkan kata kunci: "${keywords}"

Format output sebagai JSON array of strings, contoh:
["Judul 1", "Judul 2", "Judul 3"]

Judul harus:
- Akurat secara akademik
- Menggunakan terminologi yang tepat
- Menunjukkan hubungan variabel penelitian
- Sesuai format penelitian kuantitatif/kualitatif

Hanya output JSON array, tanpa penjelasan.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    return JSON.parse(text)
  } catch {
    return text.split('\n').filter(line => line.trim() && line.includes('.'))
  }
}

export async function paraphraseParagraph(paragraph: string): Promise<string> {
  const prompt = `Parafrase paragraf berikut menjadi versi baru dengan makna yang sama tapi kalimat berbeda:

"${paragraph}"

Aturan:
- Jaga makna asli
- Gunakan struktur kalimat berbeda
- Hindari plagiarisme
- Bahasa Indonesia formal

Hanya output teks hasil parafrase, tanpa kutipan atau penjelasan.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export async function generateBibliography(content: string, style: string = 'APA'): Promise<string[]> {
  const prompt = `Dari artikel/konten berikut, generate daftar pustaka (bibliografi) dengan format ${style}:

"${content}"

Format sebagai JSON array of strings.
Contoh format APA: "Nama, A. A. (Tahun). Judul artikel. Nama Jurnal, Volume(Nomor), halaman-halaman."
Contoh format MLA: "Nama, Nama. 'Judul Artikel.' Nama Jurnal, vol. nomor, no. nomor, tahun, halaman."

Hanya output JSON array, tanpa penjelasan.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    return JSON.parse(text)
  } catch {
    return text.split('\n').filter(line => line.trim().length > 10)
  }
}