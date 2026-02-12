import { executeQuery } from '../config/db.js';
import { hashString } from '../utils/tokenUtils.js';
import logger from '../utils/logger.js';

export const createRefreshToken = async (userId, token, deviceInfo = null, ipAddress = null) => {
  try {
    const tokenHash = hashString(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [userId, tokenHash, deviceInfo, ipAddress, expiresAt]);
    
    return {
      id: result.insertId,
      userId,
      tokenHash,
      deviceInfo,
      ipAddress,
      expiresAt
    };
  } catch (error) {
    logger.error('Error creating refresh token:', error);
    throw error;
  }
};

export const findRefreshToken = async (token) => {
  try {
    const tokenHash = hashString(token);
    
    const query = `
      SELECT rt.*, u.username, u.email, u.is_active
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token_hash = ? AND rt.is_revoked = FALSE AND rt.expires_at > NOW() AND u.is_active = TRUE
    `;
    
    const tokens = await executeQuery(query, [tokenHash]);
    return tokens[0] || null;
  } catch (error) {
    logger.error('Error finding refresh token:', error);
    throw error;
  }
};

export const revokeRefreshToken = async (tokenId) => {
  try {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE id = ?
    `;
    
    await executeQuery(query, [tokenId]);
    
    return true;
  } catch (error) {
    logger.error('Error revoking refresh token:', error);
    throw error;
  }
};

export const revokeRefreshTokenByHash = async (token) => {
  try {
    const tokenHash = hashString(token);
    
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE token_hash = ?
    `;
    
    await executeQuery(query, [tokenHash]);
    
    return true;
  } catch (error) {
    logger.error('Error revoking refresh token by hash:', error);
    throw error;
  }
};

export const revokeAllUserRefreshTokens = async (userId) => {
  try {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE user_id = ? AND is_revoked = FALSE
    `;
    
    await executeQuery(query, [userId]);
    
    return true;
  } catch (error) {
    logger.error('Error revoking all user refresh tokens:', error);
    throw error;
  }
};

export const revokeExpiredTokens = async () => {
  try {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE expires_at <= NOW() AND is_revoked = FALSE
    `;
    
    const result = await executeQuery(query);
    
    logger.info(`Revoked ${result.affectedRows} expired refresh tokens`);
    
    return result.affectedRows;
  } catch (error) {
    logger.error('Error revoking expired tokens:', error);
    throw error;
  }
};

export const getUserRefreshTokens = async (userId) => {
  try {
    const query = `
      SELECT id, device_info, ip_address, created_at, expires_at, is_revoked
      FROM refresh_tokens 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    
    const tokens = await executeQuery(query, [userId]);
    
    return tokens.map(token => ({
      id: token.id,
      deviceInfo: token.device_info,
      ipAddress: token.ip_address,
      createdAt: token.created_at,
      expiresAt: token.expires_at,
      isRevoked: token.is_revoked,
      isExpired: new Date(token.expires_at) <= new Date()
    }));
  } catch (error) {
    logger.error('Error getting user refresh tokens:', error);
    throw error;
  }
};

export const cleanupExpiredTokens = async () => {
  try {
    // Delete tokens that have been expired for more than 30 days
    const query = `
      DELETE FROM refresh_tokens 
      WHERE expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    const result = await executeQuery(query);
    
    logger.info(`Cleaned up ${result.affectedRows} old expired refresh tokens`);
    
    return result.affectedRows;
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
    throw error;
  }
};
