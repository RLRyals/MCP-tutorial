#!/usr/bin/env node
// test-mcp.js - Quick test script for MCP servers

import { AuthorMCPServer } from './src/mcps/author-server/index.js';

async function testMCPServer() {
    console.log('Testing MCP Server initialization...\n');
    
    let server = null;
    try {
        // Create server instance
        server = new AuthorMCPServer();
        console.log('✓ Server instance created');
        console.log(`  Server name: ${server.serverName}`);
        console.log(`  Tool count: ${server.tools.length}`);
        
        if (server.tools.length > 0) {
            console.log('  Available tools:');
            server.tools.forEach(tool => {
                console.log(`    - ${tool.name}: ${tool.description}`);
            });
        }
        
        // Test database connection
        console.log('\nTesting database connection...');
        const dbHealth = await server.db.healthCheck();
        
        if (dbHealth.healthy) {
            console.log('✓ Database connection successful');
            console.log(`  Database: ${dbHealth.database}`);
            console.log(`  Status: ${dbHealth.status}`);
        } else {
            console.log('✗ Database connection failed');
            console.log(`  Error: ${dbHealth.error}`);
        }
        
        // Test tool handler mapping
        console.log('\nTesting tool handlers...');
        for (const tool of server.tools) {
            const handler = server.getToolHandler(tool.name);
            if (handler) {
                console.log(`✓ Handler found for ${tool.name}`);
            } else {
                console.log(`✗ No handler found for ${tool.name}`);
            }
        }
        
        console.log('\n🎉 MCP Server test completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (server) {
            await server.cleanup();
        }
    }
}

testMCPServer().catch(console.error);
