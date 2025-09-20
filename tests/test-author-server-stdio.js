#!/usr/bin/env node

// Test script to verify author-server works in MCP stdio mode
// This simulates how Claude Desktop would call the server

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Testing author-server in MCP stdio mode...');
console.log('This simulates how Claude Desktop would start the server.');
console.log('');

// Set up the environment like Claude Desktop would
const env = {
    ...process.env,
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://writer:your_secure_password2025@localhost:5432/mcp_series',
    MCP_STDIO_MODE: 'true'
};

const serverPath = path.join(__dirname, 'src', 'mcps', 'author-server', 'index.js');

console.log('Starting author-server with:');
console.log('- Command: node', serverPath);
console.log('- Working directory:', __dirname);
console.log('- Environment: MCP_STDIO_MODE=true');
console.log('');

const child = spawn('node', [serverPath], {
    cwd: __dirname,
    env: env,
    stdio: ['pipe', 'pipe', 'inherit'] // stdin, stdout, stderr
});

let timeout;
let serverStarted = false;

child.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('STDOUT:', output);
    
    // Check if server has started successfully
    if (output.includes('MCP Server running') || output.includes('server started')) {
        serverStarted = true;
        console.log('✅ Server appears to have started successfully!');
    }
});

child.on('exit', (code, signal) => {
    console.log(`\nServer exited with code ${code} and signal ${signal}`);
    
    if (code === 0 && serverStarted) {
        console.log('✅ SUCCESS: Server started and exited cleanly!');
    } else if (code === 0) {
        console.log('⚠️  Server exited with code 0 but may not have started properly');
    } else {
        console.log('❌ ERROR: Server failed to start properly');
    }
    
    clearTimeout(timeout);
});

child.on('error', (error) => {
    console.log('❌ ERROR starting server:', error.message);
    clearTimeout(timeout);
});

// Handle stdin errors to prevent EPIPE crashes
child.stdin.on('error', (error) => {
    if (error.code === 'EPIPE') {
        console.log('⚠️  Server stdin closed (this is expected in some cases)');
    } else {
        console.log('❌ stdin error:', error.message);
    }
});

// Send an initialize message to test MCP communication
setTimeout(() => {
    if (child.stdin.writable) {
        console.log('\nSending MCP initialize message...');
        const initMessage = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2025-06-18",
                capabilities: {},
                clientInfo: {
                    name: "test-client",
                    version: "1.0.0"
                }
            }
        };
        
        try {
            child.stdin.write(JSON.stringify(initMessage) + '\n');
        } catch (error) {
            console.log('⚠️  Could not send message to server:', error.message);
        }
    } else {
        console.log('⚠️  Server stdin not writable - server may have already exited');
    }
}, 2000);

// Test timeout - give the server time to start and potentially respond
timeout = setTimeout(() => {
    console.log('\n⏱️ Test completed - stopping server');
    if (!child.killed) {
        child.kill('SIGTERM');
        
        // Force kill if it doesn't exit gracefully
        setTimeout(() => {
            if (!child.killed) {
                child.kill('SIGKILL');
            }
        }, 2000);
    }
}, 15000);

console.log('Waiting for server to start...');
console.log('(This test will timeout in 10 seconds if there are issues)');
