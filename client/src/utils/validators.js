import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must be less than 30 characters long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
});

// User login schema
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username or email is required'),
  
  password: z.string()
    .min(1, 'Password is required')
});

// Profile update schema
export const profileUpdateSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must be less than 30 characters long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional(),
  
  avatar_url: z.string()
    .url('Please enter a valid URL')
    .optional()
});

// Test submission schema
export const testSubmissionSchema = z.object({
  sessionToken: z.string()
    .min(32, 'Invalid session token'),
  
  wpm: z.number()
    .min(0, 'WPM must be non-negative')
    .max(300, 'WPM cannot exceed 300'),
  
  rawWpm: z.number()
    .min(0, 'Raw WPM must be non-negative')
    .max(300, 'Raw WPM cannot exceed 300'),
  
  accuracy: z.number()
    .min(0, 'Accuracy must be between 0 and 100')
    .max(100, 'Accuracy must be between 0 and 100'),
  
  correctChars: z.number()
    .int('Correct characters must be an integer')
    .min(0, 'Correct characters must be non-negative'),
  
  incorrectChars: z.number()
    .int('Incorrect characters must be an integer')
    .min(0, 'Incorrect characters must be non-negative'),
  
  totalChars: z.number()
    .int('Total characters must be an integer')
    .min(1, 'Total characters must be positive'),
  
  durationSeconds: z.number()
    .int('Duration must be an integer')
    .min(15, 'Duration must be at least 15 seconds')
    .max(120, 'Duration cannot exceed 120 seconds'),
  
  textSnippet: z.string()
    .max(100, 'Text snippet must be 100 characters or less')
    .optional()
}).refine((data) => data.totalChars === data.correctChars + data.incorrectChars, {
  message: 'Total characters must equal correct characters plus incorrect characters',
  path: ['totalChars']
});

// Text request schema
export const textRequestSchema = z.object({
  language: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt'])
    .optional(),
  
  difficulty: z.enum(['easy', 'medium', 'hard'])
    .optional(),
  
  duration: z.number()
    .int('Duration must be an integer')
    .min(15, 'Duration must be at least 15 seconds')
    .max(120, 'Duration cannot exceed 120 seconds')
    .optional()
});

// Leaderboard query schema
export const leaderboardQuerySchema = z.object({
  page: z.number()
    .int('Page must be an integer')
    .min(1, 'Page must be positive')
    .optional(),
  
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  
  timeframe: z.enum(['all', 'today', 'week', 'month'])
    .optional(),
  
  difficulty: z.enum(['easy', 'medium', 'hard'])
    .optional()
});

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters long')
    .max(128, 'New password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
      'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
});

// Validation helper functions
export const validateForm = (schema, data) => {
  try {
    schema.parse(data);
    return { isValid: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

// Real-time validation for individual fields
export const validateField = (schema, field, value) => {
  try {
    const fieldSchema = schema.shape[field];
    if (fieldSchema) {
      fieldSchema.parse(value);
      return { isValid: true, error: null };
    }
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Invalid value' };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};

export default {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  testSubmissionSchema,
  textRequestSchema,
  leaderboardQuerySchema,
  passwordChangeSchema,
  validateForm,
  validateField
};
