// src/mcps/plot-server/index.js
// Complete Plot MCP Server for universal plot management
// Handles plot threads, timeline events, tropes, story structure, and story frameworks

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

class PlotMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[PLOT-SERVER] Constructor starting...');
        try {
            super('plot-management', '1.0.0');
            console.error('[PLOT-SERVER] Constructor completed successfully');
        } catch (error) {
            console.error('[PLOT-SERVER] Constructor failed:', error.message);
            throw error;
        }
        
        this.tools = this.getTools();
        
        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[PLOT-SERVER] WARNING: Tools not properly initialized!');
            this.tools = this.getTools();
        }
        
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[PLOT-SERVER] Initialized with ${this.tools.length} tools`);
        }
        
        this.testDatabaseConnection();
    }

    async testDatabaseConnection() {
        try {
            if (this.db) {
                const healthPromise = this.db.healthCheck();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Database health check timed out')), 5000)
                );
                
                const health = await Promise.race([healthPromise, timeoutPromise]);
                if (health.healthy) {
                    console.error('[PLOT-SERVER] Database connection verified');
                } else {
                    console.error('[PLOT-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[PLOT-SERVER] Database connection test failed:', error.message);
        }
    }

    // =============================================
    // COMPLETE TOOL DEFINITIONS (all categories)
    // =============================================
    getTools() {
        return [
            // ===== LOOKUP TABLE TOOLS =====
            {
                name: 'get_available_options',
                description: 'Get available options from lookup tables (genres, tropes, categories, etc.)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        option_type: {
                            type: 'string',
                            enum: ['genres', 'trope_categories', 'story_tropes', 'genre_templates'],
                            description: 'Type of options to retrieve'
                        },
                        genre_filter: { 
                            type: 'string', 
                            description: 'Filter by specific genre name (optional)' 
                        },
                        active_only: { 
                            type: 'boolean', 
                            default: true, 
                            description: 'Only return active/available options'
                        }
                    },
                    required: ['option_type']
                }
            },

            // ===== PLOT THREAD MANAGEMENT TOOLS =====
            {
                name: 'create_plot_thread',
                description: 'Create a new plot thread (story arc, subplot, character arc)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        title: { type: 'string', description: 'Plot thread title' },
                        description: { type: 'string', description: 'Plot thread description' },
                        thread_type: { 
                            type: 'string', 
                            enum: ['series_arc', 'mini_arc', 'main_case', 'subplot', 'character_arc', 'mystery_element'],
                            description: 'Type of plot thread'
                        },
                        importance_level: { 
                            type: 'integer', 
                            minimum: 1, 
                            maximum: 10, 
                            default: 5,
                            description: 'Importance level (1-10)'
                        },
                        complexity_level: { 
                            type: 'integer', 
                            minimum: 1, 
                            maximum: 10, 
                            default: 5,
                            description: 'Complexity level (1-10)'
                        },
                        start_book: { type: 'integer', description: 'Starting book number' },
                        end_book: { type: 'integer', description: 'Ending book number (optional for ongoing threads)' },
                        related_characters: { 
                            type: 'array', 
                            items: { type: 'integer' },
                            description: 'Array of related character IDs'
                        },
                        parent_thread_id: { type: 'integer', description: 'Parent thread ID for sub-threads' }
                    },
                    required: ['series_id', 'title', 'description', 'thread_type']
                }
            },
            {
                name: 'update_plot_thread',
                description: 'Update plot thread information and status',
                inputSchema: {
                    type: 'object',
                    properties: {
                        thread_id: { type: 'integer', description: 'Plot thread ID' },
                        title: { type: 'string', description: 'Plot thread title' },
                        description: { type: 'string', description: 'Plot thread description' },
                        current_status: { 
                            type: 'string', 
                            enum: ['active', 'resolved', 'on_hold', 'abandoned'],
                            description: 'Thread status'
                        },
                        end_book: { type: 'integer', description: 'Ending book number' },
                        resolution_notes: { type: 'string', description: 'Resolution details' },
                        resolution_book: { type: 'integer', description: 'Book where resolved' }
                    },
                    required: ['thread_id']
                }
            },
            {
                name: 'get_plot_threads',
                description: 'Get plot threads for a series with filtering options',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        thread_type: { type: 'string', description: 'Filter by thread type' },
                        current_status: { type: 'string', description: 'Filter by status' },
                        book_number: { type: 'integer', description: 'Filter threads active in specific book' },
                        importance_min: { type: 'integer', description: 'Minimum importance level' }
                    },
                    required: ['series_id']
                }
            },

            // ===== STORY STRUCTURE TOOLS =====
            {
                name: 'create_story_structure',
                description: 'Create or update story structure analysis for a book',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { type: 'integer', description: 'Book ID' },
                        structure_type: { 
                            type: 'string', 
                            enum: ['three_act', 'hero_journey', 'dramatica', 'custom'],
                            default: 'three_act',
                            description: 'Type of story structure'
                        },
                        structure_data: { 
                            type: 'object', 
                            description: 'Structure-specific data (acts, beats, etc.)'
                        },
                        key_beats: { 
                            type: 'array', 
                            items: { type: 'string' },
                            description: 'Important story beats'
                        },
                        pacing_notes: { type: 'string', description: 'Notes about pacing' },
                        structure_notes: { type: 'string', description: 'Notes about structure' }
                    },
                    required: ['book_id']
                }
            },
            {
                name: 'get_story_structure',
                description: 'Get story structure analysis for a book',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { type: 'integer', description: 'Book ID' }
                    },
                    required: ['book_id']
                }
            }
        ];
    }

    // =============================================
    // COMPLETE TOOL HANDLER MAPPING
    // =============================================
    getToolHandler(toolName) {
        const handlers = {
            // Lookup System Handlers
            'get_available_options': this.handleGetAvailableOptions,
            
            // Plot Thread Handlers
            'create_plot_thread': this.handleCreatePlotThread,
            'update_plot_thread': this.handleUpdatePlotThread,
            'get_plot_threads': this.handleGetPlotThreads,
            
            // Story Structure Handlers
            'create_story_structure': this.handleCreateStoryStructure,
            'get_story_structure': this.handleGetStoryStructure
        };
        return handlers[toolName];
    }

    // =============================================
    // LOOKUP SYSTEM HANDLERS
    // =============================================
    async handleGetAvailableOptions(args) {
        try {
            const { option_type, genre_filter, active_only = true } = args;
            
            // For now, return basic genre information since we're working with the existing schema
            if (option_type === 'genres') {
                // Return basic genre list - this can be expanded when plot schema is added
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Available Genres (Basic List):\n\n` +
                                  `**Mystery** - Crime solving and investigation stories\n` +
                                  `**Romance** - Love and relationship focused stories\n` +
                                  `**Fantasy** - Magical and supernatural worlds\n` +
                                  `**Science Fiction** - Futuristic and technological stories\n` +
                                  `**Urban Fantasy** - Modern world with supernatural elements\n` +
                                  `**Thriller** - Suspense and tension driven stories\n\n` +
                                  `Note: This is a basic list. Full genre management requires plot schema migration.`
                        }
                    ]
                };
            }
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Plot management features require additional database schema. ` +
                              `Currently only basic genre information is available. ` +
                              `Run the plot schema migration to enable full functionality.`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to get available options: ${error.message}`);
        }
    }

    // =============================================
    // PLOT THREAD HANDLERS
    // =============================================
    async handleCreatePlotThread(args) {
        try {
            // For now, return a message indicating schema is needed
            return {
                content: [
                    {
                        type: 'text',
                        text: `Plot thread creation requires additional database schema. ` +
                              `Please run the plot management migration to enable this functionality.\n\n` +
                              `Requested thread details:\n` +
                              `- Title: ${args.title}\n` +
                              `- Type: ${args.thread_type}\n` +
                              `- Series ID: ${args.series_id}\n` +
                              `- Description: ${args.description}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to create plot thread: ${error.message}`);
        }
    }

    async handleUpdatePlotThread(args) {
        try {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Plot thread updates require additional database schema. ` +
                              `Please run the plot management migration to enable this functionality.`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to update plot thread: ${error.message}`);
        }
    }

    async handleGetPlotThreads(args) {
        try {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Plot thread retrieval requires additional database schema. ` +
                              `Please run the plot management migration to enable this functionality.\n\n` +
                              `Requested for Series ID: ${args.series_id}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get plot threads: ${error.message}`);
        }
    }

    // =============================================
    // STORY STRUCTURE HANDLERS
    // =============================================
    async handleCreateStoryStructure(args) {
        try {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Story structure management requires additional database schema. ` +
                              `Please run the plot management migration to enable this functionality.\n\n` +
                              `Requested structure:\n` +
                              `- Book ID: ${args.book_id}\n` +
                              `- Structure Type: ${args.structure_type || 'three_act'}\n` +
                              `- Key Beats: ${args.key_beats ? args.key_beats.length : 0} defined`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to create story structure: ${error.message}`);
        }
    }

    async handleGetStoryStructure(args) {
        try {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Story structure retrieval requires additional database schema. ` +
                              `Please run the plot management migration to enable this functionality.\n\n` +
                              `Requested for Book ID: ${args.book_id}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get story structure: ${error.message}`);
        }
    }
}

export { PlotMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[PLOT-SERVER] Module loaded');
    console.error('[PLOT-SERVER] MCP_STDIO_MODE:', process.env.MCP_STDIO_MODE);
    console.error('[PLOT-SERVER] import.meta.url:', import.meta.url);
    console.error('[PLOT-SERVER] process.argv[1]:', process.argv[1]);
}

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[PLOT-SERVER] normalized script path:', normalizedScriptPath);
    console.error('[PLOT-SERVER] is direct execution:', isDirectExecution);
}

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[PLOT-SERVER] Starting CLI runner...');
    }
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(PlotMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[PLOT-SERVER] CLI runner failed:', error.message);
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error('[PLOT-SERVER] CLI runner stack:', error.stack);
        }
        throw error;
    }
} else if (isDirectExecution) {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[PLOT-SERVER] Running in MCP stdio mode - starting server...');
    
    // When in MCP stdio mode, ensure clean stdout for JSON messages
    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[PLOT-SERVER] Setting up stdio mode handlers');
        // Redirect all console.log to stderr
        console.log = function(...args) {
            console.error('[PLOT-SERVER]', ...args);
        };
    }
    
    try {
        console.error('[PLOT-SERVER] Creating server instance...');
        const server = new PlotMCPServer();
        console.error('[PLOT-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[PLOT-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[PLOT-SERVER] Failed to start MCP server:', error.message);
        console.error('[PLOT-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[PLOT-SERVER] Module imported - not starting server');
        console.error('[PLOT-SERVER] Module export completed');
    }
}