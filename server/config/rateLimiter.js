import rateLimit from 'express-rate-limit';
import { createError } from '../middleware/errorHandler.js';
import { generateRateLimitKey } from '../middleware/sanitize.js';
import logger from '../utils/logger.js';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateRateLimitKey,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      userId: req.user?.id || 'guest'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

// Auth rate limiter (stricter for sensitive operations)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateRateLimitKey,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      userId: req.user?.id || 'guest'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.'
    });
  }
});

// Test submission rate limiter
export const testSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 test submissions per minute
  message: {
    success: false,
    message: 'Too many test submissions, please wait before submitting again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateRateLimitKey,
  handler: (req, res) => {
    logger.warn('Test submission rate limit exceeded:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      userId: req.user?.id || 'guest'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many test submissions, please wait before submitting again.'
    });
  }
});

// Test text request rate limiter
export const testTextLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 text requests per 15 minutes
  message: {
    success: false,
    message: 'Too many text requests, please wait before requesting again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateRateLimitKey,
  handler: (req, res) => {
    logger.warn('Test text rate limit exceeded:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      userId: req.user?.id || 'guest'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many text requests, please wait before requesting again.'
    });
  }
});

// Registration rate limiter (prevent spam)
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registrations per hour
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateRateLimitKey,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn('Registration rate limit exceeded:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      userId: req.user?.id || 'guest'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts, please try again later.'
    });
  }
});
