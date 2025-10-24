// src/config-mcps/revision-server/index.js
// Phase-based MCP Server: Editing and Revision Phase
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
import { BookHandlers } from '../../mcps/book-server/handlers/book-handlers.js';
import { ChapterHandlers } from '../../mcps/book-server/handlers/chapter-handlers.js';
import { SceneHandlers } from '../../mcps/book-server/handlers/scene-handlers.js';
import { ValidationHandlers } from '../../mcps/writing-server/handlers/validation-handlers.js';
import { ExportHandlers } from '../../mcps/writing-server/handlers/export-handlers.js';
import { CharacterKnowledgeHandlers } from '../../mcps/character-server/handlers/character-knowledge-handlers.js';
import { CharacterDetailHandlers } from '../../mcps/character-server/handlers/character-detail-handlers.js';
import { CharacterTimelineHandlers } from '../../mcps/character-server/handlers/character-timeline-handlers.js';
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { RelationshipHandlers } from '../../mcps/relationship-server/handlers/relationship-handlers.js';
import { TimelineEventHandlers } from '../../mcps/timeline-server/handlers/timeline-event-handlers.js';
import { EventChapterMappingHandlers } from '../../mcps/timeline-server/handlers/timeline-chapter-mapping-handler.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { WorldElementHandlers } from '../../mcps/world-server/handlers/world-element-handlers.js';
import { OrganizationHandlers } from '../../mcps/world-server/handlers/organization-handlers.js';
import { WorldManagementHandlers } from '../../mcps/world-server/handlers/world-management-handlers.js';

class RevisionMCPServer extends BaseMCPServer {
    constructor() {
        super('revision-phase', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build aggregated tool list from handlers
        this.tools = this.buildTools();

        console.error(`[REVISION-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create handler instances passing our shared database
        // These handlers are lightweight and don't create their own DB connections
        this.bookHandlers = new BookHandlers(this.db);
        this.chapterHandlers = new ChapterHandlers(this.db);
        this.sceneHandlers = new SceneHandlers(this.db);
        this.validationHandlers = new ValidationHandlers(this.db);
        this.exportHandlers = new ExportHandlers(this.db);
        this.characterKnowledgeHandlers = new CharacterKnowledgeHandlers(this.db);
        this.characterDetailHandlers = new CharacterDetailHandlers(this.db);
        this.characterTimelineHandlers = new CharacterTimelineHandlers(this.db);
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.relationshipHandlers = new RelationshipHandlers(this.db);
        this.timelineEventHandlers = new TimelineEventHandlers(this.db);
        this.eventChapterMappingHandlers = new EventChapterMappingHandlers(this.db);
        this.locationHandlers = new LocationHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);
        this.organizationHandlers = new OrganizationHandlers(this.db);
        this.worldManagementHandlers = new WorldManagementHandlers(this.db);

        console.error('[REVISION-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // Book Server - Structure Revision Tools
        const bookTools = this.bookHandlers.getBookTools();
        const getBook = bookTools.find(t => t.name === 'get_book');
        if (getBook) {
            tools.push({
                ...getBook,
                name: 'book_get_book',
                description: '[BOOK] Review the overall book structure and goals'
            });
        }

        const chapterTools = this.chapterHandlers.getChapterTools();
        const getChapter = chapterTools.find(t => t.name === 'get_chapter');
        if (getChapter) {
            tools.push({
                ...getChapter,
                name: 'book_get_chapter',
                description: '[BOOK] Examine chapter structure and details'
            });
        }

        const listChapters = chapterTools.find(t => t.name === 'list_chapters');
        if (listChapters) {
            tools.push({
                ...listChapters,
                name: 'book_list_chapters',
                description: '[BOOK] Review chapter structure and flow'
            });
        }

        const updateChapter = chapterTools.find(t => t.name === 'update_chapter');
        if (updateChapter) {
            tools.push({
                ...updateChapter,
                name: 'book_update_chapter',
                description: '[BOOK] Update chapter status and make structural changes'
            });
        }

        const sceneTools = this.sceneHandlers.getSceneTools();
        const getScene = sceneTools.find(t => t.name === 'get_scene');
        if (getScene) {
            tools.push({
                ...getScene,
                name: 'book_get_scene',
                description: '[BOOK] Review scene content in detail'
            });
        }

        const listScenes = sceneTools.find(t => t.name === 'list_scenes');
        if (listScenes) {
            tools.push({
                ...listScenes,
                name: 'book_list_scenes',
                description: '[BOOK] Review scene content and pacing'
            });
        }

        const updateScene = sceneTools.find(t => t.name === 'update_scene');
        if (updateScene) {
            tools.push({
                ...updateScene,
                name: 'book_update_scene',
                description: '[BOOK] Revise scene content, dialogue, descriptions'
            });
        }

        const reorderScenes = sceneTools.find(t => t.name === 'reorder_scenes');
        if (reorderScenes) {
            tools.push({
                ...reorderScenes,
                name: 'book_reorder_scenes',
                description: '[BOOK] Adjust scene sequencing for better flow'
            });
        }

        // Writing Server - Validation and Quality Tools
        const validationTools = this.validationHandlers.getValidationTools();
        const validateChapterStructure = validationTools.find(t => t.name === 'validate_chapter_structure');
        if (validateChapterStructure) {
            tools.push({
                ...validateChapterStructure,
                name: 'writing_validate_chapter_structure',
                description: '[WRITING] Check for structural consistency'
            });
        }

        const validateBeatPlacement = validationTools.find(t => t.name === 'validate_beat_placement');
        if (validateBeatPlacement) {
            tools.push({
                ...validateBeatPlacement,
                name: 'writing_validate_beat_placement',
                description: '[WRITING] Analyze story pacing and emotional beats'
            });
        }

        const checkStructureViolations = validationTools.find(t => t.name === 'check_structure_violations');
        if (checkStructureViolations) {
            tools.push({
                ...checkStructureViolations,
                name: 'writing_check_structure_violations',
                description: '[WRITING] Identify continuity issues and plot holes'
            });
        }

        const exportTools = this.exportHandlers.getExportTools();
        const wordCountTracking = exportTools.find(t => t.name === 'word_count_tracking');
        if (wordCountTracking) {
            tools.push({
                ...wordCountTracking,
                name: 'writing_word_count_tracking',
                description: '[WRITING] Analyze pacing and chapter length distribution'
            });
        }

        const exportManuscript = exportTools.find(t => t.name === 'export_manuscript');
        if (exportManuscript) {
            tools.push({
                ...exportManuscript,
                name: 'writing_export_manuscript',
                description: '[WRITING] Generate full or partial manuscript for review'
            });
        }

        // Character Server - Continuity Checking Tools
        const characterTimelineTools = this.characterTimelineHandlers.getCharacterTimelineTools();
        const checkCharacterContinuity = characterTimelineTools.find(t => t.name === 'check_character_continuity');
        if (checkCharacterContinuity) {
            tools.push({
                ...checkCharacterContinuity,
                name: 'character_check_character_continuity',
                description: '[CHARACTER] Identify character inconsistencies between chapters'
            });
        }

        const getCharacterTimeline = characterTimelineTools.find(t => t.name === 'get_character_timeline');
        if (getCharacterTimeline) {
            tools.push({
                ...getCharacterTimeline,
                name: 'character_get_character_timeline',
                description: '[CHARACTER] Review character\'s complete arc'
            });
        }

        const detailTools = this.characterDetailHandlers.getCharacterDetailTools();
        const getCharacterDetails = detailTools.find(t => t.name === 'get_character_details');
        if (getCharacterDetails) {
            tools.push({
                ...getCharacterDetails,
                name: 'character_get_character_details',
                description: '[CHARACTER] Verify consistent descriptions across scenes'
            });
        }

        const knowledgeTools = this.characterKnowledgeHandlers.getCharacterKnowledgeTools();
        const getCharactersWhoKnow = knowledgeTools.find(t => t.name === 'get_characters_who_know');
        if (getCharactersWhoKnow) {
            tools.push({
                ...getCharactersWhoKnow,
                name: 'character_get_characters_who_know',
                description: '[CHARACTER] Verify information spread among characters'
            });
        }

        // Plot Server - Arc Coherence Tools
        const plotThreadTools = this.plotThreadHandlers.getPlotThreadTools();
        const getPlotThreads = plotThreadTools.find(t => t.name === 'get_plot_threads');
        if (getPlotThreads) {
            tools.push({
                ...getPlotThreads,
                name: 'plot_get_plot_threads',
                description: '[PLOT] Review active threads and their progression'
            });
        }

        const updatePlotThread = plotThreadTools.find(t => t.name === 'update_plot_thread');
        if (updatePlotThread) {
            tools.push({
                ...updatePlotThread,
                name: 'plot_update_plot_thread',
                description: '[PLOT] Refine plot development and resolution'
            });
        }

        // Relationship Server - Dynamic Consistency Tools
        const relationshipTools = this.relationshipHandlers.getRelationshipTools();
        const getRelationshipArc = relationshipTools.find(t => t.name === 'get_relationship_arc');
        if (getRelationshipArc) {
            tools.push({
                ...getRelationshipArc,
                name: 'relationship_get_relationship_arc',
                description: '[RELATIONSHIP] Review relationship progression'
            });
        }

        const getRelationshipTimeline = relationshipTools.find(t => t.name === 'get_relationship_timeline');
        if (getRelationshipTimeline) {
            tools.push({
                ...getRelationshipTimeline,
                name: 'relationship_get_relationship_timeline',
                description: '[RELATIONSHIP] Check relationship development consistency'
            });
        }

        // Timeline Server - Chronological Consistency Tools
        const timelineEventTools = this.timelineEventHandlers.getTimelineEventTools();
        const listTimelineEvents = timelineEventTools.find(t => t.name === 'list_timeline_events');
        if (listTimelineEvents) {
            tools.push({
                ...listTimelineEvents,
                name: 'timeline_list_timeline_events',
                description: '[TIMELINE] Verify overall chronology'
            });
        }

        const eventChapterMappingTools = this.eventChapterMappingHandlers.getEventChapterMappingTools();
        const getEventMappings = eventChapterMappingTools.find(t => t.name === 'get_event_mappings');
        if (getEventMappings) {
            tools.push({
                ...getEventMappings,
                name: 'timeline_get_event_mappings',
                description: '[TIMELINE] Check how events are presented across chapters'
            });
        }

        const analyzeNarrativeStructure = eventChapterMappingTools.find(t => t.name === 'analyze_narrative_structure');
        if (analyzeNarrativeStructure) {
            tools.push({
                ...analyzeNarrativeStructure,
                name: 'timeline_analyze_narrative_structure',
                description: '[TIMELINE] Evaluate chronology vs. narrative presentation'
            });
        }

        // World Server - Setting Consistency Tools
        const locationTools = this.locationHandlers.getLocationTools();
        const getLocations = locationTools.find(t => t.name === 'get_locations');
        if (getLocations) {
            tools.push({
                ...getLocations,
                name: 'world_get_locations',
                description: '[WORLD] Verify consistent location descriptions'
            });
        }

        const worldElementTools = this.worldElementHandlers.getWorldElementTools();
        const getWorldElements = worldElementTools.find(t => t.name === 'get_world_elements');
        if (getWorldElements) {
            tools.push({
                ...getWorldElements,
                name: 'world_get_world_elements',
                description: '[WORLD] Check magical/technological system consistency'
            });
        }

        const organizationTools = this.organizationHandlers.getOrganizationTools();
        const getOrganizations = organizationTools.find(t => t.name === 'get_organizations');
        if (getOrganizations) {
            tools.push({
                ...getOrganizations,
                name: 'world_get_organizations',
                description: '[WORLD] Verify organizational structure consistency'
            });
        }

        const worldManagementTools = this.worldManagementHandlers.getWorldManagementTools();
        const checkWorldConsistency = worldManagementTools.find(t => t.name === 'check_world_consistency');
        if (checkWorldConsistency) {
            tools.push({
                ...checkWorldConsistency,
                name: 'world_check_world_consistency',
                description: '[WORLD] Identify world-building contradictions'
            });
        }

        return tools;
    }

    getHandlerForTool(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Book Server - Structure
            'book_get_book': () => this.bookHandlers.handleGetBook.bind(this.bookHandlers),
            'book_get_chapter': () => this.chapterHandlers.handleGetChapter.bind(this.chapterHandlers),
            'book_list_chapters': () => this.chapterHandlers.handleListChapters.bind(this.chapterHandlers),
            'book_update_chapter': () => this.chapterHandlers.handleUpdateChapter.bind(this.chapterHandlers),
            'book_get_scene': () => this.sceneHandlers.handleGetScene.bind(this.sceneHandlers),
            'book_list_scenes': () => this.sceneHandlers.handleListScenes.bind(this.sceneHandlers),
            'book_update_scene': () => this.sceneHandlers.handleUpdateScene.bind(this.sceneHandlers),
            'book_reorder_scenes': () => this.sceneHandlers.handleReorderScenes.bind(this.sceneHandlers),

            // Writing Server - Validation and Quality
            'writing_validate_chapter_structure': () => this.validationHandlers.handleValidateChapterStructure.bind(this.validationHandlers),
            'writing_validate_beat_placement': () => this.validationHandlers.handleValidateBeatPlacement.bind(this.validationHandlers),
            'writing_check_structure_violations': () => this.validationHandlers.handleCheckStructureViolations.bind(this.validationHandlers),
            'writing_word_count_tracking': () => this.exportHandlers.handleWordCountTracking.bind(this.exportHandlers),
            'writing_export_manuscript': () => this.exportHandlers.handleExportManuscript.bind(this.exportHandlers),

            // Character Server - Continuity
            'character_check_character_continuity': () => this.characterTimelineHandlers.handleCheckCharacterContinuity.bind(this.characterTimelineHandlers),
            'character_get_character_timeline': () => this.characterTimelineHandlers.handleGetCharacterTimeline.bind(this.characterTimelineHandlers),
            'character_get_character_details': () => this.characterDetailHandlers.handleGetCharacterDetails.bind(this.characterDetailHandlers),
            'character_get_characters_who_know': () => this.characterKnowledgeHandlers.handleGetCharactersWhoKnow.bind(this.characterKnowledgeHandlers),

            // Plot Server - Arc Coherence
            'plot_get_plot_threads': () => this.plotThreadHandlers.handleGetPlotThreads.bind(this.plotThreadHandlers),
            'plot_update_plot_thread': () => this.plotThreadHandlers.handleUpdatePlotThread.bind(this.plotThreadHandlers),

            // Relationship Server - Dynamic Consistency
            'relationship_get_relationship_arc': () => this.relationshipHandlers.handleGetRelationshipArc.bind(this.relationshipHandlers),
            'relationship_get_relationship_timeline': () => this.relationshipHandlers.handleGetRelationshipTimeline.bind(this.relationshipHandlers),

            // Timeline Server - Chronological Consistency
            'timeline_list_timeline_events': () => this.timelineEventHandlers.handleListTimelineEvents.bind(this.timelineEventHandlers),
            'timeline_get_event_mappings': () => this.eventChapterMappingHandlers.handleGetEventMappings.bind(this.eventChapterMappingHandlers),
            'timeline_analyze_narrative_structure': () => this.eventChapterMappingHandlers.handleAnalyzeNarrativeStructure.bind(this.eventChapterMappingHandlers),

            // World Server - Setting Consistency
            'world_get_locations': () => this.locationHandlers.handleGetLocations.bind(this.locationHandlers),
            'world_get_world_elements': () => this.worldElementHandlers.handleGetWorldElements.bind(this.worldElementHandlers),
            'world_get_organizations': () => this.organizationHandlers.handleGetOrganizations.bind(this.organizationHandlers),
            'world_check_world_consistency': () => this.worldManagementHandlers.handleCheckWorldConsistency.bind(this.worldManagementHandlers)
        };

        const handlerFactory = handlerMap[toolName];
        return handlerFactory ? handlerFactory() : null;
    }
}

export { RevisionMCPServer };

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
        const server = new RevisionMCPServer();
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
        const runner = new CLIRunner(RevisionMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[REVISION-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[REVISION-SERVER] Module imported - not starting server');
}
