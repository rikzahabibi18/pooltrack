import { z } from 'zod';
import { paginationQuerySchema, sortParam } from '../../utils/pagination.js';
import {
  booleanField,
  booleanQueryParam,
  codeField,
  optionalText,
  positiveInt,
  requiredText,
} from '../../utils/zodHelpers.js';

// Batas panjang mengikuti kolom di migration create_pools
const MAX = { CODE: 20, NAME: 100, CITY: 100, ADDRESS: 500, CAPACITY: 100_000 };

/** `occupied` = jumlah unit aktif, dihitung oleh query (bukan kolom tabel). */
export const POOL_SORT_FIELDS = ['code', 'name', 'city', 'capacity', 'occupied', 'created_at'];

/** GET /api/pools?page=&limit=&search=&sort=&order=&is_active= */
export const poolListQuerySchema = paginationQuerySchema.extend({
  sort: sortParam(POOL_SORT_FIELDS, 'name'),
  is_active: booleanQueryParam,
});

export const poolBodySchema = z.object({
  code: codeField('Kode pool', { max: MAX.CODE }),
  name: requiredText('Nama pool', { max: MAX.NAME, min: 3 }),
  city: requiredText('Kota', { max: MAX.CITY, min: 2 }),
  address: optionalText('Alamat', { max: MAX.ADDRESS }),
  capacity: positiveInt('Kapasitas', { max: MAX.CAPACITY }),
  is_active: booleanField('Status aktif', { defaultValue: true }),
});
