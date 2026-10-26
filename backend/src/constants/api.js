/** Prefix semua endpoint, mis. GET /api/health */
export const API_PREFIX = '/api';

/**
 * Port bawaan jika PORT tidak diisi. Di Vercel (serverless) memang tidak ada PORT,
 * karena Vercel sendiri yang menerima request lalu meneruskannya ke app.
 */
export const DEFAULT_PORT = 4000;

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
});

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

export const SORT_ORDERS = Object.freeze(['asc', 'desc']);
