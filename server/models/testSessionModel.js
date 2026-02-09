import { executeQuery } from '../config/db.js';
import { generateTestSessionToken, hashTestSessionToken, hashString } from '../utils/tokenUtils.js';
import logger from '../utils/logger.js';

export const createTestSession = async (sessionData) => {
  try {
    const {
      userId = null,
      guestSessionId = null,
      testTextId,
      durationSeconds,
      ipAddress = null,
      userAgent = null
    } = sessionData;

    const sessionToken = generateTestSessionToken();
    const tokenHash = hashTestSessionToken(sessionToken);
    const userAgentHash = userAgent ? hashString(userAgent) : null;
    
    const expiresAt = new Date(Date.now() + (parseInt(process.env.TEST_SESSION_TTL_SECONDS) || 600) * 1000);

    const query = `
      INSERT INTO test_sessions (
        user_id, guest_session_id, test_text_id, duration_seconds, 
        token_hash, ip_address, user_agent_hash, expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      userId, guestSessionId, testTextId, durationSeconds,
      tokenHash, ipAddress, userAgentHash, expiresAt
    ]);

    return {
      id: result.insertId,
      sessionToken,
      userId,
      guestSessionId,
      testTextId,
      durationSeconds,
      ipAddress,
      expiresAt,
      issuedAt: new Date()
    };
  } catch (error) {
    logger.error('Error creating test session:', error);
    throw error;
  }
};

export const findTestSession = async (sessionToken) => {
  try {
    const tokenHash = hashTestSessionToken(sessionToken);
    
    const query = `
      SELECT ts.*, tt.content as text_content, tt.word_count as text_word_count
      FROM test_sessions ts
      JOIN test_texts tt ON ts.test_text_id = tt.id
      WHERE ts.token_hash = ? AND ts.is_used = FALSE AND ts.expires_at > NOW()
    `;
    
    const sessions = await executeQuery(query, [tokenHash]);
    return sessions[0] || null;
  } catch (error) {
    logger.error('Error finding test session:', error);
    throw error;
  }
};

export const consumeTestSession = async (sessionToken, ipAddress = null, userAgent = null) => {
  try {
    const tokenHash = hashTestSessionToken(sessionToken);
    
    // Verify session exists and is not used
    const verifyQuery = `
      SELECT id, user_id, guest_session_id, test_text_id, duration_seconds,
             ip_address, user_agent_hash, expires_at
      FROM test_sessions 
      WHERE token_hash = ? AND is_used = FALSE AND expires_at > NOW()
    `;
    
    const sessions = await executeQuery(verifyQuery, [tokenHash]);
    
    if (sessions.length === 0) {
      return null;
    }
    
    const session = sessions[0];
    
    // Optional: Verify IP and user agent (soft fail for proxies)
    let securityCheck = true;
    if (ipAddress && session.ip_address && ipAddress !== session.ip_address) {
      logger.warn('IP address mismatch for test session:', {
        sessionId: session.id,
        expectedIp: session.ip_address,
        actualIp: ipAddress
      });
      // Don't fail, just log - could be behind proxy
    }
    
    if (userAgent && session.user_agent_hash) {
      const userAgentHash = hashString(userAgent);
      if (userAgentHash !== session.user_agent_hash) {
        logger.warn('User agent mismatch for test session:', {
          sessionId: session.id,
          expectedHash: session.user_agent_hash,
          actualHash: userAgentHash
        });
        // Don't fail, just log - could be different browser versions
      }
    }
    
    // Mark session as used
    const updateQuery = `
      UPDATE test_sessions 
      SET is_used = TRUE, used_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [session.id]);
    
    return {
      id: session.id,
      userId: session.user_id,
      guestSessionId: session.guest_session_id,
      testTextId: session.test_text_id,
      durationSeconds: session.duration_seconds,
      securityCheck
    };
  } catch (error) {
    logger.error('Error consuming test session:', error);
    throw error;
  }
};

export const cleanupExpiredSessions = async () => {
  try {
    const query = `
      UPDATE test_sessions 
      SET is_used = TRUE 
      WHERE expires_at <= NOW() AND is_used = FALSE
    `;
    
    const result = await executeQuery(query);
    
    logger.info(`Marked ${result.affectedRows} expired test sessions as used`);
    
    return result.affectedRows;
  } catch (error) {
    logger.error('Error cleaning up expired sessions:', error);
    throw error;
  }
};

export const deleteOldSessions = async () => {
  try {
    // Delete sessions that have been expired for more than 7 days
    const query = `
      DELETE FROM test_sessions 
      WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `;
    
    const result = await executeQuery(query);
    
    logger.info(`Deleted ${result.affectedRows} old test sessions`);
    
    return result.affectedRows;
  } catch (error) {
    logger.error('Error deleting old sessions:', error);
    throw error;
  }
};

export const getSessionStats = async (userId = null, guestSessionId = null) => {
  try {
    let whereClause = '';
    let params = [];
    
    if (userId) {
      whereClause = 'WHERE user_id = ?';
      params.push(userId);
    } else if (guestSessionId) {
      whereClause = 'WHERE guest_session_id = ?';
      params.push(guestSessionId);
    }
    
    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN is_used = TRUE THEN 1 END) as used_sessions,
        COUNT(CASE WHEN is_used = FALSE AND expires_at > NOW() THEN 1 END) as active_sessions,
        COUNT(CASE WHEN is_used = FALSE AND expires_at <= NOW() THEN 1 END) as expired_sessions,
        AVG(duration_seconds) as avg_duration
      FROM test_sessions 
      ${whereClause}
    `;
    
    const stats = await executeQuery(query, params);
    return stats[0] || null;
  } catch (error) {
    logger.error('Error getting session stats:', error);
    throw error;
  }
};
