import { MESSAGES } from '../constants/messages.js';
import { AppError } from '../utils/AppError.js';

/** Dipasang setelah semua route: request yang tidak cocok dengan route mana pun → 404. */
export function notFound(req, _res, next) {
  next(AppError.notFound(`${MESSAGES.ROUTE_NOT_FOUND}: ${req.method} ${req.originalUrl}`));
}
