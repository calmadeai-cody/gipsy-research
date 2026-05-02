import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/theory-generator'

// Mock response
const theoryResponse = `Landasan Teori

Teori Belajar Konstruktivisme

Konstruktivisme adalah teori belajar yang menyatakan bahwa pengetahuan tidak dapat diberikan begitu saja kepada peserta didik, melainkan harus dibangun sendiri oleh peserta didik melalui pengalaman dan interaksi dengan lingkungannya. Teori ini dipelopori oleh Jean Piaget dan kemudian dikembangkan oleh banyak ahli pendidikan lainnya seperti Vygotsky, Bruner, dan Ausubel. Dalam konteks pendidikan tinggi, konstruktivisme menekankan pentingnya peran aktif mahasiswa dalam proses pembelajaran.

Konstruktivisme mendasarkan diri pada beberapa prinsip utama. Pertama, mahasiswa secara aktif membangun pengetahuan mereka sendiri rather than passively receiving it. Kedua, pengetahuan baru dibangun berdasarkan pengetahuan sebelumnya yang sudah dimilki mahasiswa. Ketiga, proses pembelajaran akan lebih bermakna jika mahasiswa terlibat langsung dalam menemukan dan memecahkan masalah. Prinsip-prinsip ini memiliki implikasi penting bagi desain pembelajaran di institusi pendidikan tinggi.

Penerapan Teori dalam Penelitian

Dalam penelitian ini, teori konstruktivisme diterapkan untuk menganalisis bagaimana literasi digital mempengaruhi kinerja akademik mahasiswa. Mahasiswa yang memiliki tingkat literasi digital yang baik diharapkan mampu membangun pengetahuan secara lebih efektif melalui berbagai sumber belajar digital. Kemampuan ini memungkinkan mereka untuk mengakses, mengevaluasi, dan menggunakan informasi secara kritis dalam mendukung proses pembelajaran mereka.

Definisi Operasional

Literasi digital dalam penelitian ini didefinisikan sebagai kemampuan untuk mengakses, memahami, mengevaluasi, dan menggunakan informasi dari berbagai sumber digital secara kritis dan bertanggung jawab. Kinerja akademik diukur berdasarkan nilai rata-rata IPK mahasiswa yang mencerminkan keberhasilan mereka dalam mengikuti proses pembelajaran di perguruan tinggi.

Referensi Teoretis

Penelitian ini merujuk pada beberapa teoretikus utama dalam bidang literasi digital dan konstruktivisme. Piaget (1972) memberikan landasan tentang bagaimana proses asimilasi dan akomodasi terjadi dalam membangun pengetahuan. Vygotsky (1978) menjelaskan tentang zone of proximal development yang menunjukkan pentingnya interaksi sosial dalam proses belajar. Selain itu, Eshet-Alkalai (2004) memberikan kerangka kerja untuk memahami berbagai aspek literasi digital yang diperlukan di era informasi.`

// Use a factory function for proper constructor mocking
vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: theoryResponse }],
        }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('generateTheory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return a string', async () => {
    const { generateTheory } = await import('@/lib/ai/theory-generator')
    const result = await generateTheory('Pengaruh Literasi Digital terhadap Kinerja Akademik Mahasiswa')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(10)
  })

  it('should return theory with multiple paragraphs', async () => {
    const { generateTheory } = await import('@/lib/ai/theory-generator')
    const result = await generateTheory('Test Title')
    expect(result).toContain('\n\n')
  })

  it('should handle title with topic context', async () => {
    const { generateTheory } = await import('@/lib/ai/theory-generator')
    const result = await generateTheory(
      'Pengaruh Media Sosial terhadap Prestasi Belajar',
      'Penelitian ini berfokus pada mahasiswa semester awal di universitas di Indonesia'
    )
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(50)
  })

  it('should handle empty topic (optional parameter)', async () => {
    const { generateTheory } = await import('@/lib/ai/theory-generator')
    const result = await generateTheory('Hanya Judul', '')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle undefined topic', async () => {
    const { generateTheory } = await import('@/lib/ai/theory-generator')
    const result = await generateTheory('Judul Saja', undefined)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should throw error for empty title', async () => {
    const { generateTheory } = await import('@/lib/ai/theory-generator')
    await expect(generateTheory('')).rejects.toThrow()
  })

  it('should return non-empty string for valid input', async () => {
    const { generateTheory } = await import('@/lib/ai/theory-generator')
    const result = await generateTheory('Valid Research Title')
    expect(result.trim().length).toBeGreaterThan(0)
  })

  it('should call Anthropic API successfully', async () => {
    const { generateTheory } = await import('@/lib/ai/theory-generator')
    const result = await generateTheory('API Test Title')
    expect(result).toBe(theoryResponse)
  })
})

describe('resetAnthropicClient', () => {
  it('should reset the Anthropic client', async () => {
    const { resetAnthropicClient } = await import('@/lib/ai/theory-generator')
    expect(() => resetAnthropicClient()).not.toThrow()
  })
})