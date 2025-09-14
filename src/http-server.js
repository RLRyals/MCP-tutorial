// src/http-server.js - HTTP transport entry point for web-based tools like Typing Mind
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from ('fs').promises;
import path from 'path';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
// import { 
//     AuthorMCPServer, 
//     SeriesMCPServer, 
//     BookMCPServer, 
//     TimelineMCPServer, 
//     MetadataMCPServer 
// } from './mcps/index.js';
import { createServer } from '.mcps';

class HTTPMCPServerManager {
    constructor() {
        this.app = express();
        //this.app.use(bodyParser.json());
        
        // this.servers = [
            //     new AuthorMCPServer(),
            //     new SeriesMCPServer(), 
            //     new BookMCPServer(),
            //     new TimelineMCPServer(),
            //     new MetadataMCPServer()
            // ];
            
            this.setupMiddleware();
            this.setupRoutes();
        }
        
        setupMiddleware() {
            this.app.use(express.json());
            this.app.use(cors());
    
            this.app.use((req, res, next) => {
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('X-Accel-Buffering', 'no');
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                next();
            });
    }
    
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy',
                servers: this.servers.map(server => server.serverName),
                timestamp: new Date().toISOString()
            });
        });
        
        // Individual server health checks
        this.servers.forEach((server, index) => {
            this.app.get(`/health/${server.serverName}`, (req, res) => {
                res.json({
                    status: 'healthy',
                    name: server.serverName,
                    version: server.server.version,
                    tools: server.tools.length,
                    timestamp: new Date().toISOString()
                });
            });
        });
        
        // MCP SSE endpoint for each server
        this.servers.forEach((server, index) => {
            // Use the server name directly (removing -manager suffix if present)
            console.error(`Setting up SSE endpoint for ${server.serverName}`);
            const serverPath = `/${server.serverName.replace('-manager', '-server')}`;
            
            this.app.get(serverPath, async (req, res) => {
                try {
                    const transport = new SSEServerTransport(serverPath, res);
                    await server.server.connect(transport);
                    console.error(`${server.serverName} connected via SSE transport`);
                } catch (error) {
                    console.error(`Error connecting ${server.serverName}:`, error);
                    res.status(500).json({ error: 'Failed to connect MCP server' });
                }
            });
        });
        

        
        // List all available tools across all servers
        this.app.get('/tools', (req, res) => {
            const allTools = [];
            this.servers.forEach(server => {
                server.tools.forEach(tool => {
                    allTools.push({
                        ...tool,
                        server: server.serverName
                    });
                });
            });
            
            res.json({
                tools: allTools,
                serverCount: this.servers.length,
                totalTools: allTools.length
            });
        });
    }
    
    async cleanup() {
        console.error('Shutting down HTTP MCP servers...');
        for (const server of this.servers) {
            await server.cleanup();
        }
    }
    
    start(port = process.env.MCP_SERVER_PORT) {
        // Setup cleanup
        process.on('SIGINT', async () => {
            await this.cleanup();
            process.exit(0);
        });
        
        this.app.listen(port, () => {
            console.error(`MCP Series Management HTTP Server running on port ${port}`);
            console.error('Available endpoints:');
            console.error(`  Health: http://localhost:${port}/health`);
            console.error(`  Tools: http://localhost:${port}/tools`);
            this.servers.forEach(server => {
                const serverPath = server.serverName.replace('-manager', '-server');
                console.error(`  ${server.serverName}: http://localhost:${port}/${serverPath}`);
            });
        });
    }
}

// Start the server
const manager = new HTTPMCPServerManager();
const port = process.env.MCP_SERVER_PORT || 3500;
manager.start(port);
