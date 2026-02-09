import { executeQuery, executeTransaction } from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';
import logger from '../utils/logger.js';

export const createUser = async (userData) => {
  try {
    const { username, email, password } = userData;
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `;
    
    const result = await executeQuery(query, [username, email, passwordHash]);
    
    // Return the created user without password hash
    return await getUserById(result.insertId);
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const query = `
      SELECT id, username, email, avatar_url, best_wpm, avg_wpm, total_tests, 
             created_at, updated_at, is_active
      FROM users 
      WHERE id = ? AND is_active = TRUE
    `;
    
    const users = await executeQuery(query, [userId]);
    return users[0] || null;
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    throw error;
  }
};

export const getUserByUsernameOrEmail = async (identifier) => {
  try {
    const query = `
      SELECT id, username, email, password_hash, avatar_url, best_wpm, avg_wpm, 
             total_tests, created_at, updated_at, is_active
      FROM users 
      WHERE (username = ? OR email = ?) AND is_active = TRUE
    `;
    
    const users = await executeQuery(query, [identifier, identifier]);
    return users[0] || null;
  } catch (error) {
    logger.error('Error getting user by username/email:', error);
    throw error;
  }
};

export const updateUser = async (userId, updateData) => {
  try {
    const allowedFields = ['username', 'email', 'avatar_url'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) {
      return null;
    }
    
    values.push(userId);
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = TRUE
    `;
    
    await executeQuery(query, values);
    
    return await getUserById(userId);
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};

export const updatePassword = async (userId, newPassword) => {
  try {
    const passwordHash = await hashPassword(newPassword);
    
    const query = `
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = TRUE
    `;
    
    await executeQuery(query, [passwordHash, userId]);
    
    return true;
  } catch (error) {
    logger.error('Error updating password:', error);
    throw error;
  }
};

export const validateUserCredentials = async (identifier, password) => {
  try {
    const user = await getUserByUsernameOrEmail(identifier);
    
    if (!user) {
      return null;
    }
    
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }
    
    // Remove password hash from returned user object
    const { password_hash, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  } catch (error) {
    logger.error('Error validating user credentials:', error);
    throw error;
  }
};

export const updateUserStats = async (userId, wpm, accuracy) => {
  try {
    const query = `
      UPDATE users 
      SET 
        best_wpm = GREATEST(best_wpm, ?),
        avg_wpm = (
          (avg_wpm * total_tests + ?) / (total_tests + 1)
        ),
        total_tests = total_tests + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = TRUE
    `;
    
    await executeQuery(query, [wpm, wpm, userId]);
    
    return await getUserById(userId);
  } catch (error) {
    logger.error('Error updating user stats:', error);
    throw error;
  }
};

export const deactivateUser = async (userId) => {
  try {
    const query = `
      UPDATE users 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(query, [userId]);
    
    return true;
  } catch (error) {
    logger.error('Error deactivating user:', error);
    throw error;
  }
};

export const checkUsernameExists = async (username) => {
  try {
    const query = 'SELECT id FROM users WHERE username = ? AND is_active = TRUE';
    const users = await executeQuery(query, [username]);
    return users.length > 0;
  } catch (error) {
    logger.error('Error checking username existence:', error);
    throw error;
  }
};

export const checkEmailExists = async (email) => {
  try {
    const query = 'SELECT id FROM users WHERE email = ? AND is_active = TRUE';
    const users = await executeQuery(query, [email]);
    return users.length > 0;
  } catch (error) {
    logger.error('Error checking email existence:', error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_tests,
        AVG(wpm) as avg_wpm,
        MAX(wpm) as best_wpm,
        AVG(accuracy) as avg_accuracy,
        MIN(test_duration_seconds) as fastest_time,
        MAX(test_duration_seconds) as slowest_time
      FROM test_results 
      WHERE user_id = ?
    `;
    
    const stats = await executeQuery(query, [userId]);
    return stats[0] || null;
  } catch (error) {
    logger.error('Error getting user stats:', error);
    throw error;
  }
};
