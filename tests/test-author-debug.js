// Test script for debugging author server initialization
import { AuthorMCPServer } from './src/mcps/author-server/index.js';

console.error('=== TEST AUTHOR SERVER DEBUG ===');
console.error('Setting MCP_STDIO_MODE to true to simulate Claude Desktop environment');

process.env.MCP_STDIO_MODE = 'true';

try {
    console.error('Creating AuthorMCPServer instance...');
    const server = new AuthorMCPServer();
    
    console.error('Server instance created successfully');
    console.error('Server name:', server.serverName);
    console.error('Server version:', server.serverVersion);
    console.error('Tools count:', server.tools.length);
    
    console.error('Calling run() method...');
    await server.run();
    
    console.error('Server run() method completed');
    
} catch (error) {
    console.error('TEST ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
