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
import { ChapterHandlers } from '../../mcps/book-server/handlers/chapter-handlers.js';
import { CharacterHandlers } from '../../mcps/character-server/handlers/character-handlers.js';
import { CharacterDetailHandlers } from '../../mcps/character-server/handlers/character-detail-handlers.js';
import { CharacterArcHandlers } from '../../mcps/character-server/handlers/character-arc-handlers.js';
import { CharacterKnowledgeHandlers } from '../../mcps/character-server/handlers/character-knowledge-handlers.js';
import { TimelineEventHandlers } from '../../mcps/timeline-server/handlers/timeline-event-handlers.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { OrganizationHandlers } from '../../mcps/world-server/handlers/organization-handlers.js';
import { WorldElementHandlers } from '../../mcps/world-server/handlers/world-element-handlers.js';
import { RelationshipHandlers } from '../../mcps/relationship-server/handlers/relationship-handlers.js';
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { GenreExtensions } from '../../mcps/plot-server/handlers/genre-extensions.js';

// Import phase-specific schemas directly to reduce token usage
import { bookPlanningSchemas } from '../../mcps/book-server/schemas/book-planning-schemas.js';
import { chapterPlanningSchemas } from '../../mcps/book-server/schemas/chapter-planning-schemas.js';
import { characterToolsSchema, characterDetailToolsSchema } from '../../mcps/character-server/schemas/character-tools-schema.js';

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
        // Note: Core GET/LIST tools are in core-content-server
        // This server only needs handlers for CREATE/UPDATE operations
        this.bookHandlers = new BookHandlers(this.db);
        this.chapterHandlers = new ChapterHandlers(this.db);
        this.characterHandlers = new CharacterHandlers(this.db);
        this.characterDetailHandlers = new CharacterDetailHandlers(this.db);
        this.characterArcHandlers = new CharacterArcHandlers(this.db);
        this.characterKnowledgeHandlers = new CharacterKnowledgeHandlers(this.db);
        this.timelineEventHandlers = new TimelineEventHandlers(this.db);
        this.locationHandlers = new LocationHandlers(this.db);
        this.organizationHandlers = new OrganizationHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);
        this.relationshipHandlers = new RelationshipHandlers(this.db);
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.genreExtensions = new GenreExtensions(this.db);

        console.error('[BOOK-PLANNING-SERVER] Phase-specific handlers initialized');
    }

    buildTools() {
        const tools = [];

        // NOTE: Core GET/LIST tools are in core-content-server (always-on):
        // - plot_get_plot_threads, plot_create/update/resolve_plot_thread
        // - plot_create_information_reveal, plot_add_reveal_evidence
        // - character_get_character_details, character_check_character_knowledge, etc.
        // - book_get_chapter, book_list_chapters
        // - world_get_locations, world_get_world_elements
        // - relationship_get_relationship_arc, relationship_track_relationship_dynamics
        // - timeline_list_timeline_events, timeline_map_event_to_chapter

        // This server only includes CREATE/UPDATE tools specific to book planning

        // =============================================
        // 1. BOOK STRUCTURE TOOLS (Phase-specific)
        // =============================================
        tools.push({
            ...bookPlanningSchemas.create_book,
            name: 'book_create_book',
            description: `[BOOK] ${bookPlanningSchemas.create_book.description}`
        });

        tools.push({
            ...bookPlanningSchemas.update_book,
            name: 'book_update_book',
            description: `[BOOK] ${bookPlanningSchemas.update_book.description}`
        });

        tools.push({
            ...bookPlanningSchemas.get_book,
            name: 'book_get_book',
            description: `[BOOK] ${bookPlanningSchemas.get_book.description}`
        });

        tools.push({
            ...bookPlanningSchemas.list_books,
            name: 'book_list_books',
            description: `[BOOK] ${bookPlanningSchemas.list_books.description}`
        });

        // =============================================
        // 2. PLOT THREAD TOOLS (Phase-specific)
        // =============================================
        const plotThreadTools = this.plotThreadHandlers.getPlotThreadTools();

        const createPlotThread = plotThreadTools.find(t => t.name === 'create_plot_thread');
        if (createPlotThread) {
            tools.push({
                ...createPlotThread,
                name: 'plot_create_plot_thread',
                description: `[PLOT] ${createPlotThread.description}`
            });
        }

        const updatePlotThread = plotThreadTools.find(t => t.name === 'update_plot_thread');
        if (updatePlotThread) {
            tools.push({
                ...updatePlotThread,
                name: 'plot_update_plot_thread',
                description: `[PLOT] ${updatePlotThread.description}`
            });
        }

        // =============================================
        // 3. GENRE/WORLD SYSTEM TOOLS (Phase-specific)
        // =============================================
        const genreTools = this.genreExtensions.getUniversalGenreTools();

        const defineWorldSystem = genreTools.find(t => t.name === 'define_world_system');
        if (defineWorldSystem) {
            tools.push({
                ...defineWorldSystem,
                name: 'plot_define_world_system',
                description: `[PLOT] ${defineWorldSystem.description}`
            });
        }

        // =============================================
        // 4. CHARACTER MANAGEMENT TOOLS (Phase-specific)
        // =============================================
        const characterTools = this.characterHandlers.getCharacterTools();

        const listCharacters = characterTools.find(t => t.name === 'list_characters');
        if (listCharacters) {
            tools.push({
                ...listCharacters,
                name: 'character_list_characters',
                description: `[CHARACTER] ${listCharacters.description}`
            });
        }

        const createCharacter = characterTools.find(t => t.name === 'create_character');
        if (createCharacter) {
            tools.push({
                ...createCharacter,
                name: 'character_create_character',
                description: `[CHARACTER] ${createCharacter.description}`
            });
        }

        const getCharacter = characterTools.find(t => t.name === 'get_character');
        if (getCharacter) {
            tools.push({
                ...getCharacter,
                name: 'character_get_character',
                description: `[CHARACTER] ${getCharacter.description}`
            });
        }

        const updateCharacterSchema = characterToolsSchema.find(t => t.name === 'update_character');
        if (updateCharacterSchema) {
            tools.push({
                ...updateCharacterSchema,
                name: 'character_update_character',
                description: '[CHARACTER] Update character status/development for this book'
            });
        }

        const addCharacterDetailSchema = characterDetailToolsSchema.find(t => t.name === 'add_character_detail');
        if (addCharacterDetailSchema) {
            tools.push({
                ...addCharacterDetailSchema,
                name: 'character_add_character_detail',
                description: '[CHARACTER] Add book-specific character details'
            });
        }

        const updateCharacterDetailSchema = characterDetailToolsSchema.find(t => t.name === 'update_character_detail');
        if (updateCharacterDetailSchema) {
            tools.push({
                ...updateCharacterDetailSchema,
                name: 'update_character_detail',
                description: '[CHARACTER] Update existing character details'
            });
        }

        // =============================================
        // 5. CHARACTER KNOWLEDGE TOOLS (Phase-specific)
        // =============================================
        const characterKnowledgeTools = this.characterKnowledgeHandlers.getCharacterKnowledgeTools();

        const checkCharacterKnowledge = characterKnowledgeTools.find(t => t.name === 'check_character_knowledge');
        if (checkCharacterKnowledge) {
            tools.push({
                ...checkCharacterKnowledge,
                name: 'character_check_character_knowledge',
                description: '[CHARACTER] Check what a character knows to prevent plot holes'
            });
        }

        // =============================================
        // 6. CHARACTER ARC TOOLS (Phase-specific)
        // =============================================
        const characterArcTools = this.characterArcHandlers.getCharacterArcTools();
        const createCharacterArcSchema = characterArcTools.find(t => t.name === 'create_character_arc');
        if (createCharacterArcSchema) {
            tools.push({
                ...createCharacterArcSchema,
                name: 'character_create_character_arc',
                description: '[CHARACTER] Create character arc for this book'
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
                name: 'timeline_create_timeline_event',
                description: `[TIMELINE] ${createTimelineEvent.description}`
            });
        }

        // =============================================
        // 7. RELATIONSHIP ARC TOOLS (Phase-specific)
        // =============================================
        const relationshipTools = this.relationshipHandlers.getRelationshipTools();

        const createRelationshipArc = relationshipTools.find(t => t.name === 'create_relationship_arc');
        if (createRelationshipArc) {
            tools.push({
                ...createRelationshipArc,
                name: 'relationship_create_relationship_arc',
                description: `[RELATIONSHIP] ${createRelationshipArc.description}`
            });
        }

        const updateRelationshipArc = relationshipTools.find(t => t.name === 'update_relationship_arc');
        if (updateRelationshipArc) {
            tools.push({
                ...updateRelationshipArc,
                name: 'relationship_update_relationship_arc',
                description: `[RELATIONSHIP] ${updateRelationshipArc.description}`
            });
        }

        const trackRelationshipDynamics = relationshipTools.find(t => t.name === 'track_relationship_dynamics');
        if (trackRelationshipDynamics) {
            tools.push({
                ...trackRelationshipDynamics,
                name: 'relationship_track_relationship_dynamics',
                description: `[RELATIONSHIP] ${trackRelationshipDynamics.description}`
            });
        }

        const listRelationshipArcs = relationshipTools.find(t => t.name === 'list_relationship_arcs');
        if (listRelationshipArcs) {
            tools.push({
                ...listRelationshipArcs,
                name: 'relationship_list_relationship_arcs',
                description: `[RELATIONSHIP] ${listRelationshipArcs.description}`
            });
        }

        // =============================================
        // 8. WORLD BUILDING CREATION TOOLS (Phase-specific)
        // =============================================
        const locationTools = this.locationHandlers.getLocationTools();
        const createLocation = locationTools.find(t => t.name === 'create_location');
        if (createLocation) {
            tools.push({
                ...createLocation,
                name: 'world_create_location',
                description: `[WORLD] ${createLocation.description} (book-specific locations)`
            });
        }

        const organizationTools = this.organizationHandlers.getOrganizationTools();
        const createOrganization = organizationTools.find(t => t.name === 'create_organization');
        if (createOrganization) {
            tools.push({
                ...createOrganization,
                name: 'world_create_organization',
                description: `[WORLD] ${createOrganization.description} (book-specific organizations)`
            });
        }

        const worldElementTools = this.worldElementHandlers.getWorldElementTools();
        const createWorldElement = worldElementTools.find(t => t.name === 'create_world_element');
        if (createWorldElement) {
            tools.push({
                ...createWorldElement,
                name: 'world_create_world_element',
                description: `[WORLD] ${createWorldElement.description} (book-specific elements)`
            });
        }

        // =============================================
        // 7. CHAPTER CREATION (Phase-specific)
        // =============================================
        tools.push({
            ...chapterPlanningSchemas.create_chapter,
            name: 'book_create_chapter',
            description: `[BOOK] ${chapterPlanningSchemas.create_chapter.description}`
        });

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Book handlers
            'book_create_book': (args) => this.bookHandlers.handleCreateBook(args),
            'book_update_book': (args) => this.bookHandlers.handleUpdateBook(args),
            'book_get_book': (args) => this.bookHandlers.handleGetBook(args),
            'book_list_books': (args) => this.bookHandlers.handleListBooks(args),

            // Plot thread handlers
            'plot_create_plot_thread': (args) => this.plotThreadHandlers.handleCreatePlotThread(args),
            'plot_update_plot_thread': (args) => this.plotThreadHandlers.handleUpdatePlotThread(args),

            // Genre/World System handlers
            'plot_define_world_system': (args) => this.genreExtensions.handleDefineWorldSystem(args),

            // Character handlers
            'character_list_characters': (args) => this.characterHandlers.handleListCharacters(args),
            'character_create_character': (args) => this.characterHandlers.handleCreateCharacter(args),
            'character_get_character': (args) => this.characterHandlers.handleGetCharacter(args),
            'character_update_character': (args) => this.characterHandlers.handleUpdateCharacter(args),
            'character_add_character_detail': (args) => this.characterDetailHandlers.handleAddCharacterDetail(args),
            'update_character_detail': (args) => this.characterDetailHandlers.handleUpdateCharacterDetail(args),
            'character_check_character_knowledge': (args) => this.characterKnowledgeHandlers.handleCheckCharacterKnowledge(args),
            'character_create_character_arc': (args) => this.characterArcHandlers.handleCreateCharacterArc(args),

            // Timeline handlers
            'timeline_create_timeline_event': (args) => this.timelineEventHandlers.handleCreateTimelineEvent(args),

            // Relationship handlers
            'relationship_create_relationship_arc': (args) => this.relationshipHandlers.handleCreateRelationshipArc(args),
            'relationship_update_relationship_arc': (args) => this.relationshipHandlers.handleUpdateRelationshipArc(args),
            'relationship_track_relationship_dynamics': (args) => this.relationshipHandlers.handleTrackRelationshipDynamics(args),
            'relationship_list_relationship_arcs': (args) => this.relationshipHandlers.handleListRelationshipArcs(args),

            // World handlers
            'world_create_location': (args) => this.locationHandlers.handleCreateLocation(args),
            'world_create_organization': (args) => this.organizationHandlers.handleCreateOrganization(args),
            'world_create_world_element': (args) => this.worldElementHandlers.handleCreateWorldElement(args),

            // Chapter handlers
            'book_create_chapter': (args) => this.chapterHandlers.handleCreateChapter(args)
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
