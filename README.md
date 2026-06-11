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

Kalau mengubah file `.jsx`, rebuild bundle browser sebelum dipakai siswa:

```bash
node scripts/build-jsx-bundle.js
```

File produksi yang dimuat browser adalah `js/bundle/app.bundle.js`.

---

## Struktur Folder

```
sigma/
├── index.html              ← entry point
├── css/tokens.css          ← design system (warna, font, shadows)
├── assets/                 ← logo Labschool, MAJU, Pemuda Juara
├── js/
│   ├── data/curriculum.js  ← 18 modul Informatika + 18 modul KKA/AI + 6 lab + 6 gim
│   ├── components/         ← Icon set, Navbar, Footer, ModuleCard
│   ├── pages/              ← Landing, Dashboard, Catalog, Module, Playground
│   ├── labs/               ← 6 Lab Maya interaktif
│   ├── games/games.jsx     ← 6 Gim Edukasi
│   ├── bundle/app.bundle.js ← bundle produksi hasil build JSX
│   ├── vendor/             ← React/ReactDOM/Babel lokal
│   └── app.jsx             ← Router
└── scripts/
    └── build-jsx-bundle.js ← build JSX menjadi bundle browser
```

---

## Isi Konten

### Modul Pembelajaran
- **Informatika:** 18 modul aktif (6 per kelas), sesuai acuan folder "MODUL PEMBELAJARAN 2627".
- **KKA/AI:** 18 modul aktif (6 per kelas), konten disesuaikan dari dokumen kurikulum KKA resmi.
- **Kelas 7 Informatika:** BK Dasar, Komputer dan Cara Kerjanya, Jaringan Komputer dan Internet, Mesin Pencari dan Kualitas Informasi, Fakta/Opini/Hoaks/Media Digital, Ruang Publik Virtual dan Etika Digital.
- **Kelas 7 KKA:** Pengelolaan Data & BK Dasar, Pemecahan Masalah Sistematis & Instruksi, Konten Digital Dasar: Slide & Infografis, Etika Digital & Diseminasi Konten, Literasi & Etika Kecerdasan Artifisial, Pemanfaatan KA Sederhana.
- **Kelas 8 Informatika:** Himpunan Data Terstruktur I-II, Lembar Kerja Pengolah Data, Dokumen dan Presentasi, Produksi Konten Digital, Keamanan Digital.
- **Kelas 8 KKA:** Pengolahan Data dengan Spreadsheet, Instruksi Kompleks & Pemrograman Visual, Produksi Konten Audio & Video, Etika/Hak Cipta & Diseminasi Konten, Literasi & Etika Kecerdasan Artifisial, Eksperimen Data Latih & Klasifikasi KA.
- **Kelas 9 Informatika:** Python Lanjutan, Pseudocode dan Visual Programming, Rekam Jejak Digital dan Perundungan Siber, Identitas dan Data Pribadi, Mindfulness Digital, Projek Akhir Integrasi Fase D.
- **Kelas 9 KKA:** Spreadsheet & Analisis Data Lanjutan, Algoritma & Program Visual Lanjutan, Produksi Konten Digital Lanjutan, Strategi Diseminasi & Advokasi Literasi Digital, Literasi KA: Keamanan Data & DeepFake, Proyek Akhir Fase D.

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
| `#/guru` | Dashboard guru |
| `#/kelas/7` `#/kelas/8` `#/kelas/9` | Katalog per kelas |
| `#/modul/:id` | Detail modul (contoh: `#/modul/inf8-2`) |
| `#/playground` | Python editor + 5 tantangan |
| `#/lab/:id` | Lab individual, dibuka dari Misi |
| `#/gim/:id` | Gim individual, dibuka dari Misi |

---

## Status Pengembangan

Ini **versi 1.0 menuju siap dipakai siswa**. Yang sudah jalan:
- ✅ Routing hash-based (semua halaman navigasi)
- ✅ Simulasi login lokal dengan beberapa profil siswa
- ✅ Progress modul, XP, dan badge tersimpan di `localStorage`
- ✅ Bundle browser lokal tanpa CDN runtime untuk React/Babel
- ✅ 6 lab + 6 gim fully playable
- ✅ Python simulator (subset: print, for, if/else, list, sum, len, +, -, *, /, %, //)
- ✅ AI Tutor dengan fallback simulator

Yang belum:
- ◐ Autentikasi Supabase tahap awal untuk siswa/guru
- ◐ Backend cloud untuk profil dan progres belajar siswa
- ✅ Dashboard Guru lintas perangkat jika login sebagai guru Supabase
- ❌ QA visual final di perangkat siswa sebelum 5 Juni

---

## Customisasi

### Ganti / reset data siswa lokal
Buka `#/login` untuk memilih profil, membuat siswa baru, atau reset data lokal. Data siswa tersimpan di `localStorage` perangkat/browser yang dipakai.

### Integrasi Supabase tahap 1
Konten modul tetap statis di `js/data/curriculum.js` dan `js/data/quiz-bank-v2.js`. Supabase hanya dipakai untuk login, profil siswa, progres, refleksi, misi, kuis, XP, badge, lab, gim, dan dashboard guru.

1. Jalankan SQL di `supabase/schema.sql` pada SQL Editor Supabase.
2. Isi `url` dan `anonKey` di `js/data/supabase.js`.
3. Deploy Edge Functions yang dipakai dashboard guru:

```bash
supabase functions deploy create-students
supabase functions deploy reset-student-password
supabase functions deploy delete-student
```

4. Buat akun siswa dari halaman `#/login`, atau login jika akun sudah ada.
5. Untuk akun guru, daftar dulu lewat `#/login`, lalu ubah row `sigma_profiles.role` akun tersebut menjadi `teacher` lewat SQL Editor. Setelah login ulang, dashboard `#/guru` bisa membaca profil siswa lintas perangkat.

Mode lokal tetap tersedia sebagai fallback jika Supabase belum dikonfigurasi.

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
