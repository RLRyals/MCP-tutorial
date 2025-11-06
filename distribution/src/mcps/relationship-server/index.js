// src/mcps/relationship-server/index.js
// Relationship MCP Server for managing character relationships and dynamics

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';
import { RelationshipHandlers } from './handlers/relationship-handlers.js';

class RelationshipMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[RELATIONSHIP-SERVER] Constructor starting...');
        try {
            super('relationship-management', '1.0.0');
            console.error('[RELATIONSHIP-SERVER] Constructor completed successfully');
        } catch (error) {
            console.error('[RELATIONSHIP-SERVER] Constructor failed:', error.message);
            throw error;
        }

        // Initialize handler modules
        try {
            this.relationshipHandlers = new RelationshipHandlers(this.db);
            console.error('[RELATIONSHIP-SERVER] Relationship handlers initialized');
        } catch (error) {
            console.error('[RELATIONSHIP-SERVER] Handler initialization failed:', error.message);
            throw error;
        }

        // Bind handler methods
        this.bindHandlerMethods();

        // Initialize tools
        this.tools = this.getTools();

        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[RELATIONSHIP-SERVER] WARNING: Tools not properly initialized!');
        }

        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[RELATIONSHIP-SERVER] Initialized with ${this.tools.length} tools`);
        }

        this.testDatabaseConnection();
    }

    bindHandlerMethods() {
        try {
            this.handleCreateRelationshipArc = this.relationshipHandlers.handleCreateRelationshipArc.bind(this.relationshipHandlers);
            this.handleTrackRelationshipDynamics = this.relationshipHandlers.handleTrackRelationshipDynamics.bind(this.relationshipHandlers);
            this.handleGetRelationshipArc = this.relationshipHandlers.handleGetRelationshipArc.bind(this.relationshipHandlers);
            this.handleListRelationshipArcs = this.relationshipHandlers.handleListRelationshipArcs.bind(this.relationshipHandlers);
            this.handleGetRelationshipTimeline = this.relationshipHandlers.handleGetRelationshipTimeline.bind(this.relationshipHandlers);

            console.error('[RELATIONSHIP-SERVER] All handler methods bound successfully');
        } catch (error) {
            console.error('[RELATIONSHIP-SERVER] Method binding failed:', error.message);
            throw error;
        }
    }

    async testDatabaseConnection() {
        try {
            if (this.db) {
                const healthPromise = this.db.healthCheck();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Database health check timed out')), 5000)
                );

                const health = await Promise.race([healthPromise, timeoutPromise]);
                if (health.healthy) {
                    console.error('[RELATIONSHIP-SERVER] Database connection verified');
                } else {
                    console.error('[RELATIONSHIP-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[RELATIONSHIP-SERVER] Database connection test failed:', error.message);
        }
    }

    getTools() {
        try {
            const tools = [
                ...this.relationshipHandlers.getRelationshipTools()
            ];

            console.error(`[RELATIONSHIP-SERVER] Tools registered: ${tools.length} total`);
            return tools;
        } catch (error) {
            console.error('[RELATIONSHIP-SERVER] Tool registration failed:', error.message);
            return [];
        }
    }

    getToolHandler(toolName) {
        const handlers = {
            'create_relationship_arc': this.handleCreateRelationshipArc,
            'track_relationship_dynamics': this.handleTrackRelationshipDynamics,
            'get_relationship_arc': this.handleGetRelationshipArc,
            'list_relationship_arcs': this.handleListRelationshipArcs,
            'get_relationship_timeline': this.handleGetRelationshipTimeline
        };

        const handler = handlers[toolName];
        if (!handler) {
            console.error(`[RELATIONSHIP-SERVER] No handler found for tool: ${toolName}`);
        }
        return handler;
    }
}

export { RelationshipMCPServer };

// CLI runner when called directly
import { fileURLToPath } from 'url';

if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[RELATIONSHIP-SERVER] Module loaded');
}

// Normalize paths for cross-platform compatibility
const currentModuleUrl = import.meta.url;
let scriptPath = process.argv[1];
if (scriptPath.includes('\\')) {
    scriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
} else {
    scriptPath = `file://${scriptPath}`;
}
const normalizedCurrentUrl = decodeURIComponent(currentModuleUrl);
const normalizedScriptPath = decodeURIComponent(scriptPath);
const isDirectExecution = normalizedCurrentUrl === normalizedScriptPath || process.env.MCP_STDIO_MODE === 'true';

if (process.env.MCP_STDIO_MODE === 'true') {
    console.error('[RELATIONSHIP-SERVER] Running in MCP stdio mode - starting server...');

    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[RELATIONSHIP-SERVER] Setting up stdio mode handlers');
        console.log = function(...args) {
            console.error('[RELATIONSHIP-SERVER]', ...args);
        };
    }

    try {
        console.error('[RELATIONSHIP-SERVER] Creating server instance...');
        const server = new RelationshipMCPServer();
        console.error('[RELATIONSHIP-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[RELATIONSHIP-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[RELATIONSHIP-SERVER] Failed to start MCP server:', error.message);
        console.error('[RELATIONSHIP-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[RELATIONSHIP-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(RelationshipMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[RELATIONSHIP-SERVER] CLI runner failed:', error.message);
        process.exit(1);
    }
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[RELATIONSHIP-SERVER] Module imported - not starting server');
    }
}
