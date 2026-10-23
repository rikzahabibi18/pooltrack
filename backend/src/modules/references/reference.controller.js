import { MESSAGES } from '../../constants/messages.js';
import { sendSuccess } from '../../utils/response.js';
import * as referenceService from './reference.service.js';

export async function unitStatuses(_req, res) {
  const data = await referenceService.getUnitStatuses();
  sendSuccess(res, { message: MESSAGES.listed('Status unit'), data });
}

export async function inspectionGrades(_req, res) {
  const data = await referenceService.getInspectionGrades();
  sendSuccess(res, { message: MESSAGES.listed('Grade inspeksi'), data });
}
