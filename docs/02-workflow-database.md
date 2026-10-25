# Workflow & Database — PoolTrack

## 1. Workflow Bisnis

```
 ┌──────────────┐
 │ 0. SETUP     │  Manajer isi master data: Mitra, Pool (+kapasitas), Jenis Kendaraan
 └──────┬───────┘
        ▼
 ┌──────────────┐  Admin Pool input unit baru (plat, merek, mitra, pool tujuan)
 │ 1. UNIT MASUK│  ✔ plat belum terdaftar di unit aktif
 │   [MASUK]    │  ✔ pool tujuan belum penuh
 └──────┬───────┘  → status MASUK, tercatat di riwayat
        ▼
 ┌──────────────┐  Input hasil inspeksi (kondisi, odometer, grade A–D)
 │ 2. INSPEKSI  │  → jika status MASUK, otomatis menjadi DIINSPEKSI
 │ [DIINSPEKSI] │  → inspeksi ulang boleh, status tidak berubah
 └──────┬───────┘
        ▼
 ┌──────────────┐  Unit ditandai siap diserahkan ke kanal penjualan
 │ 3. SIAP JUAL │  ✔ minimal 1x inspeksi
 └──────┬───────┘
        ▼
 ┌──────────────┐  Unit diserahkan/keluar dari pool
 │ 4. KELUAR    │  → released_at terisi, kapasitas pool bertambah lagi
 └──────────────┘  → data TIDAK dihapus

 ⇄ Sewaktu-waktu: PINDAH POOL (✔ kapasitas pool tujuan)
```

### Kaitan dengan masalah di studi kasus

| Masalah | Dijawab oleh |
|---|---|
| Unit tercatat di dua pool | Database terpusat, satu unit hanya punya satu `pool_id` |
| Pool kelebihan kapasitas | Validasi kapasitas saat unit masuk atau pindah |
| Hasil inspeksi tercecer | Tabel `inspections` yang terhubung ke unit |
| Mitra bertanya status unit | Pencarian plat dan riwayat status |
| Rekap manual 1–2 hari | Dashboard dihitung otomatis |

---

## 2. ERD

```
  ┌─────────────┐      ┌─────────────┐      ┌───────────────┐
  │  partners   │      │    pools    │      │ vehicle_types │
  └──────┬──────┘      └──────┬──────┘      └───────┬───────┘
         │ 1                  │ 1                   │ 1
         │ N                  │ N                   │ N
         └──────────┐   ┌─────┘   ┌─────────────────┘
                    ▼   ▼         ▼
                  ┌───────────────────┐  N      1 ┌───────────────┐
                  │       units       │──────────►│ unit_statuses │
                  └───┬───────────┬───┘           └───────────────┘
                    1 │           │ 1                    ▲
                    N ▼           ▼ N                    │
          ┌─────────────────┐  ┌───────────────────────┐ │
          │   inspections   │  │ unit_status_histories │─┘ (from/to status)
          └────────┬────────┘  └───────────────────────┘
                   │ N
                   ▼ 1
          ┌───────────────────┐
          │ inspection_grades │
          └───────────────────┘
```

---

## 3. Detail Tabel

### A. Master (CRUD)

**partners**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | INT UNSIGNED PK AI | |
| code | VARCHAR(20) UNIQUE | |
| name | VARCHAR(150) | |
| contact_person | VARCHAR(100) NULL | |
| phone | VARCHAR(30) NULL | |
| email | VARCHAR(150) NULL | |
| is_active | BOOLEAN default true | |
| created_at, updated_at | TIMESTAMP | |

**pools**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | INT UNSIGNED PK AI | |
| code | VARCHAR(20) UNIQUE | |
| name | VARCHAR(100) | |
| city | VARCHAR(100) | |
| address | TEXT NULL | |
| capacity | INT UNSIGNED | > 0 |
| is_active | BOOLEAN default true | |
| created_at, updated_at | TIMESTAMP | |

**vehicle_types**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | INT UNSIGNED PK AI | |
| code | VARCHAR(20) UNIQUE | MOTOR, MOBIL, TRUK |
| name | VARCHAR(50) | |
| is_active | BOOLEAN default true | |
| created_at, updated_at | TIMESTAMP | |

### B. Referensi (diisi seeder, read-only via API)

**unit_statuses**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | INT UNSIGNED PK AI | |
| code | VARCHAR(20) UNIQUE | MASUK, DIINSPEKSI, SIAP_JUAL, KELUAR |
| name | VARCHAR(50) | label tampilan |
| sequence | TINYINT UNSIGNED UNIQUE | 1..4, urutan alur |
| counts_toward_capacity | BOOLEAN | true untuk 1–3, false untuk KELUAR |
| color | VARCHAR(20) | warna badge di UI |

**inspection_grades**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | INT UNSIGNED PK AI | |
| code | CHAR(1) UNIQUE | A, B, C, D |
| name | VARCHAR(50) | Sangat Baik, Baik, Cukup, Kurang |
| description | VARCHAR(255) NULL | |

### C. Transaksi

**units**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | INT UNSIGNED PK AI | |
| plate_number | VARCHAR(15) | index (bukan unique) |
| brand | VARCHAR(50) | |
| model | VARCHAR(80) | |
| year | SMALLINT UNSIGNED | |
| color | VARCHAR(30) NULL | |
| chassis_number | VARCHAR(50) NULL | |
| engine_number | VARCHAR(50) NULL | |
| vehicle_type_id | FK → vehicle_types | RESTRICT |
| partner_id | FK → partners | RESTRICT |
| pool_id | FK → pools | RESTRICT |
| status_id | FK → unit_statuses | RESTRICT |
| received_at | DATE | |
| released_at | DATE NULL | |
| notes | TEXT NULL | |
| created_at, updated_at | TIMESTAMP | |

**inspections**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | INT UNSIGNED PK AI | |
| unit_id | FK → units | RESTRICT |
| inspection_date | DATE | |
| inspector_name | VARCHAR(100) | |
| odometer_km | INT UNSIGNED NULL | |
| exterior_notes | TEXT NULL | |
| interior_notes | TEXT NULL | |
| engine_notes | TEXT NULL | |
| grade_id | FK → inspection_grades | RESTRICT |
| notes | TEXT NULL | |
| created_at, updated_at | TIMESTAMP | |

**unit_status_histories**
| Kolom | Tipe | Catatan |
|---|---|---|
| id | INT UNSIGNED PK AI | |
| unit_id | FK → units | CASCADE (ikut terhapus jika unit MASUK dihapus) |
| from_status_id | FK → unit_statuses NULL | null saat pertama masuk |
| to_status_id | FK → unit_statuses | |
| note | VARCHAR(255) NULL | |
| changed_at | TIMESTAMP | |

---

## 4. Aturan Bisnis & Implementasi

| # | Aturan | Implementasi |
|---|---|---|
| 1 | Plat unik di unit aktif | Service: cari unit dengan plat sama dan status `counts_toward_capacity = true`. Jika ada → 409. Tidak pakai UNIQUE index karena unit yang sudah KELUAR boleh masuk lagi |
| 2 | Kapasitas pool | Dalam transaction: `SELECT ... FROM pools WHERE id = ? FOR UPDATE`, hitung unit aktif di pool, bandingkan dengan `capacity`. Penuh → 409 "Kapasitas Pool X penuh (50/50)" |
| 3 | Status berurutan | `target.sequence === current.sequence + 1`, selain itu → 400/409 |
| 4 | Inspeksi ubah status | Transaction: insert inspeksi; jika status unit = MASUK → update ke DIINSPEKSI + insert history |
| 5 | Siap Jual wajib inspeksi | Hitung inspeksi unit ≥ 1 |
| 6 | KELUAR | Set `released_at = today`. Otomatis tidak dihitung kapasitas karena flag status |
| 7 | Master dipakai tidak bisa dihapus | FK RESTRICT + tangkap error FK (`ER_ROW_IS_REFERENCED_2`) → 409 pesan ramah |
| 8 | Hapus unit | Hanya jika status MASUK dan belum ada inspeksi |
| 9 | Riwayat status | Setiap create unit / ubah status / inspeksi pertama → insert `unit_status_histories` |

Kode status hanya dipakai sebagai konstanta di `backend/src/constants/unitStatus.js`.

### Keputusan tambahan (disepakati 16 Okt 2026)

| # | Keputusan | Alasan |
|---|---|---|
| A | Pelanggaran urutan status → **409** (bukan 400) | 400 khusus validasi input; urutan status adalah konflik aturan bisnis |
| B | `PUT /units/:id` **tidak** mengubah `pool_id` dan `status_id` | Pindah pool hanya lewat `PATCH /move` (cek kapasitas), ubah status hanya lewat `PATCH /status` (tulis history) — tidak ada jalan pintas |
| C | Unit berstatus **KELUAR** tidak bisa diedit, dipindah pool, atau diinspeksi | Unit sudah diserahkan; datanya menjadi arsip/riwayat |
| D | Inspeksi **satu-satunya** milik unit tidak bisa dihapus (409); inspeksi unit KELUAR tidak bisa diubah/dihapus | Unit yang punya inspeksi pasti sudah DIINSPEKSI ke atas — tanpa inspeksi statusnya tidak sah (aturan 5). Salah input → edit, bukan hapus |
| E | Dropdown di form unit hanya menampilkan master yang `is_active = true` | Master nonaktif tidak dipakai untuk data baru, tapi data lama tetap valid |
| F | Hapus unit: status MASUK **dan** belum ada inspeksi | Gabungan aturan "unit hanya bisa dihapus saat MASUK" dan tabel di atas |
| G | Kapasitas pool tidak boleh diubah menjadi lebih kecil dari jumlah unit aktif saat ini (409) | Tanpa ini pool bisa "kelebihan kapasitas" lewat edit master; dicek dalam transaction + `FOR UPDATE` |
| H | Pindah pool dicatat di `unit_status_histories` dengan status asal = tujuan dan catatan "Pindah pool: A → B" | Lokasi unit bisa dilacak di timeline; menjawab masalah "unit tercatat di dua pool" |
| I | Status DIINSPEKSI tidak bisa dipilih manual — hanya otomatis lewat inspeksi pertama (409) | Mencegah unit "diinspeksi" tanpa data inspeksi |
| J | Nomor plat dinormalisasi ke format `B 1234 XYZ` (huruf besar, satu spasi); pencarian plat mengabaikan spasi | "b1234xyz" dan "B 1234 XYZ" dianggap plat yang sama, sehingga aturan plat unik tidak bisa diakali |

| K | Setiap unit dari API membawa `actions` (`next_status`, `can_change_status` + alasannya, `can_edit`, `can_move`, `can_inspect`, `can_delete`) | Frontend tidak menyimpan kode status maupun aturan bisnis; tombol aktif/nonaktif mengikuti backend. Alasan blokir dihitung oleh fungsi yang sama dengan validasi `PATCH /status` |
| L | Auth sederhana (23 Okt 2026): JWT di `localStorage` + header `Authorization: Bearer`, register terbuka, satu jenis pengguna, tabel `users` terpisah | Paling sederhana untuk frontend–backend beda domain. Trade-off: token rentan dicuri jika ada celah XSS (alternatif: cookie `httpOnly`). Multi-role di luar scope |

Urutan penguncian baris (`FOR UPDATE`) selalu **unit dulu, baru pool**, sehingga tidak terjadi deadlock antar transaction.

---

## 5. Dashboard Summary (`GET /api/dashboard/summary`)

```json
{
  "status_counts": [{ "id": 1, "code": "MASUK", "name": "Masuk", "color": "...", "total": 12 }],
  "total_active_units": 40,
  "pool_occupancy": [{ "id": 1, "name": "Pool Tangerang", "capacity": 50, "occupied": 32 }],
  "units_by_partner": [{ "id": 1, "name": "PT Dana Mitra Sejahtera", "total": 15 }],
  "recent_inspections": [{ "id": 9, "plate_number": "B 1234 XYZ", "grade": "B", "inspection_date": "..." }]
}
```

---

## 6. Contoh Perjalanan Unit (skenario demo)

```
12 Okt  B 1234 XYZ (Avanza 2019, PT Dana Mitra Sejahtera) masuk Pool Tangerang
        → status MASUK | history: (null → MASUK)
13 Okt  Inspeksi: odometer 85.000 km, grade B, "baret pintu kiri"
        → status otomatis DIINSPEKSI | history: (MASUK → DIINSPEKSI)
14 Okt  Pool Tangerang penuh, unit lain mau masuk → DITOLAK 409
15 Okt  Set SIAP JUAL → history: (DIINSPEKSI → SIAP_JUAL)
18 Okt  Unit diserahkan → KELUAR, released_at terisi, slot pool 49/50
```

Seeder sebaiknya menyiapkan satu pool yang **hampir penuh** supaya skenario "kapasitas penuh" bisa didemokan.

---

## 7. Persiapan Presentasi (Q&A)

1. **Kenapa status di tabel, bukan ENUM?** Label, warna, dan urutan bisa diubah tanpa ubah kode atau migrasi struktur. Sejalan dengan prinsip tanpa hardcode.
2. **Tapi di kode ada 'DIINSPEKSI'?** Hanya sebagai kode identitas stabil di satu file konstanta. Data tampilan tetap dari DB. Bedanya konstanta terpusat vs hardcode tersebar.
3. **Kenapa plat tidak UNIQUE index?** Unit yang sudah keluar bisa masuk lagi. Yang wajib unik hanya plat di unit aktif.
4. **Kenapa ada tabel riwayat?** Jejak audit, misalnya untuk menjawab mitra kapan unit masuk dan kapan diinspeksi.
5. **Dua admin input bersamaan ke pool yang sama?** Cek kapasitas di dalam transaction dengan row lock (`FOR UPDATE`).
6. **Kenapa pilih kasus ini?** Relevan dengan bisnis pengelolaan aset, tapi sengaja di sisi hulu (operasional) supaya tidak overlap dengan produk penjualan yang sudah ada.
