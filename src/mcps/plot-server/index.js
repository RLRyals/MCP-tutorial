// src/mcps/plot-server/index.js
// Modular Plot MCP Server following the guide architecture
// Combines handler modules for plot threads, story analysis, and genre extensions

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';
import { PlotThreadHandlers } from './handlers/plot-thread-handlers.js';
import { StoryAnalysisHandlers } from './handlers/story-analysis-handlers.js';
import { GenreExtensions } from './handlers/genre-extensions.js';
import { lookupSystemToolsSchema } from './schemas/plot-tools-schema.js';

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
        
        // Initialize handler modules
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.storyAnalysisHandlers = new StoryAnalysisHandlers(this.db);
        this.genreExtensions = new GenreExtensions(this.db);
        
        // Mix in handler methods to this class
        Object.assign(this, this.plotThreadHandlers);
        Object.assign(this, this.storyAnalysisHandlers);
        Object.assign(this, this.genreExtensions);
        
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
    // ALL TOOLS ALWAYS AVAILABLE (NO GENRE FILTERING)
    // =============================================
    getTools() {
        return [
            // Lookup system tools
            ...lookupSystemToolsSchema,
            
            // Core plot thread tools
            ...this.plotThreadHandlers.getPlotThreadTools(),
            
            // Story analysis tools  
            ...this.storyAnalysisHandlers.getStoryAnalysisTools(),
            
            // ALL genre-specific tools (always available for multi-genre support)
            ...this.genreExtensions.getGenreSpecificTools('mystery'),
            ...this.genreExtensions.getGenreSpecificTools('romance'),
            ...this.genreExtensions.getGenreSpecificTools('fantasy')
        ];
    }

    // =============================================
    // COMPLETE TOOL HANDLER MAPPING
    // =============================================
    getToolHandler(toolName) {
        const handlers = {
            // Lookup System Handlers
            'get_available_options': this.handleGetAvailableOptions,
            
            // Plot Thread Handlers (from PlotThreadHandlers)
            'create_plot_thread': this.handleCreatePlotThread,
            'update_plot_thread': this.handleUpdatePlotThread,
            'get_plot_threads': this.handleGetPlotThreads,
            'link_plot_threads': this.handleLinkPlotThreads,
            'resolve_plot_thread': this.handleResolvePlotThread,
            
            // Story Analysis Handlers (from StoryAnalysisHandlers)
            'analyze_story_dynamics': this.handleAnalyzeStoryDynamics,
            'track_character_throughlines': this.handleTrackCharacterThroughlines,
            'identify_story_appreciations': this.handleIdentifyStoryAppreciations,
            'map_problem_solutions': this.handleMapProblemSolutions,
            
            // Mystery Genre Handlers (from GenreExtensions)
            'create_case': this.handleCreateCase,
            'add_evidence': this.handleAddEvidence,
            'track_clues': this.handleTrackClues,
            
            // Romance Genre Handlers (from GenreExtensions)
            'create_relationship_arc': this.handleCreateRelationshipArc,
            'track_romantic_tension': this.handleTrackRomanticTension,
            
            // Fantasy Genre Handlers (from GenreExtensions)
            'define_magic_system': this.handleDefineMagicSystem,
            'track_power_progression': this.handleTrackPowerProgression
        };
        return handlers[toolName];
    }

    // =============================================
    // LOOKUP SYSTEM HANDLERS
    // =============================================
    async handleGetAvailableOptions(args) {
        try {
            const { option_type } = args;
            
            // Map option types to their corresponding lookup tables
            const lookupTables = {
                'genres': { table: 'genres', nameCol: 'genre_name', descCol: 'genre_description' },
                'plot_thread_types': { table: 'plot_thread_types', nameCol: 'type_name', descCol: 'type_description' },
                'plot_thread_statuses': { table: 'plot_thread_statuses', nameCol: 'status_name', descCol: 'status_description' },
                'relationship_types': { table: 'relationship_types', nameCol: 'type_name', descCol: 'type_description' },
                'story_concerns': { table: 'story_concerns', nameCol: 'concern_name', descCol: 'concern_description' },
                'story_outcomes': { table: 'story_outcomes', nameCol: 'outcome_name', descCol: 'outcome_description' },
                'story_judgments': { table: 'story_judgments', nameCol: 'judgment_name', descCol: 'judgment_description' }
            };
            
            const lookupInfo = lookupTables[option_type];
            if (!lookupInfo) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Unknown option type: ${option_type}\n\n` +
                                  `Available types: ${Object.keys(lookupTables).join(', ')}`
                        }
                    ]
                };
            }
            
            try {
                const query = `
                    SELECT ${lookupInfo.nameCol}, ${lookupInfo.descCol} 
                    FROM ${lookupInfo.table} 
                    WHERE is_active = true 
                    ORDER BY ${lookupInfo.nameCol}
                `;
                
                const result = await this.db.query(query);
                
                if (result.rows.length > 0) {
                    let output = `# Available ${option_type.replace('_', ' ').toUpperCase()}\n\n`;
                    result.rows.forEach(row => {
                        const name = row[lookupInfo.nameCol];
                        const desc = row[lookupInfo.descCol];
                        output += `**${name}** - ${desc || 'No description'}\n`;
                    });
                    
                    return {
                        content: [
                            {
                                type: 'text',
                                text: output
                            }
                        ]
                    };
                } else {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No active ${option_type.replace('_', ' ')} found in lookup table.`
                            }
                        ]
                    };
                }
                
            } catch (dbError) {
                // Fallback if lookup table doesn't exist
                if (option_type === 'genres') {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `# Available Genres (Fallback List)\n\n` +
                                      `**mystery** - Crime solving and investigation stories\n` +
                                      `**romance** - Love and relationship focused stories\n` +
                                      `**fantasy** - Magical and supernatural worlds\n` +
                                      `**science_fiction** - Futuristic and technological stories\n` +
                                      `**thriller** - Suspense and tension driven stories\n\n` +
                                      `*Note: Run migration 004_plot_structure_and_universal_framework_fixed.sql for full lookup table support.*`
                            }
                        ]
                    };
                }
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Lookup table for ${option_type} not available.\n\n` +
                                  `Run migration 004_plot_structure_and_universal_framework_fixed.sql to enable all lookup tables.\n\n` +
                                  `Error: ${dbError.message}`
                        }
                    ]
                };
            }        } catch (error) {
            throw new Error(`Failed to get available options: ${error.message}`);
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