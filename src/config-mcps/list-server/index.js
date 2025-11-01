// src/config-mcps/list-server/index.js
// Phase-based MCP Server: List/Query Tools
// Provides read-only list and query tools across all domains

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

// Import handler classes for read-only operations
import { TimelineEventHandlers } from '../../mcps/timeline-server/handlers/timeline-event-handlers.js';
import { EventChapterMappingHandlers } from '../../mcps/timeline-server/handlers/timeline-chapter-mapping-handler.js';
import { RelationshipHandlers } from '../../mcps/relationship-server/handlers/relationship-handlers.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { WorldElementHandlers } from '../../mcps/world-server/handlers/world-element-handlers.js';
import { OrganizationHandlers } from '../../mcps/world-server/handlers/organization-handlers.js';
import { WorldManagementHandlers } from '../../mcps/world-server/handlers/world-management-handlers.js';
import { CharacterHandlers } from '../../mcps/character-server/handlers/character-handlers.js';
import { CharacterTimelineHandlers } from '../../mcps/character-server/handlers/character-timeline-handlers.js';
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { GenreExtensions } from '../../mcps/plot-server/handlers/genre-extensions.js';
import { ExportHandlers } from '../../mcps/writing-server/handlers/export-handlers.js';

class ListServerMCP extends BaseMCPServer {
    constructor() {
        super('list-server', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build tool list
        this.tools = this.buildTools();

        console.error(`[LIST-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create handler instances passing our shared database
        this.timelineEventHandlers = new TimelineEventHandlers(this.db);
        this.eventChapterMappingHandlers = new EventChapterMappingHandlers(this.db);
        this.relationshipHandlers = new RelationshipHandlers(this.db);
        this.locationHandlers = new LocationHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);
        this.organizationHandlers = new OrganizationHandlers(this.db);
        this.worldManagementHandlers = new WorldManagementHandlers(this.db);
        this.characterHandlers = new CharacterHandlers(this.db);
        this.characterTimelineHandlers = new CharacterTimelineHandlers(this.db);
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.genreExtensions = new GenreExtensions(this.db);
        this.exportHandlers = new ExportHandlers(this.db);

        console.error('[LIST-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // =============================================
        // TIMELINE TOOLS
        // =============================================
        const timelineTools = this.timelineEventHandlers.getTimelineEventTools();

        const listTimelineEvents = timelineTools.find(t => t.name === 'list_timeline_events');
        if (listTimelineEvents) {
            tools.push({
                ...listTimelineEvents,
                name: 'timeline_list_timeline_events',
                description: `[TIMELINE] ${listTimelineEvents.description}`
            });
        }

        const getCharacterTimelineEvents = timelineTools.find(t => t.name === 'get_character_timeline_events');
        if (getCharacterTimelineEvents) {
            tools.push({
                ...getCharacterTimelineEvents,
                name: 'timeline_get_character_timeline_events',
                description: `[TIMELINE] ${getCharacterTimelineEvents.description}`
            });
        }

        // Event-Chapter Mapping tools
        const eventMappingTools = this.eventChapterMappingHandlers.getEventChapterMappingTools();

        const getChapterEvents = eventMappingTools.find(t => t.name === 'get_chapter_events');
        if (getChapterEvents) {
            tools.push({
                ...getChapterEvents,
                name: 'timeline_get_chapter_events',
                description: `[TIMELINE] ${getChapterEvents.description}`
            });
        }

        const getEventMappings = eventMappingTools.find(t => t.name === 'get_event_mappings');
        if (getEventMappings) {
            tools.push({
                ...getEventMappings,
                name: 'timeline_get_event_mappings',
                description: `[TIMELINE] ${getEventMappings.description}`
            });
        }

        const analyzeNarrativeStructure = eventMappingTools.find(t => t.name === 'analyze_narrative_structure');
        if (analyzeNarrativeStructure) {
            tools.push({
                ...analyzeNarrativeStructure,
                name: 'timeline_analyze_narrative_structure',
                description: `[TIMELINE] ${analyzeNarrativeStructure.description}`
            });
        }

        const getTimelineEvent = timelineTools.find(t => t.name === 'get_timeline_event');
        if (getTimelineEvent) {
            tools.push({
                ...getTimelineEvent,
                name: 'get_timeline_event',
                description: `[TIMELINE] ${getTimelineEvent.description}`
            });
        }

        // =============================================
        // RELATIONSHIP TOOLS
        // =============================================
        const relationshipTools = this.relationshipHandlers.getRelationshipTools();

        const listRelationshipArcs = relationshipTools.find(t => t.name === 'list_relationship_arcs');
        if (listRelationshipArcs) {
            tools.push({
                ...listRelationshipArcs,
                name: 'relationship_list_relationship_arcs',
                description: `[RELATIONSHIP] ${listRelationshipArcs.description}`
            });
        }

        const getRelationshipArc = relationshipTools.find(t => t.name === 'get_relationship_arc');
        if (getRelationshipArc) {
            tools.push({
                ...getRelationshipArc,
                name: 'relationship_get_relationship_arc',
                description: `[RELATIONSHIP] ${getRelationshipArc.description}`
            });
        }

        const getRelationshipTimeline = relationshipTools.find(t => t.name === 'get_relationship_timeline');
        if (getRelationshipTimeline) {
            tools.push({
                ...getRelationshipTimeline,
                name: 'relationship_get_relationship_timeline',
                description: `[RELATIONSHIP] ${getRelationshipTimeline.description}`
            });
        }

        // =============================================
        // WORLD TOOLS
        // =============================================
        const locationTools = this.locationHandlers.getLocationTools();
        const getLocations = locationTools.find(t => t.name === 'get_locations');
        if (getLocations) {
            tools.push({
                ...getLocations,
                name: 'world_get_locations',
                description: `[WORLD] ${getLocations.description}`
            });
        }

        const worldElementTools = this.worldElementHandlers.getWorldElementTools();
        const getWorldElements = worldElementTools.find(t => t.name === 'get_world_elements');
        if (getWorldElements) {
            tools.push({
                ...getWorldElements,
                name: 'world_get_world_elements',
                description: `[WORLD] ${getWorldElements.description}`
            });
        }

        const organizationTools = this.organizationHandlers.getOrganizationTools();
        const getOrganizations = organizationTools.find(t => t.name === 'get_organizations');
        if (getOrganizations) {
            tools.push({
                ...getOrganizations,
                name: 'world_get_organizations',
                description: `[WORLD] ${getOrganizations.description}`
            });
        }

        // World Management/Analysis tools
        const worldManagementTools = this.worldManagementHandlers.getWorldManagementTools();

        const findWorldGaps = worldManagementTools.find(t => t.name === 'find_world_gaps');
        if (findWorldGaps) {
            tools.push({
                ...findWorldGaps,
                name: 'find_world_gaps',
                description: `[WORLD] ${findWorldGaps.description}`
            });
        }

        const analyzeWorldComplexity = worldManagementTools.find(t => t.name === 'analyze_world_complexity');
        if (analyzeWorldComplexity) {
            tools.push({
                ...analyzeWorldComplexity,
                name: 'analyze_world_complexity',
                description: `[WORLD] ${analyzeWorldComplexity.description}`
            });
        }

        const validateWorldRelationships = worldManagementTools.find(t => t.name === 'validate_world_relationships');
        if (validateWorldRelationships) {
            tools.push({
                ...validateWorldRelationships,
                name: 'validate_world_relationships',
                description: `[WORLD] ${validateWorldRelationships.description}`
            });
        }

        const generateWorldGuide = worldManagementTools.find(t => t.name === 'generate_world_guide');
        if (generateWorldGuide) {
            tools.push({
                ...generateWorldGuide,
                name: 'generate_world_guide',
                description: `[WORLD] ${generateWorldGuide.description}`
            });
        }

        const analyzeWorldUsage = worldManagementTools.find(t => t.name === 'analyze_world_usage');
        if (analyzeWorldUsage) {
            tools.push({
                ...analyzeWorldUsage,
                name: 'analyze_world_usage',
                description: `[WORLD] ${analyzeWorldUsage.description}`
            });
        }

        const getWorldOverview = worldManagementTools.find(t => t.name === 'get_world_overview');
        if (getWorldOverview) {
            tools.push({
                ...getWorldOverview,
                name: 'get_world_overview',
                description: `[WORLD] ${getWorldOverview.description}`
            });
        }

        // =============================================
        // CHARACTER TOOLS
        // =============================================
        const characterTools = this.characterHandlers.getCharacterTools();

        const getCharacter = characterTools.find(t => t.name === 'get_character');
        if (getCharacter) {
            tools.push({
                ...getCharacter,
                name: 'character_get_character',
                description: `[CHARACTER] ${getCharacter.description}`
            });
        }

        const listCharacters = characterTools.find(t => t.name === 'list_characters');
        if (listCharacters) {
            tools.push({
                ...listCharacters,
                name: 'character_list_characters',
                description: `[CHARACTER] ${listCharacters.description}`
            });
        }

        // Character timeline from character-timeline-handlers
        const characterTimelineTools = this.characterTimelineHandlers.getCharacterTimelineTools();
        const getCharacterTimeline = characterTimelineTools.find(t => t.name === 'get_character_timeline');
        if (getCharacterTimeline) {
            tools.push({
                ...getCharacterTimeline,
                name: 'character_get_character_timeline',
                description: `[CHARACTER] ${getCharacterTimeline.description}`
            });
        }

        // =============================================
        // PLOT TOOLS
        // =============================================
        const plotThreadTools = this.plotThreadHandlers.getPlotThreadTools();

        const getPlotThreads = plotThreadTools.find(t => t.name === 'get_plot_threads');
        if (getPlotThreads) {
            tools.push({
                ...getPlotThreads,
                name: 'plot_get_plot_threads',
                description: `[PLOT] ${getPlotThreads.description}`
            });
        }

        const genreTools = this.genreExtensions.getUniversalGenreTools();
        const trackSystemProgression = genreTools.find(t => t.name === 'track_system_progression');
        if (trackSystemProgression) {
            tools.push({
                ...trackSystemProgression,
                name: 'plot_track_system_progression',
                description: `[PLOT] ${trackSystemProgression.description}`
            });
        }

        // =============================================
        // WRITING TOOLS
        // =============================================
        const exportTools = this.exportHandlers.getExportTools();

        const exportManuscript = exportTools.find(t => t.name === 'export_manuscript');
        if (exportManuscript) {
            tools.push({
                ...exportManuscript,
                name: 'writing_export_manuscript',
                description: `[WRITING] ${exportManuscript.description}`
            });
        }

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Timeline handlers
            'timeline_list_timeline_events': (args) => this.timelineEventHandlers.handleListTimelineEvents(args),
            'timeline_get_character_timeline_events': (args) => this.timelineEventHandlers.handleListTimelineEvents({ character_id: args.character_id }),
            'get_timeline_event': (args) => this.timelineEventHandlers.handleGetTimelineEvent(args),
            'timeline_get_chapter_events': (args) => this.eventChapterMappingHandlers.handleGetChapterEvents(args),
            'timeline_get_event_mappings': (args) => this.eventChapterMappingHandlers.handleGetEventMappings(args),
            'timeline_analyze_narrative_structure': (args) => this.eventChapterMappingHandlers.handleAnalyzeNarrativeStructure(args),

            // Relationship handlers
            'relationship_list_relationship_arcs': (args) => this.relationshipHandlers.handleListRelationshipArcs(args),
            'relationship_get_relationship_arc': (args) => this.relationshipHandlers.handleGetRelationshipArc(args),
            'relationship_get_relationship_timeline': (args) => this.relationshipHandlers.handleGetRelationshipTimeline(args),

            // World handlers
            'world_get_locations': (args) => this.locationHandlers.handleGetLocations(args),
            'world_get_world_elements': (args) => this.worldElementHandlers.handleGetWorldElements(args),
            'world_get_organizations': (args) => this.organizationHandlers.handleGetOrganizations(args),
            'find_world_gaps': (args) => this.worldManagementHandlers.handleFindWorldGaps(args),
            'analyze_world_complexity': (args) => this.worldManagementHandlers.handleAnalyzeWorldComplexity(args),
            'validate_world_relationships': (args) => this.worldManagementHandlers.handleValidateWorldRelationships(args),
            'generate_world_guide': (args) => this.worldManagementHandlers.handleGenerateWorldGuide(args),
            'analyze_world_usage': (args) => this.worldManagementHandlers.handleAnalyzeWorldUsage(args),
            'get_world_overview': (args) => this.worldManagementHandlers.handleGetWorldOverview(args),

            // Character handlers
            'character_get_character': (args) => this.characterHandlers.handleGetCharacter(args),
            'character_list_characters': (args) => this.characterHandlers.handleListCharacters(args),
            'character_get_character_timeline': (args) => this.characterTimelineHandlers.handleGetCharacterTimeline(args),

            // Plot handlers
            'plot_get_plot_threads': (args) => this.plotThreadHandlers.handleGetPlotThreads(args),
            'plot_track_system_progression': (args) => this.genreExtensions.handleTrackSystemProgression(args),

            // Writing handlers
            'writing_export_manuscript': (args) => this.exportHandlers.handleExportManuscript(args)
        };

        return handlerMap[toolName] || null;
    }
}

export { ListServerMCP };

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
    console.error('[LIST-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new ListServerMCP();
        await server.run();
    } catch (error) {
        console.error('[LIST-SERVER] Failed to start MCP server:', error.message);
        console.error('[LIST-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[LIST-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(ListServerMCP);
        await runner.run();
    } catch (error) {
        console.error('[LIST-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[LIST-SERVER] Module imported - not starting server');
}
