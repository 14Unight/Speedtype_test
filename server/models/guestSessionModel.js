import { executeQuery } from '../config/db.js';
import { generateUUID } from '../utils/tokenUtils.js';
import logger from '../utils/logger.js';

export const createGuestSession = async () => {
  try {
    const guestId = generateUUID();
    
    const query = `
      INSERT INTO guest_sessions (guest_id)
      VALUES (?)
    `;
    
    const result = await executeQuery(query, [guestId]);
    
    return {
      id: result.insertId,
      guestId,
      createdAt: new Date(),
      isActive: true
    };
  } catch (error) {
    logger.error('Error creating guest session:', error);
    throw error;
  }
};

export const getGuestSessionById = async (guestId) => {
  try {
    const query = `
      SELECT id, guest_id, created_at, last_seen_at, is_active
      FROM guest_sessions 
      WHERE guest_id = ? AND is_active = TRUE
    `;
    
    const sessions = await executeQuery(query, [guestId]);
    return sessions[0] || null;
  } catch (error) {
    logger.error('Error getting guest session by ID:', error);
    throw error;
  }
};

export const updateGuestSessionActivity = async (guestId) => {
  try {
    const query = `
      UPDATE guest_sessions 
      SET last_seen_at = CURRENT_TIMESTAMP 
      WHERE guest_id = ? AND is_active = TRUE
    `;
    
    await executeQuery(query, [guestId]);
    
    return true;
  } catch (error) {
    logger.error('Error updating guest session activity:', error);
    throw error;
  }
};

export const deactivateGuestSession = async (guestId) => {
  try {
    const query = `
      UPDATE guest_sessions 
      SET is_active = FALSE 
      WHERE guest_id = ?
    `;
    
    await executeQuery(query, [guestId]);
    
    return true;
  } catch (error) {
    logger.error('Error deactivating guest session:', error);
    throw error;
  }
};

export const claimGuestResults = async (guestId, userId) => {
  try {
    // First get the guest session ID
    const guestSession = await getGuestSessionById(guestId);
    if (!guestSession) {
      throw new Error('Guest session not found');
    }

    // Update test results to transfer ownership to the user
    const updateQuery = `
      UPDATE test_results 
      SET user_id = ?, guest_session_id = NULL 
      WHERE guest_session_id = ?
    `;
    
    const result = await executeQuery(updateQuery, [userId, guestSession.id]);
    
    // Deactivate the guest session
    await deactivateGuestSession(guestId);
    
    logger.info(`Claimed ${result.affectedRows} test results for user ${userId} from guest ${guestId}`);
    
    return {
      claimedResults: result.affectedRows,
      userId,
      guestId
    };
  } catch (error) {
    logger.error('Error claiming guest results:', error);
    throw error;
  }
};

export const getGuestStats = async (guestId) => {
  try {
    const guestSession = await getGuestSessionById(guestId);
    if (!guestSession) {
      return null;
    }

    const query = `
      SELECT 
        COUNT(*) as total_tests,
        AVG(wpm) as avg_wpm,
        MAX(wpm) as best_wpm,
        AVG(accuracy) as avg_accuracy,
        MIN(test_duration_seconds) as fastest_time,
        MAX(test_duration_seconds) as slowest_time
      FROM test_results 
      WHERE guest_session_id = ?
    `;
    
    const stats = await executeQuery(query, [guestSession.id]);
    return stats[0] || null;
  } catch (error) {
    logger.error('Error getting guest stats:', error);
    throw error;
  }
};

export const cleanupOldGuestSessions = async () => {
  try {
    // Deactivate guest sessions that haven't been seen in 30 days
    const deactivateQuery = `
      UPDATE guest_sessions 
      SET is_active = FALSE 
      WHERE last_seen_at < DATE_SUB(NOW(), INTERVAL 30 DAY) AND is_active = TRUE
    `;
    
    const deactivateResult = await executeQuery(deactivateQuery);
    
    // Delete guest sessions that have been inactive for 90 days
    const deleteQuery = `
      DELETE FROM guest_sessions 
      WHERE last_seen_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
    `;
    
    const deleteResult = await executeQuery(deleteQuery);
    
    logger.info(`Cleaned up guest sessions: deactivated ${deactivateResult.affectedRows}, deleted ${deleteResult.affectedRows}`);
    
    return {
      deactivated: deactivateResult.affectedRows,
      deleted: deleteResult.affectedRows
    };
  } catch (error) {
    logger.error('Error cleaning up old guest sessions:', error);
    throw error;
  }
};
