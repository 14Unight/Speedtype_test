import express from 'express';
import {
  getText,
  submitResult,
  getHistory,
  getGuestHistory,
  ensureGuestSession
} from '../controllers/testController.js';
import { authenticate, optionalAuth, getGuestSession, requireGuestOrAuth } from '../middleware/authMiddleware.js';
import { validateTextRequest, validateTestSubmission } from '../middleware/validationMiddleware.js';
import { testTextLimiter, testSubmissionLimiter } from '../config/rateLimiter.js';
import { requireCSRF, skipCSRF } from '../middleware/csrfMiddleware.js';

const router = express.Router();

// Apply guest session middleware to all routes
router.use(getGuestSession);

// Public routes (guest or auth users)
router.get('/texts',
  optionalAuth,
  testTextLimiter,
  validateTextRequest,
  skipCSRF, // Skip CSRF for getting text as it's read-only
  getText
);

router.post('/submit',
  optionalAuth,
  testSubmissionLimiter,
  validateTestSubmission,
  requireCSRF,
  requireGuestOrAuth,
  submitResult
);

// Guest session management
router.post('/guest-session',
  skipCSRF, // Skip CSRF for creating guest session
  ensureGuestSession
);

// Protected routes (registered users only)
router.get('/history',
  authenticate,
  getHistory
);

// Guest-only routes
router.get('/guest-history',
  requireGuestOrAuth,
  getGuestHistory
);

export default router;
