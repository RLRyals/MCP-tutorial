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
import { CharacterHandlers } from '../../mcps/character-server/handlers/character-handlers.js';
import { CharacterDetailHandlers } from '../../mcps/character-server/handlers/character-detail-handlers.js';
import { CharacterArcHandlers } from '../../mcps/character-server/handlers/character-arc-handlers.js';
import { CharacterKnowledgeHandlers } from '../../mcps/character-server/handlers/character-knowledge-handlers.js';
import { RelationshipHandlers } from '../../mcps/relationship-server/handlers/relationship-handlers.js';

// Import phase-specific schemas directly to reduce token usage
import { characterToolsSchema, characterDetailToolsSchema } from '../../mcps/character-server/schemas/character-tools-schema.js';

class CharacterPlanningMCPServer extends BaseMCPServer {
    constructor() {
        super('book-planning-phase', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build aggregated tool list from handlers
        this.tools = this.buildTools();

        console.error(`[CHARACTER-PLANNING-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create phase-specific handler instances
        // Note: Core GET/LIST tools are in core-content-server
        // This server only needs handlers for CREATE/UPDATE operations
        this.characterHandlers = new CharacterHandlers(this.db);
        this.characterDetailHandlers = new CharacterDetailHandlers(this.db);
        this.characterArcHandlers = new CharacterArcHandlers(this.db);
        this.characterKnowledgeHandlers = new CharacterKnowledgeHandlers(this.db);
        this.relationshipHandlers = new RelationshipHandlers(this.db);

        console.error('[CHARACTER-PLANNING-SERVER] Phase-specific handlers initialized');
    }

    buildTools() {
        const tools = [];

        // =============================================
        //  CHARACTER MANAGEMENT TOOLS (Phase-specific)
        // =============================================
        const characterTools = this.characterHandlers.getCharacterTools();

        const listCharacters = characterTools.find(t => t.name === 'list_characters');
        if (listCharacters) {
            tools.push({
                ...listCharacters,
                name: 'list_characters',
                description: `${listCharacters.description}`
            });
        }

        const createCharacter = characterTools.find(t => t.name === 'create_character');
        if (createCharacter) {
            tools.push({
                ...createCharacter,
                name: 'create_character',
                description: `${createCharacter.description}`
            });
        }

        const updateCharacterSchema = characterToolsSchema.find(t => t.name === 'update_character');
        if (updateCharacterSchema) {
            tools.push({
                ...updateCharacterSchema,
                name: 'update_character',
                description: 'Update character status/development for this book'
            });
        }

        const addCharacterDetailSchema = characterDetailToolsSchema.find(t => t.name === 'add_character_detail');
        if (addCharacterDetailSchema) {
            tools.push({
                ...addCharacterDetailSchema,
                name: 'add_character_detail',
                description: 'Add book-specific character details'
            });
        }

        const updateCharacterDetailSchema = characterDetailToolsSchema.find(t => t.name === 'update_character_detail');
        if (updateCharacterDetailSchema) {
            tools.push({
                ...updateCharacterDetailSchema,
                name: 'update_character_detail',
                description: 'Update existing character details'
            });
        }

        // =============================================
        //  CHARACTER KNOWLEDGE TOOLS (Phase-specific)
        // =============================================
        const characterKnowledgeTools = this.characterKnowledgeHandlers.getCharacterKnowledgeTools();

        const checkCharacterKnowledge = characterKnowledgeTools.find(t => t.name === 'check_character_knowledge');
        if (checkCharacterKnowledge) {
            tools.push({
                ...checkCharacterKnowledge,
                name: 'check_character_knowledge',
                description: 'Check what a character knows to prevent plot holes'
            });
        }

        // =============================================
        //  CHARACTER ARC TOOLS (Phase-specific)
        // =============================================
        const characterArcTools = this.characterArcHandlers.getCharacterArcTools();
        const createCharacterArcSchema = characterArcTools.find(t => t.name === 'create_character_arc');
        if (createCharacterArcSchema) {
            tools.push({
                ...createCharacterArcSchema,
                name: 'create_character_arc',
                description: 'Create character arc for this book'
            });
        }

        

        // =============================================
        //  RELATIONSHIP ARC TOOLS (Phase-specific)
        // =============================================
        const relationshipTools = this.relationshipHandlers.getRelationshipTools();

        const createRelationshipArc = relationshipTools.find(t => t.name === 'create_relationship_arc');
        if (createRelationshipArc) {
            tools.push({
                ...createRelationshipArc,
                name: 'create_relationship_arc',
                description: `${createRelationshipArc.description}`
            });
        }

        const updateRelationshipArc = relationshipTools.find(t => t.name === 'update_relationship_arc');
        if (updateRelationshipArc) {
            tools.push({
                ...updateRelationshipArc,
                name: 'update_relationship_arc',
                description: `${updateRelationshipArc.description}`
            });
        }

        const trackRelationshipDynamics = relationshipTools.find(t => t.name === 'track_relationship_dynamics');
        if (trackRelationshipDynamics) {
            tools.push({
                ...trackRelationshipDynamics,
                name: 'track_relationship_dynamics',
                description: `${trackRelationshipDynamics.description}`
            });
        }

        const listRelationshipArcs = relationshipTools.find(t => t.name === 'list_relationship_arcs');
        if (listRelationshipArcs) {
            tools.push({
                ...listRelationshipArcs,
                name: 'list_relationship_arcs',
                description: `${listRelationshipArcs.description}`
            });
        }


        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
       
            // Character handlers
            'list_characters': (args) => this.characterHandlers.handleListCharacters(args),
            'create_character': (args) => this.characterHandlers.handleCreateCharacter(args),
            'get_character': (args) => this.characterHandlers.handleGetCharacter(args),
            'update_character': (args) => this.characterHandlers.handleUpdateCharacter(args),
            'add_character_detail': (args) => this.characterDetailHandlers.handleAddCharacterDetail(args),
            'update_character_detail': (args) => this.characterDetailHandlers.handleUpdateCharacterDetail(args),
            'check_character_knowledge': (args) => this.characterKnowledgeHandlers.handleCheckCharacterKnowledge(args),
            'create_character_arc': (args) => this.characterArcHandlers.handleCreateCharacterArc(args),

            // Relationship handlers
            'create_relationship_arc': (args) => this.relationshipHandlers.handleCreateRelationshipArc(args),
            'update_relationship_arc': (args) => this.relationshipHandlers.handleUpdateRelationshipArc(args),
            'track_relationship_dynamics': (args) => this.relationshipHandlers.handleTrackRelationshipDynamics(args),
            'list_relationship_arcs': (args) => this.relationshipHandlers.handleListRelationshipArcs(args),

        };

        return handlerMap[toolName] || null;
    }
}

export { CharacterPlanningMCPServer };

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
    console.error('[CHARACTER-PLANNING-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new CharacterPlanningMCPServer();
        await server.run();
    } catch (error) {
        console.error('[CHARACTER-PLANNING-SERVER] Failed to start MCP server:', error.message);
        console.error('[CHARACTER-PLANNING-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[CHARACTER-PLANNING-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(CharacterPlanningMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[CHARACTER-PLANNING-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[CHARACTER-PLANNING-SERVER] Module imported - not starting server');
}
