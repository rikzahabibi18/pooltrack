import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../utils/zodHelpers.js';
import * as vehicleTypeController from './vehicleType.controller.js';
import { vehicleTypeBodySchema, vehicleTypeListQuerySchema } from './vehicleType.schema.js';

/** /api/vehicle-types */
const router = Router();
const validateId = validate(idParamSchema, 'params');

router.get('/', validate(vehicleTypeListQuerySchema, 'query'), vehicleTypeController.list);
router.get('/:id', validateId, vehicleTypeController.detail);
router.post('/', validate(vehicleTypeBodySchema), vehicleTypeController.create);
router.put('/:id', validateId, validate(vehicleTypeBodySchema), vehicleTypeController.update);
router.delete('/:id', validateId, vehicleTypeController.remove);

export default router;
