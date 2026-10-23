import { HTTP_STATUS } from '../constants/api.js';

/**
 * Format respons sukses yang seragam:
 * { success: true, message, data, meta? }   (meta hanya untuk list)
 */
export function sendSuccess(res, { statusCode = HTTP_STATUS.OK, message, data = null, meta } = {}) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}
