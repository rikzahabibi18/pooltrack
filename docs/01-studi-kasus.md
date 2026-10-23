# Studi Kasus: PoolTrack — Sistem Manajemen Unit Aset di Pool

> Studi kasus ini fiktif dan disederhanakan untuk keperluan technical challenge.

## Latar Belakang

**PT Arta Aset Nusantara** (fiktif) adalah perusahaan pengelola aset yang menerima unit kendaraan dari beberapa mitra perusahaan pembiayaan (leasing). Unit umumnya kendaraan hasil penarikan atau penyerahan dari debitur. Setelah diterima, unit disimpan di **pool** (gudang penyimpanan) milik perusahaan di beberapa kota, diinspeksi, lalu disiapkan untuk diserahkan ke kanal penjualan perusahaan.

Saat ini perusahaan memiliki 4 pool (Tangerang, Bekasi, Bandung, Surabaya) dan menangani ratusan unit setiap bulan, mulai dari motor, mobil, sampai truk.

## Masalah

Pencatatan masih memakai **Excel per pool** yang dikirim lewat WhatsApp setiap akhir hari:

1. **Data tidak sinkron.** Kantor pusat tidak tahu posisi unit secara real-time. Pernah satu unit tercatat di dua pool sekaligus.
2. **Kapasitas pool tidak terpantau.** Pool Tangerang sempat penuh sehingga unit diparkir di luar area, padahal Pool Bandung masih kosong.
3. **Hasil inspeksi tercecer.** Catatan kondisi unit ada di kertas atau chat, sehingga sulit menentukan unit mana yang layak diserahkan ke penjualan.
4. **Mitra sering menanyakan status unit.** Admin harus membuka banyak file untuk menjawab satu pertanyaan.
5. **Laporan manual.** Rekap mingguan per status dan per mitra butuh 1–2 hari.

## Solusi

**PoolTrack**: dashboard internal berbasis web sebagai **satu sumber data** untuk seluruh unit di semua pool.

### Pengguna

| Peran | Kebutuhan |
|---|---|
| Admin Pool | Mencatat unit masuk, memperbarui lokasi, input hasil inspeksi |
| Manajer Operasional | Memantau ringkasan unit, kapasitas pool, performa per mitra |

### Ruang Lingkup

1. **Dashboard**: total unit per status, okupansi tiap pool, distribusi unit per mitra, 5 inspeksi terbaru
2. **Manajemen Unit**: CRUD, pencarian (plat/merek), filter (status, pool, mitra, jenis), pagination, detail unit dengan riwayat status
3. **Inspeksi**: hasil inspeksi per unit (tanggal, inspektor, odometer, kondisi eksterior/interior/mesin, grade A–D, catatan)
4. **Master Data**: CRUD Mitra, Pool (dengan kapasitas), Jenis Kendaraan

### Alur Status

```
MASUK → DIINSPEKSI → SIAP JUAL → KELUAR
```

### Aturan Bisnis

1. Nomor plat unik di antara unit yang masih aktif.
2. Unit tidak bisa dimasukkan ke pool yang sudah penuh.
3. Status berurutan. Unit tidak bisa langsung "Siap Jual" tanpa inspeksi.
4. Inspeksi pertama otomatis mengubah status MASUK menjadi DIINSPEKSI.
5. Mitra atau pool yang masih punya unit tidak bisa dihapus.
6. Unit yang keluar tidak dihapus. Data tetap tersimpan sebagai riwayat dan tidak dihitung dalam kapasitas.

### Di Luar Ruang Lingkup

Proses penjualan/lelang, pembayaran, upload foto, dan multi-role permission.

### Posisi Sistem

```
[Mitra Leasing] → [ POOLTRACK: Masuk → Inspeksi → Siap Jual → Keluar ] → [Kanal Penjualan]
                    hulu / operasional (scope kita)                        hilir (bukan scope)
```

### Target Hasil

- Posisi dan status unit bisa dicek dalam hitungan detik
- Tidak ada lagi unit ganda atau pool yang kelebihan kapasitas
- Rekap mingguan otomatis di dashboard
