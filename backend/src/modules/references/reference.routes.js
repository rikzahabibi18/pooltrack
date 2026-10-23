import { Router } from 'express';
import * as referenceController from './reference.controller.js';

/** /api/references — hanya baca (data diisi lewat seeder). */
const router = Router();

router.get('/unit-statuses', referenceController.unitStatuses);
router.get('/inspection-grades', referenceController.inspectionGrades);

export default router;
