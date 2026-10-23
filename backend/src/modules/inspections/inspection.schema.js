import { z } from 'zod';
import { orderParam, paginationQuerySchema, sortParam } from '../../utils/pagination.js';
import {
  optionalIdQueryParam,
  optionalNonNegativeInt,
  optionalText,
  pastOrTodayDate,
  requiredId,
  requiredText,
} from '../../utils/zodHelpers.js';

// Batas mengikuti kolom di migration create_inspections
const MAX = { INSPECTOR: 100, NOTES: 1000, ODOMETER_KM: 9_999_999 };

/** `grade` = kode grade (A–D), `plate_number` = plat unit. */
export const INSPECTION_SORT_FIELDS = ['inspection_date', 'created_at', 'plate_number', 'grade'];

/** GET /api/inspections?page=&limit=&search=&sort=&order=&grade_id=&pool_id=&unit_id= */
export const inspectionListQuerySchema = paginationQuerySchema.extend({
  sort: sortParam(INSPECTION_SORT_FIELDS, 'inspection_date'),
  order: orderParam('desc'),
  grade_id: optionalIdQueryParam,
  pool_id: optionalIdQueryParam,
  unit_id: optionalIdQueryParam,
});

/** Body POST /api/units/:id/inspections dan PUT /api/inspections/:id (unit tidak bisa diganti). */
export const inspectionBodySchema = z.object({
  inspection_date: pastOrTodayDate('Tanggal inspeksi'),
  inspector_name: requiredText('Nama inspektor', { max: MAX.INSPECTOR, min: 3 }),
  odometer_km: optionalNonNegativeInt('Odometer', { max: MAX.ODOMETER_KM }),
  exterior_notes: optionalText('Kondisi eksterior', { max: MAX.NOTES }),
  interior_notes: optionalText('Kondisi interior', { max: MAX.NOTES }),
  engine_notes: optionalText('Kondisi mesin', { max: MAX.NOTES }),
  grade_id: requiredId('Grade'),
  notes: optionalText('Catatan', { max: MAX.NOTES }),
});
