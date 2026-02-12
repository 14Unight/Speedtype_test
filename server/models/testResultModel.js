import { executeQuery } from '../config/db.js';
import logger from '../utils/logger.js';

export const createTestResult = async (resultData) => {
  try {
    const {
      userId = null,
      guestSessionId = null,
      testSessionId,
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      testDurationSeconds,
      textSnippet = null,
      rawWpm = 0
    } = resultData;

    const query = `
      INSERT INTO test_results (
        user_id, guest_session_id, test_session_id, wpm, accuracy,
        correct_chars, incorrect_chars, total_chars, test_duration_seconds,
        text_snippet, raw_wpm
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      userId, guestSessionId, testSessionId, wpm, accuracy,
      correctChars, incorrectChars, totalChars, testDurationSeconds,
      textSnippet, rawWpm
    ]);

    return {
      id: result.insertId,
      userId,
      guestSessionId,
      testSessionId,
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      testDurationSeconds,
      textSnippet,
      rawWpm,
      createdAt: new Date()
    };
  } catch (error) {
    logger.error('Error creating test result:', error);
    throw error;
  }
};

export const getUserTestResults = async (userId, page = 1, limit = 20, timeframe = 'all') => {
  try {
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE tr.user_id = ?';
    const params = [userId];
    
    if (timeframe !== 'all') {
      let dateCondition = '';
      switch (timeframe) {
        case 'today':
          dateCondition = 'AND DATE(tr.created_at) = CURDATE()';
          break;
        case 'week':
          dateCondition = 'AND tr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case 'month':
          dateCondition = 'AND tr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
      }
      whereClause += ` ${dateCondition}`;
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM test_results tr
      ${whereClause}
    `;
    
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;
    
    // Get results
    const resultsQuery = `
      SELECT 
        tr.id, tr.wpm, tr.accuracy, tr.correct_chars, tr.incorrect_chars,
        tr.total_chars, tr.test_duration_seconds, tr.text_snippet, tr.raw_wpm,
        tr.created_at, tt.content as text_content, tt.word_count as text_word_count
      FROM test_results tr
      JOIN test_sessions ts ON tr.test_session_id = ts.id
      JOIN test_texts tt ON ts.test_text_id = tt.id
      ${whereClause}
      ORDER BY tr.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    const results = await executeQuery(resultsQuery, params);
    
    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Error getting user test results:', error);
    throw error;
  }
};

export const getGuestTestResults = async (guestSessionId, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM test_results tr
      WHERE tr.guest_session_id = ?
    `;
    
    const countResult = await executeQuery(countQuery, [guestSessionId]);
    const total = countResult[0].total;
    
    // Get results
    const resultsQuery = `
      SELECT 
        tr.id, tr.wpm, tr.accuracy, tr.correct_chars, tr.incorrect_chars,
        tr.total_chars, tr.test_duration_seconds, tr.text_snippet, tr.raw_wpm,
        tr.created_at, tt.content as text_content, tt.word_count as text_word_count
      FROM test_results tr
      JOIN test_sessions ts ON tr.test_session_id = ts.id
      JOIN test_texts tt ON ts.test_text_id = tt.id
      WHERE tr.guest_session_id = ?
      ORDER BY tr.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const results = await executeQuery(resultsQuery, [guestSessionId, limit, offset]);
    
    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Error getting guest test results:', error);
    throw error;
  }
};

export const getLeaderboard = async (page = 1, limit = 50, timeframe = 'all', difficulty = null) => {
  try {
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE tr.user_id IS NOT NULL';
    const params = [];
    
    if (timeframe !== 'all') {
      switch (timeframe) {
        case 'today':
          whereClause += ' AND DATE(tr.created_at) = CURDATE()';
          break;
        case 'week':
          whereClause += ' AND tr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case 'month':
          whereClause += ' AND tr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
      }
    }
    
    if (difficulty) {
      whereClause += ' AND tt.difficulty = ?';
      params.push(difficulty);
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT tr.user_id) as total
      FROM test_results tr
      JOIN test_sessions ts ON tr.test_session_id = ts.id
      JOIN test_texts tt ON ts.test_text_id = tt.id
      ${whereClause}
    `;
    
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;
    
    // Get leaderboard results
    const leaderboardQuery = `
      SELECT 
        u.id, u.username, u.avatar_url,
        MAX(tr.wpm) as best_wpm,
        AVG(tr.wpm) as avg_wpm,
        COUNT(tr.id) as total_tests,
        AVG(tr.accuracy) as avg_accuracy,
        MAX(tr.created_at) as last_test_at
      FROM test_results tr
      JOIN users u ON tr.user_id = u.id
      JOIN test_sessions ts ON tr.test_session_id = ts.id
      JOIN test_texts tt ON ts.test_text_id = tt.id
      ${whereClause}
      GROUP BY u.id, u.username, u.avatar_url
      ORDER BY best_wpm DESC, avg_accuracy DESC, last_test_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    const results = await executeQuery(leaderboardQuery, params);
    
    // Get rank for each result
    const rankedResults = results.map((result, index) => ({
      ...result,
      rank: offset + index + 1
    }));
    
    return {
      results: rankedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Error getting leaderboard:', error);
    throw error;
  }
};

export const getUserRank = async (userId, timeframe = 'all', difficulty = null) => {
  try {
    let whereClause = 'WHERE tr.user_id IS NOT NULL';
    const params = [];
    
    if (timeframe !== 'all') {
      switch (timeframe) {
        case 'today':
          whereClause += ' AND DATE(tr.created_at) = CURDATE()';
          break;
        case 'week':
          whereClause += ' AND tr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case 'month':
          whereClause += ' AND tr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
      }
    }
    
    if (difficulty) {
      whereClause += ' AND tt.difficulty = ?';
      params.push(difficulty);
    }
    
    const rankQuery = `
      SELECT user_rank.rank
      FROM (
        SELECT 
          tr.user_id,
          ROW_NUMBER() OVER (ORDER BY MAX(tr.wpm) DESC, AVG(tr.accuracy) DESC, MAX(tr.created_at) DESC) as rank
        FROM test_results tr
        JOIN test_sessions ts ON tr.test_session_id = ts.id
        JOIN test_texts tt ON ts.test_text_id = tt.id
        ${whereClause}
        GROUP BY tr.user_id
      ) user_rank
      WHERE user_rank.user_id = ?
    `;
    
    params.push(userId);
    const result = await executeQuery(rankQuery, params);
    
    return result[0] ? result[0].rank : null;
  } catch (error) {
    logger.error('Error getting user rank:', error);
    throw error;
  }
};

export const getGlobalStats = async () => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT tr.user_id) as total_users,
        COUNT(tr.id) as total_tests,
        COUNT(DISTINCT tr.guest_session_id) as total_guest_sessions,
        AVG(tr.wpm) as global_avg_wpm,
        MAX(tr.wpm) as global_best_wpm,
        AVG(tr.accuracy) as global_avg_accuracy,
        COUNT(CASE WHEN tr.test_duration_seconds = 60 THEN 1 END) as minute_tests,
        COUNT(CASE WHEN tr.test_duration_seconds = 30 THEN 1 END) as thirty_sec_tests,
        COUNT(CASE WHEN tr.test_duration_seconds = 15 THEN 1 END) as fifteen_sec_tests
      FROM test_results tr
    `;
    
    const result = await executeQuery(query);
    return result[0] || null;
  } catch (error) {
    logger.error('Error getting global stats:', error);
    throw error;
  }
};
