import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../utils/zodHelpers.js';
import * as inspectionController from '../inspections/inspection.controller.js';
import { inspectionBodySchema } from '../inspections/inspection.schema.js';
import * as unitController from './unit.controller.js';
import { changeStatusSchema, createUnitSchema, moveUnitSchema, unitListQuerySchema, updateUnitSchema } from './unit.schema.js';

/** /api/units */
const router = Router();
const validateId = validate(idParamSchema, 'params');

router.get('/', validate(unitListQuerySchema, 'query'), unitController.list);
router.post('/', validate(createUnitSchema), unitController.create);
router.get('/:id', validateId, unitController.detail);
router.put('/:id', validateId, validate(updateUnitSchema), unitController.update);
router.delete('/:id', validateId, unitController.remove);

// Perubahan status & lokasi lewat endpoint khusus, supaya aturan bisnisnya tidak bisa dilewati
router.patch('/:id/status', validateId, validate(changeStatusSchema), unitController.changeStatus);
router.patch('/:id/move', validateId, validate(moveUnitSchema), unitController.move);

router.get('/:id/histories', validateId, unitController.histories);

// Inspeksi milik unit
router.get('/:id/inspections', validateId, inspectionController.listByUnit);
router.post('/:id/inspections', validateId, validate(inspectionBodySchema), inspectionController.createForUnit);

export default router;
