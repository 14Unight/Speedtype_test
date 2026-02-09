import mysql from 'mysql2/promise';
import { createPool } from 'mysql2/promise';
import logger from '../utils/logger.js';

let pool;

const getDatabaseConfig = () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: '+00:00',
  namedPlaceholders: true,
  typeCast: function (field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return (field.string() === '1');
    }
    if (field.type === 'DECIMAL' || field.type === 'NEWDECIMAL') {
      return parseFloat(field.string());
    }
    return next();
  }
});

export const connectDB = async () => {
  try {
    const config = getDatabaseConfig();
    
    pool = createPool(config);
    
    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    logger.info('Database connected successfully');
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const getDB = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return pool;
};

export const executeQuery = async (query, params = []) => {
  const connection = await getDB().getConnection();
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    logger.error('Query execution failed:', { query, params, error });
    throw error;
  } finally {
    connection.release();
  }
};

export const executeTransaction = async (queries) => {
  const connection = await getDB().getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    logger.error('Transaction failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const closeDB = async () => {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
};

export default {
  connectDB,
  getDB,
  executeQuery,
  executeTransaction,
  closeDB
};
