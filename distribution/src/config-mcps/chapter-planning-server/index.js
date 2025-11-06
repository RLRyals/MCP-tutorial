// src/config-mcps/chapter-planning-server/index.js
// Phase-based MCP Server: Chapter Planning Phase
// Works alongside core-content-server (always-on) - NO tool duplication

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

// Import handler classes for chapter planning phase
import { ChapterHandlers } from '../../mcps/book-server/handlers/chapter-handlers.js';
import { TimelineEventHandlers } from '../../mcps/timeline-server/handlers/timeline-event-handlers.js';
import { EventChapterMappingHandlers } from '../../mcps/timeline-server/handlers/timeline-chapter-mapping-handler.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { WorldElementHandlers } from '../../mcps/world-server/handlers/world-element-handlers.js';
import { WorldManagementHandlers } from '../../mcps/world-server/handlers/world-management-handlers.js';
import { OrganizationHandlers } from '../../mcps/world-server/handlers/organization-handlers.js';
import { CharacterKnowledgeHandlers } from '../../mcps/character-server/handlers/character-knowledge-handlers.js';
import { CharacterTimelineHandlers } from '../../mcps/character-server/handlers/character-timeline-handlers.js';
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { GenreExtensions } from '../../mcps/plot-server/handlers/genre-extensions.js';

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
        // Initialize all handler instances for chapter planning phase
        this.chapterHandlers = new ChapterHandlers(this.db);
        this.timelineEventHandlers = new TimelineEventHandlers(this.db);
        this.eventChapterMappingHandlers = new EventChapterMappingHandlers(this.db);
        this.locationHandlers = new LocationHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);
        this.worldManagementHandlers = new WorldManagementHandlers(this.db);
        this.organizationHandlers = new OrganizationHandlers(this.db);
        this.characterKnowledgeHandlers = new CharacterKnowledgeHandlers(this.db);
        this.characterTimelineHandlers = new CharacterTimelineHandlers(this.db);
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.genreExtensionHandlers = new GenreExtensions(this.db);

        console.error('[CHAPTER-PLANNING-SERVER] All handlers initialized');
    }

    buildTools() {
        const tools = [];

        // =============================================
        // TIMELINE TOOLS
        // =============================================
        const timelineTools = this.eventChapterMappingHandlers.getEventChapterMappingTools();
        tools.push(
            { ...timelineTools.find(t => t.name === 'map_event_to_chapter'), name: 'timeline_map_event_to_chapter' }
        );

        const eventTools = this.timelineEventHandlers.getTimelineEventTools();
        tools.push(
            { ...eventTools.find(t => t.name === 'update_timeline_event'), name: 'update_timeline_event' },
            { ...eventTools.find(t => t.name === 'update_event_mapping') || timelineTools.find(t => t.name === 'update_event_mapping'), name: 'update_event_mapping' }
        );

        // =============================================
        // WORLD TOOLS
        // =============================================
        const locationTools = this.locationHandlers.getLocationTools();
        tools.push(
            { ...locationTools.find(t => t.name === 'track_location_usage'), name: 'world_track_location_usage' }
        );

        const worldElementTools = this.worldElementHandlers.getWorldElementTools();
        tools.push(
            { ...worldElementTools.find(t => t.name === 'track_element_usage'), name: 'world_track_element_usage' }
        );



        tools.push(
            { ...locationTools.find(t => t.name === 'update_location'), name: 'update_location' }
        );

        tools.push(
            { ...worldElementTools.find(t => t.name === 'update_world_element'), name: 'update_world_element' }
        );

        const organizationTools = this.organizationHandlers.getOrganizationTools();
        tools.push(
            { ...organizationTools.find(t => t.name === 'track_organization_activity'), name: 'track_organization_activity' },
            { ...organizationTools.find(t => t.name === 'update_organization'), name: 'update_organization' }
        );

        // =============================================
        // BOOK TOOLS
        // =============================================
        const chapterTools = this.chapterHandlers.getChapterTools();
        tools.push(
            { ...chapterTools.find(t => t.name === 'create_chapter'), name: 'book_create_chapter' },
            { ...chapterTools.find(t => t.name === 'update_chapter'), name: 'book_update_chapter' },
            { ...chapterTools.find(t => t.name === 'get_chapter'), name: 'book_get_chapter' },
            { ...chapterTools.find(t => t.name === 'list_chapters'), name: 'book_list_chapters' }
        );

        // =============================================
        // CHARACTER TOOLS
        // =============================================
        const knowledgeTools = this.characterKnowledgeHandlers.getCharacterKnowledgeTools();
        tools.push(
            { ...knowledgeTools.find(t => t.name === 'add_character_knowledge_with_chapter'), name: 'character_add_character_knowledge_with_chapter' },
            { ...knowledgeTools.find(t => t.name === 'get_characters_who_know'), name: 'character_get_characters_who_know' }
        );

        const characterTimelineTools = this.characterTimelineHandlers.getCharacterTimelineTools();
        tools.push(
            { ...characterTimelineTools.find(t => t.name === 'track_character_presence'), name: 'track_character_presence' }
        );

        // =============================================
        // PLOT TOOLS
        // =============================================
        const genreTools = this.genreExtensionHandlers.getUniversalGenreTools();
        tools.push(
            { ...genreTools.find(t => t.name === 'create_information_reveal'), name: 'plot_create_information_reveal' },
            { ...genreTools.find(t => t.name === 'add_reveal_evidence'), name: 'plot_add_reveal_evidence' }
        );

        const plotTools = this.plotThreadHandlers.getPlotThreadTools();
        tools.push(
            { ...plotTools.find(t => t.name === 'resolve_plot_thread'), name: 'resolve_plot_thread' }
        );

        // Filter out any undefined tools
        return tools.filter(t => t && t.name);
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Timeline tools
            'timeline_map_event_to_chapter': (args) => this.eventChapterMappingHandlers.handleMapEventToChapter(args),
            'update_timeline_event': (args) => this.timelineEventHandlers.handleUpdateTimelineEvent(args),
            'update_event_mapping': (args) => this.eventChapterMappingHandlers.handleUpdateEventMapping(args),

            // World tools
            'world_track_location_usage': (args) => this.locationHandlers.handleTrackLocationUsage(args),
            'world_track_element_usage': (args) => this.worldElementHandlers.handleTrackElementUsage(args),
            'world_check_world_consistency': (args) => this.worldManagementHandlers.handleCheckWorldConsistency(args),
            'update_location': (args) => this.locationHandlers.handleUpdateLocation(args),
            'update_world_element': (args) => this.worldElementHandlers.handleUpdateWorldElement(args),
            'track_organization_activity': (args) => this.organizationHandlers.handleTrackOrganizationActivity(args),
            'update_organization': (args) => this.organizationHandlers.handleUpdateOrganization(args),

            // Book tools
            'book_create_chapter': (args) => this.chapterHandlers.handleCreateChapter(args),
            'book_update_chapter': (args) => this.chapterHandlers.handleUpdateChapter(args),
            'book_get_chapter': (args) => this.chapterHandlers.handleGetChapter(args),
            'book_list_chapters': (args) => this.chapterHandlers.handleListChapters(args),

            // Character tools
            'character_add_character_knowledge_with_chapter': (args) => this.characterKnowledgeHandlers.handleAddCharacterKnowledgeWithChapter(args),
            'character_get_characters_who_know': (args) => this.characterKnowledgeHandlers.handleGetCharactersWhoKnow(args),
            'track_character_presence': (args) => this.characterTimelineHandlers.handleTrackCharacterPresence(args),

            // Plot tools
            'plot_create_information_reveal': (args) => this.genreExtensionHandlers.handleCreateInformationReveal(args),
            'plot_add_reveal_evidence': (args) => this.genreExtensionHandlers.handleAddRevealEvidence(args),
            'resolve_plot_thread': (args) => this.plotThreadHandlers.handleResolvePlotThread(args)
        };

        return handlerMap[toolName] || null;
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
