import { HTTP_STATUS } from '../../constants/api.js';
import { MESSAGES } from '../../constants/messages.js';
import { sendSuccess } from '../../utils/response.js';
import * as vehicleTypeService from './vehicleType.service.js';
import { VEHICLE_TYPE_LABEL } from './vehicleType.service.js';

export async function list(req, res) {
  const { data, meta } = await vehicleTypeService.list(req.validated.query);
  sendSuccess(res, { message: MESSAGES.listed(VEHICLE_TYPE_LABEL), data, meta });
}

export async function detail(req, res) {
  const data = await vehicleTypeService.getById(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.detail(VEHICLE_TYPE_LABEL), data });
}

export async function create(req, res) {
  const data = await vehicleTypeService.create(req.validated.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.created(VEHICLE_TYPE_LABEL), data });
}

export async function update(req, res) {
  const data = await vehicleTypeService.update(req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: MESSAGES.updated(VEHICLE_TYPE_LABEL), data });
}

export async function remove(req, res) {
  await vehicleTypeService.remove(req.validated.params.id);
  sendSuccess(res, { message: MESSAGES.deleted(VEHICLE_TYPE_LABEL), data: { id: req.validated.params.id } });
}
