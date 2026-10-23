import { HTTP_STATUS } from '../../constants/api.js';
import { MESSAGES } from '../../constants/messages.js';
import { sendSuccess } from '../../utils/response.js';
import * as inspectionService from './inspection.service.js';
import { INSPECTION_LABEL } from './inspection.service.js';

export async function list(req, res) {
  const { data, meta } = await inspectionService.list(req.validated.query);
  sendSuccess(res, { message: MESSAGES.listed(INSPECTION_LABEL), data, meta });
}

export async function detail(req, res) {
  const data = await inspectionService.getById(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.detail(INSPECTION_LABEL), data });
}

/** GET /api/units/:id/inspections */
export async function listByUnit(req, res) {
  const data = await inspectionService.listByUnit(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.listed(INSPECTION_LABEL), data });
}

/** POST /api/units/:id/inspections — pesan memberi tahu jika status unit ikut berubah. */
export async function createForUnit(req, res) {
  const { inspection, newStatus } = await inspectionService.createForUnit(req.validated.params.id, req.validated.body);
  const message = newStatus
    ? `${MESSAGES.created(INSPECTION_LABEL)}. Status unit berubah menjadi ${newStatus.name}`
    : MESSAGES.created(INSPECTION_LABEL);

  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message,
    data: { ...inspection, unit_status_changed: Boolean(newStatus) },
  });
}

export async function update(req, res) {
  const data = await inspectionService.update(req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: MESSAGES.updated(INSPECTION_LABEL), data });
}

export async function remove(req, res) {
  await inspectionService.remove(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.deleted(INSPECTION_LABEL), data: { id: req.validated.params.id } });
}
