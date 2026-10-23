import { HTTP_STATUS } from '../../constants/api.js';
import { MESSAGES } from '../../constants/messages.js';
import { sendSuccess } from '../../utils/response.js';
import * as authService from './auth.service.js';

export async function register(req, res) {
  const data = await authService.register(req.validated.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.REGISTERED, data });
}

export async function login(req, res) {
  const data = await authService.login(req.validated.body);
  sendSuccess(res, { message: MESSAGES.LOGGED_IN, data });
}

/** req.user diisi oleh middleware requireAuth. */
export function me(req, res) {
  sendSuccess(res, { message: MESSAGES.CURRENT_USER, data: req.user });
}
