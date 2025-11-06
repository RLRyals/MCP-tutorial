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
import { genreExtensionToolsSchema } from '../../mcps/plot-server/schemas/plot-tools-schema.js';

// Import handlers from original MCPs - NO DUPLICATION
import { SeriesHandlers } from '../../mcps/series-server/handlers/series-handlers.js';
import { LookupManagementHandlers } from '../../mcps/metadata-server/handlers/lookup-management-handlers.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { OrganizationHandlers } from '../../mcps/world-server/handlers/organization-handlers.js';
import { WorldElementHandlers } from '../../mcps/world-server/handlers/world-element-handlers.js';
import { GenreExtensions } from '../../mcps/plot-server/handlers/genre-extensions.js';

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

        // World-building handlers
        this.locationHandlers = new LocationHandlers(this.db);
        this.organizationHandlers = new OrganizationHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);

        // Plot/Genre extension handlers
        this.genreExtensions = new GenreExtensions(this.db);

        console.error('[SERIES-PLANNING-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // Series tools - IMPORT ALL (no filtering per user request)
        seriesToolsSchema.forEach(tool => {
            tools.push({
                ...tool,
                name: `${tool.name}`,
                description: `${tool.description}`
            });
        });

        // Metadata tools - only assign_series_genres
        const neededMetadataTools = ['assign_series_genres'];
        lookupSystemToolsSchema
            .filter(tool => neededMetadataTools.includes(tool.name))
            .forEach(tool => {
                tools.push(tool);
            });

        // World building tools - locations
        const neededLocationTools = ['create_location', 'get_locations'];
        this.locationHandlers.getLocationTools()
            .filter(tool => neededLocationTools.includes(tool.name))
            .forEach(tool => {
                tools.push({
                    ...tool,
                    name: `${tool.name}`,
                    description: `${tool.description}`
                });
            });

        // World building tools - organizations
        const neededOrgTools = ['create_organization', 'get_organizations'];
        this.organizationHandlers.getOrganizationTools()
            .filter(tool => neededOrgTools.includes(tool.name))
            .forEach(tool => {
                tools.push({
                    ...tool,
                    name: `${tool.name}`,
                    description: `${tool.description}`
                });
            });

        // World building tools - world elements
        const neededElementTools = ['create_world_element', 'get_world_elements'];
        this.worldElementHandlers.getWorldElementTools()
            .filter(tool => neededElementTools.includes(tool.name))
            .forEach(tool => {
                tools.push({
                    ...tool,
                    name: `${tool.name}`,
                    description: `${tool.description}`
                });
            });

        // Plot/Genre extension tools - only define_world_system
        const neededPlotTools = ['define_world_system'];
        genreExtensionToolsSchema
            .filter(tool => neededPlotTools.includes(tool.name))
            .forEach(tool => {
                tools.push({
                    ...tool,
                    name: `${tool.name}`,
                    description: `${tool.description}`
                });
            });

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Series handlers - imported from series-server (ALL TOOLS)
            'list_series': this.seriesHandlers.handleListSeries.bind(this.seriesHandlers),
            'create_series': this.seriesHandlers.handleCreateSeries.bind(this.seriesHandlers),
            'get_series': this.seriesHandlers.handleGetSeries.bind(this.seriesHandlers),
            'update_series': this.seriesHandlers.handleUpdateSeries.bind(this.seriesHandlers),

            // Metadata handlers - imported from metadata-server
            'assign_series_genres': this.lookupHandlers.handleAssignSeriesGenres.bind(this.lookupHandlers),

            // World building handlers - locations
            'create_location': this.locationHandlers.handleCreateLocation.bind(this.locationHandlers),
            'get_locations': this.locationHandlers.handleGetLocations.bind(this.locationHandlers),

            // World building handlers - organizations
            'create_organization': this.organizationHandlers.handleCreateOrganization.bind(this.organizationHandlers),
            'get_organizations': this.organizationHandlers.handleGetOrganizations.bind(this.organizationHandlers),

            // World building handlers - world elements
            'create_world_element': this.worldElementHandlers.handleCreateWorldElement.bind(this.worldElementHandlers),
            'get_world_elements': this.worldElementHandlers.handleGetWorldElements.bind(this.worldElementHandlers),

            // Plot/Genre extension handlers
            'define_world_system': this.genreExtensions.handleDefineWorldSystem.bind(this.genreExtensions)
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
