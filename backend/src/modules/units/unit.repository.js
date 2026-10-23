import { db } from '../../config/database.js';
import { getOffset, orWherePlateLike, toLikePattern } from '../../utils/pagination.js';

/** Repository: HANYA query Knex untuk unit & riwayat statusnya, tanpa aturan bisnis. */

const UNIT_COLUMNS = [
  'units.id',
  'units.plate_number',
  'units.brand',
  'units.model',
  'units.year',
  'units.color',
  'units.chassis_number',
  'units.engine_number',
  'units.received_at',
  'units.released_at',
  'units.notes',
  'units.created_at',
  'units.updated_at',
  'vehicle_types.id as vehicle_type_id',
  'vehicle_types.code as vehicle_type_code',
  'vehicle_types.name as vehicle_type_name',
  'partners.id as partner_id',
  'partners.code as partner_code',
  'partners.name as partner_name',
  'pools.id as pool_id',
  'pools.code as pool_code',
  'pools.name as pool_name',
  'unit_statuses.id as status_id',
  'unit_statuses.code as status_code',
  'unit_statuses.name as status_name',
  'unit_statuses.color as status_color',
  'unit_statuses.sequence as status_sequence',
];

/** Nilai ?sort= → kolom SQL (sudah di-whitelist oleh schema). */
const SORT_COLUMNS = {
  received_at: 'units.received_at',
  created_at: 'units.created_at',
  plate_number: 'units.plate_number',
  brand: 'units.brand',
  year: 'units.year',
  status: 'unit_statuses.sequence',
  pool: 'pools.name',
};

const FILTER_COLUMNS = {
  status_id: 'units.status_id',
  pool_id: 'units.pool_id',
  partner_id: 'units.partner_id',
  vehicle_type_id: 'units.vehicle_type_id',
};

/** Subquery jumlah inspeksi per unit (dipakai untuk menentukan aksi yang diizinkan). */
const inspectionCountColumn = () =>
  db('inspections').whereRaw('?? = ??', ['inspections.unit_id', 'units.id']).count('*').as('inspection_count');

/** FROM units + JOIN ke semua master & status, dipakai list dan detail. */
const unitsWithRelations = () =>
  db('units')
    .join('vehicle_types', 'vehicle_types.id', 'units.vehicle_type_id')
    .join('partners', 'partners.id', 'units.partner_id')
    .join('pools', 'pools.id', 'units.pool_id')
    .join('unit_statuses', 'unit_statuses.id', 'units.status_id');

/** Baris datar hasil JOIN → objek bersarang yang enak dipakai frontend (unit.status.color, dll). */
function toUnit(row) {
  const {
    vehicle_type_id, vehicle_type_code, vehicle_type_name,
    partner_id, partner_code, partner_name,
    pool_id, pool_code, pool_name,
    status_id, status_code, status_name, status_color, status_sequence,
    inspection_count,
    ...unit
  } = row;

  return {
    ...unit,
    inspection_count: Number(inspection_count),
    vehicle_type: { id: vehicle_type_id, code: vehicle_type_code, name: vehicle_type_name },
    partner: { id: partner_id, code: partner_code, name: partner_name },
    pool: { id: pool_id, code: pool_code, name: pool_name },
    status: { id: status_id, code: status_code, name: status_name, color: status_color, sequence: status_sequence },
  };
}

export async function findAll({ page, limit, search, sort, order, ...filters }) {
  const query = unitsWithRelations();

  if (search) {
    const pattern = toLikePattern(search);
    query.where((builder) => {
      orWherePlateLike(builder, 'units.plate_number', search)
        .orWhere('units.brand', 'like', pattern)
        .orWhere('units.model', 'like', pattern);
    });
  }

  for (const [name, column] of Object.entries(FILTER_COLUMNS)) {
    if (filters[name] !== undefined) query.where(column, filters[name]);
  }

  const [rows, countResult] = await Promise.all([
    query
      .clone()
      .select([...UNIT_COLUMNS, inspectionCountColumn()])
      .orderBy([{ column: SORT_COLUMNS[sort], order }, { column: 'units.id', order }])
      .limit(limit)
      .offset(getOffset({ page, limit })),
    query.clone().count({ total: '*' }).first(),
  ]);

  return { rows: rows.map(toUnit), total: Number(countResult.total) };
}

/** Detail unit + jumlah inspeksinya. */
export async function findById(id) {
  const row = await unitsWithRelations()
    .select([...UNIT_COLUMNS, inspectionCountColumn()])
    .where('units.id', id)
    .first();

  return row ? toUnit(row) : null;
}

/**
 * Baris unit mentah + kunci baris (SELECT ... FOR UPDATE) sampai transaction selesai.
 * Mencegah dua request mengubah status/pool unit yang sama secara bersamaan.
 */
export const findByIdForUpdate = (id, trx) => trx('units').where({ id }).forUpdate().first();

/** Unit AKTIF lain dengan plat yang sama (aturan bisnis 1). */
export function findActiveByPlate(plateNumber, exceptId, trx = db) {
  const query = trx('units')
    .join('unit_statuses', 'unit_statuses.id', 'units.status_id')
    .join('pools', 'pools.id', 'units.pool_id')
    .select('units.id', 'units.plate_number', 'pools.name as pool_name')
    .where('units.plate_number', plateNumber)
    .where('unit_statuses.counts_toward_capacity', true);

  if (exceptId) query.whereNot('units.id', exceptId);
  return query.first();
}

export async function create(data, trx) {
  const [id] = await trx('units').insert(data);
  return id;
}

export const update = (id, data, trx = db) => trx('units').where({ id }).update(data);

/** Riwayat status ikut terhapus otomatis (FK ON DELETE CASCADE). */
export const remove = (id) => db('units').where({ id }).del();

export async function countInspections(unitId, trx = db) {
  const result = await trx('inspections').where('unit_id', unitId).count({ total: '*' }).first();
  return Number(result.total);
}

export async function findEarliestInspectionDate(unitId, trx = db) {
  const result = await trx('inspections').where('unit_id', unitId).min({ earliest: 'inspection_date' }).first();
  return result.earliest;
}

/* ---------- Riwayat status ---------- */

export const insertHistory = (history, trx) => trx('unit_status_histories').insert(history);

/** Timeline unit, urut dari yang paling lama. */
export async function findHistories(unitId) {
  const rows = await db('unit_status_histories as h')
    .leftJoin('unit_statuses as from_status', 'from_status.id', 'h.from_status_id')
    .join('unit_statuses as to_status', 'to_status.id', 'h.to_status_id')
    .select(
      'h.id',
      'h.note',
      'h.changed_at',
      'from_status.id as from_id',
      'from_status.code as from_code',
      'from_status.name as from_name',
      'from_status.color as from_color',
      'to_status.id as to_id',
      'to_status.code as to_code',
      'to_status.name as to_name',
      'to_status.color as to_color',
    )
    .where('h.unit_id', unitId)
    .orderBy([{ column: 'h.changed_at', order: 'asc' }, { column: 'h.id', order: 'asc' }]);

  return rows.map((row) => ({
    id: row.id,
    note: row.note,
    changed_at: row.changed_at,
    from_status: row.from_id ? { id: row.from_id, code: row.from_code, name: row.from_name, color: row.from_color } : null,
    to_status: { id: row.to_id, code: row.to_code, name: row.to_name, color: row.to_color },
  }));
}
