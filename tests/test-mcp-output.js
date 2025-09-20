// test-mcp-output.js - Test what's being output to stdout during MCP server startup
import { AuthorMCPServer } from './src/mcps/author-server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

console.error('=== Starting MCP Output Test ===');
console.error('This will show what gets sent to stdout vs stderr');

// Capture both stdout and stderr
const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

let stdoutData = '';
let stderrData = '';

process.stdout.write = function(string, encoding, fd) {
    if (string && typeof string === 'string') {
        stdoutData += string;
        console.error(`[STDOUT CAPTURED]: ${string.replace(/\n/g, '\\n')}`);
    }
    return originalStdoutWrite.call(process.stdout, string, encoding, fd);
};

process.stderr.write = function(string, encoding, fd) {
    if (string && typeof string === 'string') {
        stderrData += string;
    }
    return originalStderrWrite.call(process.stderr, string, encoding, fd);
};

async function testMCPStartup() {
    try {
        console.error('Creating AuthorMCPServer...');
        const server = new AuthorMCPServer();
        
        console.error('Starting MCP server with stdio transport...');
        const transport = new StdioServerTransport();
        
        // Try to connect - this might reveal the output issue
        await server.server.connect(transport);
        
        console.error('MCP server connected successfully');
        
        // Show captured data
        console.error('\n=== CAPTURE RESULTS ===');
        console.error(`Stdout captured: ${stdoutData.length} chars`);
        console.error(`Stderr captured: ${stderrData.length} chars`);
        
        if (stdoutData.length > 0) {
            console.error('\n=== STDOUT CONTENT (first 500 chars) ===');
            console.error(JSON.stringify(stdoutData.substring(0, 500)));
        }
        
        // Clean shutdown
        await server.cleanup();
        
    } catch (error) {
        console.error('Error during test:', error);
    }
    
    process.exit(0);
}

testMCPStartup();
