import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/api.js';
import { DB_ERROR_CODES } from '../constants/database.js';
import { MESSAGES } from '../constants/messages.js';
import { AppError } from '../utils/AppError.js';

/**
 * Mengubah error apa pun menjadi AppError:
 * 1. AppError dari service          → dipakai apa adanya
 * 2. Body JSON rusak                → 400
 * 3. Error constraint database      → 409 / 400 dengan pesan ramah (jaring pengaman)
 * 4. Selain itu (bug, DB mati, dll) → 500
 */
function toAppError(error) {
  if (error instanceof AppError) return error;

  if (error.type === 'entity.parse.failed') return AppError.badRequest(MESSAGES.INVALID_JSON);

  if (error.code === DB_ERROR_CODES.DUPLICATE_ENTRY) return AppError.conflict(MESSAGES.DUPLICATE_ENTRY);
  if (DB_ERROR_CODES.ROW_IS_REFERENCED.includes(error.code)) return AppError.conflict(MESSAGES.RESOURCE_IN_USE);
  if (DB_ERROR_CODES.NO_REFERENCED_ROW.includes(error.code)) return AppError.badRequest(MESSAGES.INVALID_REFERENCE);

  return new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_ERROR);
}

// Express mengenali error handler dari jumlah parameternya (4), jadi `_next` wajib ditulis.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  const appError = toAppError(error);
  const isServerError = appError.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Error tak terduga dicatat lengkap di log server, tapi detailnya tidak dikirim ke klien.
  if (isServerError) console.error(error);

  const body = { success: false, message: appError.message };
  if (appError.errors.length > 0) body.errors = appError.errors;
  if (isServerError && !env.isProduction) body.stack = error.stack;

  res.status(appError.statusCode).json(body);
}
