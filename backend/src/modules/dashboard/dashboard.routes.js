import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

/** /api/dashboard */
const router = Router();

router.get('/summary', dashboardController.summary);

export default router;
