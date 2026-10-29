import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { isAuth } from '../middlewares/isAuth.js';
import { uploadAvatarMiddleware } from '../middlewares/upload.middleware.js';
import { loginLimiter } from '../middlewares/rate-limit.middleware.js';
import {
  registerSchema,
  loginSchema,
} from '../validations/auth.schema.js';
import {
  register,
  login,
  getProfile,
  uploadAvatar,
} from '../controllers/auth.controller.js';

const router = Router();

// POST /register (Public)
router.post('/register', validate(registerSchema), register);

// POST /login (Public, giới hạn 5 request/60s qua loginLimiter)
router.post('/login', loginLimiter, validate(loginSchema), login);

// GET /profile (Yêu cầu đăng nhập - isAuth)
router.get('/profile', isAuth, getProfile);

// POST /me/avatar (Yêu cầu đăng nhập - isAuth -> Multer -> Controller)
router.post('/me/avatar', isAuth, uploadAvatarMiddleware, uploadAvatar);

export default router;
