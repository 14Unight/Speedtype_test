import { getRandomText } from '../models/testTextModel.js';
import { createTestSession, consumeTestSession } from '../models/testSessionModel.js';
import { createTestResult, getUserTestResults, getGuestTestResults } from '../models/testResultModel.js';
import { createGuestSession } from '../models/guestSessionModel.js';
import { updateUserStats } from '../models/userModel.js';
import { createError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export const getText = async (req, res, next) => {
  try {
    const { language = 'en', difficulty = 'medium', duration = 60 } = req.query;

    // Get random text
    const text = await getRandomText(language, difficulty);
    
    if (!text) {
      throw createError('No text available for the specified criteria', 404);
    }

    // Create test session
    const sessionData = {
      userId: req.user?.id || null,
      guestSessionId: req.guestSession?.id || null,
      testTextId: text.id,
      durationSeconds: parseInt(duration),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const testSession = await createTestSession(sessionData);

    res.json({
      success: true,
      data: {
        text: {
          id: text.id,
          content: text.content,
          language: text.language,
          difficulty: text.difficulty,
          wordCount: text.word_count
        },
        sessionToken: testSession.sessionToken,
        durationSeconds: testSession.durationSeconds,
        expiresAt: testSession.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const submitResult = async (req, res, next) => {
  try {
    const {
      sessionToken,
      wpm,
      rawWpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      durationSeconds,
      textSnippet
    } = req.body;

    // Consume test session (validate and mark as used)
    const sessionData = await consumeTestSession(
      sessionToken,
      req.ip,
      req.get('User-Agent')
    );

    if (!sessionData) {
      throw createError('Invalid or expired session token', 400);
    }

    // Additional validation
    if (sessionData.durationSeconds !== durationSeconds) {
      throw createError('Duration mismatch with session', 400);
    }

    // Create test result
    const resultData = {
      userId: sessionData.userId,
      guestSessionId: sessionData.guestSessionId,
      testSessionId: sessionData.id,
      wpm,
      rawWpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      testDurationSeconds: durationSeconds,
      textSnippet
    };

    const result = await createTestResult(resultData);

    // Update user stats if this is a registered user
    let isNewRecord = false;
    if (sessionData.userId) {
      const user = await updateUserStats(sessionData.userId, wpm, accuracy);
      isNewRecord = wpm > user.best_wpm;
    }

    res.status(201).json({
      success: true,
      message: 'Test result submitted successfully',
      data: {
        result: {
          id: result.id,
          wpm: result.wpm,
          rawWpm: result.rawWpm,
          accuracy: result.accuracy,
          correctChars: result.correctChars,
          incorrectChars: result.incorrectChars,
          totalChars: result.totalChars,
          testDurationSeconds: result.testDurationSeconds,
          textSnippet: result.textSnippet,
          createdAt: result.createdAt
        },
        isNewRecord,
        isGuest: !!sessionData.guestSessionId
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, timeframe = 'all' } = req.query;

    const history = await getUserTestResults(
      userId,
      parseInt(page),
      parseInt(limit),
      timeframe
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

export const getGuestHistory = async (req, res, next) => {
  try {
    if (!req.guestSession) {
      throw createError('Guest session required', 401);
    }

    const { page = 1, limit = 20 } = req.query;

    const history = await getGuestTestResults(
      req.guestSession.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

export const ensureGuestSession = async (req, res, next) => {
  try {
    // If user is authenticated, no need for guest session
    if (req.user) {
      return res.json({
        success: true,
        data: {
          isGuest: false,
          message: 'User is authenticated'
        }
      });
    }

    // Create guest session if it doesn't exist
    if (!req.guestSession) {
      const guestSession = await createGuestSession();
      
      // Set guest ID cookie
      res.cookie('guestId', guestSession.guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/'
      });

      return res.json({
        success: true,
        data: {
          isGuest: true,
          guestId: guestSession.guestId,
          message: 'Guest session created'
        }
      });
    }

    res.json({
      success: true,
      data: {
        isGuest: true,
        guestId: req.guestSession.guestId,
        message: 'Guest session exists'
      }
    });
  } catch (error) {
    next(error);
  }
};
