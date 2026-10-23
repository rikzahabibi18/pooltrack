import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { idParamSchema } from '../../utils/zodHelpers.js';
import * as partnerController from './partner.controller.js';
import { partnerBodySchema, partnerListQuerySchema } from './partner.schema.js';

/** /api/partners */
const router = Router();
const validateId = validate(idParamSchema, 'params');

router.get('/', validate(partnerListQuerySchema, 'query'), partnerController.list);
router.get('/:id', validateId, partnerController.detail);
router.post('/', validate(partnerBodySchema), partnerController.create);
router.put('/:id', validateId, validate(partnerBodySchema), partnerController.update);
router.delete('/:id', validateId, partnerController.remove);

export default router;
