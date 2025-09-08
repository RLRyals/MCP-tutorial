// src/mcps/timeline-server/index.js

// Protect stdout from any pollution in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalWrite = process.stdout.write;
    process.stdout.write = function() { return true; };
    
    // Restore stdout after module loading is complete
    process.nextTick(() => {
        process.stdout.write = originalWrite;
    });
}

import { BaseMCPServer } from '../../shared/base-server.js';

class TimelineMCPServer extends BaseMCPServer {
    constructor() {
        super('timeline-manager', '1.0.0');
         // Initialize tools after base constructor
        this.tools = this.getTools();
    }

    getTools() {
        return [
            {
                name: 'list_timeline_events',
                description: 'List timeline events, optionally filtered by series',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Filter by series ID (optional)' }
                    },
                    required: []
                }
            },
            {
                name: 'get_timeline_event',
                description: 'Get detailed information about a specific timeline event',
                inputSchema: {
                    type: 'object',
                    properties: {
                        event_id: { type: 'integer', description: 'The ID of the timeline event' }
                    },
                    required: ['event_id']
                }
            },
            {
                name: 'create_timeline_event',
                description: 'Create a new timeline event for a series',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'ID of the series' },
                        event_name: { type: 'string', description: 'Name of the event' },
                        event_description: { type: 'string', description: 'Description of the event' },
                        event_date: { type: 'string', description: 'Date of the event (in-universe date)' },
                        book_id: { type: 'integer', description: 'Associated book ID (optional)' },
                        sort_order: { type: 'integer', description: 'Order in timeline (optional)' }
                    },
                    required: ['series_id', 'event_name', 'event_date']
                }
            },
            {
                name: 'update_timeline_event',
                description: 'Update an existing timeline event',
                inputSchema: {
                    type: 'object',
                    properties: {
                        event_id: { type: 'integer', description: 'The ID of the event to update' },
                        event_name: { type: 'string', description: 'Name of the event' },
                        event_description: { type: 'string', description: 'Description of the event' },
                        event_date: { type: 'string', description: 'Date of the event (in-universe date)' },
                        book_id: { type: 'integer', description: 'Associated book ID' },
                        sort_order: { type: 'integer', description: 'Order in timeline' }
                    },
                    required: ['event_id']
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'list_timeline_events': this.handleListTimelineEvents,
            'get_timeline_event': this.handleGetTimelineEvent,
            'create_timeline_event': this.handleCreateTimelineEvent,
            'update_timeline_event': this.handleUpdateTimelineEvent
        };
        return handlers[toolName];
    }

    async handleListTimelineEvents(args) {
        try {
            const { series_id } = args;
            
            let query = `
                SELECT t.*, s.title as series_title, b.title as book_title, a.name as author_name 
                FROM timeline_events t 
                JOIN series s ON t.series_id = s.id 
                JOIN authors a ON s.author_id = a.id 
                LEFT JOIN books b ON t.book_id = b.id
            `;
            
            const params = [];
            if (series_id) {
                query += ' WHERE t.series_id = $1';
                params.push(series_id);
            }
            
            query += ' ORDER BY s.title, t.sort_order, t.event_date';
            
            const result = await this.db.query(query, params);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${result.rows.length} timeline events:\n\n` +
                              result.rows.map(event => 
                                  `ID: ${event.id}\n` +
                                  `Event: ${event.event_name}\n` +
                                  `Series: ${event.series_title}\n` +
                                  `Author: ${event.author_name}\n` +
                                  `Date: ${event.event_date}\n` +
                                  `Book: ${event.book_title || 'Not specified'}\n` +
                                  `Order: ${event.sort_order || 'Not specified'}\n` +
                                  `Description: ${event.event_description || 'No description available'}\n`
                              ).join('\n---\n\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to list timeline events: ${error.message}`);
        }
    }

    async handleGetTimelineEvent(args) {
        try {
            const { event_id } = args;
            const query = `
                SELECT t.*, s.title as series_title, b.title as book_title, a.name as author_name 
                FROM timeline_events t 
                JOIN series s ON t.series_id = s.id 
                JOIN authors a ON s.author_id = a.id 
                LEFT JOIN books b ON t.book_id = b.id 
                WHERE t.id = $1
            `;
            const result = await this.db.query(query, [event_id]);
            
            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No timeline event found with ID: ${event_id}`
                        }
                    ]
                };
            }
            
            const event = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Timeline Event Details:\n\n` +
                              `ID: ${event.id}\n` +
                              `Event: ${event.event_name}\n` +
                              `Series: ${event.series_title}\n` +
                              `Author: ${event.author_name}\n` +
                              `Date: ${event.event_date}\n` +
                              `Book: ${event.book_title || 'Not specified'}\n` +
                              `Order: ${event.sort_order || 'Not specified'}\n` +
                              `Description: ${event.event_description || 'No description available'}\n` +
                              `Created: ${event.created_at}\n` +
                              `Updated: ${event.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get timeline event: ${error.message}`);
        }
    }

    async handleCreateTimelineEvent(args) {
        try {
            const { series_id, event_name, event_description, event_date, book_id, sort_order } = args;
            
            const query = `
                INSERT INTO timeline_events (series_id, event_name, event_description, event_date, book_id, sort_order) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *
            `;
            const result = await this.db.query(query, [series_id, event_name, event_description, event_date, book_id, sort_order]);
            const event = result.rows[0];
            
            // Get series, book, and author info for display
            const infoQuery = `
                SELECT s.title as series_title, a.name as author_name, b.title as book_title 
                FROM series s 
                JOIN authors a ON s.author_id = a.id 
                LEFT JOIN books b ON b.id = $2 
                WHERE s.id = $1
            `;
            const infoResult = await this.db.query(infoQuery, [series_id, book_id]);
            const info = infoResult.rows[0] || {};
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Created timeline event successfully!\n\n` +
                              `ID: ${event.id}\n` +
                              `Event: ${event.event_name}\n` +
                              `Series: ${info.series_title || 'Unknown'}\n` +
                              `Author: ${info.author_name || 'Unknown'}\n` +
                              `Date: ${event.event_date}\n` +
                              `Book: ${info.book_title || 'Not specified'}\n` +
                              `Order: ${event.sort_order || 'Not specified'}\n` +
                              `Description: ${event.event_description || 'No description provided'}`
                    }
                ]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid series_id or book_id: Series or Book not found');
            }
            throw new Error(`Failed to create timeline event: ${error.message}`);
        }
    }

    async handleUpdateTimelineEvent(args) {
        try {
            const { event_id, event_name, event_description, event_date, book_id, sort_order } = args;
            
            // Build dynamic update query
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            if (event_name !== undefined) {
                updates.push(`event_name = $${paramCount++}`);
                values.push(event_name);
            }
            if (event_description !== undefined) {
                updates.push(`event_description = $${paramCount++}`);
                values.push(event_description);
            }
            if (event_date !== undefined) {
                updates.push(`event_date = $${paramCount++}`);
                values.push(event_date);
            }
            if (book_id !== undefined) {
                updates.push(`book_id = $${paramCount++}`);
                values.push(book_id);
            }
            if (sort_order !== undefined) {
                updates.push(`sort_order = $${paramCount++}`);
                values.push(sort_order);
            }
            
            if (updates.length === 0) {
                throw new Error('No fields to update');
            }
            
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(event_id);
            
            const query = `
                UPDATE timeline_events 
                SET ${updates.join(', ')} 
                WHERE id = $${paramCount} 
                RETURNING *
            `;
            
            const result = await this.db.query(query, values);
            
            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No timeline event found with ID: ${event_id}`
                        }
                    ]
                };
            }
            
            const event = result.rows[0];
            
            // Get series, book, and author info for display
            const infoQuery = `
                SELECT s.title as series_title, a.name as author_name, b.title as book_title 
                FROM series s 
                JOIN authors a ON s.author_id = a.id 
                LEFT JOIN books b ON b.id = $2 
                WHERE s.id = $1
            `;
            const infoResult = await this.db.query(infoQuery, [event.series_id, event.book_id]);
            const info = infoResult.rows[0] || {};
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Updated timeline event successfully!\n\n` +
                              `ID: ${event.id}\n` +
                              `Event: ${event.event_name}\n` +
                              `Series: ${info.series_title || 'Unknown'}\n` +
                              `Author: ${info.author_name || 'Unknown'}\n` +
                              `Date: ${event.event_date}\n` +
                              `Book: ${info.book_title || 'Not specified'}\n` +
                              `Order: ${event.sort_order || 'Not specified'}\n` +
                              `Description: ${event.event_description || 'No description available'}\n` +
                              `Updated: ${event.updated_at}`
                    }
                ]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid book_id: Book not found');
            }
            throw new Error(`Failed to update timeline event: ${error.message}`);
        }
    }
}

export { TimelineMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    const { CLIRunner } = await import('../../shared/cli-runner.js');
    const runner = new CLIRunner(TimelineMCPServer);
    await runner.run();
} else if (isDirectExecution) {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[TIMELINE-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new TimelineMCPServer();
        await server.run();
    } catch (error) {
        console.error('[TIMELINE-SERVER] Failed to start MCP server:', error.message);
        console.error('[TIMELINE-SERVER] Stack:', error.stack);
        process.exit(1);
    }
}
