// src/shared/cli-runner.js - CLI support for running individual MCP servers
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

export async function runMCPServer(mcpServer, argv = process.argv) {
    const useStdio = argv.includes('--stdio') || !argv.includes('--http');
    const port = getPortFromArgs(argv, 3000 + Math.floor(Math.random() * 1000));
    
    // Setup cleanup
    process.on('SIGINT', async () => {
        await mcpServer.cleanup();
        process.exit(0);
    });
    
    if (useStdio) {
        console.error(`Starting ${mcpServer.server.name} with stdio transport...`);
        const transport = new StdioServerTransport();
        await mcpServer.server.connect(transport);
        console.error(`${mcpServer.server.name} running with stdio transport`);
    } else {
        console.error(`Starting ${mcpServer.server.name} with HTTP transport on port ${port}...`);
        const app = express();
        
        // CORS middleware
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
        
        // Health check
        app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                name: mcpServer.server.name,
                version: mcpServer.server.version || '1.0.0',
                tools: mcpServer.tools.length,
                timestamp: new Date().toISOString()
            });
        });
        
        // List tools
        app.get('/tools', (req, res) => {
            res.json({
                server: mcpServer.server.name,
                tools: mcpServer.tools
            });
        });
        
        // MCP SSE endpoint
        app.get('/message', async (req, res) => {
            try {
                const transport = new SSEServerTransport('/message', res);
                await mcpServer.server.connect(transport);
                console.error(`${mcpServer.server.name} connected via SSE`);
            } catch (error) {
                console.error(`Error connecting ${mcpServer.server.name}:`, error);
                res.status(500).json({ error: 'Failed to connect MCP server' });
            }
        });
        
        app.listen(port, () => {
            console.error(`${mcpServer.server.name} running on port ${port}`);
            console.error(`Health: http://localhost:${port}/health`);
            console.error(`Tools: http://localhost:${port}/tools`);
            console.error(`MCP: http://localhost:${port}/message`);
        });
    }
}

function getPortFromArgs(argv, defaultPort) {
    const portIndex = argv.indexOf('--port');
    if (portIndex !== -1 && portIndex + 1 < argv.length) {
        const port = parseInt(argv[portIndex + 1]);
        if (!isNaN(port)) {
            return port;
        }
    }
    return defaultPort;
}
