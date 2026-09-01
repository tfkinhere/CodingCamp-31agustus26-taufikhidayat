# Dashboard Produktivitas — Steering

## Deskripsi Proyek
Aplikasi web dashboard produktivitas yang dibangun dengan HTML, CSS, dan Vanilla JavaScript murni (tanpa framework). Digunakan sebagai halaman New Tab personal untuk mendukung produktivitas sehari-hari.

## Tech Stack
- **HTML** — struktur halaman
- **CSS** — styling dan tema (light/dark mode)
- **Vanilla JavaScript** — semua logika fitur
- **LocalStorage API** — penyimpanan data di sisi klien (tidak ada backend)

## Fitur Utama
1. **Greeting & Waktu** — jam real-time, tanggal bahasa Indonesia, sapa berdasarkan waktu, nama pengguna yang bisa dikustomisasi
2. **Focus Timer** — timer 25 menit (Pomodoro) dengan tombol Mulai, Berhenti, dan Reset
3. **Daftar Tugas (To-Do List)** — tambah, edit, tandai selesai, hapus, cegah duplikat
4. **Tautan Favorit (Quick Links)** — simpan dan kelola link situs favorit
5. **Light / Dark Mode** — toggle tema dengan preferensi tersimpan

## Aturan Folder
- Hanya **1 file CSS** di dalam `css/`
- Hanya **1 file JavaScript** di dalam `js/`
- Kode harus bersih dan mudah dibaca

## Standar Kode
- Gunakan komentar JSDoc untuk semua fungsi
- Nama variabel dan fungsi dalam **Bahasa Indonesia** agar konsisten
- Hindari framework — semua harus Vanilla JS
- Semua data disimpan di LocalStorage dengan key prefix `dashboard_`
- Escape HTML sebelum render ke DOM untuk mencegah XSS

## Deployment
- Source code di GitHub Repository
- Website dipublikasikan via **GitHub Pages**
