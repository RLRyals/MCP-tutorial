/**
 * Timeline Server MCP for managing story timeline and event mapping
 * 
 * This server manages timeline events and their presentation in chapters,
 * supporting non-linear storytelling and multiple POVs.
 */

import { BaseMCPServer } from '../../shared/base-server.js';
//import { DatabaseManager } from '../../shared/database.js';

// Import handlers
import { TimelineEventHandlers } from './handlers/timeline-event-handlers.js';
import { EventChapterMappingHandlers } from './handlers/timeline-chapter-mapping-handler.js'; // Add the new import

class TimelineMCPServer extends BaseMCPServer {
    constructor() {
        super('timeline-server', '1.0.0', 'Handles timeline events and their narrative presentation');
        
        // Set up database connection
        //this.db = new DatabaseManager();
        
        // Create handler instances
        this.timelineEventHandlers = new TimelineEventHandlers(this.db);
        this.eventChapterMappingHandlers = new EventChapterMappingHandlers(this.db); // Add new handler
        
        // Properly bind handler methods to maintain context
        this.bindHandlerMethods();
        
        // Get all tools from handlers
        this.tools = this.getTools();
    }
    
    /**
     * Combine all tools from the different handlers
     */
    getTools() {
        return [
            ...this.timelineEventHandlers.getTimelineEventTools(),
            ...this.eventChapterMappingHandlers.getEventChapterMappingTools() // Add mapping tools
        ];
    }
    
       // =============================================
    // COMPLETE TOOL HANDLER MAPPING
    // =============================================
    getToolHandler(toolName) {
        const handlers = {
            // Timeline event handlers
            'list_timeline_events': this.handleListTimelineEvents,
            'get_timeline_event': this.handleGetTimelineEvent,
            'create_timeline_event': this.handleCreateTimelineEvent,
            'update_timeline_event': this.handleUpdateTimelineEvent,
            'delete_timeline_event': this.handleDeleteTimelineEvent,
            'get_character_timeline_events': this.handleGetCharacterTimelineEvents,
            // Event-Chapter mapping handlers
            'map_event_to_chapter': this.handleMapEventToChapter,
            'get_event_mappings': this.handleGetEventMappings,
            'get_chapter_events': this.handleGetChapterEvents,
            'update_event_mapping': this.handleUpdateEventMapping,
            'delete_event_mapping': this.handleDeleteEventMapping,
            'analyze_narrative_structure': this.handleAnalyzeNarrativeStructure
        };
        return handlers[toolName] || null;
    }

    





    /**
     * Proper method binding to maintain context
     */
    bindHandlerMethods() {
        // Timeline event handler methods
        this.handleListTimelineEvents = this.timelineEventHandlers.handleListTimelineEvents.bind(this.timelineEventHandlers);
        this.handleGetTimelineEvent = this.timelineEventHandlers.handleGetTimelineEvent.bind(this.timelineEventHandlers);
        this.handleCreateTimelineEvent = this.timelineEventHandlers.handleCreateTimelineEvent.bind(this.timelineEventHandlers);
        this.handleUpdateTimelineEvent = this.timelineEventHandlers.handleUpdateTimelineEvent.bind(this.timelineEventHandlers);
        this.handleDeleteTimelineEvent = this.timelineEventHandlers.handleDeleteTimelineEvent.bind(this.timelineEventHandlers);
        this.handleGetCharacterTimelineEvents = this.timelineEventHandlers.handleGetCharacterTimeline.bind(this.timelineEventHandlers);
        
        // Event-Chapter mapping handler methods
        this.handleMapEventToChapter = this.eventChapterMappingHandlers.handleMapEventToChapter.bind(this.eventChapterMappingHandlers);
        this.handleGetEventMappings = this.eventChapterMappingHandlers.handleGetEventMappings.bind(this.eventChapterMappingHandlers);
        this.handleGetChapterEvents = this.eventChapterMappingHandlers.handleGetChapterEvents.bind(this.eventChapterMappingHandlers);
        this.handleUpdateEventMapping = this.eventChapterMappingHandlers.handleUpdateEventMapping.bind(this.eventChapterMappingHandlers);
        this.handleDeleteEventMapping = this.eventChapterMappingHandlers.handleDeleteEventMapping.bind(this.eventChapterMappingHandlers);
        this.handleAnalyzeNarrativeStructure = this.eventChapterMappingHandlers.handleAnalyzeNarrativeStructure.bind(this.eventChapterMappingHandlers);
    }
    
    /**
     * Clean up resources when server is shutting down
     */
    async cleanup() {
        if (this.db) {
            await this.db.close();
        }
    }
}

export { TimelineMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[TIMELINE-SERVER] Module loaded');
}

// Normalize paths for cross-platform compatibility (Windows and Mac)
const currentModuleUrl = import.meta.url;
let scriptPath = process.argv[1];
// Handle Windows paths
if (scriptPath.includes('\\')) {
    scriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
} else {
    // Handle Mac/Unix paths
    scriptPath = `file://${scriptPath}`;
}
// Decode the URLs to ensure proper comparison
const normalizedCurrentUrl = decodeURIComponent(currentModuleUrl);
const normalizedScriptPath = decodeURIComponent(scriptPath);
const isDirectExecution = normalizedCurrentUrl === normalizedScriptPath || process.env.MCP_STDIO_MODE === 'true';

// Prioritize MCP_STDIO_MODE environment variable
if (process.env.MCP_STDIO_MODE === 'true') {
    // When running in STDIO mode (via Claude Desktop)
    console.error('[TIMELINE-SERVER] Running in MCP stdio mode - starting server...');
    
    // When in MCP stdio mode, ensure clean stdout for JSON messages
    console.log = function(...args) {
        console.error('[TIMELINE-SERVER]', ...args);
    };
    
    try {
        console.error('[TIMELINE-SERVER] Creating server instance...');
        const server = new TimelineMCPServer();
        console.error('[TIMELINE-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[TIMELINE-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[TIMELINE-SERVER] Failed to start MCP server:', error.message);
        console.error('[TIMELINE-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    // When running as CLI (direct node execution)
    console.error('[TIMELINE-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(TimelineMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[TIMELINE-SERVER] CLI runner failed:', error.message);
        process.exit(1);
    }
} else {
    // Module was imported, not directly executed
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[TIMELINE-SERVER] Module imported - not starting server');
    }
}