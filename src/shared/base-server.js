// src/shared/base-server.js - Base class for all MCP servers
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, InitializeRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from './database.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config({ 
    path: 'C:/github/MCP-tutorial/.env',
    silent: true , debug: false, quiet: true
});

if (!process.env.DATABASE_URL) {
    // Completely suppress dotenv output in MCP stdio mode
    if (process.env.MCP_STDIO_MODE === 'true') {
        // Temporarily redirect stdout to prevent dotenv pollution
        const originalWrite = process.stdout.write;
        process.stdout.write = () => true;
        
        try {
            dotenv.config({ silent: true , debug: false, quiet: true });
        } finally {
            // Restore stdout
            process.stdout.write = originalWrite;
        }
    } else {
        dotenv.config({ silent: true });
    }
}

export class BaseMCPServer {
    constructor(serverName, serverVersion = '1.0.0') {
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[${serverName}] BaseMCPServer constructor starting...`);
        }
        
        this.serverName = serverName;
        this.serverVersion = serverVersion;
        this.databaseReady = false;

        // Initialize HTTP server for health checks if not Claude MCP stdio mode
        if (process.env.MCP_STDIO_MODE !== 'true') {
            this.httpApp = express();
            this.setupHttpServer();
        }
        
        try {
            if (process.env.MCP_STDIO_MODE !== 'true') {
                console.error(`[${serverName}] Initializing MCP Server...`);
            }
            
            // Initialize MCP Server
            this.server = new Server(
                {
                    name: serverName,
                    version: serverVersion,
                },
                {
                    capabilities: {
                        tools: {},
                    },
                }
            );
            
            if (process.env.MCP_STDIO_MODE !== 'true') {
                console.error(`[${serverName}] MCP Server initialized`);
                console.error(`[${serverName}] Initializing database...`);
            }
            
            // Initialize database (only once)
            this.db = new DatabaseManager();
            
            if (process.env.MCP_STDIO_MODE !== 'true') {
                console.error(`[${serverName}] Database manager created`);
            }

            // Initialize minimal properties for immediate MCP functionality
            this.tools = []; // Empty tools initially - will be populated by child class
                    
            this.setupErrorHandling();
        
            this.setupBaseHandlers();

            
            if (process.env.MCP_STDIO_MODE !== 'true') {
                console.error(`[${serverName}] Minimal initialization completed for MCP handshake`);
                console.error(`[${serverName}] BaseMCPServer constructor completed successfully`);
            }
        } catch (error) {
            console.error(`[${serverName}] BaseMCPServer constructor failed:`, error.message);
            console.error(`[${serverName}] Stack:`, error.stack);
            throw error;
        }
    }

    setupHttpServer() {
        // Skip HTTP server when running as MCP server (stdio mode)
        // MCP servers communicate via stdin/stdout, not HTTP
        if (!process.stdout.isTTY || process.env.MCP_SERVER_MODE) {
            // Don't output to console during stdio mode - it interferes with MCP communication
            return;
        }
        this.httpApp.use(helmet());
        this.httpApp.use(cors());
        this.httpApp.use(express.json());

        // Health check endpoint
        this.httpApp.get('/health', async (req, res) => {
            try {
                // Only check database if it's initialized
                let dbHealth = { status: 'initializing' };
                if (this.db && this.databaseReady) {
                    dbHealth = await this.db.healthCheck();
                } else if (this.db) {
                    dbHealth = { status: 'connecting' };
                }
                
                res.json({
                    server: this.serverName,
                    status: this.databaseReady ? 'healthy' : 'starting',
                    timestamp: new Date().toISOString(),
                    database: dbHealth
                });
            } catch (error) {
                res.status(500).json({
                    server: this.serverName,
                    status: 'unhealthy',
                    error: error.message
                });
            }
        });

        // Server info endpoint
        this.httpApp.get('/info', (req, res) => {
            res.json({
                name: this.serverName,
                version: this.serverVersion,
                tools: this.tools.map(tool => ({
                    name: tool.name,
                    description: tool.description
                }))
            });
        });

        const port = process.env.MCP_PORT || 3000;
        this.httpApp.listen(port, () => {
            console.error(`${this.serverName} HTTP server running on port ${port}`);
        });
    }

    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error(`[${this.serverName} MCP Error]`, error);
        };

        process.on('SIGINT', async () => {
            await this.cleanup();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await this.cleanup();
            process.exit(0);
        });

        process.on('uncaughtException', (error) => {
            console.error(`[${this.serverName} Uncaught Exception]`, error);
            this.cleanup().then(() => process.exit(1));
        });
    }

    setupBaseHandlers() {
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[${this.serverName}] Setting up base handlers...`);
        }
        
        try {
            // Initialize handler - CRITICAL for MCP handshake
            console.error(`[${this.serverName}] Registering InitializeRequestSchema handler...`);
            this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
                console.error(`[${this.serverName}] Initialize request received from ${request.params?.clientInfo?.name || 'unknown client'}`);
                return {
                    protocolVersion: "2025-06-18",
                    capabilities: {
                        tools: {}
                    },
                    serverInfo: {
                        name: this.serverName,
                        version: this.serverVersion
                    }
                };
            });
            console.error(`[${this.serverName}] InitializeRequestSchema handler registered successfully`);
            
            // List tools handler
            if (process.env.MCP_STDIO_MODE !== 'true') {
                console.error(`[${this.serverName}] Registering ListToolsRequestSchema handler...`);
            }
            
            this.server.setRequestHandler(ListToolsRequestSchema, async () => {
                console.error(`[${this.serverName}] ListTools request received, returning ${this.tools.length} tools`);
                return { tools: this.tools };
            });
            
            if (process.env.MCP_STDIO_MODE !== 'true') {
                console.error(`[${this.serverName}] ListToolsRequestSchema handler registered successfully`);
                console.error(`[${this.serverName}] Registering CallToolRequestSchema handler...`);
            }

            // Call tool handler
            this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
                const { name, arguments: args } = request.params;
                
                // Only log in non-stdio mode to avoid JSON pollution
                if (process.env.MCP_STDIO_MODE !== 'true') {
                    console.error(`[${this.serverName}] CallTool request received for: ${name}`);
                }

                try {
                    const handler = this.getToolHandler(name);
                    if (!handler) {
                        throw new Error(`Unknown tool: ${name}`);
                    }

                    const result = await handler.call(this, args);
                    
                    if (process.env.MCP_STDIO_MODE !== 'true') {
                        console.error(`[${this.serverName}] Tool ${name} executed successfully`);
                    }
                    
                    return this.formatSuccess(result);
                } catch (error) {
                    console.error(`[${this.serverName}] Error executing tool ${name}:`, error);
                    return this.formatError(name, error);
                }
            });
            
            if (process.env.MCP_STDIO_MODE !== 'true') {
                console.error(`[${this.serverName}] CallToolRequestSchema handler registered successfully`);
                console.error(`[${this.serverName}] Base handlers setup completed`);
            }
        } catch (error) {
            console.error(`[${this.serverName}] Error setting up base handlers:`, error);
            throw error;
        }
    }

    // To be overridden by child classes
    getTools() {
        return [];
    }

    // To be overridden by child classes
    getToolHandler(toolName) {
        throw new Error('getToolHandler must be implemented by child class');
    }

    // Helper methods for formatting responses
    formatSuccess(data, message = null) {
        const response = {
            content: []
        };

        if (message) {
            response.content.push({
                type: 'text',
                text: message
            });
        }

        if (data) {
            if (typeof data === 'string') {
                response.content.push({
                    type: 'text',
                    text: data
                });
            } else {
                response.content.push({
                    type: 'text',
                    text: JSON.stringify(data, null, 2)
                });
            }
        }

        return response;
    }

    formatError(toolName, error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error executing ${toolName}: ${error.message}`
                }
            ],
            isError: true
        };
    }

    // Common validation helpers
    validateRequired(args, requiredFields) {
        const missing = requiredFields.filter(field => 
            args[field] === undefined || args[field] === null || args[field] === ''
        );
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }

    validateSeriesExists(seriesId) {
        return this.db.findById('series', seriesId);
    }

    validateBookExists(bookId) {
        return this.db.findById('books', bookId);
    }

    validateCharacterExists(characterId) {
        return this.db.findById('characters', characterId);
    }

    // Common tool implementations that can be shared
    async getSeriesOverview(args) {
        const { series_id } = args;
        const result = await this.db.getSeriesOverview(series_id);
        
        if (series_id && result.length === 0) {
            throw new Error(`Series with ID ${series_id} not found`);
        }
        
        return result;
    }

    async searchContent(args) {
        this.validateRequired(args, ['series_id', 'search_term']);
        const { series_id, search_term, content_types } = args;
        
        await this.validateSeriesExists(series_id);
        
        const contentTypesArray = content_types ? 
            (Array.isArray(content_types) ? content_types : [content_types]) : 
            [];
            
        return await this.db.searchContent(series_id, search_term, contentTypesArray);
    }

    async cleanup() {
        console.error(`Shutting down ${this.serverName}...`);
        try {
            await this.db.close();
            console.error(`${this.serverName} database connection closed`);
        } catch (error) {
            console.error(`Error during ${this.serverName} cleanup:`, error);
        }
    }

    async run() {
        try {
            // Start MCP server first (don't wait for database)
            console.error(`[${this.serverName}] Starting MCP server...`);
            
            console.error(`[${this.serverName}] Creating transport...`);
            const transport = new StdioServerTransport();
            
            console.error(`[${this.serverName}] Connecting server to transport...`);
            await this.server.connect(transport);
            
            console.error(`[${this.serverName}] MCP Server running on stdio`);
            
        } catch (error) {
            console.error(`Failed to start ${this.serverName}:`, error);
            console.error(`Error details:`, error.stack);
            await this.cleanup();
            process.exit(1);
        }
    }
    
    async testDatabaseConnection() {
        try {
            // Wait for database to be initialized in deferred initialization
            if (!this.db) {
                console.error(`${this.serverName} waiting for database initialization...`);
                return;
            }
            
            console.error(`${this.serverName} testing database connection...`);
            const healthCheckPromise = this.db.healthCheck();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database health check timed out after 10 seconds')), 10000)
            );
            
            const healthCheck = await Promise.race([healthCheckPromise, timeoutPromise]);
            if (healthCheck.healthy) {
                console.error(`${this.serverName} database connection established`);
                this.databaseReady = true;
            } else {
                console.error(`${this.serverName} database health check failed: ${healthCheck.error}`);
                this.databaseReady = false;
            }
        } catch (error) {
            console.error(`${this.serverName} database connection failed: ${error.message}`);
            this.databaseReady = false;
        }
    }
}