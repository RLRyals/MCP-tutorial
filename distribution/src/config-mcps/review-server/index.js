// src/config-mcps/review-server/index.js
// Phase-based MCP Server: Editing and Review Phase
// Aggregates ONLY the tools needed during editing and revision - NO code duplication, ONE database connection

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

// Import ONLY handler classes - NOT full servers
// This prevents creating multiple database connections
import { ValidationHandlers } from '../../mcps/writing-server/handlers/validation-handlers.js';
import { ExportHandlers } from '../../mcps/writing-server/handlers/export-handlers.js';
import { TimelineEventHandlers } from '../../mcps/timeline-server/handlers/timeline-event-handlers.js';
import { EventChapterMappingHandlers } from '../../mcps/timeline-server/handlers/timeline-chapter-mapping-handler.js';
import { WorldElementHandlers } from '../../mcps/world-server/handlers/world-element-handlers.js';
import { WorldManagementHandlers } from '../../mcps/world-server/handlers/world-management-handlers.js';
import { SessionHandlers } from '../../mcps/writing-server/handlers/session-handlers.js';


class ReviewMCPServer extends BaseMCPServer {
    constructor() {
        super('review-phase', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build aggregated tool list from handlers
        this.tools = this.buildTools();

        console.error(`[REVISION-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create handler instances passing our shared database
        // These handlers are lightweight and don't create their own DB connections
        this.validationHandlers = new ValidationHandlers(this.db);
        this.exportHandlers = new ExportHandlers(this.db);
        this.timelineEventHandlers = new TimelineEventHandlers(this.db);
        this.eventChapterMappingHandlers = new EventChapterMappingHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);
        this.worldManagementHandlers = new WorldManagementHandlers(this.db);
        this.sessionHandlers = new SessionHandlers(this.db);

        console.error('[REVISION-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // Writing Server - Validation and Quality Tools
        const validationTools = this.validationHandlers.getValidationTools();
        const validateChapterStructure = validationTools.find(t => t.name === 'validate_chapter_structure');
        if (validateChapterStructure) {
            tools.push({
                ...validateChapterStructure,
                name: 'validate_chapter_structure',
                description: 'Check for structural consistency'
            });
        }

        const validateBeatPlacement = validationTools.find(t => t.name === 'validate_beat_placement');
        if (validateBeatPlacement) {
            tools.push({
                ...validateBeatPlacement,
                name: 'validate_beat_placement',
                description: 'Analyze story pacing and emotional beats'
            });
        }

        const checkStructureViolations = validationTools.find(t => t.name === 'check_structure_violations');
        if (checkStructureViolations) {
            tools.push({
                ...checkStructureViolations,
                name: 'check_structure_violations',
                description: 'Identify continuity issues and plot holes'
            });
        }

        const exportTools = this.exportHandlers.getExportTools();
        const wordCountTracking = exportTools.find(t => t.name === 'word_count_tracking');
        if (wordCountTracking) {
            tools.push({
                ...wordCountTracking,
                name: 'word_count_tracking',
                description: 'Analyze pacing and chapter length distribution'
            });
        }

        const exportManuscript = exportTools.find(t => t.name === 'export_manuscript');
        if (exportManuscript) {
            tools.push({
                ...exportManuscript,
                name: 'export_manuscript',
                description: 'Generate full or partial manuscript for review'
            });
        }

        // World Server - Setting Consistency Tools
        const worldManagementTools = this.worldManagementHandlers.getWorldManagementTools();
        const checkWorldConsistency = worldManagementTools.find(t => t.name === 'check_world_consistency');
        if (checkWorldConsistency) {
            tools.push({
                ...checkWorldConsistency,
                name: 'check_world_consistency',
                description: 'Identify world-building contradictions'
            });
        }

        const sessionTools = this.sessionHandlers.getSessionTools();
        const setWritingGoals = sessionTools.find(t => t.name === 'set_writing_goals');
        if (setWritingGoals) {
            tools.push({
                ...setWritingGoals,
                name: 'set_writing_goals',
                description: 'Set writing goals'
            });
        }

        const getProductivityAnalytics = sessionTools.find(t => t.name === 'get_productivity_analytics');
        if (getProductivityAnalytics) {
            tools.push({
                ...getProductivityAnalytics,
                name: 'get_productivity_analytics',
                description: 'Get productivity analytics'
            });
        }

        //get writing progress
        const getWritingProgress = sessionTools.find(t => t.name === 'get_writing_progress');
        if (getWritingProgress) {
            tools.push({
                ...getWritingProgress,
                name: 'get_writing_progress',
                description: 'Get writing progress'
            });
        }

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Writing Server - Validation and Quality
            'validate_chapter_structure': this.validationHandlers.handleValidateChapterStructure.bind(this.validationHandlers),
            'validate_beat_placement': this.validationHandlers.handleValidateBeatPlacement.bind(this.validationHandlers),
            'check_structure_violations': this.validationHandlers.handleCheckStructureViolations.bind(this.validationHandlers),
            'word_count_tracking': this.exportHandlers.handleWordCountTracking.bind(this.exportHandlers),
            'export_manuscript': this.exportHandlers.handleExportManuscript.bind(this.exportHandlers),
            'get_writing_progress': (args) => this.sessionHandlers.handleGetWritingProgress(args),
            'set_writing_goals': (args) => this.sessionHandlers.handleSetWritingGoals(args),
            'get_productivity_analytics': (args) => this.sessionHandlers.handleGetProductivityAnalytics(args),

            // World Server - Setting Consistency
            'check_world_consistency': this.worldManagementHandlers.handleCheckWorldConsistency.bind(this.worldManagementHandlers)
        };

        return handlerMap[toolName] || null;
    }
}

export { ReviewMCPServer };

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
    console.error('[REVISION-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new ReviewMCPServer();
        await server.run();
    } catch (error) {
        console.error('[REVISION-SERVER] Failed to start MCP server:', error.message);
        console.error('[REVISION-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[REVISION-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(ReviewMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[REVISION-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[REVISION-SERVER] Module imported - not starting server');
}
