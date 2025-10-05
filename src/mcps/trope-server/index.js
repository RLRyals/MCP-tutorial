// src/mcps/trope-server/index.js
// Trope MCP Server - Manages narrative tropes and their implementation

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';
import { TropeHandlers } from './handlers/trope-handlers.js';
import { tropeToolsSchema } from './schemas/trope-tools-schema.js';

class TropeMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[TROPE-SERVER] Constructor starting...');
        try {
            super('trope-management', '1.0.0');
            console.error('[TROPE-SERVER] Constructor completed successfully');
        } catch (error) {
            console.error('[TROPE-SERVER] Constructor failed:', error.message);
            throw error;
        }

        // Initialize handler modules with error handling
        try {
            this.tropeHandlers = new TropeHandlers(this.db);
            console.error('[TROPE-SERVER] Trope handlers initialized');
        } catch (error) {
            console.error('[TROPE-SERVER] Handler initialization failed:', error.message);
            throw error;
        }

        // Bind handler methods to maintain context
        this.bindHandlerMethods();

        // Use direct schema imports for tools
        this.tools = this.getTools();

        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[TROPE-SERVER] WARNING: Tools not properly initialized!');
            this.tools = [...tropeToolsSchema];
        }

        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[TROPE-SERVER] Initialized with ${this.tools.length} tools`);
        }

        this.testDatabaseConnection();
    }

    // Proper method binding to maintain context
    bindHandlerMethods() {
        try {
            this.handleCreateTrope = this.tropeHandlers.handleCreateTrope.bind(this.tropeHandlers);
            this.handleGetTrope = this.tropeHandlers.handleGetTrope.bind(this.tropeHandlers);
            this.handleListTropes = this.tropeHandlers.handleListTropes.bind(this.tropeHandlers);
            this.handleCreateTropeInstance = this.tropeHandlers.handleCreateTropeInstance.bind(this.tropeHandlers);
            this.handleGetTropeInstance = this.tropeHandlers.handleGetTropeInstance.bind(this.tropeHandlers);
            this.handleListTropeInstances = this.tropeHandlers.handleListTropeInstances.bind(this.tropeHandlers);
            this.handleImplementTropeScene = this.tropeHandlers.handleImplementTropeScene.bind(this.tropeHandlers);
            this.handleGetTropeScenes = this.tropeHandlers.handleGetTropeScenes.bind(this.tropeHandlers);
            this.handleGetTropeProgress = this.tropeHandlers.handleGetTropeProgress.bind(this.tropeHandlers);
            this.handleAnalyzeTropePatterns = this.tropeHandlers.handleAnalyzeTropePatterns.bind(this.tropeHandlers);

            console.error('[TROPE-SERVER] All handler methods bound successfully');
        } catch (error) {
            console.error('[TROPE-SERVER] Method binding failed:', error.message);
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
                    console.error('[TROPE-SERVER] Database connection verified');
                } else {
                    console.error('[TROPE-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[TROPE-SERVER] Database connection test failed:', error.message);
        }
    }

    // =============================================
    // Use direct schema imports for tools
    // =============================================
    getTools() {
        try {
            const tools = [...tropeToolsSchema];

            console.error(`[TROPE-SERVER] Tools registered: ${tools.length} total`);
            return tools;
        } catch (error) {
            console.error('[TROPE-SERVER] Tool registration failed:', error.message);
            return [...tropeToolsSchema];
        }
    }

    // =============================================
    // TOOL HANDLER MAPPING
    // =============================================
    getToolHandler(toolName) {
        const handlers = {
            'create_trope': this.handleCreateTrope,
            'get_trope': this.handleGetTrope,
            'list_tropes': this.handleListTropes,
            'create_trope_instance': this.handleCreateTropeInstance,
            'get_trope_instance': this.handleGetTropeInstance,
            'list_trope_instances': this.handleListTropeInstances,
            'implement_trope_scene': this.handleImplementTropeScene,
            'get_trope_scenes': this.handleGetTropeScenes,
            'get_trope_progress': this.handleGetTropeProgress,
            'analyze_trope_patterns': this.handleAnalyzeTropePatterns
        };

        const handler = handlers[toolName];
        if (!handler) {
            console.error(`[TROPE-SERVER] No handler found for tool: ${toolName}`);
        }
        return handler;
    }
}

export { TropeMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[TROPE-SERVER] Module loaded');
}

// Normalize paths for cross-platform compatibility (Windows and Mac)
const currentModuleUrl = import.meta.url;
let scriptPath = process.argv[1];
// Handle Windows paths
if (scriptPath.includes('\\')) {
    scriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
} else {
    // Handle Mac/Unix paths
    scriptPath = `file://${scriptPath}`;
}
// Decode the URLs to ensure proper comparison
const normalizedCurrentUrl = decodeURIComponent(currentModuleUrl);
const normalizedScriptPath = decodeURIComponent(scriptPath);
const isDirectExecution = normalizedCurrentUrl === normalizedScriptPath || process.env.MCP_STDIO_MODE === 'true';

// Prioritize MCP_STDIO_MODE environment variable
if (process.env.MCP_STDIO_MODE === 'true') {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[TROPE-SERVER] Running in MCP stdio mode - starting server...');

    // When in MCP stdio mode, ensure clean stdout for JSON messages
    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[TROPE-SERVER] Setting up stdio mode handlers');
        // Redirect all console.log to stderr
        console.log = function(...args) {
            console.error('[TROPE-SERVER]', ...args);
        };
    }

    try {
        console.error('[TROPE-SERVER] Creating server instance...');
        const server = new TropeMCPServer();
        console.error('[TROPE-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[TROPE-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[TROPE-SERVER] Failed to start MCP server:', error.message);
        console.error('[TROPE-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    // When running as CLI (direct node execution)
    console.error('[TROPE-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(TropeMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[TROPE-SERVER] CLI runner failed:', error.message);
        process.exit(1);
    }
} else {
    // Module was imported, not directly executed
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[TROPE-SERVER] Module imported - not starting server');
    }
}
