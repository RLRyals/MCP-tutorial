// src/config-mcps/scene-server/index.js
// Phase-based MCP Server: Scene Writing Phase
// Aggregates ONLY the tools needed during scene writing - NO code duplication, ONE database connection

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
import { SceneHandlers } from '../../mcps/book-server/handlers/scene-handlers.js';
import { CharacterDetailHandlers } from '../../mcps/character-server/handlers/character-detail-handlers.js';
import { CharacterTimelineHandlers } from '../../mcps/character-server/handlers/character-timeline-handlers.js';
import { ValidationHandlers } from '../../mcps/writing-server/handlers/validation-handlers.js';
import { SessionHandlers } from '../../mcps/writing-server/handlers/session-handlers.js';
import { ExportHandlers } from '../../mcps/writing-server/handlers/export-handlers.js';

// Import phase-specific schemas directly to reduce token usage
import { minimalSceneWritingSchemas } from '../../mcps/book-server/schemas/scene-writing-schemas.js';

class SceneWritingMCPServer extends BaseMCPServer {
    constructor() {
        super('scene-writing-phase', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build aggregated tool list from handlers
        this.tools = this.buildTools();

        console.error(`[SCENE-WRITING-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create handler instances passing our shared database
        // These handlers are lightweight and don't create their own DB connections
        this.sceneHandlers = new SceneHandlers(this.db);
        this.characterDetailHandlers = new CharacterDetailHandlers(this.db);
        this.characterTimelineHandlers = new CharacterTimelineHandlers(this.db);
        this.validationHandlers = new ValidationHandlers(this.db);
        this.sessionHandlers = new SessionHandlers(this.db);
        this.exportHandlers = new ExportHandlers(this.db);

        console.error('[SCENE-WRITING-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // BOOK - Scene Tools
        tools.push({
            ...minimalSceneWritingSchemas.create_scene,
            name: 'book_create_scene',
            description: '[BOOK] Create new scenes as they are written'
        });

        tools.push({
            ...minimalSceneWritingSchemas.update_scene,
            name: 'book_update_scene',
            description: '[BOOK] Update scenes with word counts and status changes'
        });

        tools.push({
            ...minimalSceneWritingSchemas.get_scene,
            name: 'book_get_scene',
            description: '[BOOK] Get details of a specific scene'
        });

        tools.push({
            ...minimalSceneWritingSchemas.list_scenes,
            name: 'book_list_scenes',
            description: '[BOOK] Review existing scenes before adding new ones'
        });

        // CHARACTER Tools
        const detailTools = this.characterDetailHandlers.getCharacterDetailTools();
        const getCharacterDetails = detailTools.find(t => t.name === 'get_character_details');
        if (getCharacterDetails) {
            tools.push({
                ...getCharacterDetails,
                name: 'character_get_character_details',
                description: '[CHARACTER] Ensure consistent character descriptions and traits'
            });
        }

        const characterTimelineTools = this.characterTimelineHandlers.getCharacterTimelineTools();
        const getCharactersInChapter = characterTimelineTools.find(t => t.name === 'get_characters_in_chapter');
        if (getCharactersInChapter) {
            tools.push({
                ...getCharactersInChapter,
                name: 'character_get_characters_in_chapter',
                description: '[CHARACTER] See who is supposed to appear in the chapter'
            });
        }

        const checkCharacterContinuity = characterTimelineTools.find(t => t.name === 'check_character_continuity');
        if (checkCharacterContinuity) {
            tools.push({
                ...checkCharacterContinuity,
                name: 'character_check_character_continuity',
                description: '[CHARACTER] Verify character consistency across chapter boundaries'
            });
        }

        // WRITING - Validation Tools
        const validationTools = this.validationHandlers.getValidationTools();
        const validateChapterStructure = validationTools.find(t => t.name === 'validate_chapter_structure');
        if (validateChapterStructure) {
            tools.push({
                ...validateChapterStructure,
                name: 'writing_validate_chapter_structure',
                description: '[WRITING] Validate chapter structure and consistency'
            });
        }

        const validateBeatPlacement = validationTools.find(t => t.name === 'validate_beat_placement');
        if (validateBeatPlacement) {
            tools.push({
                ...validateBeatPlacement,
                name: 'writing_validate_beat_placement',
                description: '[WRITING] Validate story beats and pacing'
            });
        }

        const checkStructureViolations = validationTools.find(t => t.name === 'check_structure_violations');
        if (checkStructureViolations) {
            tools.push({
                ...checkStructureViolations,
                name: 'writing_check_structure_violations',
                description: '[WRITING] Check for structural inconsistencies'
            });
        }

        // WRITING - Session & Export Tools
        const exportTools = this.exportHandlers.getExportTools();
        const wordCountTracking = exportTools.find(t => t.name === 'word_count_tracking');
        if (wordCountTracking) {
            tools.push({
                ...wordCountTracking,
                name: 'writing_word_count_tracking',
                description: '[WRITING] Track word count progress'
            });
        }

        const sessionTools = this.sessionHandlers.getSessionTools();
        const logWritingSession = sessionTools.find(t => t.name === 'log_writing_session');
        if (logWritingSession) {
            tools.push({
                ...logWritingSession,
                name: 'log_writing_session',
                description: 'Log writing session activity'
            });
        }

        const getWritingProgress = sessionTools.find(t => t.name === 'get_writing_progress');
        if (getWritingProgress) {
            tools.push({
                ...getWritingProgress,
                name: 'get_writing_progress',
                description: 'Get writing progress tracking'
            });
        }

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

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        // Use arrow functions to defer binding until runtime
        const handlerMap = {
            // BOOK - Scene Tools
            'book_create_scene': (args) => this.sceneHandlers.handleCreateScene(args),
            'book_update_scene': (args) => this.sceneHandlers.handleUpdateScene(args),
            'book_get_scene': (args) => this.sceneHandlers.handleGetScene(args),
            'book_list_scenes': (args) => this.sceneHandlers.handleListScenes(args),

            // CHARACTER Tools
            'character_get_character_details': (args) => this.characterDetailHandlers.handleGetCharacterDetails(args),
            'character_get_characters_in_chapter': (args) => this.characterTimelineHandlers.handleGetCharactersInChapter(args),
            'character_check_character_continuity': (args) => this.characterTimelineHandlers.handleCheckCharacterContinuity(args),

            // WRITING - Validation Tools
            'writing_validate_chapter_structure': (args) => this.validationHandlers.handleValidateChapterStructure(args),
            'writing_validate_beat_placement': (args) => this.validationHandlers.handleValidateBeatPlacement(args),
            'writing_check_structure_violations': (args) => this.validationHandlers.handleCheckStructureViolations(args),

            // WRITING - Session & Export Tools
            'writing_word_count_tracking': (args) => this.exportHandlers.handleWordCountTracking(args),
            'log_writing_session': (args) => this.sessionHandlers.handleLogWritingSession(args),
            'get_writing_progress': (args) => this.sessionHandlers.handleGetWritingProgress(args),
            'set_writing_goals': (args) => this.sessionHandlers.handleSetWritingGoals(args),
            'get_productivity_analytics': (args) => this.sessionHandlers.handleGetProductivityAnalytics(args)
        };

        return handlerMap[toolName] || null;
    }
}

export { SceneWritingMCPServer };

// CLI runner when called directly

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
    console.error('[SCENE-WRITING-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new SceneWritingMCPServer();
        await server.run();
    } catch (error) {
        console.error('[SCENE-WRITING-SERVER] Failed to start MCP server:', error.message);
        console.error('[SCENE-WRITING-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[SCENE-WRITING-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(SceneWritingMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[SCENE-WRITING-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[SCENE-WRITING-SERVER] Module imported - not starting server');
}
