'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

const toolMeta: Record<string, { title: string; description: string; category: string; pro: boolean }> = {
  'diagram-kerangka-berpikir': { title: 'Diagram Kerangka Berpikir', description: 'Buat diagram kerangka berpikir penelitian secara otomatis', category: 'Perencanaan & Ide Penelitian', pro: true },
  'generator-judul-penelitian': { title: 'Generator Judul Penelitian', description: 'Hasilkan judul penelitian yang tepat berdasarkan topik Anda', category: 'Perencanaan & Ide Penelitian', pro: false },
  'generator-proposal-penelitian': { title: 'Generator Proposal Penelitian', description: 'Buat proposal penelitian lengkap dengan struktur yang benar', category: 'Perencanaan & Ide Penelitian', pro: true },
  'pemilihan-metode-penelitian': { title: 'Pemilihan Metode Penelitian', description: 'Pilih metode penelitian yang tepat untuk riset Anda', category: 'Perencanaan & Ide Penelitian', pro: true },
  'asisten-pengembang-teks': { title: 'Asisten Pengembang Teks', description: 'Kembangkan teks penelitian agar lebih kaya dan komprehensif', category: 'Asistensi Penulisan Akademik', pro: true },
  'generator-latar-belakang': { title: 'Generator Latar Belakang', description: 'Buat bagian latar belakang penelitian dengan argumentasi kuat', category: 'Asistensi Penulisan Akademik', pro: true },
  'generator-landasan-teori': { title: 'Generator Landasan Teori', description: 'Buat landasan teori yang komprehensif untuk penelitian', category: 'Asistensi Penulisan Akademik', pro: true },
  'parafrase-paragraf': { title: 'Parafrase Paragraf', description: 'Parafrase paragraf dengan menjaga makna asli dan menghindari plagiarisme', category: 'Asistensi Penulisan Akademik', pro: false },
  'generator-research-gap': { title: 'Generator Research Gap & Novelty', description: 'Identifikasi research gap dan novelty dari topik penelitian Anda', category: 'Literatur & Referensi', pro: true },
  'generator-tinjauan-pustaka': { title: 'Generator Tinjauan Pustaka', description: 'Buat tinjauan pustaka sistematis berdasarkan文献 yang ada', category: 'Literatur & Referensi', pro: true },
  'pembuatan-daftar-pustaka': { title: 'Pembuatan Daftar Pustaka', description: 'Buat daftar pustaka otomatis dalam format APA, MLA, dll', category: 'Literatur & Referensi', pro: true },
  'pencari-artikel-ilmiah': { title: 'Pencari Artikel Ilmiah', description: 'Cari artikel ilmiah dari berbagai database akademik', category: 'Literatur & Referensi', pro: true },
  'analisis-teks-transkrip': { title: 'Analisis Teks Transkrip', description: 'Analisis teks transkrip wawancara atau dokumen penelitian', category: 'Pengolahan & Visualisasi Data', pro: true },
  'asisten-visualisasi-data': { title: 'Asisten Visualisasi Data', description: 'Buat visualisasi data penelitian yang informatif', category: 'Pengolahan & Visualisasi Data', pro: true },
  'asisten-analisis-statistik': { title: 'Asisten Analisis Statistik', description: 'Bantu analisis data statistik untuk penelitian Anda', category: 'Pengolahan & Visualisasi Data', pro: true },
  'generator-deskripsi-gambar': { title: 'Generator Deskripsi Gambar', description: 'Buat deskripsi akademik untuk gambar, tabel, dan grafik', category: 'Pengolahan & Visualisasi Data', pro: true },
  'ai-to-human': { title: 'AI to Human', description: 'Ubah teks hasil AI menjadi lebih natural dan manusiawi', category: 'Finalisasi Standar Akademik', pro: false },
  'generator-abstrak-penelitian': { title: 'Generator Abstrak Penelitian', description: 'Buat abstrak penelitian yang menarik dan informatif', category: 'Finalisasi Standar Akademik', pro: true },
  'generator-pertanyaan-sidang': { title: 'Generator Pertanyaan Sidang', description: 'Siapkan diri dengan generator pertanyaan sidang yang komprehensif', category: 'Finalisasi Standar Akademik', pro: true },
  'konversi-artikel-ilmiah': { title: 'Konversi ke Artikel Ilmiah', description: 'Konversi hasil penelitian menjadi artikel ilmiah siap publish', category: 'Finalisasi Standar Akademik', pro: true },
}

export default function ToolPage() {
  const params = useParams()
  const slug = params?.slug as string
  const meta = toolMeta[slug] || { title: slug, description: 'AI Tool', category: 'General', pro: false }
  
  const calmadeUrl = `https://calmade.ai/chat?tool=${encodeURIComponent(slug)}&mode=iframe`

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <span>←</span>
              <span>Kembali</span>
            </Link>
            <span className="text-gray-600">|</span>
            <div>
              <h1 className="text-lg font-medium">{meta.title}</h1>
              <p className="text-sm text-gray-500">{meta.category}</p>
            </div>
          </div>
          {meta.pro && (
            <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs text-purple-400">
              PRO
            </span>
          )}
        </div>
      </header>

      {/* iframe Container */}
      <div className="flex-1 relative">
        <iframe
          src={calmadeUrl}
          className="w-full h-full absolute inset-0 border-0"
          allow="accelerometer; camera; microphone"
          title={meta.title}
        />
      </div>
    </div>
  )
}