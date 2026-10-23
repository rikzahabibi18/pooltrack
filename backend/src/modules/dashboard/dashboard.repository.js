import { db } from '../../config/database.js';

/** Query agregasi untuk dashboard. Semua angka dihitung database, bukan angka dummy. */

/** Jumlah unit per status (semua status tetap muncul walau 0), urut sesuai alur. */
export function countUnitsPerStatus() {
  const columns = ['s.id', 's.code', 's.name', 's.color', 's.sequence', 's.counts_toward_capacity'];
  return db('unit_statuses as s')
    .leftJoin('units as u', 'u.status_id', 's.id')
    .select(columns)
    .count({ total: 'u.id' })
    .groupBy(columns)
    .orderBy('s.sequence');
}

/**
 * Okupansi tiap pool: SUM(counts_toward_capacity) = jumlah unit aktif,
 * karena flag bernilai 1 untuk status aktif dan 0 untuk KELUAR.
 * Pool nonaktif tetap ditampilkan jika masih berisi unit.
 */
export async function getPoolOccupancy() {
  const columns = ['p.id', 'p.code', 'p.name', 'p.city', 'p.capacity', 'p.is_active'];
  const rows = await db('pools as p')
    .leftJoin('units as u', 'u.pool_id', 'p.id')
    .leftJoin('unit_statuses as s', 's.id', 'u.status_id')
    .select(columns)
    .select(db.raw('COALESCE(SUM(s.counts_toward_capacity), 0) AS occupied'))
    .groupBy(columns)
    .havingRaw('occupied > 0 OR p.is_active = 1')
    .orderBy('p.name');

  // SUM menghasilkan DECIMAL yang dikirim driver sebagai string → ubah ke angka
  return rows.map((row) => ({ ...row, occupied: Number(row.occupied) }));
}

/** Distribusi unit AKTIF per mitra (mitra tanpa unit aktif tidak ditampilkan). */
export function countActiveUnitsPerPartner() {
  return db('partners as p')
    .join('units as u', 'u.partner_id', 'p.id')
    .join('unit_statuses as s', 's.id', 'u.status_id')
    .where('s.counts_toward_capacity', true)
    .select('p.id', 'p.code', 'p.name')
    .count({ total: 'u.id' })
    .groupBy('p.id', 'p.code', 'p.name')
    .orderBy([{ column: 'total', order: 'desc' }, { column: 'p.name', order: 'asc' }]);
}

export function findRecentInspections(limit) {
  return db('inspections as i')
    .join('units as u', 'u.id', 'i.unit_id')
    .join('pools as p', 'p.id', 'u.pool_id')
    .join('inspection_grades as g', 'g.id', 'i.grade_id')
    .select(
      'i.id',
      'i.inspection_date',
      'i.inspector_name',
      'u.id as unit_id',
      'u.plate_number',
      'u.brand',
      'u.model',
      'p.name as pool_name',
      'g.code as grade_code',
      'g.name as grade_name',
    )
    .orderBy([{ column: 'i.inspection_date', order: 'desc' }, { column: 'i.id', order: 'desc' }])
    .limit(limit);
}
