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
import { ChapterHandlers } from '../../mcps/book-server/handlers/chapter-handlers.js';
import { SceneHandlers } from '../../mcps/book-server/handlers/scene-handlers.js';
import { CharacterKnowledgeHandlers } from '../../mcps/character-server/handlers/character-knowledge-handlers.js';
import { CharacterDetailHandlers } from '../../mcps/character-server/handlers/character-detail-handlers.js';
import { CharacterTimelineHandlers } from '../../mcps/character-server/handlers/character-timeline-handlers.js';
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { GenreExtensions } from '../../mcps/plot-server/handlers/genre-extensions.js';
import { RelationshipHandlers } from '../../mcps/relationship-server/handlers/relationship-handlers.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { WorldElementHandlers } from '../../mcps/world-server/handlers/world-element-handlers.js';
import { EventChapterMappingHandlers } from '../../mcps/timeline-server/handlers/timeline-chapter-mapping-handler.js';

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
        this.chapterHandlers = new ChapterHandlers(this.db);
        this.sceneHandlers = new SceneHandlers(this.db);
        this.characterKnowledgeHandlers = new CharacterKnowledgeHandlers(this.db);
        this.characterDetailHandlers = new CharacterDetailHandlers(this.db);
        this.characterTimelineHandlers = new CharacterTimelineHandlers(this.db);
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.informationRevealHandlers = new GenreExtensions(this.db);
        this.relationshipHandlers = new RelationshipHandlers(this.db);
        this.locationHandlers = new LocationHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);
        this.eventChapterMappingHandlers = new EventChapterMappingHandlers(this.db);

        console.error('[SCENE-WRITING-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // Book Server - Chapter Tools
        const chapterTools = this.chapterHandlers.getChapterTools();
        const getChapter = chapterTools.find(t => t.name === 'get_chapter');
        if (getChapter) {
            tools.push({
                ...getChapter,
                name: 'book_get_chapter',
                description: '[BOOK] Review the chapter plan before writing scenes'
            });
        }

        // Book Server - Scene Tools
        const sceneTools = this.sceneHandlers.getSceneTools();
        const getScene = sceneTools.find(t => t.name === 'get_scene');
        if (getScene) {
            tools.push({
                ...getScene,
                name: 'book_get_scene',
                description: '[BOOK] Get details of a specific scene'
            });
        }

        const listScenes = sceneTools.find(t => t.name === 'list_scenes');
        if (listScenes) {
            tools.push({
                ...listScenes,
                name: 'book_list_scenes',
                description: '[BOOK] Review existing scenes before adding new ones'
            });
        }

        const createScene = sceneTools.find(t => t.name === 'create_scene');
        if (createScene) {
            tools.push({
                ...createScene,
                name: 'book_create_scene',
                description: '[BOOK] Create new scenes as they are written'
            });
        }

        const updateScene = sceneTools.find(t => t.name === 'update_scene');
        if (updateScene) {
            tools.push({
                ...updateScene,
                name: 'book_update_scene',
                description: '[BOOK] Update scenes with word counts and status changes'
            });
        }

        // Character Server - Knowledge Tools
        const knowledgeTools = this.characterKnowledgeHandlers.getCharacterKnowledgeTools();
        const checkCharacterKnowledge = knowledgeTools.find(t => t.name === 'check_character_knowledge');
        if (checkCharacterKnowledge) {
            tools.push({
                ...checkCharacterKnowledge,
                name: 'character_check_character_knowledge',
                description: '[CHARACTER] CRITICAL: Verify what characters know before writing'
            });
        }

        const addCharacterKnowledgeWithChapter = knowledgeTools.find(t => t.name === 'add_character_knowledge_with_chapter');
        if (addCharacterKnowledgeWithChapter) {
            tools.push({
                ...addCharacterKnowledgeWithChapter,
                name: 'character_add_character_knowledge_with_chapter',
                description: '[CHARACTER] Track new knowledge acquired in scenes'
            });
        }

        // Character Server - Detail Tools
        const detailTools = this.characterDetailHandlers.getCharacterDetailTools();
        const getCharacterDetails = detailTools.find(t => t.name === 'get_character_details');
        if (getCharacterDetails) {
            tools.push({
                ...getCharacterDetails,
                name: 'character_get_character_details',
                description: '[CHARACTER] Ensure consistent character descriptions and traits'
            });
        }

        // Character Server - Timeline/Presence Tools
        const characterTimelineTools = this.characterTimelineHandlers.getCharacterTimelineTools();
        const getCharactersInChapter = characterTimelineTools.find(t => t.name === 'get_characters_in_chapter');
        if (getCharactersInChapter) {
            tools.push({
                ...getCharactersInChapter,
                name: 'character_get_characters_in_chapter',
                description: '[CHARACTER] See who is supposed to appear in the chapter'
            });
        }

        // Plot Server - Plot Thread Tools
        const plotThreadTools = this.plotThreadHandlers.getPlotThreadTools();
        const getPlotThreads = plotThreadTools.find(t => t.name === 'get_plot_threads');
        if (getPlotThreads) {
            tools.push({
                ...getPlotThreads,
                name: 'plot_get_plot_threads',
                description: '[PLOT] Check active threads relevant to the scene'
            });
        }

        // Plot Server - Information Reveal Tools
        const infoRevealTools = this.informationRevealHandlers.getUniversalGenreTools();
        const createInfoReveal = infoRevealTools.find(t => t.name === 'create_information_reveal');
        if (createInfoReveal) {
            tools.push({
                ...createInfoReveal,
                name: 'plot_create_information_reveal',
                description: '[PLOT] Track when important information is revealed'
            });
        }

        const addRevealEvidence = infoRevealTools.find(t => t.name === 'add_reveal_evidence');
        if (addRevealEvidence) {
            tools.push({
                ...addRevealEvidence,
                name: 'plot_add_reveal_evidence',
                description: '[PLOT] Track evidence discovered during scenes'
            });
        }

        // Relationship Server Tools
        const relationshipTools = this.relationshipHandlers.getRelationshipTools();
        const trackRelationshipDynamics = relationshipTools.find(t => t.name === 'track_relationship_dynamics');
        if (trackRelationshipDynamics) {
            tools.push({
                ...trackRelationshipDynamics,
                name: 'relationship_track_relationship_dynamics',
                description: '[RELATIONSHIP] Record relationship developments in scenes'
            });
        }

        const getRelationshipArc = relationshipTools.find(t => t.name === 'get_relationship_arc');
        if (getRelationshipArc) {
            tools.push({
                ...getRelationshipArc,
                name: 'relationship_get_relationship_arc',
                description: '[RELATIONSHIP] Check the current state of relationships'
            });
        }

        // World Server - Location Tools
        const locationTools = this.locationHandlers.getLocationTools();
        const getLocations = locationTools.find(t => t.name === 'get_locations');
        if (getLocations) {
            tools.push({
                ...getLocations,
                name: 'world_get_locations',
                description: '[WORLD] Ensure consistent location descriptions'
            });
        }

        const trackLocationUsage = locationTools.find(t => t.name === 'track_location_usage');
        if (trackLocationUsage) {
            tools.push({
                ...trackLocationUsage,
                name: 'world_track_location_usage',
                description: '[WORLD] Record where scenes take place'
            });
        }

        // World Server - Element Tools
        const worldElementTools = this.worldElementHandlers.getWorldElementTools();
        const getWorldElements = worldElementTools.find(t => t.name === 'get_world_elements');
        if (getWorldElements) {
            tools.push({
                ...getWorldElements,
                name: 'world_get_world_elements',
                description: '[WORLD] Verify magical/technological system details'
            });
        }

        const trackElementUsage = worldElementTools.find(t => t.name === 'track_element_usage');
        if (trackElementUsage) {
            tools.push({
                ...trackElementUsage,
                name: 'world_track_element_usage',
                description: '[WORLD] Record when magic/technology is used in scenes'
            });
        }

        // Timeline Server Tools
        const eventChapterMappingTools = this.eventChapterMappingHandlers.getEventChapterMappingTools();
        const getChapterEvents = eventChapterMappingTools.find(t => t.name === 'get_chapter_events');
        if (getChapterEvents) {
            tools.push({
                ...getChapterEvents,
                name: 'timeline_get_chapter_events',
                description: '[TIMELINE] See what events are happening chronologically'
            });
        }

        const mapEventToChapter = eventChapterMappingTools.find(t => t.name === 'map_event_to_chapter');
        if (mapEventToChapter) {
            tools.push({
                ...mapEventToChapter,
                name: 'timeline_map_event_to_chapter',
                description: '[TIMELINE] Record how events are presented in scenes'
            });
        }

        return tools;
    }

    getHandlerForTool(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Book Server - Chapter
            'book_get_chapter': () => this.chapterHandlers.handleGetChapter.bind(this.chapterHandlers),

            // Book Server - Scene
            'book_get_scene': () => this.sceneHandlers.handleGetScene.bind(this.sceneHandlers),
            'book_list_scenes': () => this.sceneHandlers.handleListScenes.bind(this.sceneHandlers),
            'book_create_scene': () => this.sceneHandlers.handleCreateScene.bind(this.sceneHandlers),
            'book_update_scene': () => this.sceneHandlers.handleUpdateScene.bind(this.sceneHandlers),

            // Character Server - Knowledge
            'character_check_character_knowledge': () => this.characterKnowledgeHandlers.handleCheckCharacterKnowledge.bind(this.characterKnowledgeHandlers),
            'character_add_character_knowledge_with_chapter': () => this.characterKnowledgeHandlers.handleAddCharacterKnowledgeWithChapter.bind(this.characterKnowledgeHandlers),

            // Character Server - Details
            'character_get_character_details': () => this.characterDetailHandlers.handleGetCharacterDetails.bind(this.characterDetailHandlers),

            // Character Server - Timeline/Presence
            'character_get_characters_in_chapter': () => this.characterTimelineHandlers.handleGetCharactersInChapter.bind(this.characterTimelineHandlers),

            // Plot Server - Plot Threads
            'plot_get_plot_threads': () => this.plotThreadHandlers.handleGetPlotThreads.bind(this.plotThreadHandlers),

            // Plot Server - Information Reveals
            'plot_create_information_reveal': () => this.informationRevealHandlers.handleCreateInformationReveal.bind(this.informationRevealHandlers),
            'plot_add_reveal_evidence': () => this.informationRevealHandlers.handleAddRevealEvidence.bind(this.informationRevealHandlers),

            // Relationship Server
            'relationship_track_relationship_dynamics': () => this.relationshipHandlers.handleTrackRelationshipDynamics.bind(this.relationshipHandlers),
            'relationship_get_relationship_arc': () => this.relationshipHandlers.handleGetRelationshipArc.bind(this.relationshipHandlers),

            // World Server - Locations
            'world_get_locations': () => this.locationHandlers.handleGetLocations.bind(this.locationHandlers),
            'world_track_location_usage': () => this.locationHandlers.handleTrackLocationUsage.bind(this.locationHandlers),

            // World Server - Elements
            'world_get_world_elements': () => this.worldElementHandlers.handleGetWorldElements.bind(this.worldElementHandlers),
            'world_track_element_usage': () => this.worldElementHandlers.handleTrackElementUsage.bind(this.worldElementHandlers),

            // Timeline Server
            'timeline_get_chapter_events': () => this.eventChapterMappingHandlers.handleGetChapterEvents.bind(this.eventChapterMappingHandlers),
            'timeline_map_event_to_chapter': () => this.eventChapterMappingHandlers.handleMapEventToChapter.bind(this.eventChapterMappingHandlers)
        };

        const handlerFactory = handlerMap[toolName];
        return handlerFactory ? handlerFactory() : null;
    }
}

export { SceneWritingMCPServer };

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
