import { HTTP_STATUS } from '../../constants/api.js';
import { MESSAGES } from '../../constants/messages.js';
import { sendSuccess } from '../../utils/response.js';
import * as unitService from './unit.service.js';
import { UNIT_LABEL } from './unit.service.js';

export async function list(req, res) {
  const { data, meta } = await unitService.list(req.validated.query);
  sendSuccess(res, { message: MESSAGES.listed(UNIT_LABEL), data, meta });
}

export async function detail(req, res) {
  const data = await unitService.getById(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.detail(UNIT_LABEL), data });
}

export async function create(req, res) {
  const data = await unitService.create(req.validated.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.created(UNIT_LABEL), data });
}

export async function update(req, res) {
  const data = await unitService.update(req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: MESSAGES.updated(UNIT_LABEL), data });
}

export async function remove(req, res) {
  await unitService.remove(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.deleted(UNIT_LABEL), data: { id: req.validated.params.id } });
}

export async function changeStatus(req, res) {
  const data = await unitService.changeStatus(req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: `Status unit berhasil diubah menjadi ${data.status.name}`, data });
}

export async function move(req, res) {
  const data = await unitService.move(req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: `Unit berhasil dipindahkan ke ${data.pool.name}`, data });
}

export async function histories(req, res) {
  const data = await unitService.getHistories(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.listed('Riwayat status'), data });
}
