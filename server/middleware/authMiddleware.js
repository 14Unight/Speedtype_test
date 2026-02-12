import { verifyAccessToken, extractTokenFromHeader } from '../utils/tokenUtils.js';
import { executeQuery } from '../config/db.js';
import { createError } from './errorHandler.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw createError('Access token required', 401);
    }

    const decoded = await verifyAccessToken(token);
    
    // Fetch user from database to ensure they're still active
    const users = await executeQuery(
      'SELECT id, username, email, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      throw createError('User not found', 401);
    }

    const user = users[0];
    
    if (!user.is_active) {
      throw createError('Account is deactivated', 401);
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = await verifyAccessToken(token);
      
      const users = await executeQuery(
        'SELECT id, username, email, is_active FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length > 0 && users[0].is_active) {
        req.user = {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    logger.warn('Optional auth failed:', error.message);
    next();
  }
};

export const getGuestSession = async (req, res, next) => {
  try {
    const guestId = req.cookies?.guestId;
    
    if (guestId) {
      const sessions = await executeQuery(
        'SELECT id, guest_id, is_active FROM guest_sessions WHERE guest_id = ? AND is_active = TRUE',
        [guestId]
      );

      if (sessions.length > 0) {
        req.guestSession = {
          id: sessions[0].id,
          guestId: sessions[0].guest_id
        };

        // Update last seen
        await executeQuery(
          'UPDATE guest_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?',
          [sessions[0].id]
        );
      }
    }

    next();
  } catch (error) {
    logger.error('Error getting guest session:', error);
    next();
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }
  next();
};

export const requireGuestOrAuth = (req, res, next) => {
  if (!req.user && !req.guestSession) {
    throw createError('Authentication or guest session required', 401);
  }
  next();
};
