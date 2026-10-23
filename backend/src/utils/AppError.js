import { HTTP_STATUS } from '../constants/api.js';

/**
 * Error yang "disengaja" dan aman ditampilkan ke klien.
 * Service melempar AppError (mis. kapasitas penuh → 409),
 * lalu errorHandler mengubahnya menjadi respons JSON.
 *
 * `errors` berisi daftar { field, message } untuk kesalahan per-field.
 */
export class AppError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new AppError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message) {
    return new AppError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static notFound(message) {
    return new AppError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message, errors) {
    return new AppError(HTTP_STATUS.CONFLICT, message, errors);
  }
}
