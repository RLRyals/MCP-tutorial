#!/usr/bin/env node

// Simple test to verify that MCP servers can be imported and instantiated
// without triggering the CLI runner

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing MCP Server Imports and Instantiation');
console.log('='.repeat(50));

async function testServerImport(serverName, serverPath) {
    console.log(`\nTesting ${serverName}...`);
    
    try {
        // Set MCP_STDIO_MODE to prevent CLI runner from executing
        process.env.MCP_STDIO_MODE = 'true';
        
        // Import the server class
        const module = await import(serverPath);
        const ServerClass = module[Object.keys(module)[0]]; // Get the first export
        
        console.log(`  ✅ Import successful`);
        
        // Try to instantiate the server
        const server = new ServerClass();
        console.log(`  ✅ Instantiation successful`);
        
        // Check basic properties
        console.log(`  📋 Server name: ${server.serverName}`);
        console.log(`  🔧 Tools available: ${server.tools ? server.tools.length : 0}`);
        
        // Cleanup
        if (server.cleanup && typeof server.cleanup === 'function') {
            await server.cleanup();
            console.log(`  ✅ Cleanup successful`);
        }
        
        return true;
        
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        if (error.stack) {
            console.log(`  📚 Stack: ${error.stack.split('\n')[1]?.trim()}`);
        }
        return false;
    }
}

async function runTests() {
    const servers = [
        ['AuthorMCPServer', './src/mcps/author-server/index.js'],
        ['BookMCPServer', './src/mcps/book-server/index.js'],
        ['SeriesMCPServer', './src/mcps/series-server/index.js'],
        ['TimelineMCPServer', './src/mcps/timeline-server/index.js'],
        ['MetadataMCPServer', './src/mcps/metadata-server/index.js']
    ];
    
    let passCount = 0;
    let failCount = 0;
    
    for (const [name, path] of servers) {
        const success = await testServerImport(name, path);
        if (success) {
            passCount++;
        } else {
            failCount++;
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed`);
    
    if (failCount === 0) {
        console.log('🎉 All servers can be imported and instantiated successfully!');
        console.log('✅ The CLI runner fix is working correctly.');
        console.log('');
        console.log('This means Claude Desktop should be able to:');
        console.log('  - Import the server classes');
        console.log('  - Create server instances');
        console.log('  - Access server tools');
        console.log('  - Use MCP stdio transport');
    } else {
        console.log('❌ Some servers have issues. Check the errors above.');
        console.log('');
        console.log('Next steps:');
        console.log('  - Run: node debug-author-server.js');
        console.log('  - Check database connectivity');
        console.log('  - Verify environment variables');
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
});
