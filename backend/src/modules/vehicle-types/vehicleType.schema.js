import { z } from 'zod';
import { paginationQuerySchema, sortParam } from '../../utils/pagination.js';
import { booleanField, booleanQueryParam, codeField, requiredText } from '../../utils/zodHelpers.js';

// Batas panjang mengikuti kolom di migration create_vehicle_types
const MAX = { CODE: 20, NAME: 50 };

export const VEHICLE_TYPE_SORT_FIELDS = ['code', 'name', 'created_at'];

/** GET /api/vehicle-types?page=&limit=&search=&sort=&order=&is_active= */
export const vehicleTypeListQuerySchema = paginationQuerySchema.extend({
  sort: sortParam(VEHICLE_TYPE_SORT_FIELDS, 'name'),
  is_active: booleanQueryParam,
});

export const vehicleTypeBodySchema = z.object({
  code: codeField('Kode jenis kendaraan', { max: MAX.CODE }),
  name: requiredText('Nama jenis kendaraan', { max: MAX.NAME, min: 2 }),
  is_active: booleanField('Status aktif', { defaultValue: true }),
});
