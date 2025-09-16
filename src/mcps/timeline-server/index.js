/**
 * Timeline Server MCP for managing story timeline and event mapping
 * 
 * This server manages timeline events and their presentation in chapters,
 * supporting non-linear storytelling and multiple POVs.
 */

import { BaseMCPServer } from '../../shared/base-mcp-server.js';
//import { DatabaseManager } from '../../shared/database.js';

// Import handlers
import { TimelineEventHandlers } from './handlers/timeline-event-handlers.js';
import { EventChapterMappingHandlers } from './handlers/timeline-chapter-mapping-handler.js'; // Add the new import

class TimelineMCPServer extends BaseMCPServer {
    constructor() {
        super('timeline-server', '1.0.0', 'Handles timeline events and their narrative presentation');
        
        // Set up database connection
        this.db = new DatabaseManager();
        
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
    
    /**
     * Proper method binding to maintain context
     */
    bindHandlerMethods() {
        // Timeline event handler methods
        this.handleListTimelineEvents = this.timelineEventHandlers.handleListTimelineEvents.bind(this.timelineEventHandlers);
        this.handleGetTimelineEvent = this.timelineEventHandlers.handleGetTimelineEvent.bind(this.timelineEventHandlers);
        this.handleCreateTimelineEvent = this.timelineEventHandlers.handleCreateTimelineEvent.bind(this.timelineEventHandlers);
        this.handleUpdateTimelineEvent = this.timelineEventHandlers.handleUpdateTimelineEvent.bind(this.timelineEventHandlers);
        
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

// Create and start the server
const server = new TimelineMCPServer();
server.start();

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    console.log('Shutting down timeline-server...');
    await server.cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down timeline-server...');
    await server.cleanup();
    process.exit(0);
});