#!/usr/bin/env node
// test-db.js - Quick database connection test
 
import { DatabaseManager } from '../src/shared/database.js';

async function testDatabase() {
    console.log('Testing database connection...\n');
    
    let db = null;
    try {
        db = new DatabaseManager();
        
        console.log('Database URL check:', process.env.DATABASE_URL ? 'Found' : 'Missing');
        
        const healthCheck = await db.healthCheck();
        
        if (healthCheck.healthy) {
            console.log('✓ Database connection successful');
            console.log(`  Database: ${healthCheck.database}`);
            console.log(`  Status: ${healthCheck.status}`);
            console.log(`  Connection time: ${healthCheck.timestamp}`);
        } else {
            console.log('✗ Database connection failed');
            console.log(`  Error: ${healthCheck.error}`);
        }
        
        // Try a simple query
        console.log('\nTesting basic query...');
        const result = await db.query('SELECT NOW() as current_time');
        console.log('✓ Query successful');
        console.log(`  Current time: ${result.rows[0].current_time}`);
        
        console.log('\n🎉 Database test completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Database test failed:', error.message);
        console.error('Details:', error);
    } finally {
        if (db) {
            await db.close();
        }
    }
}

testDatabase().catch(console.error);
