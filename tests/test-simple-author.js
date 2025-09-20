// test-simple-author.js - Minimal MCP server for testing
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

console.error('[SIMPLE-TEST] Creating minimal MCP server...');

// Create server
const server = new Server(
    {
        name: 'simple-author-test',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

console.error('[SIMPLE-TEST] Server created, setting up handlers...');

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('[SIMPLE-TEST] ListTools request received');
    return { 
        tools: [
            {
                name: 'test_tool',
                description: 'A simple test tool',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            }
        ]
    };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    console.error(`[SIMPLE-TEST] CallTool request received for: ${name}`);
    
    return {
        content: [
            {
                type: 'text',
                text: `Test tool ${name} executed successfully!`
            }
        ]
    };
});

console.error('[SIMPLE-TEST] Handlers set up, connecting transport...');

// Connect transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('[SIMPLE-TEST] MCP Server running on stdio');
