/**
 * Seed dijalankan Knex berurutan sesuai nama file (01, 02, ...).
 * File pertama ini mengosongkan semua tabel supaya `npm run seed` bisa diulang kapan saja.
 *
 * Urutan hapus: tabel anak dulu, baru tabel induk (karena foreign key RESTRICT).
 */
const TABLES_CHILD_TO_PARENT = [
  'unit_status_histories',
  'inspections',
  'units',
  'vehicle_types',
  'pools',
  'partners',
  'inspection_grades',
  'unit_statuses',
  'users',
];

export async function seed(knex) {
  for (const table of TABLES_CHILD_TO_PARENT) {
    await knex(table).del();
    // Reset penomoran id supaya data contoh selalu mulai dari 1
    await knex.raw('ALTER TABLE ?? AUTO_INCREMENT = 1', [table]);
  }
}
