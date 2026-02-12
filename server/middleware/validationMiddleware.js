import { body, param, query, validationResult } from 'express-validator';
import { createError } from './errorHandler.js';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw createError(errorMessages.join(', '), 400);
  }
  
  next();
};

// Auth validation
export const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Test validation
export const validateTestSubmission = [
  body('sessionToken')
    .notEmpty()
    .withMessage('Session token is required')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid session token format'),
  
  body('wpm')
    .isFloat({ min: 0, max: 300 })
    .withMessage('WPM must be between 0 and 300'),
  
  body('rawWpm')
    .isFloat({ min: 0, max: 300 })
    .withMessage('Raw WPM must be between 0 and 300'),
  
  body('accuracy')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Accuracy must be between 0 and 100'),
  
  body('correctChars')
    .isInt({ min: 0 })
    .withMessage('Correct characters must be a non-negative integer'),
  
  body('incorrectChars')
    .isInt({ min: 0 })
    .withMessage('Incorrect characters must be a non-negative integer'),
  
  body('totalChars')
    .isInt({ min: 1 })
    .withMessage('Total characters must be a positive integer'),
  
  body('durationSeconds')
    .isInt({ min: 15, max: 120 })
    .withMessage('Duration must be between 15 and 120 seconds'),
  
  body('textSnippet')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Text snippet must be 100 characters or less'),
  
  // Custom validation: totalChars should equal correctChars + incorrectChars
  body().custom((value, { req }) => {
    if (value.correctChars + value.incorrectChars !== value.totalChars) {
      throw new Error('Total characters must equal correct characters plus incorrect characters');
    }
    return true;
  }),
  
  handleValidationErrors
];

// Test text request validation
export const validateTextRequest = [
  query('language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'it', 'pt'])
    .withMessage('Invalid language'),
  
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty'),
  
  query('duration')
    .optional()
    .isInt({ min: 15, max: 120 })
    .withMessage('Duration must be between 15 and 120 seconds'),
  
  handleValidationErrors
];

// Leaderboard validation
export const validateLeaderboardQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('timeframe')
    .optional()
    .isIn(['all', 'today', 'week', 'month'])
    .withMessage('Invalid timeframe'),
  
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty'),
  
  handleValidationErrors
];

// Profile validation
export const validateProfileUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  
  handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  handleValidationErrors
];
