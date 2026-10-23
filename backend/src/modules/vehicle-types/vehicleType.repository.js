import { db } from '../../config/database.js';
import { applySearch, paginate } from '../../utils/pagination.js';

/** Repository: HANYA query Knex ke tabel vehicle_types, tanpa aturan bisnis. */

const TABLE = 'vehicle_types';
const COLUMNS = ['id', 'code', 'name', 'is_active', 'created_at', 'updated_at'];
const SEARCH_COLUMNS = ['code', 'name'];

export function findAll({ page, limit, search, sort, order, is_active }) {
  const query = db(TABLE);
  applySearch(query, SEARCH_COLUMNS, search);
  if (is_active !== undefined) query.where('is_active', is_active);

  return paginate(query, {
    select: COLUMNS,
    page,
    limit,
    orderBy: [{ column: sort, order }, { column: 'id', order }],
  });
}

export const findById = (id) => db(TABLE).select(COLUMNS).where({ id }).first();

export const findByCode = (code) => db(TABLE).select('id', 'code').where({ code }).first();

export async function create(data) {
  const [id] = await db(TABLE).insert(data);
  return id;
}

export const update = (id, data) => db(TABLE).where({ id }).update(data);

export const remove = (id) => db(TABLE).where({ id }).del();

/** Jumlah unit (termasuk yang sudah KELUAR) dengan jenis kendaraan ini. */
export async function countUnits(id) {
  const result = await db('units').where('vehicle_type_id', id).count({ total: '*' }).first();
  return Number(result.total);
}
