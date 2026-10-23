import { z } from 'zod';
import { orderParam, paginationQuerySchema, sortParam } from '../../utils/pagination.js';
import {
  optionalIdQueryParam,
  optionalText,
  pastOrTodayDate,
  plateNumberField,
  requiredId,
  requiredText,
  vehicleYearField,
} from '../../utils/zodHelpers.js';

// Batas panjang mengikuti kolom di migration create_units / create_unit_status_histories
const MAX = { PLATE: 15, BRAND: 50, MODEL: 80, COLOR: 30, CHASSIS: 50, ENGINE: 50, NOTES: 1000, STATUS_NOTE: 200 };

/** `status` = urutan status (sequence), `pool` = nama pool. */
export const UNIT_SORT_FIELDS = ['received_at', 'created_at', 'plate_number', 'brand', 'year', 'status', 'pool'];

/** GET /api/units?page=&limit=&search=&sort=&order=&status_id=&pool_id=&partner_id=&vehicle_type_id= */
export const unitListQuerySchema = paginationQuerySchema.extend({
  sort: sortParam(UNIT_SORT_FIELDS, 'received_at'),
  order: orderParam('desc'),
  status_id: optionalIdQueryParam,
  pool_id: optionalIdQueryParam,
  partner_id: optionalIdQueryParam,
  vehicle_type_id: optionalIdQueryParam,
});

/** Data unit yang boleh diubah lewat form edit. */
const editableFields = {
  plate_number: plateNumberField('Nomor plat', { max: MAX.PLATE }),
  brand: requiredText('Merek', { max: MAX.BRAND }),
  model: requiredText('Model', { max: MAX.MODEL }),
  year: vehicleYearField('Tahun'),
  color: optionalText('Warna', { max: MAX.COLOR }),
  chassis_number: optionalText('Nomor rangka', { max: MAX.CHASSIS }),
  engine_number: optionalText('Nomor mesin', { max: MAX.ENGINE }),
  vehicle_type_id: requiredId('Jenis kendaraan'),
  partner_id: requiredId('Mitra'),
  received_at: pastOrTodayDate('Tanggal masuk'),
  notes: optionalText('Catatan', { max: MAX.NOTES }),
};

/** POST /api/units — unit baru selalu berstatus MASUK, jadi status tidak dikirim. */
export const createUnitSchema = z.object({
  ...editableFields,
  pool_id: requiredId('Pool'),
});

/**
 * PUT /api/units/:id — pool_id & status_id sengaja TIDAK ada (keputusan B).
 * Jika tetap dikirim, Zod membuangnya; perubahan pool/status hanya lewat endpoint khusus.
 */
export const updateUnitSchema = z.object(editableFields);

/** PATCH /api/units/:id/status */
export const changeStatusSchema = z.object({
  to_status_id: requiredId('Status tujuan'),
  note: optionalText('Catatan', { max: MAX.STATUS_NOTE }),
});

/** PATCH /api/units/:id/move */
export const moveUnitSchema = z.object({
  pool_id: requiredId('Pool tujuan'),
  note: optionalText('Catatan', { max: MAX.STATUS_NOTE }),
});
