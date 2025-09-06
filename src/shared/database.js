// src/shared/database.js - Shared database connection and utilities
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseManager {
    constructor() {
        // Debug environment variables when MCP server starts
           console.error('=== DATABASE DEBUG ===');
           console.error('NODE_ENV:', process.env.NODE_ENV);
           console.error('DATABASE_URL exists:', !!process.env.DATABASE_URL);
           console.error('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
           console.error('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 30) + '...' || 'undefined');
           console.error('Working directory:', process.cwd());
           console.error('====================');
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.pool.on('error', (err) => {
            console.error('Database pool error:', err);
        });
    }

    async query(text, params = []) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async healthCheck() {
        try {
            const result = await this.query('SELECT NOW()');
            return { healthy: true, timestamp: result.rows[0].now };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async close() {
        await this.pool.end();
    }

    // Common query helpers
    async findById(table, id) {
        const result = await this.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
        return result.rows[0];
    }

    async create(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        
        const query = `
            INSERT INTO ${table} (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *
        `;
        
        const result = await this.query(query, values);
        return result.rows[0];
    }

    async update(table, id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
        
        const query = `
            UPDATE ${table} 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING *
        `;
        
        const result = await this.query(query, [id, ...values]);
        return result.rows[0];
    }

    async delete(table, id) {
        const result = await this.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
        return result.rows[0];
    }
}