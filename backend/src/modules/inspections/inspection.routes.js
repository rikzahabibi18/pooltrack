import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../utils/zodHelpers.js';
import * as inspectionController from './inspection.controller.js';
import { inspectionBodySchema, inspectionListQuerySchema } from './inspection.schema.js';

/**
 * /api/inspections
 * Menambah inspeksi dilakukan lewat POST /api/units/:id/inspections (lihat unit.routes.js),
 * karena inspeksi selalu milik satu unit.
 */
const router = Router();
const validateId = validate(idParamSchema, 'params');

router.get('/', validate(inspectionListQuerySchema, 'query'), inspectionController.list);
router.get('/:id', validateId, inspectionController.detail);
router.put('/:id', validateId, validate(inspectionBodySchema), inspectionController.update);
router.delete('/:id', validateId, inspectionController.remove);

export default router;
