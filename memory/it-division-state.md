# IT Division State

## Active Project
- **Project:** GipsyAI (Academic AI Super-App) - REBUILD
- **Location:** ~/gipsyai-project/
- **Last Updated:** 2026-04-29 05:47 UTC

## Current Status
- **Phase:** REBUILD - Full gipsyresearch.id replication
- **Cron Job ID:** 2f9d176d-8cc2-4c04-a057-71f025105837
- **Cron Schedule:** Every 3 hours (0 */3 * * *)

## New Instructions from User (2026-04-29 05:45 UTC)
- AI tools will be embedded as **iframe using Calmade AI**
- Rebuild gipsy.ai WITHOUT any Framer dependencies
- Keep: login authentication, all existing features
- **Scrape ALL pages/features from gipsyresearch.id**
- **UI check with image interpretation**
- Goal: Complete duplicate/rebuild of gipsyresearch.id functionality

## Scraped Pages So Far
| Page | URL | Status |
|------|-----|--------|
| Homepage | https://gipsyresearch.id/gipsyai | ✅ Done |
| Login | https://gipsyresearch.id/gipsyai/login | ✅ Done |
| About | https://gipsyresearch.id/about | ✅ Done |
| Kelas | https://gipsyresearch.id/kelas | ✅ Done |

## Pending Scrape
- [ ] Portal/Member area
- [ ] Konsultasi page
- [ ] Olah Data page
- [ ] Artikel page
- [ ] Affiliate page
- [ ] FAQ page
- [ ] Contact page
- [ ] All AI tool pages (40+ tools)

## AI Tools to Build (40+ categories)
1. **Perencanaan & Ide Penelitian**
   - Diagram Kerangka Berpikir (Beta) [PRO]
   - Generator Judul Penelitian
   - Generator Proposal Penelitian [PRO]
   - Pemilihan Metode Penelitian [PRO]

2. **Asistensi Penulisan Akademik**
   - Asisten Pengembang Teks [PRO]
   - Generator Latar Belakang [PRO]
   - Generator Landasan Teori [PRO]
   - Parafrase Paragraf

3. **Literatur & Referensi**
   - Generator Research Gap & Novelty [PRO]
   - Generator Tinjauan Pustaka [PRO]
   - Pembuatan Daftar Pustaka [PRO]
   - Pencari Artikel Ilmiah [PRO]

4. **Pengolahan & Visualisasi Data**
   - Analisis Teks Transkrip [PRO]
   - Asisten Visualisasi Data [PRO]
   - Asisten Analisis Statistik [PRO]
   - Generator Deskripsi Gambar [PRO]

5. **Finalisasi Standar Akademik**
   - AI to Human
   - Generator Abstrak Penelitian [PRO]
   - Generator Pertanyaan Sidang [PRO]
   - Konversi ke Artikel Ilmiah [PRO]

## Pricing Tiers
| Tier | Price | Features |
|------|-------|----------|
| BASIC | Rp 19.000/month | 7 AI tools |
| PRO | Rp 39.000/month (sale: Rp 19.000) | 40+ AI tools |
| PRO Researcher | Rp 49.000/month (sale: Rp 29.000) | 40+ AI tools + 10+ kelas |

## Architecture Note
- **AI tools = iframes pointing to Calmade AI**
- Each tool is a separate page with embedded Calmade AI
- No direct AI API calls from GipsyAI (outsource to Calmade)
- GipsyAI = frontend + auth + payment + iframe container

## Pending Tasks
1. Scrape remaining gipsyresearch.id pages
2. Update SPEC.md with iframe-based AI architecture
3. Build the AI tools pages as iframe containers
4. Set up Calmade AI integration for each tool
5. Build complete pricing/payment flow
6. Add all 40+ AI tools
7. UI check with browser screenshot

## Blockers
- Need Calmade AI endpoint/URL for iframes
