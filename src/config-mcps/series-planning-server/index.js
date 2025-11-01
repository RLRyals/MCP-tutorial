// src/config-mcps/series-planning-server/index.js
// Phase-based MCP Server: Series Planning Phase
// Aggregates ONLY the tools needed during series planning - NO code duplication, ONE database connection

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

// Import ONLY handler classes - NOT full servers
// Import schemas from original MCPs - NO DUPLICATION
import { seriesToolsSchema } from '../../mcps/series-server/schemas/series-tools-schema.js';
import { lookupSystemToolsSchema } from '../../mcps/metadata-server/schemas/lookup-tools-schema.js';

// Import handlers from original MCPs - NO DUPLICATION
import { SeriesHandlers } from '../../mcps/series-server/handlers/series-handlers.js';
import { LookupManagementHandlers } from '../../mcps/metadata-server/handlers/lookup-management-handlers.js';

class SeriesPlanningMCPServer extends BaseMCPServer {
    constructor() {
        super('series-planning-phase', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build aggregated tool list from handlers
        this.tools = this.buildTools();

        console.error(`[SERIES-PLANNING-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Series and metadata handlers
        this.seriesHandlers = new SeriesHandlers(this.db);
        this.lookupHandlers = new LookupManagementHandlers(this.db);

        console.error('[SERIES-PLANNING-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // Series tools - filter to only include needed tools from README
        const neededSeriesTools = ['create_series', 'update_series', 'get_series', 'list_series'];
        seriesToolsSchema
            .filter(tool => neededSeriesTools.includes(tool.name))
            .forEach(tool => {
                tools.push({
                    ...tool,
                    name: `series_${tool.name}`,
                    description: `[SERIES] ${tool.description}`
                });
            });

        // Metadata tools - only assign_series_genres
        const neededMetadataTools = ['assign_series_genres'];
        lookupSystemToolsSchema
            .filter(tool => neededMetadataTools.includes(tool.name))
            .forEach(tool => {
                tools.push(tool);
            });

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Series handlers - imported from series-server
            'series_list_series': this.seriesHandlers.handleListSeries.bind(this.seriesHandlers),
            'series_create_series': this.seriesHandlers.handleCreateSeries.bind(this.seriesHandlers),
            'series_get_series': this.seriesHandlers.handleGetSeries.bind(this.seriesHandlers),
            'series_update_series': this.seriesHandlers.handleUpdateSeries.bind(this.seriesHandlers),

            // Metadata handlers - imported from metadata-server
            'assign_series_genres': this.lookupHandlers.handleAssignSeriesGenres.bind(this.lookupHandlers)
        };

        return handlerMap[toolName] || null;
    }
}

export { SeriesPlanningMCPServer };

// CLI runner when called directly
import { fileURLToPath } from 'url';

const normalizePath = (path) => {
    if (!path) return '';
    let normalizedPath = path.replace(/\\/g, '/');
    if (!normalizedPath.startsWith('file:')) {
        if (process.platform === 'win32') {
            normalizedPath = `file:///${normalizedPath}`;
        } else {
            normalizedPath = `file://${normalizedPath}`;
        }
    }
    normalizedPath = normalizedPath.replace(/^file:\/+/, 'file:///');
    return normalizedPath;
};

const normalizedScriptPath = normalizePath(process.argv[1]);
const normalizedCurrentModuleUrl = import.meta.url.replace(/\/{3,}/g, '///')
    .replace(/^file:\/([^\/])/, 'file:///$1');

const isDirectExecution = normalizedCurrentModuleUrl === normalizedScriptPath ||
    decodeURIComponent(normalizedCurrentModuleUrl) === normalizedScriptPath;

if (process.env.MCP_STDIO_MODE) {
    console.error('[SERIES-PLANNING-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new SeriesPlanningMCPServer();
        await server.run();
    } catch (error) {
        console.error('[SERIES-PLANNING-SERVER] Failed to start MCP server:', error.message);
        console.error('[SERIES-PLANNING-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[SERIES-PLANNING-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(SeriesPlanningMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[SERIES-PLANNING-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[SERIES-PLANNING-SERVER] Module imported - not starting server');
}
