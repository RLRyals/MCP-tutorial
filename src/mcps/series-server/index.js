// src/mcps/series-server/index.js
// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        // Keep the original console.error functionality but write to stderr instead
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';
import { SeriesHandlers } from './handlers/series-handlers.js';

class SeriesMCPServer extends BaseMCPServer {
    constructor() {
        super('series-manager', '1.0.0');

        // Initialize series handlers with shared DB connection
        this.seriesHandlers = new SeriesHandlers(this.db);

        // Initialize tools after base constructor
        this.tools = this.getTools();
        
        // Defensive check to ensure tools are properly initialized
        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[SERIES-SERVER] WARNING: Tools not properly initialized!');
            this.tools = this.getTools(); // Try again
        }
        
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[SERIES-SERVER] Initialized with ${this.tools.length} tools`);
        }
        
        // Test database connection on startup (don't wait for it, just start it)
        this.testDatabaseConnection();
    }
    
    async testDatabaseConnection() {
        try {
            if (this.db) {
                // Quick health check with timeout
                const healthPromise = this.db.healthCheck();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Database health check timed out')), 5000)
                );
                
                const health = await Promise.race([healthPromise, timeoutPromise]);
                if (health.healthy) {
                    console.error('[SERIES-SERVER] Database connection verified');
                } else {
                    console.error('[SERIES-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[SERIES-SERVER] Database connection test failed:', error.message);
        }
    }

    getTools() {
        // Use centralized schema from handlers
        return this.seriesHandlers.getSeriesTools();
    }

    getToolHandler(toolName) {
        const handlers = {
            'list_series': this.seriesHandlers.handleListSeries.bind(this.seriesHandlers),
            'get_series': this.seriesHandlers.handleGetSeries.bind(this.seriesHandlers),
            'create_series': this.seriesHandlers.handleCreateSeries.bind(this.seriesHandlers),
            'update_series': this.seriesHandlers.handleUpdateSeries.bind(this.seriesHandlers)
        };
        return handlers[toolName];
    }
}

export { SeriesMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[SERIES-SERVER] Module loaded');
    console.error('[SERIES-SERVER] MCP_STDIO_MODE:', process.env.MCP_STDIO_MODE);
    console.error('[SERIES-SERVER] import.meta.url:', import.meta.url);
    console.error('[SERIES-SERVER] process.argv[1]:', process.argv[1]);
}

// Convert paths to handle cross-platform differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];

// Function to normalize paths across platforms for more reliable comparison
const normalizePath = (path) => {
    if (!path) return '';
    
    // Replace backslashes with forward slashes for Windows
    let normalizedPath = path.replace(/\\/g, '/');
    
    // Add correct file:// protocol prefix based on platform
    if (!normalizedPath.startsWith('file:')) {
        if (process.platform === 'win32') {
            // Windows paths need triple slash: file:///C:/path
            normalizedPath = `file:///${normalizedPath}`;
        } else {
            // Mac/Linux paths need double slash: file:///Users/path
            normalizedPath = `file://${normalizedPath}`;
        }
    }
    
    // Fix any malformed protocol slashes (file:/ or file:// to file:///)
    normalizedPath = normalizedPath.replace(/^file:\/+/, 'file:///');
    
    return normalizedPath;
};

const normalizedScriptPath = normalizePath(scriptPath);
const normalizedCurrentModuleUrl = currentModuleUrl.replace(/\/{3,}/g, '///')
    .replace(/^file:\/([^\/])/, 'file:///$1'); // Ensure proper file:/// format

const isDirectExecution = normalizedCurrentModuleUrl === normalizedScriptPath || 
    decodeURIComponent(normalizedCurrentModuleUrl) === normalizedScriptPath;

if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[SERIES-SERVER] normalized current module url:', normalizedCurrentModuleUrl);
    console.error('[SERIES-SERVER] normalized script path:', normalizedScriptPath);
    console.error('[SERIES-SERVER] is direct execution:', isDirectExecution);
}

if (process.env.MCP_STDIO_MODE) {
    // When running in MCP stdio mode, always start the server
    console.error('[SERIES-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new SeriesMCPServer();
        await server.run();
    } catch (error) {
        console.error('[SERIES-SERVER] Failed to start MCP server:', error.message);
        console.error('[SERIES-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[SERIES-SERVER] Starting CLI runner...');
    }
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(SeriesMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[SERIES-SERVER] CLI runner failed:', error.message);
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error('[SERIES-SERVER] CLI runner stack:', error.stack);
        }
        throw error;
    }
} else if (isDirectExecution) {
    // When running directly as a CLI tool
    console.error('[SERIES-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(SeriesMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[SERIES-SERVER] CLI runner failed:', error.message);
        console.error('[SERIES-SERVER] CLI runner stack:', error.stack);
        throw error;
    }
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[SERIES-SERVER] Module imported - not starting server');
        console.error('[SERIES-SERVER] Module export completed');
    }
}