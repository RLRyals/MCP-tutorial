#!/usr/bin/env node

// Test the fixed author server with optimized constructor
console.error('[TEST] Starting fixed author server test...');

import { AuthorMCPServer } from './src/mcps/author-server/index.js';

console.error('[TEST] Creating server instance...');
const server = new AuthorMCPServer();

console.error('[TEST] Starting server run...');
await server.run();

console.error('[TEST] Server startup completed - should respond to MCP quickly now');
