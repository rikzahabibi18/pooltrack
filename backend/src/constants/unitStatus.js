/**
 * Kode status unit — identitas STABIL yang boleh dipakai di kode.
 *
 * Label, urutan (sequence), warna, dan aturan kapasitas TIDAK ditulis di sini,
 * melainkan diambil dari tabel `unit_statuses`. Kode hanya dipakai untuk aturan
 * yang memang khusus satu status, mis. "inspeksi pertama mengubah MASUK → DIINSPEKSI".
 */
export const UNIT_STATUS = Object.freeze({
  MASUK: 'MASUK',
  DIINSPEKSI: 'DIINSPEKSI',
  SIAP_JUAL: 'SIAP_JUAL',
  KELUAR: 'KELUAR',
});
