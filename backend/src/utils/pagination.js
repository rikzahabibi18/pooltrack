import { z } from 'zod';
import { PAGINATION, SORT_ORDERS } from '../constants/api.js';

/**
 * Bagian schema query yang sama untuk semua endpoint list:
 * ?page=1&limit=10&search=...&order=asc
 * Setiap modul menambahkan `sort` (daftar kolom yang diizinkan) dan filternya sendiri.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'page harus berupa angka' })
    .int('page harus bilangan bulat')
    .min(1, 'page minimal 1')
    .default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number({ invalid_type_error: 'limit harus berupa angka' })
    .int('limit harus bilangan bulat')
    .min(1, 'limit minimal 1')
    .max(PAGINATION.MAX_LIMIT, `limit maksimal ${PAGINATION.MAX_LIMIT}`)
    .default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().trim().optional(),
  order: allowedValues('order', SORT_ORDERS).default('asc'),
});

/** Parameter ?sort= yang hanya menerima kolom dari whitelist modul. */
export const sortParam = (fields, defaultValue) => allowedValues('sort', fields).default(defaultValue);

/** Mengganti default ?order= untuk list yang sebaiknya terbaru dulu (mis. unit, inspeksi). */
export const orderParam = (defaultValue) => allowedValues('order', SORT_ORDERS).default(defaultValue);

/** Enum dengan pesan error berbahasa Indonesia, mis. "sort harus salah satu dari: code, name". */
function allowedValues(name, values) {
  return z.enum(values, { errorMap: () => ({ message: `${name} harus salah satu dari: ${values.join(', ')}` }) });
}

export const getOffset = ({ page, limit }) => (page - 1) * limit;

export function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Pencarian teks: WHERE (kolom1 LIKE '%kata%' OR kolom2 LIKE '%kata%' ...).
 * Karakter % dan _ dari user di-escape supaya dicari sebagai huruf biasa.
 */
export function applySearch(query, columns, search) {
  if (!search) return query;

  const pattern = toLikePattern(search);
  return query.where((builder) => {
    for (const column of columns) builder.orWhere(column, 'like', pattern);
  });
}

/** "kata" → "%kata%" dengan % dan _ dari user di-escape. */
export const toLikePattern = (search) => `%${search.replace(/[\\%_]/g, '\\$&')}%`;

/**
 * Kondisi pencarian plat yang mengabaikan spasi: "B1234" cocok dengan "B 1234 XYZ".
 * Dipakai bersama oleh list unit dan list inspeksi.
 */
export function orWherePlateLike(builder, column, search) {
  return builder.orWhereRaw("REPLACE(??, ' ', '') LIKE ?", [column, toLikePattern(search.replace(/\s+/g, ''))]);
}

/**
 * Menjalankan query list dengan pagination.
 * Dua query berjalan paralel: satu mengambil data halaman ini, satu menghitung total.
 *
 * @param baseQuery Query Knex yang sudah berisi FROM + WHERE (tanpa SELECT/ORDER/LIMIT)
 * @param options.select  Kolom yang diambil
 * @param options.orderBy Daftar { column, order }
 */
export async function paginate(baseQuery, { select, page, limit, orderBy }) {
  const [rows, countResult] = await Promise.all([
    baseQuery.clone().select(select).orderBy(orderBy).limit(limit).offset(getOffset({ page, limit })),
    baseQuery.clone().count({ total: '*' }).first(),
  ]);

  return { rows, total: Number(countResult.total) };
}
