// src/stdio-server.js - Stdio transport entry point for Claude Projects
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { 
    AuthorMCPServer, 
    SeriesMCPServer, 
    BookMCPServer, 
    TimelineMCPServer, 
    MetadataMCPServer 
} from './mcps/index.js';

class CompositeMCPServer {
    constructor() {
        this.servers = [
            new AuthorMCPServer(),
            new SeriesMCPServer(),
            new BookMCPServer(),
            new TimelineMCPServer(),
            new MetadataMCPServer()
        ];
        
        // Merge all tools from individual servers
        this.allTools = [];
        this.toolHandlers = new Map();
        
        for (const server of this.servers) {
            for (const tool of server.tools) {
                this.allTools.push(tool);
                this.toolHandlers.set(tool.name, server.getToolHandler(tool.name));
            }
        }
        
        // Use the first server's underlying server as the main one
        this.mainServer = this.servers[0].server;
        this.setupCompositeHandlers();
    }
    
    setupCompositeHandlers() {
        // Override the handlers to use composite functionality
        this.mainServer.setRequestHandler(ListToolsRequestSchema, async () => {
            return { tools: this.allTools };
        });
        
        this.mainServer.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            
            try {
                const handler = this.toolHandlers.get(name);
                if (!handler) {
                    throw new Error(`Unknown tool: ${name}`);
                }
                return await handler(args);
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing ${name}: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        });
    }
    
    async cleanup() {
        for (const server of this.servers) {
            await server.cleanup();
        }
    }
}

async function main() {
    const compositeServer = new CompositeMCPServer();
    
    // Setup cleanup
    process.on('SIGINT', async () => {
        await compositeServer.cleanup();
        process.exit(0);
    });
    
    const transport = new StdioServerTransport();
    await compositeServer.mainServer.connect(transport);
    console.error('MCP Series Management Server running with stdio transport (Claude Projects compatible)');
}

main().catch(console.error);
