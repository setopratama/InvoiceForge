# Changelog

## v1.0.0 (2026-07-06)

### Added
- **Dashboard** — overview finansial: total invoiced, paid, pending, active clients
- **Invoice Management** — create, edit, clone, delete, status (draft/sent/paid/overdue/cancelled)
- **PDF Export** — export invoice ke PDF via html2pdf.js
- **Client Master Data** — CRUD clients, filter by type (corporate/individual)
- **PIC Internal Master Data** — CRUD PIC, upload signature
- **Multi-Company** — kelola banyak perusahaan dengan bank info masing-masing, pilih perusahaan di invoice
- **Settings** — konfigurasi PPN, mata uang, identitas perusahaan default, bank info default
- **Invoice Filter** — filter by status, client, search by invoice number
- **Auto-Save Draft** — draft invoice tersimpan otomatis
- **Clone Invoice** — duplikasi invoice yang sudah ada
- **Error Logging** — frontend error logger ke backend

### Tech Stack
- **Backend:** Hono.js + Zod + TypeScript (ESM)
- **Frontend:** Astro (SSR) + Preact + Tailwind CSS v4
- **Storage:** JSON flat-file (no database required)
- **PDF:** html2pdf.js
- **Icons:** Lucide Preact
