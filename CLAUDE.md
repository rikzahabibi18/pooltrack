# PoolTrack — Sistem Manajemen Unit Aset di Pool

Project technical challenge (CRUD dashboard) untuk proses rekrutmen.
**Deadline: Senin, 19 Oktober 2026.**

Baca juga sebelum mengerjakan apa pun:
- `docs/01-studi-kasus.md` — latar belakang, masalah, scope, aturan bisnis
- `docs/02-workflow-database.md` — workflow, ERD, detail tabel, cara implementasi aturan bisnis

---

## Cara bekerja dengan saya (developer)

- Komunikasi pakai **Bahasa Indonesia santai**.
- Saya lebih kuat di **frontend** daripada backend. Setiap selesai satu tahap (terutama backend),
  **jelaskan singkat apa yang dibuat dan kenapa**, karena saya harus bisa mempresentasikan
  dan menjawab pertanyaan tech lead tentang setiap bagian kode.
- Kerjakan **bertahap sesuai Roadmap** di bawah, jangan lompat. Centang checklist setelah selesai.
- Prioritas: **simple tapi kuat**. Fitur sedikit tapi rapi, konsisten, tanpa bug. Jangan menambah fitur di luar scope tanpa bertanya.
- Pakai pola yang standar dan mudah dijelaskan. Hindari trik atau abstraksi berlebihan.

---

## Tech Stack (sudah diputuskan)

| Bagian | Pilihan |
|---|---|
| Database | **MariaDB** |
| Backend | **Node.js + Express (JavaScript, ES Modules)** |
| Query/Migration | **Knex** + driver `mysql2` (migrations + seeds) |
| Validasi BE | **Zod** |
| Frontend | **React + TypeScript + Vite** |
| UI | **Tailwind CSS + shadcn/ui**, ikon `lucide-react` |
| Data fetching | **TanStack Query** + **axios** (satu instance, baseURL dari env) |
| Form | **React Hook Form + Zod** |
| Routing | **React Router** |
| Grafik | **Recharts** |
| Notifikasi | `sonner` (toast) |
| Container | **Docker Compose** — hanya MariaDB untuk development (Docker penuh dilewati, lihat Tahap 8) |
| Deploy | FE → **Vercel**, BE + MariaDB → **Railway** |

---

## Struktur Repo

```
pooltrack/
├── CLAUDE.md
├── README.md
├── docker-compose.yml
├── docs/
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── knexfile.js
│   └── src/
│       ├── app.js / server.js
│       ├── config/          # baca & validasi env (gagal start kalau env kurang)
│       ├── constants/       # kode status stabil, default pagination, dll (SATU tempat)
│       ├── database/
│       │   ├── migrations/
│       │   └── seeds/
│       ├── modules/
│       │   └── <fitur>/     # <fitur>.routes.js, .controller.js, .service.js, .repository.js, .schema.js
│       ├── middlewares/     # errorHandler, notFound, validate
│       └── utils/           # response helper, pagination helper, AppError
└── frontend/
    ├── .env.example
    ├── Dockerfile + nginx.conf
    └── src/
        ├── app/             # router, providers, layout
        ├── components/ui/   # shadcn
        ├── components/      # komponen shared (DataTable, PageHeader, StatusBadge, ConfirmDialog, EmptyState)
        ├── config/          # menu sidebar, konstanta UI
        ├── features/
        │   └── <fitur>/     # api.ts, hooks.ts, types.ts, schema.ts, components/, pages/
        └── lib/             # axios instance, utils, query client
```

Arsitektur backend berlapis: **route → controller → service → repository**.
- Controller: hanya urus req/res.
- Service: semua aturan bisnis + transaction.
- Repository: hanya query Knex.

---

## Aturan "TANPA HARDCODE" (wajib)

1. Semua kredensial, port, URL, CORS origin dari `.env`. Sediakan `.env.example` di BE & FE. FE pakai `VITE_API_URL`.
2. Data master & referensi (mitra, pool, jenis kendaraan, status unit, grade inspeksi) **ada di database**, diisi lewat **seeder**. FE **tidak boleh** punya array statis untuk dropdown — ambil dari API.
3. Label, urutan, dan warna badge status berasal dari tabel `unit_statuses`.
4. Statistik dashboard dihitung backend (`/api/dashboard/summary`), bukan angka dummy.
5. Kode status (`MASUK`, `DIINSPEKSI`, `SIAP_JUAL`, `KELUAR`) boleh dipakai di kode **hanya** sebagai konstanta terpusat di `backend/src/constants/`. Logika urutan memakai kolom `sequence`, logika kapasitas memakai kolom `counts_toward_capacity`.
6. Magic number (page size default, max limit, dll) → file konstanta/config.
7. Menu sidebar & route didefinisikan di satu config di FE.

---

## Konvensi API

- Prefix: `/api`
- Format response **selalu**:
  ```json
  { "success": true, "message": "string", "data": {}, "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 } }
  ```
  `meta` hanya untuk list. Error:
  ```json
  { "success": false, "message": "string", "errors": [{ "field": "plate_number", "message": "..." }] }
  ```
- Status code: 200, 201, 400 (validasi), 401 (belum login / token tidak valid), 404, 409 (konflik aturan bisnis: kapasitas penuh, plat duplikat, master dipakai), 500.
- List endpoint mendukung query: `page`, `limit`, `search`, `sort`, `order`, + filter spesifik.
- Nama kolom DB & field JSON: `snake_case`.

### Daftar Endpoint

```
GET    /api/health

# Auth (terbuka, kecuali /me). Semua endpoint lain wajib header Authorization: Bearer <token>
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

# Master
GET|POST          /api/partners
GET|PUT|DELETE    /api/partners/:id
GET|POST          /api/pools                 (list menyertakan occupied & capacity)
GET|PUT|DELETE    /api/pools/:id
GET|POST          /api/vehicle-types
GET|PUT|DELETE    /api/vehicle-types/:id

# Referensi (read-only)
GET    /api/references/unit-statuses
GET    /api/references/inspection-grades

# Unit
GET|POST          /api/units                 (filter: status_id, pool_id, partner_id, vehicle_type_id)
GET|PUT|DELETE    /api/units/:id             (DELETE hanya jika status MASUK)
PATCH  /api/units/:id/status                 body: { to_status_id, note? }
PATCH  /api/units/:id/move                   body: { pool_id, note? }
GET    /api/units/:id/histories
GET    /api/units/:id/inspections
POST   /api/units/:id/inspections

# Inspeksi
GET    /api/inspections
GET|PUT|DELETE /api/inspections/:id

# Dashboard
GET    /api/dashboard/summary
```

---

## Aturan Bisnis (ringkas — detail di docs/02)

1. Plat unik di antara unit **aktif** (status yang `counts_toward_capacity = true`) — dicek di service, bukan UNIQUE index.
2. Unit tidak bisa masuk/pindah ke pool yang penuh. Cek dalam **transaction** + `SELECT ... FOR UPDATE` pada baris pool.
3. Status hanya boleh maju **1 langkah** sesuai `sequence`.
4. Simpan inspeksi pada unit berstatus MASUK → otomatis jadi DIINSPEKSI (1 transaction, tulis history).
5. SIAP_JUAL wajib minimal 1 inspeksi.
6. KELUAR → isi `released_at`, unit tidak dihitung kapasitas lagi.
7. Master yang masih dipakai tidak bisa dihapus → 409 dengan pesan ramah (FK `ON DELETE RESTRICT`).
8. Unit hanya bisa dihapus saat status MASUK (koreksi salah input).
9. Setiap perubahan status otomatis tercatat di `unit_status_histories`.

---

## Rambu Studi Kasus (penting)

- **JANGAN** memakai nama perusahaan asli, nama produk mereka, logo, atau nama mitra leasing asli. Semua seed data **fiktif** (contoh: "PT Dana Mitra Sejahtera", "PT Kredit Andalan Nusantara").
- **JANGAN** menambahkan fitur penjualan, harga jual, lelang, pembeli, katalog, atau marketplace. Scope berhenti di status KELUAR (serah terima).
- Di luar scope: pembayaran, upload foto, multi-role permission. Auth (login JWT sederhana) **opsional**, hanya dikerjakan jika semua tahap lain selesai.

---

## UI Guideline

- Layout dashboard: sidebar kiri (dari config menu), header dengan judul halaman, konten di card.
- Setiap halaman list: search, filter, pagination, tombol tambah, aksi per baris (detail/edit/hapus).
- Wajib ada: skeleton loading, empty state, error state, toast sukses/gagal, dialog konfirmasi hapus.
- Badge status memakai warna dari API.
- Responsif sampai lebar mobile.
- Konsisten: satu komponen `DataTable`, `PageHeader`, `FormDialog`/halaman form yang dipakai ulang.

### Halaman
1. **Dashboard** — kartu ringkasan per status, okupansi tiap pool (progress bar), grafik unit per mitra, 5 inspeksi terbaru
2. **Unit** — list + filter; form tambah/edit; **detail unit** (info, timeline riwayat status, daftar inspeksi, tombol ubah status/pindah pool/tambah inspeksi)
3. **Inspeksi** — list semua inspeksi
4. **Master Data** — Mitra, Pool, Jenis Kendaraan

---

## Roadmap

- [x] **Tahap 1 — Setup**: struktur repo, `docker-compose.yml` (MariaDB), skeleton backend (Express, config env, error handler, response helper), skeleton frontend (Vite+TS, Tailwind, shadcn, router, layout + sidebar)
- [x] **Tahap 2 — Database**: migrations semua tabel, seeds (referensi + master fiktif + ±30 unit contoh dengan berbagai status + inspeksi + history)
- [x] **Tahap 3 — API Master & Referensi**: partners, pools (dengan okupansi), vehicle-types, references
- [x] **Tahap 4 — API Unit, Inspeksi, Dashboard**: termasuk semua aturan bisnis + transaction
- [x] **Tahap 5 — FE Master Data**
- [x] **Tahap 6 — FE Unit & Inspeksi** (list, form, detail + timeline)
- [x] **Tahap 7 — FE Dashboard**
- [ ] ~~**Tahap 8 — Docker penuh** (backend + frontend/nginx, migrate & seed otomatis saat start)~~ — **dilewati** (19 Okt 2026): tidak dibutuhkan untuk demo maupun deploy (Railway & Vercel build langsung dari kode), dan laptop development tidak cukup sumber daya untuk Docker Desktop (RAM 3,8 GB, disk C: sempit). `docker-compose.yml` tetap tersedia untuk MariaDB.
- [x] **Tahap 9 — README** (latar belakang, cara run lokal & Docker, env, dokumentasi endpoint, ERD, disclaimer) + koleksi request (Postman/`.http`)
- [ ] **Tahap 10 — Deploy**: BE + MariaDB ke Railway, FE ke Vercel
- [x] *(Opsional)* Auth JWT sederhana — login & register terbuka, token di localStorage (keputusan L di docs/02)

Kalimat disclaimer README:
> Studi kasus ini fiktif dan disederhanakan untuk keperluan technical challenge. Alur bisnis sebenarnya di industri pengelolaan aset tentu jauh lebih kompleks.
