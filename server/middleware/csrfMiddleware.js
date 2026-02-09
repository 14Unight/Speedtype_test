import { generateToken, verifyToken } from 'csrf-csrf';
import { createError } from './errorHandler.js';
import logger from '../utils/logger.js';

const { csrfSynchronisedProtection } = generateToken({
  secret: process.env.JWT_ACCESS_SECRET || 'default-secret-change-in-production',
  saltLength: 16,
  secretLength: 32,
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  }
});

export const csrfProtection = csrfSynchronisedProtection;

export const getCSRFToken = (req, res, next) => {
  try {
    const token = generateToken(req, res);
    res.json({ csrfToken: token });
  } catch (error) {
    logger.error('Error generating CSRF token:', error);
    next(createError('Failed to generate CSRF token', 500));
  }
};

// Custom CSRF middleware for API routes that need CSRF protection
export const requireCSRF = (req, res, next) => {
  try {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!token) {
      throw createError('CSRF token required', 403);
    }
    
    const isValid = verifyToken(req, token);
    
    if (!isValid) {
      throw createError('Invalid CSRF token', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Skip CSRF for certain routes (like GET requests, auth endpoints)
export const skipCSRF = (req, res, next) => {
  next();
};
