import mysql from 'mysql2/promise'
import { config } from './config.js'
import { logger } from './logger.js'

let pool = null
let databaseReady = false

function poolOptions() {
  if (config.databaseUrl) return { uri: config.databaseUrl, waitForConnections: true, connectionLimit: 10, queueLimit: 0 }
  return {
    host: config.mysqlHost,
    port: config.mysqlPort,
    database: config.mysqlDatabase,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
}

export async function initDatabase() {
  try {
    pool = mysql.createPool(poolOptions())
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id CHAR(36) PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        title VARCHAR(160) NOT NULL,
        description TEXT NOT NULL,
        area ENUM('daily', 'study') NOT NULL DEFAULT 'daily',
        category VARCHAR(80) NOT NULL DEFAULT 'Geral',
        priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        status ENUM('todo', 'doing', 'done') NOT NULL DEFAULT 'todo',
        due_date DATE NULL,
        estimated_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 30,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_tasks_user_status (user_id, status),
        INDEX idx_tasks_user_due_date (user_id, due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    databaseReady = true
    logger.info('MySQL conectado e schema de usuários/tarefas verificado')
  } catch (error) {
    logger.error('MySQL indisponível; ativando fallback em memória para demonstração', { error: error.message })
    databaseReady = false
  }
}

export function getPool() { return databaseReady ? pool : null }
export function databaseStatus() { return databaseReady ? 'up' : 'memory-fallback' }
