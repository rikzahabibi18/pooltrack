import { HTTP_STATUS } from '../../constants/api.js';
import { MESSAGES } from '../../constants/messages.js';
import { sendSuccess } from '../../utils/response.js';
import * as poolService from './pool.service.js';
import { POOL_LABEL } from './pool.service.js';

export async function list(req, res) {
  const { data, meta } = await poolService.list(req.validated.query);
  sendSuccess(res, { message: MESSAGES.listed(POOL_LABEL), data, meta });
}

export async function detail(req, res) {
  const data = await poolService.getById(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.detail(POOL_LABEL), data });
}

export async function create(req, res) {
  const data = await poolService.create(req.validated.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.created(POOL_LABEL), data });
}

export async function update(req, res) {
  const data = await poolService.update(req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: MESSAGES.updated(POOL_LABEL), data });
}

export async function remove(req, res) {
  await poolService.remove(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.deleted(POOL_LABEL), data: { id: req.validated.params.id } });
}
