// src/mcps/plot-server/index.js
// COMPLETELY FIXED VERSION - Modular Plot MCP Server with proper method binding
// Combines handler modules for plot threads, story analysis, and genre extensions

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';
import { PlotThreadHandlers } from './handlers/plot-thread-handlers.js';
import { GenreExtensions } from './handlers/genre-extensions.js';
import {
    lookupSystemToolsSchema,
    plotThreadToolsSchema,
    genreExtensionToolsSchema
} from './schemas/plot-tools-schema.js';

class PlotMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[PLOT-SERVER] Constructor starting...');
        try {
            super('plot-management', '1.0.0');
            console.error('[PLOT-SERVER] Constructor completed successfully');
        } catch (error) {
            console.error('[PLOT-SERVER] Constructor failed:', error.message);
            throw error;
        }
        
        // Initialize handler modules with error handling
        try {
            this.plotThreadHandlers = new PlotThreadHandlers(this.db);
            console.error('[PLOT-SERVER] Plot thread handlers initialized');

            this.genreExtensions = new GenreExtensions(this.db);
            console.error('[PLOT-SERVER] Genre extensions initialized');

        } catch (error) {
            console.error('[PLOT-SERVER] Handler initialization failed:', error.message);
            throw error;
        }
        
        // FIXED: Properly bind handler methods to maintain context
        this.bindHandlerMethods();
        
        // FIXED: Use direct schema imports instead of handler methods that might fail
        this.tools = this.getTools();
        
        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[PLOT-SERVER] WARNING: Tools not properly initialized!');
            // Fallback to basic tools only
            this.tools = [...lookupSystemToolsSchema];
        }
        
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[PLOT-SERVER] Initialized with ${this.tools.length} tools`);
        }
        
        this.testDatabaseConnection();
    }

    // FIXED: Proper method binding to maintain context
    bindHandlerMethods() {
        try {
            // Bind plot thread handler methods
            this.handleCreatePlotThread = this.plotThreadHandlers.handleCreatePlotThread.bind(this.plotThreadHandlers);
            this.handleUpdatePlotThread = this.plotThreadHandlers.handleUpdatePlotThread.bind(this.plotThreadHandlers);
            this.handleGetPlotThreads = this.plotThreadHandlers.handleGetPlotThreads.bind(this.plotThreadHandlers);
            //this.handleLinkPlotThreads = this.plotThreadHandlers.handleLinkPlotThreads.bind(this.plotThreadHandlers);
            this.handleResolvePlotThread = this.plotThreadHandlers.handleResolvePlotThread.bind(this.plotThreadHandlers);

            // Bind universal genre extension methods
            this.handleCreateInformationReveal = this.genreExtensions.handleCreateInformationReveal.bind(this.genreExtensions);
            this.handleDefineWorldSystem = this.genreExtensions.handleDefineWorldSystem.bind(this.genreExtensions);
            this.handleAddRevealEvidence = this.genreExtensions.handleAddRevealEvidence.bind(this.genreExtensions);
            this.handleTrackSystemProgression = this.genreExtensions.handleTrackSystemProgression.bind(this.genreExtensions);

            console.error('[PLOT-SERVER] All handler methods bound successfully');
        } catch (error) {
            console.error('[PLOT-SERVER] Method binding failed:', error.message);
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
                    console.error('[PLOT-SERVER] Database connection verified');
                } else {
                    console.error('[PLOT-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[PLOT-SERVER] Database connection test failed:', error.message);
        }
    }

    // =============================================
    // FIXED: Use direct schema imports for tools
    // =============================================
    getTools() {
        try {
            const tools = [
                // Lookup system tools (always working)
                ...lookupSystemToolsSchema,

                // Core plot thread tools
                ...plotThreadToolsSchema,

                // Universal genre tools
                ...genreExtensionToolsSchema
            ];

            console.error(`[PLOT-SERVER] Tools registered: ${tools.length} total`);
            return tools;
        } catch (error) {
            console.error('[PLOT-SERVER] Tool registration failed:', error.message);
            // Return at least the working lookup tools
            return [...lookupSystemToolsSchema];
        }
    }

    // =============================================
    // COMPLETE TOOL HANDLER MAPPING
    // =============================================
    getToolHandler(toolName) {
        const handlers = {
            // Plot Thread Handlers
            'create_plot_thread': this.handleCreatePlotThread,
            'update_plot_thread': this.handleUpdatePlotThread,
            'get_plot_threads': this.handleGetPlotThreads,
            //'link_plot_threads': this.handleLinkPlotThreads,
            'resolve_plot_thread': this.handleResolvePlotThread,

            // Universal Genre Handlers (replaces old genre-specific ones)
            'create_information_reveal': this.handleCreateInformationReveal,
            'define_world_system': this.handleDefineWorldSystem,
            'add_reveal_evidence': this.handleAddRevealEvidence,
            'track_system_progression': this.handleTrackSystemProgression
        };

        const handler = handlers[toolName];
        if (!handler) {
            console.error(`[PLOT-SERVER] No handler found for tool: ${toolName}`);
        }
        return handler;
    }
}

export { PlotMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[PLOT-SERVER] Module loaded');
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
    console.error('[PLOT-SERVER] Running in MCP stdio mode - starting server...');
    
    // When in MCP stdio mode, ensure clean stdout for JSON messages
    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[PLOT-SERVER] Setting up stdio mode handlers');
        // Redirect all console.log to stderr
        console.log = function(...args) {
            console.error('[PLOT-SERVER]', ...args);
        };
    }
    
    try {
        console.error('[PLOT-SERVER] Creating server instance...');
        const server = new PlotMCPServer();
        console.error('[PLOT-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[PLOT-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[PLOT-SERVER] Failed to start MCP server:', error.message);
        console.error('[PLOT-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    // When running as CLI (direct node execution)
    console.error('[PLOT-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(PlotMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[PLOT-SERVER] CLI runner failed:', error.message);
        process.exit(1);
    }
} else {
    // Module was imported, not directly executed
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[PLOT-SERVER] Module imported - not starting server');
    }
}