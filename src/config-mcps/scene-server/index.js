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
            name: 'create_scene',
            description: 'Create new scenes as they are written'
        });

        tools.push({
            ...minimalSceneWritingSchemas.update_scene,
            name: 'update_scene',
            description: 'Update scenes with word counts and status changes'
        });

        tools.push({
            ...minimalSceneWritingSchemas.get_scene,
            name: 'get_scene',
            description: 'Get details of a specific scene'
        });

        tools.push({
            ...minimalSceneWritingSchemas.list_scenes,
            name: 'list_scenes',
            description: 'Review existing scenes before adding new ones'
        });

        // CHARACTER Tools
        const characterTimelineTools = this.characterTimelineHandlers.getCharacterTimelineTools();
        const getCharactersInChapter = characterTimelineTools.find(t => t.name === 'get_characters_in_chapter');
        if (getCharactersInChapter) {
            tools.push({
                ...getCharactersInChapter,
                name: 'get_characters_in_chapter',
                description: 'See who is supposed to appear in the chapter'
            });
        }
        
        // WRITING - Validation Tools
        const validationTools = this.validationHandlers.getValidationTools();
        const validateChapterStructure = validationTools.find(t => t.name === 'validate_chapter_structure');
        if (validateChapterStructure) {
            tools.push({
                ...validateChapterStructure,
                name: 'validate_chapter_structure',
                description: 'Validate chapter structure and consistency'
            });
        }

        const validateBeatPlacement = validationTools.find(t => t.name === 'validate_beat_placement');
        if (validateBeatPlacement) {
            tools.push({
                ...validateBeatPlacement,
                name: 'validate_beat_placement',
                description: 'Validate story beats and pacing'
            });
        }

        const checkStructureViolations = validationTools.find(t => t.name === 'check_structure_violations');
        if (checkStructureViolations) {
            tools.push({
                ...checkStructureViolations,
                name: 'check_structure_violations',
                description: 'Check for structural inconsistencies'
            });
        }

        // WRITING - Session & Export Tools
        const exportTools = this.exportHandlers.getExportTools();
        const wordCountTracking = exportTools.find(t => t.name === 'word_count_tracking');
        if (wordCountTracking) {
            tools.push({
                ...wordCountTracking,
                name: 'word_count_tracking',
                description: 'Track word count progress'
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


        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        // Use arrow functions to defer binding until runtime
        const handlerMap = {
            // BOOK - Scene Tools
            'create_scene': (args) => this.sceneHandlers.handleCreateScene(args),
            'update_scene': (args) => this.sceneHandlers.handleUpdateScene(args),
            'get_scene': (args) => this.sceneHandlers.handleGetScene(args),
            'list_scenes': (args) => this.sceneHandlers.handleListScenes(args),

            // CHARACTER Tools
            'get_character_details': (args) => this.characterDetailHandlers.handleGetCharacterDetails(args),
            'get_characters_in_chapter': (args) => this.characterTimelineHandlers.handleGetCharactersInChapter(args),
            'check_character_continuity': (args) => this.characterTimelineHandlers.handleCheckCharacterContinuity(args),

            // WRITING - Validation Tools
            'validate_chapter_structure': (args) => this.validationHandlers.handleValidateChapterStructure(args),
            'validate_beat_placement': (args) => this.validationHandlers.handleValidateBeatPlacement(args),
            'check_structure_violations': (args) => this.validationHandlers.handleCheckStructureViolations(args),

            // WRITING - Session & Export Tools
            'word_count_tracking': (args) => this.exportHandlers.handleWordCountTracking(args),
            'log_writing_session': (args) => this.sessionHandlers.handleLogWritingSession(args)
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
