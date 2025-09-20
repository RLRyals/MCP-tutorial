// Quick test for series server initialization
import { SeriesMCPServer } from './src/mcps/series-server/index.js';

console.error('Testing SeriesMCPServer initialization...');

try {
    // Set stdio mode to prevent server from starting
    process.env.MCP_STDIO_MODE = 'false';  
    
    const server = new SeriesMCPServer();
    
    console.error('✅ Server created successfully');
    console.error('Server name:', server.serverName);
    console.error('Tools count:', server.tools ? server.tools.length : 'undefined');
    console.error('Tools:', server.tools ? server.tools.map(t => t.name) : 'undefined');
    
    // Test tool handler
    const handler = server.getToolHandler('list_series');
    console.error('list_series handler:', handler ? '✅ Found' : '❌ Not found');
    
    console.error('🎉 Series server test completed successfully!');
    
    process.exit(0);
} catch (error) {
    console.error('❌ Series server test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
