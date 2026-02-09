-- Create database
CREATE DATABASE IF NOT EXISTS typing_test_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE typing_test_db;

-- Users table
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    best_wpm DECIMAL(6,2) DEFAULT 0,
    avg_wpm DECIMAL(6,2) DEFAULT 0,
    total_tests INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_best_wpm (best_wpm DESC)
) ENGINE=InnoDB;

-- Guest sessions (guest mode identity stored as httpOnly cookie "guestId")
CREATE TABLE guest_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    guest_id CHAR(36) NOT NULL UNIQUE,                 -- UUID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_guest_id (guest_id)
) ENGINE=InnoDB;

-- Test texts table
CREATE TABLE test_texts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    word_count INT UNSIGNED NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_language (language),
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB;

-- Custom protection: DB-backed one-time test sessions issued by GET /api/test/texts
-- Client receives plaintext session_token; server stores ONLY SHA-256 hash.
CREATE TABLE test_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    guest_session_id BIGINT UNSIGNED NULL,
    test_text_id INT UNSIGNED NOT NULL,
    duration_seconds INT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,              -- SHA-256 hex
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent_hash CHAR(64) DEFAULT NULL,            -- SHA-256 of UA (privacy-friendly)
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (guest_session_id) REFERENCES guest_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (test_text_id) REFERENCES test_texts(id) ON DELETE CASCADE,
    INDEX idx_expires_at (expires_at),
    INDEX idx_user_id (user_id),
    INDEX idx_guest_session_id (guest_session_id),
    INDEX idx_duration (duration_seconds),
    INDEX idx_used (is_used)
) ENGINE=InnoDB;

-- Test results table (UPDATED: allow guest results)
-- IMPORTANT: leaderboard queries MUST filter WHERE user_id IS NOT NULL
CREATE TABLE test_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    guest_session_id BIGINT UNSIGNED NULL,
    test_session_id BIGINT UNSIGNED NULL,
    wpm DECIMAL(6,2) NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    correct_chars INT UNSIGNED NOT NULL,
    incorrect_chars INT UNSIGNED NOT NULL,
    total_chars INT UNSIGNED NOT NULL,
    test_duration_seconds INT UNSIGNED NOT NULL,
    text_snippet VARCHAR(100) DEFAULT NULL,
    raw_wpm DECIMAL(6,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_session_id) REFERENCES guest_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (test_session_id) REFERENCES test_sessions(id) ON DELETE NULL,
    -- MariaDB 11+ enforces CHECK constraints:
    CHECK (
      (user_id IS NOT NULL AND guest_session_id IS NULL)
      OR
      (user_id IS NULL AND guest_session_id IS NOT NULL)
    ),
    INDEX idx_user_id (user_id),
    INDEX idx_guest_session_id (guest_session_id),
    INDEX idx_wpm (wpm DESC),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_leaderboard (wpm DESC, accuracy DESC, created_at DESC),
    INDEX idx_duration (test_duration_seconds)
) ENGINE=InnoDB;

-- Refresh tokens table (registered users only)
CREATE TABLE refresh_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(500) DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- Insert sample test texts
INSERT INTO test_texts (content, language, difficulty, word_count) VALUES
('The quick brown fox jumps over the lazy dog. This pangram sentence contains every letter of the alphabet at least once, making it perfect for typing practice.', 'en', 'easy', 26),
('Technology has revolutionized the way we communicate, work, and live. From smartphones to artificial intelligence, innovation continues to shape our daily experiences.', 'en', 'medium', 25),
('Quantum computing represents a fundamental shift in computational power, leveraging quantum mechanical phenomena like superposition and entanglement to process information in ways that classical computers cannot match.', 'en', 'hard', 32),
('Practice makes perfect when learning to type. Focus on accuracy first, then gradually increase your speed. Proper posture and finger placement are essential for long-term improvement.', 'en', 'easy', 29),
('Machine learning algorithms analyze vast amounts of data to identify patterns and make predictions. These systems power everything from recommendation engines to autonomous vehicles.', 'en', 'medium', 28),
('Cryptocurrency and blockchain technology are transforming financial systems worldwide. Decentralized ledgers provide transparent, secure, and efficient ways to transfer value without intermediaries.', 'en', 'hard', 30);
