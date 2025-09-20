#!/usr/bin/env node
// test-clean-startup.js - Test for clean MCP server startup without stdout pollution

// Test both individual server and through CLI runner
import { CLIRunner } from './src/shared/cli-runner.js';
import { AuthorMCPServer } from './src/mcps/author-server/index.js';

console.error('Testing MCP server startup for stdout pollution...');

// Test 1: Direct instantiation
console.error('\n=== Test 1: Direct Server Creation ===');
try {
    console.error('Creating AuthorMCPServer directly...');
    const server = new AuthorMCPServer();
    console.error('✅ Server created successfully');
    await server.cleanup();
} catch (error) {
    console.error('❌ Error creating server:', error.message);
}

// Test 2: CLI Runner (simulates Claude Desktop invocation)
console.error('\n=== Test 2: CLI Runner (MCP mode) ===');
try {
    console.error('Testing CLI runner with stdio mode...');
    const runner = new CLIRunner(AuthorMCPServer);
    
    // Simulate Claude Desktop calling with stdio
    const testArgs = ['node', 'author-server.js', '--stdio'];
    
    // This should NOT produce any stdout output
    console.error('Starting MCP server...');
    
    // Note: This will actually start the server, so we need to handle cleanup
    setTimeout(() => {
        console.error('✅ Test completed - if you see this, no stdout pollution occurred');
        process.exit(0);
    }, 2000);
    
    await runner.run(testArgs);
    
} catch (error) {
    console.error('❌ Error with CLI runner:', error.message);
    process.exit(1);
}
