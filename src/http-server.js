// src/http-server.js - HTTP transport entry point for web-based tools like Typing Mind
import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { 
    AuthorMCPServer, 
    SeriesMCPServer, 
    BookMCPServer, 
    TimelineMCPServer, 
    MetadataMCPServer 
} from './mcps/index.js';

class HTTPMCPServerManager {
    constructor() {
        this.app = express();
        this.servers = [
            new AuthorMCPServer(),
            new SeriesMCPServer(), 
            new BookMCPServer(),
            new TimelineMCPServer(),
            new MetadataMCPServer()
        ];
        
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use((req, res, next) => {
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
                servers: this.servers.map(server => server.server.name),
                timestamp: new Date().toISOString()
            });
        });
        
        // Individual server health checks
        this.servers.forEach((server, index) => {
            this.app.get(`/health/${server.server.name}`, (req, res) => {
                res.json({
                    status: 'healthy',
                    name: server.server.name,
                    version: server.server.version,
                    tools: server.tools.length,
                    timestamp: new Date().toISOString()
                });
            });
        });
        
        // MCP SSE endpoint for each server
        this.servers.forEach((server, index) => {
            // Use the server name directly (removing -manager suffix if present)
            const serverPath = `/${server.server.name.replace('-manager', '-server')}`;
            
            this.app.get(serverPath, async (req, res) => {
                try {
                    const transport = new SSEServerTransport(serverPath, res);
                    await server.server.connect(transport);
                    console.error(`${server.server.name} connected via SSE transport`);
                } catch (error) {
                    console.error(`Error connecting ${server.server.name}:`, error);
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
                        server: server.server.name
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
    
    start(port = 3500) {
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
                const serverPath = server.server.name.replace('-manager', '-server');
                console.error(`  ${server.server.name}: http://localhost:${port}/${serverPath}`);
            });
        });
    }
}

// Start the server
const manager = new HTTPMCPServerManager();
const port = process.env.PORT || 3500;
manager.start(port);
