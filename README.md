# InvoiceForge ⚒️

InvoiceForge adalah aplikasi manajemen invoice minimalis industrial yang dirancang khusus untuk software house. Dibangun dengan fokus pada kecepatan, kemudahan penggunaan, dan estetika yang bersih.

## 🚀 Fitur Utama

- **Dashboard Finansial**: Pantau total invoice, pembayaran masuk, dan piutang secara real-time.
- **Invoice Editor & Preview**: Edit invoice dan lihat preview-nya secara instan sebelum diekspor.
- **Export PDF**: Unduh invoice dalam format PDF profesional langsung dari browser.
- **Master Data**: Kelola database Client dan PIC (Penanggung Jawab) internal dengan mudah.
- **Multi-Company**: Kelola banyak perusahaan beserta data bank masing-masing dan pilih perusahaan saat buat invoice.
- **Sistem Clone**: Duplikasi invoice yang sudah ada untuk mempercepat proses pembuatan.
- **Industrial Design**: Antarmuka bersih dengan palet warna *stone* dan tipografi teknis yang premium.
- **Version & Changelog Page**: Navigasi versi interaktif langsung dari aplikasi.

## 🛠️ Stack Teknologi

- **Frontend**: Astro JS, Preact, Tailwind CSS, Lucide Icons.
- **Backend**: Hono.js (Node.js runtime), Zod Validation.
- **Storage**: Local JSON Flat-file (No external DB required).
- **PDF Export**: html2pdf.js.

## 🏁 Cara Menjalankan Aplikasi

Aplikasi ini terdiri dari dua bagian: **Backend API** dan **Frontend Web**.

### 1. Persiapan Awal
Pastikan Anda sudah menginstal Node.js (versi 20 atau terbaru).

### 2. Menjalankan Backend
Backend menangani penyimpanan data dan logika bisnis.
```bash
cd backend
npm install
npm run dev
```
Backend akan berjalan di `http://localhost:3001`.

### 3. Menjalankan Frontend
Frontend adalah antarmuka pengguna aplikasi.
```bash
cd frontend
npm install
npm run dev
```
Frontend akan berjalan di `http://localhost:4321`.

### 4. Menyalankan Keduanya Sekaligus (Rekomendasi)
Anda dapat menyalakan backend dan frontend secara bersamaan dari direktori root:
```bash
npm install
npm run dev
```
Ini akan menjalankan kedua server secara paralel menggunakan `concurrently`.

### 5. Menyalankan via Docker Compose
Alternatifnya, Anda dapat menjalankan aplikasi dalam container Docker secara instan tanpa perlu menginstal dependensi Node.js secara lokal:
```bash
# Build dan jalankan container
docker compose up --build -d

# Stop container
docker compose down
```
Setelah container berjalan, aplikasi dapat diakses di:
- **Frontend Web**: `http://localhost:4322`
- **Backend API**: `http://localhost:3002`

---

## 📂 Struktur Proyek

```text
invoiceforge/
├── backend/             # Hono.js API & JSON Data
│   ├── data/            # Lokasi penyimpanan file .json
│   └── src/             # Source code API
├── frontend/            # Astro JS Application
│   ├── src/
│   │   ├── components/  # Komponen UI (Preact)
│   │   ├── pages/       # Rute halaman aplikasi
│   │   └── lib/         # API Client & Utilities
└── README.md            # Dokumentasi ini
```

## 📝 Catatan Penting

- Aplikasi ini menggunakan penyimpanan file JSON lokal. Jika Anda ingin melakukan backup, cukup salin isi folder `backend/data/`.
- Pengaturan identitas perusahaan dapat diubah melalui file `.env` di folder `backend`.

---
*InvoiceForge v1.0.0 — Dibuat untuk Efisiensi Software House.*
