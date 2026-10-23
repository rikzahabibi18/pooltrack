import { MESSAGES } from '../constants/messages.js';
import { AppError } from '../utils/AppError.js';

/**
 * Validasi req.body / req.query / req.params dengan schema Zod.
 *
 * Data yang lolos validasi (sudah dibersihkan & dikonversi tipenya) disimpan di
 * `req.validated[source]`. Di Express 5, `req.query` bersifat read-only, jadi
 * kita tidak menimpanya.
 *
 * Contoh: router.post('/', validate(createPartnerSchema), controller.create)
 */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(AppError.badRequest(MESSAGES.VALIDATION_FAILED, errors));
  }

  req.validated = { ...req.validated, [source]: result.data };
  return next();
};
