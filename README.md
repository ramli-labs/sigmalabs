# SIGMA Labschool

**Media Pembelajaran Interaktif — Informatika & Koding & Kecerdasan Artifisial**
SMP Labschool Jakarta • Kelas 7, 8, 9

---

## Cara Menjalankan

Buka terminal di dalam folder `sigma/`, lalu:

```bash
python3 -m http.server 8000
```

Atau kalau punya Node:

```bash
npx serve
```

Lalu buka: **http://localhost:8000**

> ⚠️ Jangan buka `index.html` langsung (double-click file). Browser akan blokir script karena CORS. Harus pakai HTTP server.

---

## Struktur Folder

```
sigma/
├── index.html              ← entry point
├── css/tokens.css          ← design system (warna, font, shadows)
├── assets/                 ← logo Labschool, MAJU, Pemuda Juara
├── js/
│   ├── data/curriculum.js  ← 18 modul Informatika + 18 slot KKA/AI + 6 lab + 6 gim
│   ├── components/         ← Icon set, Navbar, Footer, ModuleCard
│   ├── pages/              ← Landing, Dashboard, Catalog, Module, Playground
│   ├── labs/               ← 6 Lab Maya interaktif
│   ├── games/games.jsx     ← 6 Gim Edukasi
│   └── app.jsx             ← Router
```

---

## Isi Konten

### Modul Pembelajaran
- **Informatika:** 18 modul aktif sesuai acuan folder "MODUL PEMBELAJARAN 2627" (6 modul per kelas).
- **KKA/AI:** 18 slot modul disiapkan sebagai placeholder sampai modul final selesai.
- **Kelas 7 Informatika:** BK Dasar, Komputer dan Cara Kerjanya, Jaringan Komputer dan Internet, Mesin Pencari dan Kualitas Informasi, Fakta/Opini/Hoaks/Media Digital, Ruang Publik Virtual dan Etika Digital.
- **Kelas 8 Informatika:** Himpunan Data Terstruktur I-II, Lembar Kerja Pengolah Data, Dokumen dan Presentasi, Produksi Konten Digital, Keamanan Digital.
- **Kelas 9 Informatika:** Penerapan BK dan Data Terstruktur, Pseudocode dan Visual Programming, Rekam Jejak Digital dan Perundungan Siber, Identitas dan Data Pribadi, Mindfulness Digital, Projek Akhir Integrasi Fase D.

Setiap modul punya 4 tab: **Materi**, **Misi**, **Kuis** (interaktif, auto-grade), **AI Tutor** (chat — pakai `window.claude.complete` kalau ada, fallback ke simulator).

### Aktivitas Misi
Lab dan gim tidak ditampilkan sebagai menu utama. Keduanya muncul kontekstual di tab **Misi** sesuai pelajaran.

**6 Lab Maya**
1. **Visualisasi Sorting** — Bubble/Selection/Insertion/Quick, dengan animasi bar
2. **Laboratorium Biner** — toggle 8 bit, konversi ke desimal & hex + challenge
3. **Gerbang Logika** — AND/OR/NOT/XOR/NAND/NOR dengan SVG circuit interaktif
4. **Neural Playground** — perceptron yang belajar AND/OR/XOR real-time
5. **AI Image Classifier** — gambar di canvas, AI tebak bentuk
6. **Simulasi Jaringan** — animasi paket data laptop → router → ISP → server

**6 Gim Edukasi**
1. **Bug Hunter** — temukan baris kode yang ada bug
2. **Balap Sorting** — drag & drop urutkan angka
3. **Pemecah Kode Caesar** — dekripsi pesan terenkripsi
4. **Dilema Etika AI** — skenario bercabang (self-driving car, hiring AI, deepfake, surveillance)
5. **Tebak Pola AI** — pattern recognition melawan waktu
6. **Biner Typing** — konversi desimal ke biner dalam 60 detik

---

## Rute Halaman

| URL | Halaman |
|---|---|
| `#/` | Landing |
| `#/login` | Simulasi login siswa lokal |
| `#/dashboard` | Dashboard siswa |
| `#/kelas/7` `#/kelas/8` `#/kelas/9` | Katalog per kelas |
| `#/modul/:id` | Detail modul (contoh: `#/modul/inf8-2`) |
| `#/playground` | Python editor + 5 tantangan |
| `#/lab/:id` | Lab individual, dibuka dari Misi |
| `#/gim/:id` | Gim individual, dibuka dari Misi |

---

## Status Pengembangan

Ini **versi 1.0 dari prototype fungsional** — belum versi produksi. Yang sudah jalan:
- ✅ Routing hash-based (semua halaman navigasi)
- ✅ Simulasi login lokal dengan beberapa profil siswa
- ✅ Progress modul, XP, dan badge demo tersimpan di `localStorage`
- ✅ 6 lab + 6 gim fully playable
- ✅ Python simulator (subset: print, for, if/else, list, sum, len, +, -, *, /, %, //)
- ✅ AI Tutor dengan fallback simulator

Yang belum:
- ❌ Autentikasi real berbasis server
- ❌ Backend cloud untuk sinkronisasi antar perangkat
- ❌ Dashboard Guru (variant di design asli belum di-port)
- ❌ Mobile-responsive optimal (layout desktop-first)

---

## Customisasi

### Ganti / reset data user demo
Buka `#/login` untuk memilih profil, membuat siswa baru, atau reset data demo. Data simulasi disimpan di `localStorage`.

### Tambah modul baru
Edit `window.CURRICULUM.modules` di file yang sama — tambahkan object dengan `id`, `subject`, `level`, `unit`, `title`, dll.

### Ganti warna brand
Edit `css/tokens.css` — semua pakai CSS variable (`--navy-950`, `--gold-400`, dll).

### Ganti font
Edit `<link href="...">` di `index.html` dan `--font-display` / `--font-sans` di `tokens.css`.

---

## Kredits

Design system asli: tim RJM Design Canvas
Implementasi fungsional: SIGMA Labschool platform build (2026)
