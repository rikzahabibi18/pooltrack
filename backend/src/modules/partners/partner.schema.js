import { z } from 'zod';
import { paginationQuerySchema, sortParam } from '../../utils/pagination.js';
import {
  booleanField,
  booleanQueryParam,
  codeField,
  optionalEmail,
  optionalPhone,
  optionalText,
  requiredText,
} from '../../utils/zodHelpers.js';

// Batas panjang mengikuti kolom di migration create_partners
const MAX = { CODE: 20, NAME: 150, CONTACT: 100, PHONE: 30, EMAIL: 150 };

/** Kolom yang boleh dipakai untuk ?sort= (whitelist, mencegah SQL injection lewat ORDER BY). */
export const PARTNER_SORT_FIELDS = ['code', 'name', 'created_at'];

/** GET /api/partners?page=&limit=&search=&sort=&order=&is_active= */
export const partnerListQuerySchema = paginationQuerySchema.extend({
  sort: sortParam(PARTNER_SORT_FIELDS, 'name'),
  is_active: booleanQueryParam,
});

/** Body POST & PUT (PUT mengirim data lengkap). */
export const partnerBodySchema = z.object({
  code: codeField('Kode mitra', { max: MAX.CODE }),
  name: requiredText('Nama mitra', { max: MAX.NAME, min: 3 }),
  contact_person: optionalText('Nama kontak', { max: MAX.CONTACT }),
  phone: optionalPhone('Telepon', { max: MAX.PHONE }),
  email: optionalEmail('Email', { max: MAX.EMAIL }),
  is_active: booleanField('Status aktif', { defaultValue: true }),
});
