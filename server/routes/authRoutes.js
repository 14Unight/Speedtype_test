import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin, validateProfileUpdate } from '../middleware/validationMiddleware.js';
import { authLimiter, registrationLimiter } from '../config/rateLimiter.js';
import { requireCSRF, skipCSRF } from '../middleware/csrfMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', 
  registrationLimiter,
  validateRegister,
  skipCSRF, // Skip CSRF for registration as it's the first interaction
  register
);

router.post('/login',
  authLimiter,
  validateLogin,
  skipCSRF, // Skip CSRF for login as it's often the first interaction
  login
);

router.post('/refresh',
  authLimiter,
  skipCSRF, // Skip CSRF for token refresh as it's automated
  refresh
);

// Protected routes
router.post('/logout',
  authenticate,
  requireCSRF,
  logout
);

router.post('/logout-all',
  authenticate,
  requireCSRF,
  logoutAll
);

router.get('/me',
  authenticate,
  getMe
);

router.put('/profile',
  authenticate,
  requireCSRF,
  validateProfileUpdate,
  updateProfile
);

export default router;
