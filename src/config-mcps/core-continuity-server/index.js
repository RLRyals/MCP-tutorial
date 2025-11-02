// src/config-mcps/core-continuity-server/index.js
// Phase-based MCP Server: Core Continuity Checking
// Read-only tools for checking continuity during writing

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

// Import ONLY handler classes - NOT full servers
import { CharacterHandlers } from '../../mcps/character-server/handlers/character-handlers.js';
import { CharacterDetailHandlers } from '../../mcps/character-server/handlers/character-detail-handlers.js';
import { CharacterKnowledgeHandlers } from '../../mcps/character-server/handlers/character-knowledge-handlers.js';
import { CharacterTimelineHandlers } from '../../mcps/character-server/handlers/character-timeline-handlers.js';
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { RelationshipHandlers } from '../../mcps/relationship-server/handlers/relationship-handlers.js';
import { EventChapterMappingHandlers } from '../../mcps/timeline-server/handlers/timeline-chapter-mapping-handler.js';

class CoreContinuityMCPServer extends BaseMCPServer {
    constructor() {
        super('core-continuity-server', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build tool list
        this.tools = this.buildTools();

        console.error(`[CORE-CONTINUITY-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create handler instances passing our shared database
        this.characterHandlers = new CharacterHandlers(this.db);
        this.characterDetailHandlers = new CharacterDetailHandlers(this.db);
        this.characterKnowledgeHandlers = new CharacterKnowledgeHandlers(this.db);
        this.characterTimelineHandlers = new CharacterTimelineHandlers(this.db);
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.relationshipHandlers = new RelationshipHandlers(this.db);
        this.eventChapterMappingHandlers = new EventChapterMappingHandlers(this.db);

        console.error('[CORE-CONTINUITY-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // CHARACTER TOOLS
        const characterTools = this.characterHandlers.getCharacterTools();
        const getCharacter = characterTools.find(t => t.name === 'get_character');
        if (getCharacter) {
            tools.push({
                ...getCharacter,
                name: 'character_get_character',
                description: '[CHARACTER] Get character basic information'
            });
        }

        const detailTools = this.characterDetailHandlers.getCharacterDetailTools();
        const getCharacterDetails = detailTools.find(t => t.name === 'get_character_details');
        if (getCharacterDetails) {
            tools.push({
                ...getCharacterDetails,
                name: 'character_get_character_details',
                description: '[CHARACTER] Get detailed character information'
            });
        }

        const characterKnowledgeTools = this.characterKnowledgeHandlers.getCharacterKnowledgeTools();
        const checkCharacterKnowledge = characterKnowledgeTools.find(t => t.name === 'check_character_knowledge');
        if (checkCharacterKnowledge) {
            tools.push({
                ...checkCharacterKnowledge,
                name: 'character_check_character_knowledge',
                description: '[CHARACTER] Check what a character knows'
            });
        }

        const characterTimelineTools = this.characterTimelineHandlers.getCharacterTimelineTools();
        const checkCharacterContinuity = characterTimelineTools.find(t => t.name === 'check_character_continuity');
        if (checkCharacterContinuity) {
            tools.push({
                ...checkCharacterContinuity,
                name: 'character_check_character_continuity',
                description: '[CHARACTER] Check character continuity across chapters'
            });
        }

        // PLOT TOOLS
        const plotThreadTools = this.plotThreadHandlers.getPlotThreadTools();
        const getPlotThreads = plotThreadTools.find(t => t.name === 'get_plot_threads');
        if (getPlotThreads) {
            tools.push({
                ...getPlotThreads,
                name: 'plot_get_plot_threads',
                description: '[PLOT] Get plot threads for checking continuity'
            });
        }

        // RELATIONSHIP TOOLS
        const relationshipTools = this.relationshipHandlers.getRelationshipTools();
        const getRelationshipArc = relationshipTools.find(t => t.name === 'get_relationship_arc');
        if (getRelationshipArc) {
            tools.push({
                ...getRelationshipArc,
                name: 'relationship_get_relationship_arc',
                description: '[RELATIONSHIP] Get relationship arc details'
            });
        }

        const getRelationshipTimeline = relationshipTools.find(t => t.name === 'get_relationship_timeline');
        if (getRelationshipTimeline) {
            tools.push({
                ...getRelationshipTimeline,
                name: 'relationship_get_relationship_timeline',
                description: '[RELATIONSHIP] Get relationship progression timeline'
            });
        }

        // TIMELINE TOOLS
        const eventMappingTools = this.eventChapterMappingHandlers.getEventChapterMappingTools();
        const getEventMappings = eventMappingTools.find(t => t.name === 'get_event_mappings');
        if (getEventMappings) {
            tools.push({
                ...getEventMappings,
                name: 'timeline_get_event_mappings',
                description: '[TIMELINE] Get timeline event to chapter mappings'
            });
        }

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Character handlers
            'character_get_character': (args) => this.characterHandlers.handleGetCharacter(args),
            'character_get_character_details': (args) => this.characterDetailHandlers.handleGetCharacterDetails(args),
            'character_check_character_knowledge': (args) => this.characterKnowledgeHandlers.handleCheckCharacterKnowledge(args),
            'character_check_character_continuity': (args) => this.characterTimelineHandlers.handleCheckCharacterContinuity(args),

            // Plot handlers
            'plot_get_plot_threads': (args) => this.plotThreadHandlers.handleGetPlotThreads(args),

            // Relationship handlers
            'relationship_get_relationship_arc': (args) => this.relationshipHandlers.handleGetRelationshipArc(args),
            'relationship_get_relationship_timeline': (args) => this.relationshipHandlers.handleGetRelationshipTimeline(args),

            // Timeline handlers
            'timeline_get_event_mappings': (args) => this.eventChapterMappingHandlers.handleGetEventMappings(args)
        };

        return handlerMap[toolName] || null;
    }
}

export { CoreContinuityMCPServer };

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
    console.error('[CORE-CONTINUITY-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new CoreContinuityMCPServer();
        await server.run();
    } catch (error) {
        console.error('[CORE-CONTINUITY-SERVER] Failed to start MCP server:', error.message);
        console.error('[CORE-CONTINUITY-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[CORE-CONTINUITY-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(CoreContinuityMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[CORE-CONTINUITY-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[CORE-CONTINUITY-SERVER] Module imported - not starting server');
}
