import { sendSuccess } from '../../utils/response.js';
import * as dashboardService from './dashboard.service.js';

export async function summary(_req, res) {
  const data = await dashboardService.getSummary();
  sendSuccess(res, { message: 'Ringkasan dashboard berhasil dimuat', data });
}
