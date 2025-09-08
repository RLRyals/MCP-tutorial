#!/usr/bin/env node

// Debug script for author-server MCP connection issues
// This script will help identify what's causing the server to disconnect

import { AuthorMCPServer } from '../src/mcps/author-server/index.js';
import { DatabaseManager } from '../src/shared/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugAuthorServer() {
    console.log('='.repeat(60));
    console.log('DEBUG: Author Server Connection Issues');
    console.log('='.repeat(60));
    
    // 1. Check environment variables
    console.log('\n1. ENVIRONMENT VARIABLES:');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('MCP_STDIO_MODE:', process.env.MCP_STDIO_MODE || 'undefined');
    console.log('Working directory:', process.cwd());
    
    if (process.env.DATABASE_URL) {
        // Hide password for security
        const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
        console.log('DATABASE_URL (masked):', maskedUrl);
    } else {
        console.log('ERROR: DATABASE_URL is not set!');
        return;
    }
    
    // 2. Test database connection directly
    console.log('\n2. TESTING DATABASE CONNECTION:');
    const db = new DatabaseManager();
    
    try {
        console.log('Attempting database health check...');
        const healthCheck = await db.healthCheck();
        
        if (healthCheck.healthy) {
            console.log('✅ Database connection successful!');
            console.log('Database time:', healthCheck.timestamp);
        } else {
            console.log('❌ Database health check failed:', healthCheck.error);
            return;
        }
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
        console.log('Error code:', error.code);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\nPossible causes:');
            console.log('- Database server is not running');
            console.log('- Wrong host or port in DATABASE_URL');
            console.log('- Firewall blocking connection');
        } else if (error.code === 'ENOTFOUND') {
            console.log('\nPossible causes:');
            console.log('- Invalid hostname in DATABASE_URL');
            console.log('- DNS resolution issues');
        } else if (error.message.includes('password authentication failed')) {
            console.log('\nPossible causes:');
            console.log('- Wrong username or password in DATABASE_URL');
            console.log('- User does not exist in database');
        } else if (error.message.includes('database') && error.message.includes('does not exist')) {
            console.log('\nPossible causes:');
            console.log('- Database name in DATABASE_URL does not exist');
            console.log('- Need to create the database first');
        }
        
        await db.close();
        return;
    }
    
    // 3. Test basic queries
    console.log('\n3. TESTING DATABASE SCHEMA:');
    
    try {
        // Check if authors table exists
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'authors'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('✅ Authors table exists');
            
            // Check authors count
            const countResult = await db.query('SELECT COUNT(*) FROM authors');
            console.log(`Authors in database: ${countResult.rows[0].count}`);
        } else {
            console.log('❌ Authors table does not exist');
            console.log('You may need to run database migrations');
        }
    } catch (error) {
        console.log('❌ Error checking database schema:', error.message);
    }
    
    // 4. Test MCP Server instantiation
    console.log('\n4. TESTING MCP SERVER CREATION:');
    
    try {
        console.log('Creating AuthorMCPServer instance...');
        const server = new AuthorMCPServer();
        console.log('✅ AuthorMCPServer created successfully');
        console.log('Server name:', server.serverName);
        console.log('Tools count:', server.tools.length);
        console.log('Tools:', server.tools.map(t => t.name).join(', '));
        
        await server.cleanup();
        console.log('✅ Server cleanup successful');
    } catch (error) {
        console.log('❌ Error creating MCP server:', error.message);
        console.log('Stack trace:', error.stack);
    }
    
    await db.close();
    
    console.log('\n' + '='.repeat(60));
    console.log('DEBUG COMPLETE');
    console.log('='.repeat(60));
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. If database connection failed:');
    console.log('   - Run: .\\scripts\\start-database.ps1');
    console.log('   - Check DATABASE_URL credentials');
    console.log('   - Verify database exists and user has permissions');
    
    console.log('\n2. If server creation failed:');
    console.log('   - Check for syntax errors in server files');
    console.log('   - Verify all dependencies are installed');
    console.log('   - Run: npm install');
    
    console.log('\n3. Test the fix:');
    console.log('   - Run: node test-server-import.js');
    console.log('   - Restart Claude Desktop');
    console.log('   - Try using MCP tools in Claude');
    
    console.log('\n4. If Claude Desktop still has issues:');
    console.log('   - Check claude-desktop.json paths');
    console.log('   - Verify MCP_STDIO_MODE=true in config');
    console.log('   - Check Claude Desktop logs');
}

// Run the debug script
debugAuthorServer().catch(error => {
    console.error('Debug script failed:', error);
    process.exit(1);
});
