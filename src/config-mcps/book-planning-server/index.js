// src/config-mcps/book-planning-server/index.js
// Phase-based MCP Server: Book Planning Phase
// Works alongside core-content-server (always-on) - NO tool duplication

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

// Import ONLY phase-specific handler classes
// Core handlers (PlotThread, CharacterTimeline, CharacterKnowledge, CharacterDetail,
// Location, Relationship, TimelineEvent, WorldElement, GenreExtensions, Chapter get/list)
// are in core-content-server (always-on)
import { BookHandlers } from '../../mcps/book-server/handlers/book-handlers.js';
import { TimelineEventHandlers } from '../../mcps/timeline-server/handlers/timeline-event-handlers.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { OrganizationHandlers } from '../../mcps/world-server/handlers/organization-handlers.js';
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { LookupManagementHandlers } from '../../mcps/metadata-server/handlers/lookup-management-handlers.js';

// Import phase-specific schemas directly to reduce token usage
import { bookPlanningSchemas } from '../../mcps/book-server/schemas/book-planning-schemas.js';

class BookPlanningMCPServer extends BaseMCPServer {
    constructor() {
        super('book-planning-phase', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build aggregated tool list from handlers
        this.tools = this.buildTools();

        console.error(`[BOOK-PLANNING-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create phase-specific handler instances
        this.bookHandlers = new BookHandlers(this.db);
        this.timelineEventHandlers = new TimelineEventHandlers(this.db);
        this.locationHandlers = new LocationHandlers(this.db);
        this.organizationHandlers = new OrganizationHandlers(this.db);
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.lookupHandlers = new LookupManagementHandlers(this.db);

        console.error('[BOOK-PLANNING-SERVER] Phase-specific handlers initialized');
    }

    buildTools() {
        const tools = [];

        // =============================================
        // 1. BOOK STRUCTURE TOOLS (Phase-specific)
        // =============================================
        tools.push({
            ...bookPlanningSchemas.create_book,
            name: 'create_book',
            description: `${bookPlanningSchemas.create_book.description}`
        });

        tools.push({
            ...bookPlanningSchemas.update_book,
            name: 'update_book',
            description: `${bookPlanningSchemas.update_book.description}`
        });

        tools.push({
            ...bookPlanningSchemas.get_book,
            name: 'get_book',
            description: `${bookPlanningSchemas.get_book.description}`
        });

        tools.push({
            ...bookPlanningSchemas.list_books,
            name: 'list_books',
            description: `${bookPlanningSchemas.list_books.description}`
        });

        // =============================================
        // 2. PLOT THREAD TOOLS (Phase-specific)
        // =============================================
        const plotThreadTools = this.plotThreadHandlers.getPlotThreadTools();

        const createPlotThread = plotThreadTools.find(t => t.name === 'create_plot_thread');
        if (createPlotThread) {
            tools.push({
                ...createPlotThread,
                name: 'create_plot_thread',
                description: `${createPlotThread.description}`
            });
        }

        const updatePlotThread = plotThreadTools.find(t => t.name === 'update_plot_thread');
        if (updatePlotThread) {
            tools.push({
                ...updatePlotThread,
                name: 'update_plot_thread',
                description: `${updatePlotThread.description}`
            });
        }
        
        // =============================================
        // 4. TIMELINE EVENT CREATION (Phase-specific)
        // =============================================
        const timelineTools = this.timelineEventHandlers.getTimelineEventTools();
        const createTimelineEvent = timelineTools.find(t => t.name === 'create_timeline_event');
        if (createTimelineEvent) {
            tools.push({
                ...createTimelineEvent,
                name: 'create_timeline_event',
                description: `${createTimelineEvent.description}`
            });
        }

        // =============================================
        // 5. METADATA TOOLS (Phase-specific)
        // =============================================
        const lookupTools = this.lookupHandlers.getLookupManagementTools();
        const assignBookGenres = lookupTools.find(t => t.name === 'assign_book_genres');
        if (assignBookGenres) {
            tools.push({
                ...assignBookGenres,
                name: 'assign_book_genres',
                description: `${assignBookGenres.description}`
            });
        }

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Book handlers
            'create_book': (args) => this.bookHandlers.handleCreateBook(args),
            'update_book': (args) => this.bookHandlers.handleUpdateBook(args),
            'get_book': (args) => this.bookHandlers.handleGetBook(args),
            'list_books': (args) => this.bookHandlers.handleListBooks(args),

            // Plot thread handlers
            'create_plot_thread': (args) => this.plotThreadHandlers.handleCreatePlotThread(args),
            'update_plot_thread': (args) => this.plotThreadHandlers.handleUpdatePlotThread(args),

            // Timeline handlers
            'create_timeline_event': (args) => this.timelineEventHandlers.handleCreateTimelineEvent(args),

            // Metadata handlers
            'assign_book_genres': (args) => this.lookupHandlers.handleAssignBookGenres(args)
        };

        return handlerMap[toolName] || null;
    }
}

export { BookPlanningMCPServer };

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
    console.error('[BOOK-PLANNING-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new BookPlanningMCPServer();
        await server.run();
    } catch (error) {
        console.error('[BOOK-PLANNING-SERVER] Failed to start MCP server:', error.message);
        console.error('[BOOK-PLANNING-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[BOOK-PLANNING-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(BookPlanningMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[BOOK-PLANNING-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[BOOK-PLANNING-SERVER] Module imported - not starting server');
}
