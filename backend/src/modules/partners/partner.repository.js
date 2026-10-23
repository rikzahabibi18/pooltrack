import { db } from '../../config/database.js';
import { applySearch, paginate } from '../../utils/pagination.js';

/** Repository: HANYA query Knex ke tabel partners, tanpa aturan bisnis. */

const TABLE = 'partners';
const COLUMNS = ['id', 'code', 'name', 'contact_person', 'phone', 'email', 'is_active', 'created_at', 'updated_at'];
const SEARCH_COLUMNS = ['code', 'name', 'contact_person', 'email'];

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

/** Jumlah unit (termasuk yang sudah KELUAR) yang memakai mitra ini. */
export async function countUnits(id) {
  const result = await db('units').where('partner_id', id).count({ total: '*' }).first();
  return Number(result.total);
}
