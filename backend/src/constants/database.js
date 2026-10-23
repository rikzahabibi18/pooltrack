export const DATABASE = Object.freeze({
  POOL_MIN: 0,
  POOL_MAX: 10,
  /** Berapa lama menunggu koneksi dari pool sebelum dianggap gagal. */
  ACQUIRE_TIMEOUT_MS: 5000,
});

/** Kode error MariaDB/MySQL yang diterjemahkan menjadi respons yang ramah. */
export const DB_ERROR_CODES = Object.freeze({
  DUPLICATE_ENTRY: 'ER_DUP_ENTRY',
  ROW_IS_REFERENCED: ['ER_ROW_IS_REFERENCED', 'ER_ROW_IS_REFERENCED_2'],
  NO_REFERENCED_ROW: ['ER_NO_REFERENCED_ROW', 'ER_NO_REFERENCED_ROW_2'],
});
