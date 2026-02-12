import { createUser, validateUserCredentials, updateUser, checkUsernameExists, checkEmailExists, updateUserStats } from '../models/userModel.js';
import { createRefreshToken, findRefreshToken, revokeRefreshToken, revokeAllUserRefreshTokens } from '../models/refreshTokenModel.js';
import { createGuestSession, claimGuestResults } from '../models/guestSessionModel.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import { validatePasswordStrength } from '../utils/passwordUtils.js';
import { createError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw createError(passwordValidation.errors.join(', '), 400);
    }

    // Check if username or email already exists
    const [usernameExists, emailExists] = await Promise.all([
      checkUsernameExists(username),
      checkEmailExists(email)
    ]);

    if (usernameExists) {
      throw createError('Username already taken', 409);
    }

    if (emailExists) {
      throw createError('Email already registered', 409);
    }

    // Create user
    const user = await createUser({ username, email, password });

    // Claim guest results if guest session exists
    if (req.guestSession) {
      try {
        await claimGuestResults(req.guestSession.guestId, user.id);
        logger.info(`Claimed guest results for new user ${user.id}`);
      } catch (error) {
        logger.warn('Failed to claim guest results during registration:', error);
        // Don't fail registration if guest claiming fails
      }
    }

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken({ userId: user.id, username: user.username }),
      generateRefreshToken({ userId: user.id })
    ]);

    // Store refresh token
    const deviceInfo = req.get('User-Agent');
    const ipAddress = req.ip;
    await createRefreshToken(user.id, refreshToken, deviceInfo, ipAddress);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          best_wpm: user.best_wpm,
          avg_wpm: user.avg_wpm,
          total_tests: user.total_tests,
          created_at: user.created_at
        },
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate credentials
    const user = await validateUserCredentials(username, password);

    if (!user) {
      throw createError('Invalid username or password', 401);
    }

    // Claim guest results if guest session exists
    if (req.guestSession) {
      try {
        await claimGuestResults(req.guestSession.guestId, user.id);
        logger.info(`Claimed guest results for user ${user.id} during login`);
      } catch (error) {
        logger.warn('Failed to claim guest results during login:', error);
        // Don't fail login if guest claiming fails
      }
    }

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken({ userId: user.id, username: user.username }),
      generateRefreshToken({ userId: user.id })
    ]);

    // Store refresh token
    const deviceInfo = req.get('User-Agent');
    const ipAddress = req.ip;
    await createRefreshToken(user.id, refreshToken, deviceInfo, ipAddress);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          best_wpm: user.best_wpm,
          avg_wpm: user.avg_wpm,
          total_tests: user.total_tests,
          created_at: user.created_at
        },
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw createError('Refresh token required', 401);
    }

    // Verify refresh token and check if it exists in database
    const [decoded, storedToken] = await Promise.all([
      verifyRefreshToken(refreshToken),
      findRefreshToken(refreshToken)
    ]);

    if (!storedToken) {
      throw createError('Invalid refresh token', 401);
    }

    // Generate new access token
    const accessToken = await generateAccessToken({
      userId: decoded.userId,
      username: decoded.username
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Revoke the refresh token
      await revokeRefreshTokenByHash(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    // Revoke all refresh tokens for the user
    await revokeAllUserRefreshTokens(req.user.id);

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, avatar_url } = req.body;
    const userId = req.user.id;

    // Check if username or email already exists (if being updated)
    if (username && username !== req.user.username) {
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        throw createError('Username already taken', 409);
      }
    }

    if (email && email !== req.user.email) {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        throw createError('Email already registered', 409);
      }
    }

    // Update user
    const updatedUser = await updateUser(userId, { username, email, avatar_url });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

export const revokeRefreshTokenByHash = async (token) => {
  try {
    const storedToken = await findRefreshToken(token);
    if (storedToken) {
      await revokeRefreshToken(storedToken.id);
    }
  } catch (error) {
    logger.error('Error revoking refresh token by hash:', error);
    // Don't throw error here as this is called from logout
  }
};
