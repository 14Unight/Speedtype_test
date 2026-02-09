import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import logger from './logger.js';

const getJWTSecret = (type) => {
  const secret = type === 'access' 
    ? process.env.JWT_ACCESS_SECRET 
    : process.env.JWT_REFRESH_SECRET;
  
  if (!secret) {
    throw new Error(`JWT ${type} secret not configured`);
  }
  
  return new TextEncoder().encode(secret);
};

export const generateAccessToken = async (payload) => {
  try {
    const secret = getJWTSecret('access');
    const expiresTime = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    
    return await new SignJWT({
      ...payload,
      type: 'access'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresTime)
      .sign(secret);
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

export const generateRefreshToken = async (payload) => {
  try {
    const secret = getJWTSecret('refresh');
    const expiresTime = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const tokenId = crypto.randomUUID();
    
    return await new SignJWT({
      ...payload,
      type: 'refresh',
      jti: tokenId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresTime)
      .sign(secret);
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

export const verifyAccessToken = async (token) => {
  try {
    const secret = getJWTSecret('access');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    logger.error('Error verifying access token:', error);
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = async (token) => {
  try {
    const secret = getJWTSecret('refresh');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    logger.error('Error verifying refresh token:', error);
    throw new Error('Invalid refresh token');
  }
};

export const generateTestSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashTestSessionToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const hashString = (input) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

export const generateUUID = () => {
  return crypto.randomUUID();
};

export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};
