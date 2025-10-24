// src/mcps/character-server/index.js
// MODULAR VERSION - Character MCP Server with separated handlers and schemas
// Designed for AI Writing Teams to manage character information and continuity

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    console.error = function() {
        // Keep the original console.error functionality but write to stderr instead
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';
import { CharacterHandlers } from './handlers/character-handlers.js';
import { CharacterDetailHandlers } from './handlers/character-detail-handlers.js';
import { CharacterKnowledgeHandlers } from './handlers/character-knowledge-handlers.js';
import { CharacterTimelineHandlers } from './handlers/character-timeline-handlers.js';

class CharacterMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[CHARACTER-SERVER] Constructor starting...');
        try {
            super('character-manager', '1.0.0');
            console.error('[CHARACTER-SERVER] Constructor completed successfully');
        } catch (error) {
            console.error('[CHARACTER-SERVER] Constructor failed:', error.message);
            console.error('[CHARACTER-SERVER] Stack:', error.stack);
            throw error;
        }

        // Initialize handler modules with database connection
        this.characterHandlers = new CharacterHandlers(this.db);
        this.characterDetailHandlers = new CharacterDetailHandlers(this.db);
        this.characterKnowledgeHandlers = new CharacterKnowledgeHandlers(this.db);
        this.characterTimelineHandlers = new CharacterTimelineHandlers(this.db);

        // Properly bind handler methods to maintain context
        this.bindHandlerMethods();

        // Initialize tools after base constructor
        this.tools = this.getTools();

        // Defensive check to ensure tools are properly initialized
        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[CHARACTER-SERVER] WARNING: Tools not properly initialized!');
            this.tools = this.getTools(); // Try again
        }

        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[CHARACTER-SERVER] Initialized with ${this.tools.length} tools`);
        }

        // Test database connection on startup (don't wait for it, just start it)
        this.testDatabaseConnection();
    }

    // Proper method binding to maintain context
    bindHandlerMethods() {
        // Bind character handler methods
        this.handleListCharacters = this.characterHandlers.handleListCharacters.bind(this.characterHandlers);
        this.handleGetCharacter = this.characterHandlers.handleGetCharacter.bind(this.characterHandlers);
        this.handleCreateCharacter = this.characterHandlers.handleCreateCharacter.bind(this.characterHandlers);
        this.handleUpdateCharacter = this.characterHandlers.handleUpdateCharacter.bind(this.characterHandlers);

        // Bind character detail handler methods
        this.handleAddCharacterDetail = this.characterDetailHandlers.handleAddCharacterDetail.bind(this.characterDetailHandlers);
        this.handleGetCharacterDetails = this.characterDetailHandlers.handleGetCharacterDetails.bind(this.characterDetailHandlers);
        this.handleUpdateCharacterDetail = this.characterDetailHandlers.handleUpdateCharacterDetail.bind(this.characterDetailHandlers);
        this.handleDeleteCharacterDetail = this.characterDetailHandlers.handleDeleteCharacterDetail.bind(this.characterDetailHandlers);

        // Bind character knowledge handler methods
        this.handleAddCharacterKnowledge = this.characterKnowledgeHandlers.handleAddCharacterKnowledge.bind(this.characterKnowledgeHandlers);
        this.handleAddCharacterKnowledgeWithChapter = this.characterKnowledgeHandlers.handleAddCharacterKnowledgeWithChapter.bind(this.characterKnowledgeHandlers);
        this.handleCheckCharacterKnowledge = this.characterKnowledgeHandlers.handleCheckCharacterKnowledge.bind(this.characterKnowledgeHandlers);
        this.handleGetCharactersWhoKnow = this.characterKnowledgeHandlers.handleGetCharactersWhoKnow.bind(this.characterKnowledgeHandlers);

        // Bind character timeline handler methods
        this.handleTrackCharacterPresence = this.characterTimelineHandlers.handleTrackCharacterPresence.bind(this.characterTimelineHandlers);
        this.handleGetCharacterTimeline = this.characterTimelineHandlers.handleGetCharacterTimeline.bind(this.characterTimelineHandlers);
        this.handleCheckCharacterContinuity = this.characterTimelineHandlers.handleCheckCharacterContinuity.bind(this.characterTimelineHandlers);
        this.handleGetCharactersInChapter = this.characterTimelineHandlers.handleGetCharactersInChapter.bind(this.characterTimelineHandlers);
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
                    console.error('[CHARACTER-SERVER] Database connection verified');
                } else {
                    console.error('[CHARACTER-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[CHARACTER-SERVER] Database connection test failed:', error.message);
        }
    }

    // =============================================
    // COMPLETE TOOL REGISTRATION
    // =============================================
    getTools() {
        return [
            // Character Management Tools
            ...this.characterHandlers.getCharacterTools(),

            // Character Detail Management Tools
            ...this.characterDetailHandlers.getCharacterDetailTools(),

            // Character Knowledge Management Tools
            ...this.characterKnowledgeHandlers.getCharacterKnowledgeTools(),

            // Character Timeline Management Tools
            ...this.characterTimelineHandlers.getCharacterTimelineTools()
        ];
    }

    // =============================================
    // COMPLETE TOOL HANDLER MAPPING
    // =============================================
    getToolHandler(toolName) {
        const handlers = {
            // Character Management Handlers
            'list_characters': this.handleListCharacters,
            'get_character': this.handleGetCharacter,
            'create_character': this.handleCreateCharacter,
            'update_character': this.handleUpdateCharacter,

            // Character Detail Handlers
            'add_character_detail': this.handleAddCharacterDetail,
            'get_character_details': this.handleGetCharacterDetails,
            'update_character_detail': this.handleUpdateCharacterDetail,
            'delete_character_detail': this.handleDeleteCharacterDetail,

            // Character Knowledge Handlers
            'add_character_knowledge': this.handleAddCharacterKnowledge,
            'add_character_knowledge_with_chapter': this.handleAddCharacterKnowledgeWithChapter,
            'check_character_knowledge': this.handleCheckCharacterKnowledge,
            'get_characters_who_know': this.handleGetCharactersWhoKnow,

            // Character Timeline Handlers
            'track_character_presence': this.handleTrackCharacterPresence,
            'get_character_timeline': this.handleGetCharacterTimeline,
            'check_character_continuity': this.handleCheckCharacterContinuity,
            'get_characters_in_chapter': this.handleGetCharactersInChapter
        };
        return handlers[toolName];
    }
}

export { CharacterMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[CHARACTER-SERVER] Module loaded');
    console.error('[CHARACTER-SERVER] MCP_STDIO_MODE:', process.env.MCP_STDIO_MODE);
    console.error('[CHARACTER-SERVER] import.meta.url:', import.meta.url);
    console.error('[CHARACTER-SERVER] process.argv[1]:', process.argv[1]);
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
    console.error('[CHARACTER-SERVER] normalized current module url:', normalizedCurrentModuleUrl);
    console.error('[CHARACTER-SERVER] normalized script path:', normalizedScriptPath);
    console.error('[CHARACTER-SERVER] is direct execution:', isDirectExecution);
}

if (process.env.MCP_STDIO_MODE) {
    // When running in MCP stdio mode, always start the server
    console.error('[CHARACTER-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new CharacterMCPServer();
        await server.run();
    } catch (error) {
        console.error('[CHARACTER-SERVER] Failed to start MCP server:', error.message);
        console.error('[CHARACTER-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[CHARACTER-SERVER] Starting CLI runner...');
    }
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(CharacterMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[CHARACTER-SERVER] CLI runner failed:', error.message);
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error('[CHARACTER-SERVER] CLI runner stack:', error.stack);
        }
        throw error;
    }
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[CHARACTER-SERVER] Module imported - not starting server');
        console.error('[CHARACTER-SERVER] Module export completed');
    }
}
