import { executeQuery } from '../config/db.js';
import logger from '../utils/logger.js';

export const getRandomText = async (language = 'en', difficulty = 'medium') => {
  try {
    const query = `
      SELECT id, content, language, difficulty, word_count
      FROM test_texts 
      WHERE language = ? AND difficulty = ? AND is_active = TRUE
      ORDER BY RAND()
      LIMIT 1
    `;
    
    const texts = await executeQuery(query, [language, difficulty]);
    return texts[0] || null;
  } catch (error) {
    logger.error('Error getting random text:', error);
    throw error;
  }
};

export const getTextById = async (textId) => {
  try {
    const query = `
      SELECT id, content, language, difficulty, word_count, is_active
      FROM test_texts 
      WHERE id = ?
    `;
    
    const texts = await executeQuery(query, [textId]);
    return texts[0] || null;
  } catch (error) {
    logger.error('Error getting text by ID:', error);
    throw error;
  }
};

export const getAllTexts = async (page = 1, limit = 20, language = null, difficulty = null) => {
  try {
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (language) {
      whereClause += ' AND language = ?';
      params.push(language);
    }
    
    if (difficulty) {
      whereClause += ' AND difficulty = ?';
      params.push(difficulty);
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM test_texts 
      ${whereClause}
    `;
    
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;
    
    // Get texts
    const textsQuery = `
      SELECT id, content, language, difficulty, word_count, is_active, created_at
      FROM test_texts 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    const texts = await executeQuery(textsQuery, params);
    
    return {
      texts,
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
    logger.error('Error getting all texts:', error);
    throw error;
  }
};

export const createText = async (textData) => {
  try {
    const { content, language = 'en', difficulty = 'medium', wordCount } = textData;
    
    // Calculate word count if not provided
    const calculatedWordCount = wordCount || content.trim().split(/\s+/).length;
    
    const query = `
      INSERT INTO test_texts (content, language, difficulty, word_count)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [content, language, difficulty, calculatedWordCount]);
    
    return await getTextById(result.insertId);
  } catch (error) {
    logger.error('Error creating text:', error);
    throw error;
  }
};

export const updateText = async (textId, updateData) => {
  try {
    const allowedFields = ['content', 'language', 'difficulty', 'is_active'];
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
    
    // Recalculate word count if content is being updated
    if (updateData.content) {
      updates.push('word_count = ?');
      values.push(updateData.content.trim().split(/\s+/).length);
    }
    
    values.push(textId);
    
    const query = `
      UPDATE test_texts 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(query, values);
    
    return await getTextById(textId);
  } catch (error) {
    logger.error('Error updating text:', error);
    throw error;
  }
};

export const deleteText = async (textId) => {
  try {
    // Soft delete by setting is_active to false
    const query = `
      UPDATE test_texts 
      SET is_active = FALSE 
      WHERE id = ?
    `;
    
    await executeQuery(query, [textId]);
    
    return true;
  } catch (error) {
    logger.error('Error deleting text:', error);
    throw error;
  }
};

export const getTextStats = async () => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_texts,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_texts,
        COUNT(CASE WHEN language = 'en' THEN 1 END) as english_texts,
        COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy_texts,
        COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium_texts,
        COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard_texts,
        AVG(word_count) as avg_word_count,
        MIN(word_count) as min_word_count,
        MAX(word_count) as max_word_count
      FROM test_texts
    `;
    
    const result = await executeQuery(query);
    return result[0] || null;
  } catch (error) {
    logger.error('Error getting text stats:', error);
    throw error;
  }
};
