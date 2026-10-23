import { UNIT_STATUS } from '../../constants/unitStatus.js';

/**
 * Data referensi. Inilah satu-satunya sumber label, urutan, warna badge,
 * dan aturan kapasitas status — frontend & service membaca dari tabel ini.
 */
const UNIT_STATUSES = [
  { code: UNIT_STATUS.MASUK, name: 'Masuk', sequence: 1, counts_toward_capacity: true, color: '#2563EB' },
  { code: UNIT_STATUS.DIINSPEKSI, name: 'Diinspeksi', sequence: 2, counts_toward_capacity: true, color: '#D97706' },
  { code: UNIT_STATUS.SIAP_JUAL, name: 'Siap Jual', sequence: 3, counts_toward_capacity: true, color: '#16A34A' },
  { code: UNIT_STATUS.KELUAR, name: 'Keluar', sequence: 4, counts_toward_capacity: false, color: '#6B7280' },
];

const INSPECTION_GRADES = [
  { code: 'A', name: 'Sangat Baik', description: 'Kondisi sangat baik, dapat diserahkan tanpa perbaikan.' },
  { code: 'B', name: 'Baik', description: 'Kekurangan kecil, mis. baret atau lecet ringan.' },
  { code: 'C', name: 'Cukup', description: 'Perlu perbaikan ringan sebelum diserahkan.' },
  { code: 'D', name: 'Kurang', description: 'Perlu perbaikan besar pada beberapa bagian.' },
];

export async function seed(knex) {
  await knex('unit_statuses').insert(UNIT_STATUSES);
  await knex('inspection_grades').insert(INSPECTION_GRADES);
}
