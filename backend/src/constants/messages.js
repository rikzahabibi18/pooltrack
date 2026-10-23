/** Pesan API. `label` adalah nama resource, mis. "Mitra" atau "Pool". */
export const MESSAGES = Object.freeze({
  HEALTHY: 'Layanan berjalan normal',
  VALIDATION_FAILED: 'Data yang dikirim tidak valid',
  ROUTE_NOT_FOUND: 'Endpoint tidak ditemukan',
  INVALID_JSON: 'Format JSON tidak valid',
  INTERNAL_ERROR: 'Terjadi kesalahan pada server',
  DUPLICATE_ENTRY: 'Data dengan nilai tersebut sudah terdaftar',
  RESOURCE_IN_USE: 'Data tidak dapat dihapus karena masih digunakan oleh data lain',
  INVALID_REFERENCE: 'Data relasi yang dipilih tidak ditemukan',
  CODE_TAKEN: 'Kode sudah digunakan',

  REGISTERED: 'Registrasi berhasil',
  LOGGED_IN: 'Login berhasil',
  CURRENT_USER: 'Data pengguna berhasil dimuat',
  EMAIL_TAKEN: 'Email sudah terdaftar',
  INVALID_CREDENTIALS: 'Email atau password salah',
  UNAUTHENTICATED: 'Silakan login terlebih dahulu',
  SESSION_EXPIRED: 'Sesi login sudah berakhir, silakan login kembali',

  listed: (label) => `Daftar ${label.toLowerCase()} berhasil dimuat`,
  detail: (label) => `Detail ${label.toLowerCase()} berhasil dimuat`,
  created: (label) => `${label} berhasil ditambahkan`,
  updated: (label) => `${label} berhasil diperbarui`,
  deleted: (label) => `${label} berhasil dihapus`,
  notFound: (label) => `${label} tidak ditemukan`,
  codeTaken: (code) => `Kode "${code}" sudah digunakan`,
  inUse: (label, name, unitCount) =>
    `${label} "${name}" tidak dapat dihapus karena masih tercatat pada ${unitCount} unit. Nonaktifkan saja jika tidak dipakai lagi.`,
});
