import { AUTH } from '../constants/auth.js';
import { MESSAGES } from '../constants/messages.js';
import { getUserFromToken } from '../modules/auth/auth.service.js';
import { AppError } from '../utils/AppError.js';

/**
 * Penjaga endpoint: request wajib membawa header `Authorization: Bearer <token>`.
 * Jika token valid, data user disimpan di `req.user`; jika tidak → 401.
 */
export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? '';
  if (!header.startsWith(AUTH.BEARER_PREFIX)) {
    throw AppError.unauthorized(MESSAGES.UNAUTHENTICATED);
  }

  req.user = await getUserFromToken(header.slice(AUTH.BEARER_PREFIX.length));
  next();
}
