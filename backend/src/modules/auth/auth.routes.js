import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { validate } from '../../middlewares/validate.js';
import * as authController from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schema.js';

/** /api/auth — register & login terbuka; /me butuh token. */
const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);

export default router;
