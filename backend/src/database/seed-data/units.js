/**
 * Data contoh unit (FIKTIF) untuk seed `04_units.js`.
 *
 * Semua tanggal ditulis relatif terhadap hari seed dijalankan ("x hari lalu"),
 * sehingga dashboard selalu terlihat segar kapan pun seed diulang.
 *
 * Field:
 * - partner / pool / type / status : kode master & referensi (bukan id)
 * - received   : diterima x hari lalu (status MASUK)
 * - inspections: daftar inspeksi; yang pertama mengubah status menjadi DIINSPEKSI
 * - ready      : ditandai SIAP_JUAL x hari lalu
 * - released   : KELUAR x hari lalu (released_at)
 *
 * Ringkasan: 32 unit — MASUK 8, DIINSPEKSI 9, SIAP_JUAL 8, KELUAR 7.
 * Unit aktif per pool: Tangerang 11/12 (hampir penuh), Bekasi 7/30, Bandung 3/25, Surabaya 4/20.
 */

const INSPECTOR = {
  AGUS: 'Agus Santoso',
  DEWI: 'Dewi Anggraini',
  BAYU: 'Bayu Pratama',
  SINTA: 'Sinta Maharani',
};

const GOOD = { exterior: 'Cat mulus, tidak ada penyok.', interior: 'Bersih dan lengkap.', engine: 'Mesin halus, tidak ada rembesan.' };
const MINOR = { exterior: 'Baret halus di pintu kiri dan bumper belakang.', interior: 'Jok sedikit kusam.', engine: 'Normal, perlu ganti oli.' };
const FAIR = { exterior: 'Penyok kecil di fender depan, cat kusam.', interior: 'Dashboard retak ringan, karpet kotor.', engine: 'Suara kasar saat dingin, perlu tune-up.' };
const POOR = { exterior: 'Penyok di beberapa panel, karat di kolong.', interior: 'Jok sobek, AC tidak dingin.', engine: 'Kebocoran oli dan aki lemah.' };

export const SEED_UNITS = [
  // ---------- Pool Tangerang: 11 aktif (kapasitas 12) + 2 keluar ----------
  { plate: 'B 1871 KZA', brand: 'Toyota', model: 'Avanza 1.3 G', year: 2019, color: 'Silver', type: 'MOBIL', partner: 'DMS', pool: 'TGR', status: 'MASUK', received: 1 },
  { plate: 'B 3345 TFP', brand: 'Honda', model: 'Beat CBS', year: 2021, color: 'Hitam', type: 'MOTOR', partner: 'KAN', pool: 'TGR', status: 'MASUK', received: 2 },
  { plate: 'B 6620 UJR', brand: 'Daihatsu', model: 'Xenia 1.3 R', year: 2018, color: 'Putih', type: 'MOBIL', partner: 'DMS', pool: 'TGR', status: 'MASUK', received: 3 },
  { plate: 'B 3876 JXY', brand: 'Yamaha', model: 'Aerox 155', year: 2021, color: 'Biru', type: 'MOTOR', partner: 'KAN', pool: 'TGR', status: 'MASUK', received: 0 },
  {
    plate: 'B 4412 NQS', brand: 'Yamaha', model: 'NMAX 155', year: 2022, color: 'Abu-abu', type: 'MOTOR', partner: 'AFP', pool: 'TGR', status: 'DIINSPEKSI', received: 6,
    inspections: [{ days: 5, grade: 'B', km: 18_450, inspector: INSPECTOR.AGUS, ...MINOR }],
  },
  {
    plate: 'B 2290 PLK', brand: 'Mitsubishi', model: 'Xpander Ultimate', year: 2020, color: 'Hitam', type: 'MOBIL', partner: 'DMS', pool: 'TGR', status: 'DIINSPEKSI', received: 8,
    inspections: [{ days: 7, grade: 'C', km: 62_300, inspector: INSPECTOR.AGUS, ...FAIR }],
  },
  {
    plate: 'B 9014 WRT', brand: 'Suzuki', model: 'Ertiga GX', year: 2019, color: 'Merah', type: 'MOBIL', partner: 'SKB', pool: 'TGR', status: 'DIINSPEKSI', received: 9,
    inspections: [{ days: 8, grade: 'A', km: 41_200, inspector: INSPECTOR.DEWI, ...GOOD }],
  },
  {
    plate: 'B 8123 TKM', brand: 'Mitsubishi', model: 'Colt Diesel FE 74', year: 2016, color: 'Kuning', type: 'TRUK', partner: 'AFP', pool: 'TGR', status: 'DIINSPEKSI', received: 10,
    inspections: [{ days: 9, grade: 'C', km: 185_700, inspector: INSPECTOR.AGUS, ...FAIR }],
  },
  {
    plate: 'B 7781 FCD', brand: 'Honda', model: 'Vario 125', year: 2020, color: 'Merah', type: 'MOTOR', partner: 'KAN', pool: 'TGR', status: 'SIAP_JUAL', received: 15, ready: 12,
    inspections: [{ days: 14, grade: 'A', km: 22_900, inspector: INSPECTOR.DEWI, ...GOOD }],
  },
  {
    plate: 'B 5507 GHA', brand: 'Toyota', model: 'Kijang Innova 2.0 G', year: 2017, color: 'Abu-abu', type: 'MOBIL', partner: 'DMS', pool: 'TGR', status: 'SIAP_JUAL', received: 18, ready: 11,
    notes: 'Diinspeksi ulang setelah perbaikan mesin.',
    inspections: [
      { days: 17, grade: 'C', km: 128_400, inspector: INSPECTOR.AGUS, ...FAIR },
      { days: 13, grade: 'B', km: 128_410, inspector: INSPECTOR.AGUS, ...MINOR, notes: 'Inspeksi ulang: mesin sudah di-tune-up.' },
    ],
  },
  {
    plate: 'B 1029 SAV', brand: 'Honda', model: 'Brio Satya E', year: 2021, color: 'Putih', type: 'MOBIL', partner: 'SKB', pool: 'TGR', status: 'SIAP_JUAL', received: 20, ready: 16,
    inspections: [{ days: 19, grade: 'B', km: 35_600, inspector: INSPECTOR.DEWI, ...MINOR }],
  },
  {
    plate: 'B 6703 KLO', brand: 'Toyota', model: 'Calya G', year: 2018, color: 'Silver', type: 'MOBIL', partner: 'DMS', pool: 'TGR', status: 'KELUAR', received: 40, ready: 33, released: 27,
    inspections: [{ days: 38, grade: 'B', km: 74_100, inspector: INSPECTOR.AGUS, ...MINOR }],
  },
  {
    plate: 'B 2218 MNB', brand: 'Honda', model: 'Scoopy', year: 2020, color: 'Krem', type: 'MOTOR', partner: 'KAN', pool: 'TGR', status: 'KELUAR', received: 35, ready: 31, released: 25,
    inspections: [{ days: 34, grade: 'A', km: 15_800, inspector: INSPECTOR.DEWI, ...GOOD }],
  },

  // ---------- Pool Bekasi: 7 aktif + 2 keluar ----------
  { plate: 'B 4590 KRD', brand: 'Toyota', model: 'Rush S', year: 2019, color: 'Putih', type: 'MOBIL', partner: 'KAN', pool: 'BKS', status: 'MASUK', received: 2 },
  { plate: 'B 6034 ZXA', brand: 'Yamaha', model: 'Mio M3', year: 2019, color: 'Hitam', type: 'MOTOR', partner: 'AFP', pool: 'BKS', status: 'MASUK', received: 4 },
  {
    plate: 'B 3301 PQS', brand: 'Honda', model: 'PCX 160', year: 2022, color: 'Putih', type: 'MOTOR', partner: 'AFP', pool: 'BKS', status: 'DIINSPEKSI', received: 7,
    inspections: [{ days: 5, grade: 'A', km: 9_800, inspector: INSPECTOR.BAYU, ...GOOD }],
  },
  {
    plate: 'B 9921 UDT', brand: 'Hino', model: 'Dutro 130 HD', year: 2017, color: 'Putih', type: 'TRUK', partner: 'SKB', pool: 'BKS', status: 'DIINSPEKSI', received: 12,
    inspections: [{ days: 11, grade: 'C', km: 210_500, inspector: INSPECTOR.BAYU, ...FAIR }],
  },
  {
    plate: 'B 8840 LRM', brand: 'Isuzu', model: 'Elf NMR 71', year: 2018, color: 'Putih', type: 'TRUK', partner: 'SKB', pool: 'BKS', status: 'DIINSPEKSI', received: 13,
    inspections: [{ days: 12, grade: 'D', km: 246_000, inspector: INSPECTOR.BAYU, ...POOR }],
  },
  {
    plate: 'B 5520 VTE', brand: 'Daihatsu', model: 'Sigra 1.2 R', year: 2020, color: 'Abu-abu', type: 'MOBIL', partner: 'DMS', pool: 'BKS', status: 'SIAP_JUAL', received: 22, ready: 18,
    inspections: [{ days: 21, grade: 'B', km: 48_900, inspector: INSPECTOR.BAYU, ...MINOR }],
  },
  {
    plate: 'B 1188 HJK', brand: 'Wuling', model: 'Confero S', year: 2019, color: 'Putih', type: 'MOBIL', partner: 'KAN', pool: 'BKS', status: 'SIAP_JUAL', received: 25, ready: 20,
    inspections: [{ days: 24, grade: 'C', km: 67_300, inspector: INSPECTOR.BAYU, ...FAIR }],
  },
  {
    plate: 'B 4477 BBN', brand: 'Toyota', model: 'Agya 1.2 G', year: 2020, color: 'Merah', type: 'MOBIL', partner: 'DMS', pool: 'BKS', status: 'KELUAR', received: 45, ready: 40, released: 30,
    inspections: [{ days: 44, grade: 'A', km: 30_200, inspector: INSPECTOR.BAYU, ...GOOD }],
  },
  {
    plate: 'B 2650 CTR', brand: 'Honda', model: 'Vario 150', year: 2019, color: 'Hitam', type: 'MOTOR', partner: 'KAN', pool: 'BKS', status: 'KELUAR', received: 50, ready: 45, released: 38,
    inspections: [{ days: 49, grade: 'B', km: 27_400, inspector: INSPECTOR.BAYU, ...MINOR }],
  },

  // ---------- Pool Bandung: 3 aktif + 2 keluar ----------
  // D 4521 KJ: pernah KELUAR, lalu masuk lagi → contoh plat sama yang sah karena unit lamanya sudah tidak aktif
  {
    plate: 'D 4521 KJ', brand: 'Toyota', model: 'Avanza 1.5 Veloz', year: 2018, color: 'Hitam', type: 'MOBIL', partner: 'AFP', pool: 'BDG', status: 'KELUAR', received: 60, ready: 52, released: 45,
    chassis: 'MHKM1CA4JJK104521', engine: '2NRF215487',
    inspections: [{ days: 58, grade: 'B', km: 88_700, inspector: INSPECTOR.SINTA, ...MINOR }],
  },
  {
    plate: 'D 4521 KJ', brand: 'Toyota', model: 'Avanza 1.5 Veloz', year: 2018, color: 'Hitam', type: 'MOBIL', partner: 'AFP', pool: 'BDG', status: 'MASUK', received: 3,
    chassis: 'MHKM1CA4JJK104521', engine: '2NRF215487', notes: 'Unit masuk kembali dari mitra yang sama.',
  },
  {
    plate: 'D 7765 RTY', brand: 'Suzuki', model: 'APV Arena', year: 2016, color: 'Silver', type: 'MOBIL', partner: 'DMS', pool: 'BDG', status: 'DIINSPEKSI', received: 6,
    inspections: [{ days: 4, grade: 'C', km: 143_900, inspector: INSPECTOR.SINTA, ...FAIR }],
  },
  {
    plate: 'D 1290 AEF', brand: 'Honda', model: 'Beat Street', year: 2022, color: 'Hitam', type: 'MOTOR', partner: 'SKB', pool: 'BDG', status: 'SIAP_JUAL', received: 16, ready: 10,
    inspections: [{ days: 15, grade: 'A', km: 7_300, inspector: INSPECTOR.SINTA, ...GOOD }],
  },
  {
    plate: 'D 3148 YUI', brand: 'Yamaha', model: 'Vixion', year: 2017, color: 'Merah', type: 'MOTOR', partner: 'KAN', pool: 'BDG', status: 'KELUAR', received: 38, ready: 30, released: 22,
    inspections: [{ days: 37, grade: 'B', km: 39_600, inspector: INSPECTOR.SINTA, ...MINOR }],
  },

  // ---------- Pool Surabaya: 4 aktif + 1 keluar ----------
  { plate: 'L 8820 NB', brand: 'Honda', model: 'CB150R', year: 2020, color: 'Merah', type: 'MOTOR', partner: 'AFP', pool: 'SBY', status: 'MASUK', received: 1 },
  {
    plate: 'L 2276 HK', brand: 'Mitsubishi', model: 'L300 Pick Up', year: 2019, color: 'Hitam', type: 'TRUK', partner: 'DMS', pool: 'SBY', status: 'DIINSPEKSI', received: 9,
    inspections: [{ days: 6, grade: 'B', km: 96_100, inspector: INSPECTOR.DEWI, ...MINOR }],
  },
  {
    plate: 'L 1543 QW', brand: 'Toyota', model: 'Fortuner 2.4 VRZ', year: 2018, color: 'Putih', type: 'MOBIL', partner: 'KAN', pool: 'SBY', status: 'SIAP_JUAL', received: 21, ready: 14,
    inspections: [{ days: 20, grade: 'B', km: 102_800, inspector: INSPECTOR.DEWI, ...MINOR }],
  },
  {
    plate: 'L 6612 DM', brand: 'Daihatsu', model: 'Terios R', year: 2021, color: 'Abu-abu', type: 'MOBIL', partner: 'SKB', pool: 'SBY', status: 'SIAP_JUAL', received: 23, ready: 17,
    inspections: [{ days: 22, grade: 'A', km: 28_700, inspector: INSPECTOR.DEWI, ...GOOD }],
  },
  {
    plate: 'L 5099 AC', brand: 'Suzuki', model: 'Satria F150', year: 2018, color: 'Biru', type: 'MOTOR', partner: 'SKB', pool: 'SBY', status: 'KELUAR', received: 42, ready: 34, released: 28,
    inspections: [
      { days: 41, grade: 'C', km: 45_100, inspector: INSPECTOR.DEWI, ...FAIR },
      { days: 36, grade: 'B', km: 45_100, inspector: INSPECTOR.DEWI, ...MINOR, notes: 'Inspeksi ulang setelah servis.' },
    ],
  },
];
