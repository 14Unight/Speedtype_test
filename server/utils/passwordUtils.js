import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import logger from './logger.js';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: parseInt(process.env.ARGON2_MEMORY_COST) || 65536,
  timeCost: parseInt(process.env.ARGON2_TIME_COST) || 3,
  parallelism: parseInt(process.env.ARGON2_PARALLELISM) || 4,
  hashLength: 32,
  saltLength: 16
};

const BCRYPT_SALT_ROUNDS = 12;

let useArgon2 = true;

const testArgon2Availability = async () => {
  try {
    await argon2.hash('test', ARGON2_OPTIONS);
    logger.info('Argon2 is available and will be used for password hashing');
  } catch (error) {
    logger.warn('Argon2 not available, falling back to bcrypt:', error.message);
    useArgon2 = false;
  }
};

export const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  try {
    if (useArgon2) {
      return await argon2.hash(password, ARGON2_OPTIONS);
    } else {
      return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

export const verifyPassword = async (password, hash) => {
  if (!password || !hash) {
    return false;
  }

  try {
    if (useArgon2) {
      return await argon2.verify(hash, password, ARGON2_OPTIONS);
    } else {
      return await bcrypt.compare(password, hash);
    }
  } catch (error) {
    logger.error('Error verifying password:', error);
    return false;
  }
};

export const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common patterns
  const commonPatterns = [
    /^123/i,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns that are not allowed');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Initialize argon2 availability
testArgon2Availability().catch(() => {
  // Fallback already handled in testArgon2Availability
});

export default {
  hashPassword,
  verifyPassword,
  validatePasswordStrength
};
