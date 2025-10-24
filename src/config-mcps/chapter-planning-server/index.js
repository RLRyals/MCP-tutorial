// src/config-mcps/chapter-planning-server/index.js
// Phase-based MCP Server: Chapter Planning Phase
// Aggregates ONLY the tools needed during chapter planning - NO code duplication, ONE database connection

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
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { GenreExtensions } from '../../mcps/plot-server/handlers/genre-extensions.js';
import { CharacterKnowledgeHandlers } from '../../mcps/character-server/handlers/character-knowledge-handlers.js';
import { CharacterTimelineHandlers } from '../../mcps/character-server/handlers/character-timeline-handlers.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { RelationshipHandlers } from '../../mcps/relationship-server/handlers/relationship-handlers.js';
import { TimelineEventHandlers } from '../../mcps/timeline-server/handlers/timeline-event-handlers.js';
import { ChapterHandlers } from '../../mcps/book-server/handlers/chapter-handlers.js';
import { SceneHandlers } from '../../mcps/book-server/handlers/scene-handlers.js';

class ChapterPlanningMCPServer extends BaseMCPServer {
    constructor() {
        super('chapter-planning-phase', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build aggregated tool list from handlers
        this.tools = this.buildTools();

        console.error(`[CHAPTER-PLANNING-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create handler instances passing our shared database
        // These handlers are lightweight and don't create their own DB connections
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.informationRevealHandlers = new GenreExtensions(this.db);
        this.characterKnowledgeHandlers = new CharacterKnowledgeHandlers(this.db);
        this.characterTimelineHandlers = new CharacterTimelineHandlers(this.db);
        this.locationHandlers = new LocationHandlers(this.db);
        this.relationshipHandlers = new RelationshipHandlers(this.db);
        this.timelineEventHandlers = new TimelineEventHandlers(this.db);
        this.chapterHandlers = new ChapterHandlers(this.db);
        this.sceneHandlers = new SceneHandlers(this.db);

        console.error('[CHAPTER-PLANNING-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // Plot thread tools: get_plot_threads
        const plotThreadTools = this.plotThreadHandlers.getPlotThreadTools();
        const getPlotThreads = plotThreadTools.find(t => t.name === 'get_plot_threads');
        if (getPlotThreads) {
            tools.push({
                ...getPlotThreads,
                name: 'plot_get_plot_threads',
                description: `[PLOT] Get active plot threads for this chapter`
            });
        }

        // Information reveal tools: create_information_reveal
        const infoRevealTools = this.informationRevealHandlers.getUniversalGenreTools();
        const createInfoReveal = infoRevealTools.find(t => t.name === 'create_information_reveal');
        if (createInfoReveal) {
            tools.push({
                ...createInfoReveal,
                name: 'plot_create_information_reveal',
                description: `[PLOT] Plan key evidence or information to be revealed in this chapter`
            });
        }

        // Character knowledge tools: check_character_knowledge
        const knowledgeTools = this.characterKnowledgeHandlers.getCharacterKnowledgeTools();
        const checkCharacterKnowledge = knowledgeTools.find(t => t.name === 'check_character_knowledge');
        if (checkCharacterKnowledge) {
            tools.push({
                ...checkCharacterKnowledge,
                name: 'character_check_character_knowledge',
                description: `[CHARACTER] Verify what a character knows before planning scenes`
            });
        }

        // Character timeline/presence tools: get_characters_in_chapter
        const characterTimelineTools = this.characterTimelineHandlers.getCharacterTimelineTools();
        const getCharactersInChapter = characterTimelineTools.find(t => t.name === 'get_characters_in_chapter');
        if (getCharactersInChapter) {
            tools.push({
                ...getCharactersInChapter,
                name: 'character_get_characters_in_chapter',
                description: `[CHARACTER] Get characters present in this chapter`
            });
        }

        // Location tools: get_locations
        const locationTools = this.locationHandlers.getLocationTools();
        const getLocations = locationTools.find(t => t.name === 'get_locations');
        if (getLocations) {
            tools.push({
                ...getLocations,
                name: 'world_get_locations',
                description: `[WORLD] Get location details for chapter settings`
            });
        }

        // Relationship tools: track_relationship_dynamics
        const relationshipTools = this.relationshipHandlers.getRelationshipTools();
        const trackRelationshipDynamics = relationshipTools.find(t => t.name === 'track_relationship_dynamics');
        if (trackRelationshipDynamics) {
            tools.push({
                ...trackRelationshipDynamics,
                name: 'relationship_track_relationship_dynamics',
                description: `[RELATIONSHIP] Plan relationship developments in this chapter`
            });
        }

        // Timeline tools: map_event_to_chapter
        const timelineTools = this.timelineEventHandlers.getTimelineEventTools();
        const mapEventToChapter = timelineTools.find(t => t.name === 'map_event_to_chapter');
        if (mapEventToChapter) {
            tools.push({
                ...mapEventToChapter,
                name: 'timeline_map_event_to_chapter',
                description: `[TIMELINE] Plan how timeline events appear in this chapter`
            });
        }

        // Chapter tools from book server
        const chapterTools = this.chapterHandlers.getChapterTools();
        const createChapter = chapterTools.find(t => t.name === 'create_chapter');
        if (createChapter) {
            tools.push({
                ...createChapter,
                name: 'book_create_chapter',
                description: '[BOOK] Create a new chapter in a book'
            });
        }
        
        const getChapter = chapterTools.find(t => t.name === 'get_chapter');
        if (getChapter) {
            tools.push({
                ...getChapter,
                name: 'book_get_chapter',
                description: '[BOOK] Get chapter details'
            });
        }
        
        // Scene tools from book server
        const sceneTools = this.sceneHandlers.getSceneTools();
        const createScene = sceneTools.find(t => t.name === 'create_scene');
        if (createScene) {
            tools.push({
                ...createScene,
                name: 'book_create_scene',
                description: '[BOOK] Create a new scene within a chapter'
            });
        }
        
        const listScenes = sceneTools.find(t => t.name === 'list_scenes');
        if (listScenes) {
            tools.push({
                ...listScenes,
                name: 'book_list_scenes',
                description: '[BOOK] List scenes in a chapter'
            });
        }

        return tools;
    }

    getHandlerForTool(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            'plot_get_plot_threads': () => this.plotThreadHandlers.handleGetPlotThreads.bind(this.plotThreadHandlers),
            'plot_create_information_reveal': () => this.informationRevealHandlers.handleCreateInformationReveal.bind(this.informationRevealHandlers),
            'character_check_character_knowledge': () => this.characterKnowledgeHandlers.handleCheckCharacterKnowledge.bind(this.characterKnowledgeHandlers),
            'character_get_characters_in_chapter': () => this.characterTimelineHandlers.handleGetCharactersInChapter.bind(this.characterTimelineHandlers),
            'world_get_locations': () => this.locationHandlers.handleGetLocations.bind(this.locationHandlers),
            'relationship_track_relationship_dynamics': () => this.relationshipHandlers.handleTrackRelationshipDynamics.bind(this.relationshipHandlers),
            'timeline_map_event_to_chapter': () => this.timelineEventHandlers.handleMapEventToChapter.bind(this.timelineEventHandlers),
            'book_create_chapter': () => this.chapterHandlers.handleCreateChapter.bind(this.chapterHandlers),
            'book_get_chapter': () => this.chapterHandlers.handleGetChapter.bind(this.chapterHandlers),
            'book_create_scene': () => this.sceneHandlers.handleCreateScene.bind(this.sceneHandlers),
            'book_list_scenes': () => this.sceneHandlers.handleListScenes.bind(this.sceneHandlers)
        };

        const handlerFactory = handlerMap[toolName];
        return handlerFactory ? handlerFactory() : null;
    }
}

export { ChapterPlanningMCPServer };

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
    console.error('[CHAPTER-PLANNING-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new ChapterPlanningMCPServer();
        await server.run();
    } catch (error) {
        console.error('[CHAPTER-PLANNING-SERVER] Failed to start MCP server:', error.message);
        console.error('[CHAPTER-PLANNING-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[CHAPTER-PLANNING-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(ChapterPlanningMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[CHAPTER-PLANNING-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[CHAPTER-PLANNING-SERVER] Module imported - not starting server');
}