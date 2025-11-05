// scripts/db-connection.js
// Simple database connection for local Postgres Docker container

import pg from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (3 levels up from scripts/)
config({ path: resolve(__dirname, '../../../.env') });

const { Pool } = pg;

/**
 * Create database connection pool
 */
export function createPool() {
    const connectionString = process.env.DATABASE_URL ||
        'postgresql://mcp_user:your_secure_password@localhost:5432/mcp_series';

    return new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
}

/**
 * Execute a query with error handling
 */
export async function query(text, params = []) {
    const pool = createPool();

    try {
        const result = await pool.query(text, params);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

/**
 * Test database connection
 */
export async function testConnection() {
    try {
        const result = await query('SELECT NOW() as time, current_database() as db');
        return {
            success: true,
            time: result[0].time,
            database: result[0].db
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export default { createPool, query, testConnection };
