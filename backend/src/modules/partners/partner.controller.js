import { HTTP_STATUS } from '../../constants/api.js';
import { MESSAGES } from '../../constants/messages.js';
import { sendSuccess } from '../../utils/response.js';
import * as partnerService from './partner.service.js';
import { PARTNER_LABEL } from './partner.service.js';

/**
 * Controller: hanya mengurus request & response.
 * Input sudah divalidasi middleware (req.validated), logika ada di service.
 * Express 5 otomatis meneruskan error dari fungsi async ke errorHandler.
 */

export async function list(req, res) {
  const { data, meta } = await partnerService.list(req.validated.query);
  sendSuccess(res, { message: MESSAGES.listed(PARTNER_LABEL), data, meta });
}

export async function detail(req, res) {
  const data = await partnerService.getById(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.detail(PARTNER_LABEL), data });
}

export async function create(req, res) {
  const data = await partnerService.create(req.validated.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.created(PARTNER_LABEL), data });
}

export async function update(req, res) {
  const data = await partnerService.update(req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: MESSAGES.updated(PARTNER_LABEL), data });
}

export async function remove(req, res) {
  await partnerService.remove(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.deleted(PARTNER_LABEL), data: { id: req.validated.params.id } });
}
