import express from 'express';
import {
  getLeaderboardData,
  getUserRankData,
  getGlobalStatsData
} from '../controllers/leaderboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateLeaderboardQuery } from '../middleware/validationMiddleware.js';
import { skipCSRF } from '../middleware/csrfMiddleware.js';

const router = express.Router();

// All leaderboard routes require authentication
router.use(authenticate);

router.get('/',
  validateLeaderboardQuery,
  skipCSRF, // Skip CSRF for GET requests
  getLeaderboardData
);

router.get('/my-rank',
  skipCSRF, // Skip CSRF for GET requests
  getUserRankData
);

router.get('/stats',
  skipCSRF, // Skip CSRF for GET requests
  getGlobalStatsData
);

export default router;
