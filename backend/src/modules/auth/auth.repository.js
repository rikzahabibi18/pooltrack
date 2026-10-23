import { db } from '../../config/database.js';

/** Repository: HANYA query Knex ke tabel users. */

const TABLE = 'users';
/** Kolom yang aman dikirim ke klien (tanpa password_hash). */
const PUBLIC_COLUMNS = ['id', 'name', 'email', 'created_at'];

export const findById = (id) => db(TABLE).select(PUBLIC_COLUMNS).where({ id }).first();

/** Dipakai saat login: ikut mengambil password_hash untuk dicocokkan. */
export const findByEmailWithPassword = (email) =>
  db(TABLE).select([...PUBLIC_COLUMNS, 'password_hash']).where({ email }).first();

export const existsByEmail = async (email) => Boolean(await db(TABLE).select('id').where({ email }).first());

export async function create(data) {
  const [id] = await db(TABLE).insert(data);
  return id;
}
