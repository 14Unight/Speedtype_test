import { createError } from './errorHandler.js';

// Basic HTML sanitization
export const sanitizeHTML = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// SQL injection prevention for basic inputs
export const sanitizeSQL = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  
  return str.replace(/['"\\]/g, '');
};

// XSS prevention middleware
export const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeHTML(req.body[key]);
        }
      }
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeHTML(req.query[key]);
        }
      }
    }
    
    next();
  } catch (error) {
    next(createError('Input sanitization failed', 400));
  }
};

// Content Security Policy helper
export const getCSP = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
  return [
    "default-src 'self'",
    `script-src 'self' ${isProduction ? '' : "'unsafe-inline' 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${clientUrl}`,
    "upgrade-insecure-requests"
  ].join('; ');
};

// Rate limiting key generator
export const generateRateLimitKey = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  const userId = req.user?.id || 'guest';
  
  return `${ip}:${userAgent}:${userId}`;
};
