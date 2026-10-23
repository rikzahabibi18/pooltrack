import { db } from '../../config/database.js';
import { applySearch, paginate } from '../../utils/pagination.js';

/** Repository: HANYA query Knex ke tabel pools, tanpa aturan bisnis. */

const TABLE = 'pools';
const COLUMNS = ['id', 'code', 'name', 'city', 'address', 'capacity', 'is_active', 'created_at', 'updated_at'].map(
  (column) => `${TABLE}.${column}`,
);
const SEARCH_COLUMNS = ['code', 'name', 'city'];

/**
 * Unit "aktif" = unit yang status-nya `counts_toward_capacity = true`.
 * Aturan ini dibaca dari tabel unit_statuses, bukan dari kode status tertentu.
 *
 * @param trx Koneksi/transaction yang dipakai (default: koneksi biasa)
 */
const activeUnitsQuery = (trx = db) =>
  trx('units')
    .join('unit_statuses', 'unit_statuses.id', 'units.status_id')
    .where('unit_statuses.counts_toward_capacity', true);

/** Subquery okupansi per baris pool: (SELECT COUNT(*) ... WHERE units.pool_id = pools.id) */
const occupiedColumn = () => activeUnitsQuery().whereRaw('?? = ??', ['units.pool_id', 'pools.id']).count('*').as('occupied');

export function findAll({ page, limit, search, sort, order, is_active }) {
  const query = db(TABLE);
  applySearch(query, SEARCH_COLUMNS, search);
  if (is_active !== undefined) query.where('is_active', is_active);

  return paginate(query, {
    select: [...COLUMNS, occupiedColumn()],
    page,
    limit,
    orderBy: [{ column: sort, order }, { column: 'id', order }],
  });
}

export const findById = (id) => db(TABLE).select([...COLUMNS, occupiedColumn()]).where({ id }).first();

/**
 * Mengunci baris pool sampai transaction selesai (SELECT ... FOR UPDATE).
 * Request lain yang ingin mengubah/menambah unit ke pool ini harus menunggu,
 * sehingga hitungan kapasitas tidak bisa "balapan".
 */
export const findByIdForUpdate = (id, trx) => trx(TABLE).select(COLUMNS).where({ id }).forUpdate().first();

export async function countActiveUnits(poolId, trx = db) {
  const result = await activeUnitsQuery(trx).where('units.pool_id', poolId).count({ total: '*' }).first();
  return Number(result.total);
}

export const findByCode = (code) => db(TABLE).select('id', 'code').where({ code }).first();

export async function create(data) {
  const [id] = await db(TABLE).insert(data);
  return id;
}

export const update = (id, data, trx = db) => trx(TABLE).where({ id }).update(data);

export const remove = (id) => db(TABLE).where({ id }).del();

/** Jumlah unit (termasuk yang sudah KELUAR) yang pernah tercatat di pool ini. */
export async function countUnits(id) {
  const result = await db('units').where('pool_id', id).count({ total: '*' }).first();
  return Number(result.total);
}
