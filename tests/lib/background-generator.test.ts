import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetAnthropicClient } from '@/lib/ai/background-generator'

// Mock response
const backgroundResponse = `Latar belakang penelitian ini membahas mengenai pentingnya pengembangan literasi digital dalam konteks pendidikan tinggi di Indonesia. Di era digital yang berkembang pesat saat ini, kemampuan literasi digital menjadi keterampilan fundamental yang harus dikuasai oleh setiap individu, terutama mahasiswa yang akan menjadi agen perubahan di masyarakat. Ketidakmampuan dalam memahami dan memanfaatkan teknologi digital secara optimal dapat menghambat proses pembelajaran dan pengembangan kompetensi yang diperlukan di dunia kerja.

Dalam konteks pendidikan tinggi, mahasiswa menghadapi berbagai tantangan dalam mengembangkan literasi digital yang memadai. Meskipun teknologi informasi telah berkembang dengan sangat cepat, masih banyak ditemukan gap antara kemampuan mahasiswa dalam menggunakan teknologi dan kebutuhan yang diperlukan dalam pembelajaran akademik. Hal ini menunjukkan bahwa diperlukan upaya sistematis untuk meningkatkan literasi digital mahasiswa agar dapat mengikuti perkembangan zaman dan memenuhi tuntutan pendidikan.

Berdasarkan permasalahan tersebut, masih terdapat kekosongan pengetahuan (research gap) yang perlu diisi melalui penelitian lebih lanjut. Penelitian ini diperlukan untuk mengkaji secara komprehensif bagaimana literasi digital mempengaruhi kinerja akademik mahasiswa dan faktor-faktor apa saja yang dapat menjadi pendorong atau penghambat dalam pengembangan kompetensi tersebut. Hasil penelitian ini diharapkan dapat memberikan kontribusi nyata bagi pengembangan kurikulum dan strategi pembelajaran yang efektif di institusi pendidikan tinggi.`

// Use a factory function for proper constructor mocking
vi.mock('@anthropic-ai/sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockAnthropic = function(this: { messages: { create: ReturnType<typeof vi.fn> } }, _config: { apiKey?: string }) {
    this.messages = {
      create: vi.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: backgroundResponse }],
        }
      }),
    }
  }
  return { Anthropic: MockAnthropic }
})

describe('generateBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAnthropicClient()
  })

  it('should return a string', async () => {
    const { generateBackground } = await import('@/lib/ai/background-generator')
    const result = await generateBackground('Pengaruh Literasi Digital terhadap Kinerja Akademik Mahasiswa')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(10)
  })

  it('should return background with multiple paragraphs', async () => {
    const { generateBackground } = await import('@/lib/ai/background-generator')
    const result = await generateBackground('Test Title')
    expect(result).toContain('\n\n')
  })

  it('should handle title with problem context', async () => {
    const { generateBackground } = await import('@/lib/ai/background-generator')
    const result = await generateBackground(
      'Pengaruh Media Sosial terhadap Prestasi Belajar',
      'Mahasiswa sering mengalami difficulty dalam mengelola waktu antara media sosial dan kegiatan belajar'
    )
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(50)
  })

  it('should handle empty problem (optional parameter)', async () => {
    const { generateBackground } = await import('@/lib/ai/background-generator')
    const result = await generateBackground('Hanya Judul', '')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle undefined problem', async () => {
    const { generateBackground } = await import('@/lib/ai/background-generator')
    const result = await generateBackground('Judul Saja', undefined)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should throw error for empty title', async () => {
    const { generateBackground } = await import('@/lib/ai/background-generator')
    await expect(generateBackground('')).rejects.toThrow()
  })

  it('should return non-empty string for valid input', async () => {
    const { generateBackground } = await import('@/lib/ai/background-generator')
    const result = await generateBackground('Valid Research Title')
    expect(result.trim().length).toBeGreaterThan(0)
  })

  it('should call Anthropic API successfully', async () => {
    const { generateBackground } = await import('@/lib/ai/background-generator')
    const result = await generateBackground('API Test Title')
    expect(result).toBe(backgroundResponse)
  })
})

describe('resetAnthropicClient', () => {
  it('should reset the Anthropic client', async () => {
    const { resetAnthropicClient } = await import('@/lib/ai/background-generator')
    expect(() => resetAnthropicClient()).not.toThrow()
  })
})