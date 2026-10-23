import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../utils/zodHelpers.js';
import * as poolController from './pool.controller.js';
import { poolBodySchema, poolListQuerySchema } from './pool.schema.js';

/** /api/pools */
const router = Router();
const validateId = validate(idParamSchema, 'params');

router.get('/', validate(poolListQuerySchema, 'query'), poolController.list);
router.get('/:id', validateId, poolController.detail);
router.post('/', validate(poolBodySchema), poolController.create);
router.put('/:id', validateId, validate(poolBodySchema), poolController.update);
router.delete('/:id', validateId, poolController.remove);

export default router;
