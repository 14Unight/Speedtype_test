import { getLeaderboard, getUserRank, getGlobalStats } from '../models/testResultModel.js';
import { createError } from '../middleware/errorHandler.js';

export const getLeaderboardData = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, timeframe = 'all', difficulty = null } = req.query;

    const leaderboard = await getLeaderboard(
      parseInt(page),
      parseInt(limit),
      timeframe,
      difficulty
    );

    // Get current user's rank if authenticated
    let userRank = null;
    if (req.user) {
      userRank = await getUserRank(req.user.id, timeframe, difficulty);
    }

    res.json({
      success: true,
      data: {
        ...leaderboard,
        userRank
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRankData = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { timeframe = 'all', difficulty = null } = req.query;

    const userRank = await getUserRank(req.user.id, timeframe, difficulty);

    res.json({
      success: true,
      data: {
        userRank,
        timeframe,
        difficulty
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getGlobalStatsData = async (req, res, next) => {
  try {
    const stats = await getGlobalStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
