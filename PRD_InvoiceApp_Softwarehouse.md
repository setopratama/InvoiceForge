# PRD — Invoice Application for Software House
**Codename:** `InvoiceForge`
**Version:** 1.0.0
**Format Dokumen:** Product Requirements Document
**Target Agent:** Antigravity AI Agent
**Tanggal:** 2026-05-04
**Status:** Ready for Implementation

---

## 1. Ringkasan Eksekutif

InvoiceForge adalah aplikasi manajemen invoice untuk perusahaan software house berbasis layanan (service-based). Aplikasi berjalan di atas stack **Astro JS (Frontend) + Hono.js (Backend API, Node.js runtime)** dengan penyimpanan data lokal menggunakan file JSON. Tampilan dirancang dengan estetika **minimalis industrial** — latar belakang putih, tipografi tebal, aksen hitam dan abu-abu, tanpa ornamen dekoratif berlebihan.

---

## 2. Tujuan Produk

| # | Tujuan |
|---|--------|
| 1 | Memudahkan pembuatan dan pengelolaan invoice layanan software house |
| 2 | Menyediakan data master client dan penanggung jawab yang terintegrasi |
| 3 | Mendukung ekspor PDF invoice dengan format profesional |
| 4 | Memungkinkan duplikasi cepat (clone) invoice yang sudah ada |
| 5 | Berjalan offline-first tanpa ketergantungan database eksternal |

---

## 3. Stack Teknologi

### 3.1 Frontend
| Layer | Teknologi | Keterangan |
|-------|-----------|-----------|
| Framework | **Astro JS** v4+ | SSR + Island Architecture |
| UI Component | **Preact** (via Astro integration) | Ringan, reactive |
| Styling | **Tailwind CSS** v3 | Utility-first, konfigurasi custom industrial theme |
| PDF Export | **html2pdf.js** + **jsPDF** | Client-side rendering PDF |
| HTTP Client | **fetch** native | Komunikasi ke API |
| Icons | **Lucide Icons** | Konsisten, minimal |

### 3.2 Backend
| Layer | Teknologi | Keterangan |
|-------|-----------|-----------|
| Framework | **Hono.js** | Ultra-lightweight, Node.js runtime, TypeScript-first |
| Runtime | **Node.js** v20+ | Stable LTS |
| Data Storage | **JSON files** via `fs/promises` | Flat file, no external DB |
| Validator | **Zod** | Schema validation input/output |
| PDF Generation (server) | **Puppeteer** | Headless Chrome untuk PDF |
| CORS | **Hono CORS middleware** | Allow Astro dev origin |

### 3.3 Alasan Pemilihan Hono.js
- Sangat ringan (~13KB), startup cepat
- TypeScript native tanpa config tambahan
- API router intuitif mirip Express tapi lebih modern
- Compatible dengan Bun jika ingin upgrade runtime ke depan
- Middleware CORS, logger, validator tersedia built-in

---

## 4. Struktur Folder Proyek

```
invoiceforge/
├── frontend/                    # Astro JS App
│   ├── src/
│   │   ├── components/
│   │   │   ├── invoice/
│   │   │   │   ├── InvoiceForm.tsx
│   │   │   │   ├── InvoiceTable.tsx
│   │   │   │   ├── InvoicePreview.tsx
│   │   │   │   └── LineItemRow.tsx
│   │   │   ├── client/
│   │   │   │   ├── ClientForm.tsx
│   │   │   │   └── ClientTable.tsx
│   │   │   ├── pic/
│   │   │   │   ├── PICForm.tsx
│   │   │   │   └── PICTable.tsx
│   │   │   └── shared/
│   │   │       ├── Navbar.astro
│   │   │       ├── Sidebar.astro
│   │   │       ├── Modal.tsx
│   │   │       ├── Badge.astro
│   │   │       └── Button.astro
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro
│   │   ├── pages/
│   │   │   ├── index.astro              # Dashboard
│   │   │   ├── invoice/
│   │   │   │   ├── index.astro          # List Invoice
│   │   │   │   ├── create.astro         # Buat Invoice Baru
│   │   │   │   └── [id].astro           # Detail/Edit Invoice
│   │   │   ├── client/
│   │   │   │   └── index.astro          # Master Client
│   │   │   └── pic/
│   │   │       └── index.astro          # Master Penanggung Jawab
│   │   ├── styles/
│   │   │   └── global.css
│   │   └── lib/
│   │       ├── api.ts                   # API client wrapper
│   │       ├── pdf.ts                   # PDF export helpers
│   │       └── format.ts               # Currency, date formatters
│   ├── public/
│   │   └── logo.svg
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   └── package.json
│
├── backend/                     # Hono.js API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── invoice.ts
│   │   │   ├── client.ts
│   │   │   └── pic.ts
│   │   ├── services/
│   │   │   ├── invoice.service.ts
│   │   │   ├── client.service.ts
│   │   │   └── pic.service.ts
│   │   ├── schemas/
│   │   │   ├── invoice.schema.ts
│   │   │   ├── client.schema.ts
│   │   │   └── pic.schema.ts
│   │   ├── utils/
│   │   │   ├── storage.ts              # JSON read/write utility
│   │   │   ├── id.ts                   # ID generator
│   │   │   └── pdf.ts                  # Puppeteer PDF renderer
│   │   └── index.ts                    # Hono app entry point
│   ├── data/                           # JSON Storage
│   │   ├── invoices.json
│   │   ├── clients.json
│   │   └── pics.json
│   └── package.json
│
└── README.md
```

---

## 5. Desain Database (JSON Schema)

### 5.1 `clients.json`

```json
[
  {
    "id": "CLT-001",
    "name": "PT Maju Bersama Teknologi",
    "pic_id": "PIC-001",
    "email": "finance@majutech.co.id",
    "phone": "021-5551234",
    "address": "Jl. Sudirman No. 45, Jakarta Pusat",
    "npwp": "01.234.567.8-901.000",
    "type": "corporate",
    "created_at": "2026-01-10T08:00:00Z",
    "updated_at": "2026-01-10T08:00:00Z"
  }
]
```

**Field Keterangan:**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| `id` | string | ✅ | Format: `CLT-XXX` auto-generate |
| `name` | string | ✅ | Nama perusahaan/individu client |
| `pic_id` | string | ❌ | Ref ke `pics.json` — penanggung jawab dari sisi client |
| `email` | string | ✅ | Email billing |
| `phone` | string | ❌ | Nomor telepon |
| `address` | string | ✅ | Alamat lengkap |
| `npwp` | string | ❌ | Nomor NPWP untuk kebutuhan pajak |
| `type` | enum | ✅ | `corporate` \| `individual` |

---

### 5.2 `pics.json` (Penanggung Jawab)

```json
[
  {
    "id": "PIC-001",
    "name": "Budi Santoso",
    "role": "Project Manager",
    "email": "budi@internalsoftware.co.id",
    "phone": "0812-3456-7890",
    "department": "Delivery",
    "signature_path": null,
    "created_at": "2026-01-05T08:00:00Z",
    "updated_at": "2026-01-05T08:00:00Z"
  }
]
```

**Field Keterangan:**

| Field | Type | Required | Keterangan |
|-------|------|----------|-----------|
| `id` | string | ✅ | Format: `PIC-XXX` auto-generate |
| `name` | string | ✅ | Nama penanggung jawab internal |
| `role` | string | ✅ | Jabatan (PM, Sales, Director, dll.) |
| `email` | string | ✅ | Email internal |
| `phone` | string | ❌ | Nomor handphone |
| `department` | string | ❌ | Divisi/departemen |
| `signature_path` | string\|null | ❌ | Path file tanda tangan (future: upload) |

---

### 5.3 `invoices.json`

```json
[
  {
    "id": "INV-2026-001",
    "invoice_number": "INV/2026/05/001",
    "status": "draft",
    "client_id": "CLT-001",
    "pic_id": "PIC-001",
    "issue_date": "2026-05-04",
    "due_date": "2026-06-04",
    "payment_terms": 30,
    "currency": "IDR",
    "items": [
      {
        "id": "ITEM-001",
        "description": "Pengembangan Fitur Authentication & Authorization",
        "detail": "Implementasi JWT, RBAC, dan SSO integration",
        "quantity": 1,
        "unit": "paket",
        "unit_price": 15000000,
        "subtotal": 15000000
      },
      {
        "id": "ITEM-002",
        "description": "Pemeliharaan Sistem Bulanan",
        "detail": "Monitoring, bug fix, minor update — Mei 2026",
        "quantity": 1,
        "unit": "bulan",
        "unit_price": 5000000,
        "subtotal": 5000000
      }
    ],
    "subtotal": 20000000,
    "discount": {
      "type": "percentage",
      "value": 10,
      "amount": 2000000
    },
    "tax": {
      "ppn": 11,
      "amount": 1980000
    },
    "total": 19980000,
    "notes": "Pembayaran melalui transfer bank. Mohon mencantumkan nomor invoice.",
    "bank_info": {
      "bank_name": "BCA",
      "account_number": "1234567890",
      "account_name": "PT Software Kita"
    },
    "is_clone": false,
    "cloned_from": null,
    "created_at": "2026-05-04T08:00:00Z",
    "updated_at": "2026-05-04T08:00:00Z"
  }
]
```

**Field Status Invoice:**

| Status | Deskripsi |
|--------|-----------|
| `draft` | Sedang dibuat, belum dikirim |
| `sent` | Sudah dikirim ke client |
| `paid` | Sudah dibayar |
| `overdue` | Melewati due date, belum dibayar |
| `cancelled` | Dibatalkan |

---

## 6. Fitur Detail

### 6.1 Manajemen Invoice

#### 6.1.1 List Invoice
- Tabel invoice dengan kolom: Nomor Invoice, Client, Tanggal, Jatuh Tempo, Total, Status, Aksi
- Filter berdasarkan: Status, Client, Rentang Tanggal
- Search berdasarkan nomor invoice atau nama client
- Sort per kolom (ascending/descending)
- Badge warna per status (`draft` = abu, `sent` = biru, `paid` = hijau, `overdue` = merah, `cancelled` = hitam)
- Pagination: 10 item per halaman

#### 6.1.2 Buat Invoice Baru
- Form input dengan section:
  1. **Header Invoice** — nomor invoice (auto-generate, editable), tanggal terbit, jatuh tempo, terms
  2. **Pilih Client** — dropdown dari master client, tampilkan data client terisi otomatis
  3. **Pilih Penanggung Jawab** — dropdown dari master PIC
  4. **Line Items** — tambah/hapus baris jasa dengan:
     - Deskripsi layanan
     - Detail/keterangan tambahan
     - Quantity & Unit (paket, jam, bulan, dll.)
     - Harga satuan
     - Subtotal (auto-hitung)
  5. **Kalkulasi** — subtotal, diskon (nominal/%), PPN (opsional), total akhir
  6. **Informasi Bank** — nama bank, nomor rekening, nama pemilik
  7. **Catatan** — notes bebas untuk footer invoice
- Preview real-time di panel kanan (desktop) atau tab Preview (mobile)
- Simpan sebagai Draft atau langsung Set Status Sent

#### 6.1.3 Edit Invoice
- Semua field editable kecuali nomor invoice (readonly setelah `sent`)
- Warning dialog jika invoice sudah berstatus `sent` atau `paid`
- History perubahan tidak ditrack di v1.0 (future feature)

#### 6.1.4 Clone Invoice
- Tombol **"Clone"** di halaman detail atau list invoice
- Duplikat semua field invoice kecuali:
  - `id` dan `invoice_number` — di-generate ulang
  - `status` — reset ke `draft`
  - `issue_date` — set ke tanggal hari ini
  - `due_date` — dihitung ulang berdasarkan `payment_terms`
  - `is_clone: true`, `cloned_from: <original_id>`
- Redirect ke halaman edit invoice hasil clone
- Toast notifikasi: "Invoice berhasil di-clone"

#### 6.1.5 Ekspor PDF
- Tombol **"Export PDF"** di halaman detail invoice
- Dua metode:
  1. **Client-side** (default): html2pdf.js render dari preview HTML — cepat, tanpa server call
  2. **Server-side** (fallback): endpoint `/api/invoice/:id/pdf` menggunakan Puppeteer — untuk keperluan kualitas print lebih tinggi
- Format PDF invoice:
  - Ukuran kertas: **A4**
  - Header: Logo perusahaan + nama perusahaan + info kontak
  - Body: Data client, tabel line items, kalkulasi
  - Footer: Info bank, catatan, area tanda tangan PIC
  - Nomor halaman di footer
- Nama file: `INV-2026-05-001.pdf`

#### 6.1.6 Hapus Invoice
- Konfirmasi dialog sebelum hapus
- Invoice berstatus `paid` tidak bisa dihapus (hanya bisa cancel)
- Soft delete tidak diimplementasi di v1.0 — hard delete dari JSON

---

### 6.2 Master Client

- Halaman daftar client dengan tabel: Nama, Tipe, Email, NPWP, PIC Terkait, Aksi
- Form create/edit client:
  - Nama perusahaan/individu
  - Tipe: Corporate / Individual
  - Email, Telepon
  - Alamat lengkap
  - NPWP (opsional)
  - Pilih Penanggung Jawab (PIC) default dari master PIC
- Search & filter by tipe client
- Tidak bisa hapus client yang masih memiliki invoice aktif — tampilkan pesan error

---

### 6.3 Master Penanggung Jawab (PIC)

- Halaman daftar PIC dengan tabel: Nama, Jabatan, Departemen, Email, Aksi
- Form create/edit PIC:
  - Nama lengkap
  - Jabatan/Role
  - Departemen
  - Email & Telepon
  - Upload tanda tangan (opsional — simpan sebagai base64 atau path relatif)
- PIC digunakan sebagai person-in-charge dari sisi **internal perusahaan** pada invoice
- Tidak bisa hapus PIC yang masih di-assign ke invoice atau client

---

## 7. Desain UI/UX

### 7.1 Tema Minimalis Industrial

**Prinsip Desain:**
- Background utama: `#FFFFFF` (putih bersih)
- Surface card: `#F5F5F4` (warm white / stone-50)
- Border: `#D6D3D1` (stone-300) — thin 1px
- Aksen utama: `#1C1917` (stone-900, near-black)
- Aksen sekunder: `#78716C` (stone-500, medium gray)
- Status color palette: minimal, flat (tidak glossy)
- Tidak ada shadow berat — hanya `shadow-sm` atau `box-shadow: 0 1px 2px rgba(0,0,0,0.06)`

**Tipografi:**
- Font utama: `Inter` (via Google Fonts atau Fontsource)
- Font invoice/print: `IBM Plex Mono` untuk nomor/angka, `Inter` untuk teks
- Heading: weight 600–700
- Body: weight 400
- Label form: uppercase tracking-wider, size xs

**Komponen UI Industrial:**
- Button: rectangular (no border-radius atau radius kecil `rounded-sm`), border 1px solid
- Input: flat, border bottom only atau full border tipis
- Table: header uppercase, row divider tipis, hover state `bg-stone-50`
- Badge status: flat background, no border-radius besar
- Sidebar: lebar 240px, background `#FAFAF9`, border-right

### 7.2 Layout Halaman

**Struktur Global:**
```
┌─────────────────────────────────┐
│         Top Navbar              │
├──────────┬──────────────────────┤
│          │                      │
│ Sidebar  │   Main Content Area  │
│  (240px) │                      │
│          │                      │
└──────────┴──────────────────────┘
```

**Halaman Invoice Form (Desktop):**
```
┌──────────────────────┬──────────────────┐
│   Form Input         │  Preview Invoice  │
│   (60%)              │  (40%)            │
└──────────────────────┴──────────────────┘
```

**Invoice Preview Template (untuk PDF):**
```
┌─────────────────────────────────────────┐
│  [LOGO]   Nama Perusahaan               │
│           Alamat | Email | Telp          │
├─────────────────────────────────────────┤
│  INVOICE                                │
│  No: INV/2026/05/001                    │
│  Tanggal: 4 Mei 2026                    │
│  Jatuh Tempo: 4 Juni 2026               │
├──────────────────┬──────────────────────┤
│  Kepada:         │  Penanggung Jawab:   │
│  PT Client       │  Budi Santoso        │
│  Alamat...       │  Project Manager     │
├─────────────────────────────────────────┤
│  No │ Deskripsi    │ Qty │ Harga │ Sub  │
│   1 │ Auth Dev     │  1  │  15jt │ 15jt │
│   2 │ Maintenance  │  1  │   5jt │  5jt │
├─────────────────────────────────────────┤
│                   Subtotal: Rp 20.000.000│
│                   Diskon (10%): (2.000.000)│
│                   PPN 11%: 1.980.000    │
│                   TOTAL: Rp 19.980.000  │
├─────────────────────────────────────────┤
│  Pembayaran ke:                         │
│  BCA - 1234567890 - PT Software Kita    │
│                                         │
│  Catatan: ...                           │
├─────────────────────────────────────────┤
│  Tanda Tangan PIC:                      │
│  Budi Santoso                           │
└─────────────────────────────────────────┘
```

---

## 8. API Specification (Hono.js)

### 8.1 Base URL
```
Development: http://localhost:3001/api
```

### 8.2 Invoice Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/invoices` | List semua invoice + filter/sort query |
| `GET` | `/api/invoices/:id` | Detail satu invoice |
| `POST` | `/api/invoices` | Buat invoice baru |
| `PUT` | `/api/invoices/:id` | Update invoice |
| `DELETE` | `/api/invoices/:id` | Hapus invoice |
| `POST` | `/api/invoices/:id/clone` | Clone invoice |
| `GET` | `/api/invoices/:id/pdf` | Generate PDF (Puppeteer) |
| `PATCH` | `/api/invoices/:id/status` | Update status saja |

**Query Params `GET /api/invoices`:**
```
?status=draft|sent|paid|overdue|cancelled
?client_id=CLT-001
?date_from=2026-01-01
?date_to=2026-05-31
?search=INV/2026
?sort_by=issue_date|due_date|total
?sort_dir=asc|desc
?page=1&limit=10
```

**Request Body `POST /api/invoices`:**
```json
{
  "client_id": "CLT-001",
  "pic_id": "PIC-001",
  "issue_date": "2026-05-04",
  "due_date": "2026-06-04",
  "payment_terms": 30,
  "currency": "IDR",
  "items": [
    {
      "description": "Pengembangan Fitur Authentication",
      "detail": "JWT, RBAC, SSO",
      "quantity": 1,
      "unit": "paket",
      "unit_price": 15000000
    }
  ],
  "discount": { "type": "percentage", "value": 10 },
  "tax": { "ppn": 11 },
  "notes": "Mohon transfer ke rekening berikut...",
  "bank_info": {
    "bank_name": "BCA",
    "account_number": "1234567890",
    "account_name": "PT Software Kita"
  }
}
```

**Response Wrapper:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Invoice berhasil dibuat",
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "total_pages": 5
  }
}
```

---

### 8.3 Client Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/clients` | List semua client |
| `GET` | `/api/clients/:id` | Detail client |
| `POST` | `/api/clients` | Buat client baru |
| `PUT` | `/api/clients/:id` | Update client |
| `DELETE` | `/api/clients/:id` | Hapus client (validasi invoice) |

---

### 8.4 PIC Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/pics` | List semua PIC |
| `GET` | `/api/pics/:id` | Detail PIC |
| `POST` | `/api/pics` | Buat PIC baru |
| `PUT` | `/api/pics/:id` | Update PIC |
| `DELETE` | `/api/pics/:id` | Hapus PIC (validasi assignment) |

---

## 9. Nomor Invoice Auto-Generate

Format: `INV/YYYY/MM/SEQ`

Contoh: `INV/2026/05/001`

**Logika:**
1. Baca semua invoice dari `invoices.json`
2. Filter invoice dengan prefix bulan/tahun yang sama
3. Ambil sequence tertinggi, increment +1
4. Pad dengan leading zeros 3 digit (001, 002, ..., 099, 100)
5. Return nomor invoice baru

**Implementasi di `id.ts`:**
```typescript
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  // ... read existing invoices, find max seq for this month/year
  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `INV/${year}/${month}/${nextSeq}`;
}
```

---

## 10. Format Nomor & Currency

- **Format uang:** Rupiah dengan separator titik — `Rp 19.980.000`
- **Format tanggal display:** `4 Mei 2026` (Indonesia locale)
- **Format tanggal storage:** ISO 8601 — `2026-05-04`
- **Unit default tersedia:** `paket`, `jam`, `hari`, `minggu`, `bulan`, `lisensi`, `unit`

---

## 11. Validasi & Business Rules

| Rule | Keterangan |
|------|-----------|
| Invoice wajib memiliki minimal 1 line item | Validasi di form dan API |
| `due_date` harus setelah `issue_date` | Validasi Zod |
| Client tidak bisa dihapus jika ada invoice aktif | Cek di service sebelum delete |
| PIC tidak bisa dihapus jika di-assign ke invoice atau client | Cek di service sebelum delete |
| Invoice `paid` tidak bisa dihapus (hanya cancel) | Guard di endpoint DELETE |
| Invoice `paid` atau `cancelled` tidak bisa diedit | Warning + disable form |
| Diskon maksimum 100% | Validasi Zod |
| Total invoice tidak boleh negatif | Business logic di kalkulasi |

---

## 12. Error Handling

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice dengan ID tersebut tidak ditemukan",
    "details": null
  }
}
```

**Error Codes:**

| Code | HTTP | Keterangan |
|------|------|-----------|
| `INVOICE_NOT_FOUND` | 404 | Invoice tidak ditemukan |
| `CLIENT_NOT_FOUND` | 404 | Client tidak ditemukan |
| `PIC_NOT_FOUND` | 404 | PIC tidak ditemukan |
| `VALIDATION_ERROR` | 400 | Input tidak valid (Zod error) |
| `CLIENT_HAS_INVOICES` | 409 | Client tidak bisa dihapus |
| `PIC_IS_ASSIGNED` | 409 | PIC tidak bisa dihapus |
| `INVOICE_IMMUTABLE` | 403 | Invoice tidak bisa diedit |
| `PDF_GENERATION_FAILED` | 500 | Gagal generate PDF |
| `STORAGE_ERROR` | 500 | Gagal baca/tulis JSON |

---

## 13. Konfigurasi & Environment

**`backend/.env`:**
```env
PORT=3001
DATA_DIR=./data
FRONTEND_URL=http://localhost:4321
COMPANY_NAME=PT Software Kita
COMPANY_ADDRESS=Jl. Contoh No. 1, Jakarta
COMPANY_EMAIL=invoice@softwarekita.co.id
COMPANY_PHONE=021-12345678
COMPANY_NPWP=01.234.567.8-901.000
DEFAULT_BANK_NAME=BCA
DEFAULT_BANK_ACCOUNT=1234567890
DEFAULT_BANK_ACCOUNT_NAME=PT Software Kita
DEFAULT_PPN=11
LOGO_PATH=./assets/logo.png
```

**`frontend/.env`:**
```env
PUBLIC_API_URL=http://localhost:3001/api
PUBLIC_COMPANY_NAME=PT Software Kita
```

---

## 14. Komponen Preact Kunci

### 14.1 `InvoiceForm.tsx`
- State management: `useState` untuk tiap section form
- `useEffect` untuk auto-hitung subtotal saat items berubah
- Debounced preview update (300ms)

### 14.2 `LineItemRow.tsx`
- Props: `item`, `onUpdate`, `onDelete`
- Input: description, detail, qty, unit, unit_price
- Auto-hitung subtotal = qty × unit_price

### 14.3 `InvoicePreview.tsx`
- Terima `invoiceData` sebagai props
- Render template invoice HTML yang sama dengan yang di-export ke PDF
- Zoom control untuk mobile

---

## 15. Panduan Implementasi untuk Antigravity Agent

### Urutan Pengerjaan yang Disarankan:

```
FASE 1 — Backend Core (prioritas pertama)
  [1] Setup project Hono.js + TypeScript
  [2] Buat utility storage.ts (JSON read/write)
  [3] Buat utility id.ts (ID & invoice number generator)
  [4] Implementasi CRUD Client (/api/clients)
  [5] Implementasi CRUD PIC (/api/pics)
  [6] Implementasi CRUD Invoice (/api/invoices)
  [7] Implementasi Clone Invoice
  [8] Implementasi PDF endpoint (Puppeteer)
  [9] Setup seed data (clients.json, pics.json, invoices.json contoh)

FASE 2 — Frontend Core
  [10] Setup Astro JS + Tailwind + Preact
  [11] Base layout, Sidebar, Navbar
  [12] Halaman Master Client (list + form)
  [13] Halaman Master PIC (list + form)
  [14] Halaman List Invoice + filter/search
  [15] Form buat/edit Invoice dengan LineItems
  [16] Invoice Preview component (HTML template)
  [17] Clone invoice flow
  [18] Export PDF (client-side html2pdf.js)

FASE 3 — Polish & QA
  [19] Loading states, error states, empty states
  [20] Toast notifications
  [21] Responsive mobile layout
  [22] Validasi form frontend
  [23] Edge case testing (delete client dengan invoice, etc.)
```

### Perintah Setup Awal:

```bash
# Backend
mkdir invoiceforge && cd invoiceforge
mkdir backend && cd backend
npm init -y
npm install hono @hono/node-server zod
npm install -D typescript @types/node tsx
mkdir -p src/{routes,services,schemas,utils} data

# Frontend
cd ..
npm create astro@latest frontend -- --template minimal
cd frontend
npx astro add tailwind preact
npm install lucide-preact html2pdf.js
```

---

## 16. Catatan Tambahan

1. **Backup data:** Karena storage JSON, rekomendasikan agent tambahkan `data/backups/` dan simpan backup otomatis sebelum operasi DELETE.
2. **Logo perusahaan:** Simpan di `backend/assets/logo.png` — digunakan oleh Puppeteer PDF dan Astro (via API endpoint `/api/company/logo`).
3. **Print CSS:** Tambahkan `@media print` di global.css untuk mendukung Ctrl+P langsung dari browser sebagai alternatif PDF export.
4. **Timezone:** Gunakan `Asia/Jakarta` (WIB) untuk semua operasi tanggal.
5. **Encoding JSON:** Pastikan semua file JSON di-write dengan `utf-8` untuk mendukung karakter Indonesia (é, nama dengan huruf khusus, dsb.).
6. **Concurrent write:** Di v1.0 tidak perlu implementasi file locking — asumsi single user. Jika multi-user, upgrade ke SQLite.

---

## 17. Kriteria Penerimaan (Acceptance Criteria)

| Fitur | Kriteria |
|-------|----------|
| Buat Invoice | Invoice tersimpan di JSON, nomor auto-generate sequential, semua field wajib tervalidasi |
| Edit Invoice | Perubahan tersimpan, invoice `paid`/`cancelled` tidak bisa diedit |
| Clone Invoice | Invoice baru terbuat dengan data copied, status reset ke draft, nomor baru |
| Export PDF | File PDF ter-download dengan nama yang benar, layout A4 sesuai template |
| Master Client | CRUD berjalan, tidak bisa hapus jika ada invoice |
| Master PIC | CRUD berjalan, tidak bisa hapus jika di-assign |
| Filter Invoice | Filter by status, client, tanggal berjalan independen dan dapat dikombinasikan |
| Responsif | Dapat digunakan di layar 1280px+ (desktop) dan 768px (tablet) |

---

*PRD ini dibuat untuk Antigravity AI Agent. Implementasi mengikuti urutan fase yang tertera. Semua keputusan teknis di luar scope PRD ini didelegasikan ke agent.*

---

**End of Document**
*InvoiceForge PRD v1.0.0 — 2026-05-04*
