// src/mcps/plot-server/index.js
// COMPLETELY FIXED VERSION - Modular Plot MCP Server with proper method binding
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
import { TropeHandlers } from './handlers/trope-handlers.js'; 
import { 
    lookupSystemToolsSchema, 
    plotThreadToolsSchema, 

    storyAnalysisToolsSchema,
    genreExtensionToolsSchema,
    tropeToolsSchema 

} from './schemas/plot-tools-schema.js';

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
        
        // Initialize handler modules with error handling
        try {
            this.plotThreadHandlers = new PlotThreadHandlers(this.db);
            console.error('[PLOT-SERVER] Plot thread handlers initialized');
            
            this.storyAnalysisHandlers = new StoryAnalysisHandlers(this.db);
            console.error('[PLOT-SERVER] Story analysis handlers initialized');
            
             this.genreExtensions = new GenreExtensions(this.db);
             console.error('[PLOT-SERVER] Genre extensions initialized');

            this.tropeHandlers = new TropeHandlers(this.db);
            console.error('[PLOT-SERVER] Trope handlers initialized');
       
        } catch (error) {
            console.error('[PLOT-SERVER] Handler initialization failed:', error.message);
            throw error;
        }
        
        // FIXED: Properly bind handler methods to maintain context
        this.bindHandlerMethods();
        
        // FIXED: Use direct schema imports instead of handler methods that might fail
        this.tools = this.getTools();
        
        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[PLOT-SERVER] WARNING: Tools not properly initialized!');
            // Fallback to basic tools only
            this.tools = [...lookupSystemToolsSchema];
        }
        
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[PLOT-SERVER] Initialized with ${this.tools.length} tools`);
        }
        
        this.testDatabaseConnection();
    }

    // FIXED: Proper method binding to maintain context
    bindHandlerMethods() {
        try {
            // Bind plot thread handler methods
            this.handleCreatePlotThread = this.plotThreadHandlers.handleCreatePlotThread.bind(this.plotThreadHandlers);
            this.handleUpdatePlotThread = this.plotThreadHandlers.handleUpdatePlotThread.bind(this.plotThreadHandlers);
            this.handleGetPlotThreads = this.plotThreadHandlers.handleGetPlotThreads.bind(this.plotThreadHandlers);
            this.handleLinkPlotThreads = this.plotThreadHandlers.handleLinkPlotThreads.bind(this.plotThreadHandlers);
            this.handleResolvePlotThread = this.plotThreadHandlers.handleResolvePlotThread.bind(this.plotThreadHandlers);
            
            // Bind story analysis handler methods
            this.handleAnalyzeStoryDynamics = this.storyAnalysisHandlers.handleAnalyzeStoryDynamics.bind(this.storyAnalysisHandlers);
            this.handleTrackCharacterThroughlines = this.storyAnalysisHandlers.handleTrackCharacterThroughlines.bind(this.storyAnalysisHandlers);
            this.handleIdentifyStoryAppreciations = this.storyAnalysisHandlers.handleIdentifyStoryAppreciations.bind(this.storyAnalysisHandlers);
            this.handleMapProblemSolutions = this.storyAnalysisHandlers.handleMapProblemSolutions.bind(this.storyAnalysisHandlers);
            
             // Bind universal genre extension methods
            this.handleCreateInformationReveal = this.genreExtensions.handleCreateInformationReveal.bind(this.genreExtensions);
            this.handleCreateRelationshipArc = this.genreExtensions.handleCreateRelationshipArc.bind(this.genreExtensions);
            this.handleDefineWorldSystem = this.genreExtensions.handleDefineWorldSystem.bind(this.genreExtensions);
            this.handleAddRevealEvidence = this.genreExtensions.handleAddRevealEvidence.bind(this.genreExtensions);
            this.handleTrackRelationshipDynamics = this.genreExtensions.handleTrackRelationshipDynamics.bind(this.genreExtensions);
            this.handleTrackSystemProgression = this.genreExtensions.handleTrackSystemProgression.bind(this.genreExtensions);

            
            // Bind trope handler methods
            this.handleCreateTrope = this.tropeHandlers.handleCreateTrope.bind(this.tropeHandlers);
            this.handleGetTrope = this.tropeHandlers.handleGetTrope.bind(this.tropeHandlers);
            this.handleListTropes = this.tropeHandlers.handleListTropes.bind(this.tropeHandlers);
            this.handleCreateTropeInstance = this.tropeHandlers.handleCreateTropeInstance.bind(this.tropeHandlers);
            this.handleGetTropeInstance = this.tropeHandlers.handleGetTropeInstance.bind(this.tropeHandlers);
            this.handleListTropeInstances = this.tropeHandlers.handleListTropeInstances.bind(this.tropeHandlers);
            this.handleImplementTropeScene = this.tropeHandlers.handleImplementTropeScene.bind(this.tropeHandlers);
            this.handleGetTropeProgress = this.tropeHandlers.handleGetTropeProgress.bind(this.tropeHandlers);
            this.handleAnalyzeTropePatterns = this.tropeHandlers.handleAnalyzeTropePatterns.bind(this.tropeHandlers);

            console.error('[PLOT-SERVER] All handler methods bound successfully');
        } catch (error) {
            console.error('[PLOT-SERVER] Method binding failed:', error.message);
            throw error;
        }
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
    // FIXED: Use direct schema imports for tools
    // =============================================
    getTools() {
        try {
            const tools = [
                // Lookup system tools (always working)
                ...lookupSystemToolsSchema,
                
                // Core plot thread tools
                ...plotThreadToolsSchema,
                
                // Story analysis tools  
                ...storyAnalysisToolsSchema,
                

                // Trope system tools
                ...tropeToolsSchema,

                //Universal genre tools
                ...genreExtensionToolsSchema

            ];
            
            console.error(`[PLOT-SERVER] Tools registered: ${tools.length} total`);
            return tools;
        } catch (error) {
            console.error('[PLOT-SERVER] Tool registration failed:', error.message);
            // Return at least the working lookup tools
            return [...lookupSystemToolsSchema];
        }
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
            'link_plot_threads': this.handleLinkPlotThreads,
            'resolve_plot_thread': this.handleResolvePlotThread,
            
            // Story Analysis Handlers
            'analyze_story_dynamics': this.handleAnalyzeStoryDynamics,
            'track_character_throughlines': this.handleTrackCharacterThroughlines,
            'identify_story_appreciations': this.handleIdentifyStoryAppreciations,
            'map_problem_solutions': this.handleMapProblemSolutions,
            
            // Universal Genre Handlers (replaces old genre-specific ones)
            'create_information_reveal': this.handleCreateInformationReveal,
            'create_relationship_arc': this.handleCreateRelationshipArc,
            'define_world_system': this.handleDefineWorldSystem,
            'add_reveal_evidence': this.handleAddRevealEvidence,
            'track_relationship_dynamics': this.handleTrackRelationshipDynamics,
            'track_system_progression': this.handleTrackSystemProgression,
            
            // Trope Handlers (optional chaining for safety)
            'create_trope': this.handleCreateTrope,
            'get_trope': this.handleGetTrope,
            'list_tropes': this.handleListTropes,
            'create_trope_instance': this.handleCreateTropeInstance,
            'get_trope_instance': this.handleGetTropeInstance,
            'list_trope_instances': this.handleListTropeInstances,
            'implement_trope_scene': this.handleImplementTropeScene,
            'get_trope_progress': this.handleGetTropeProgress,
            'analyze_trope_patterns': this.handleAnalyzeTropePatterns
        };
        
        const handler = handlers[toolName];
        if (!handler) {
            console.error(`[PLOT-SERVER] No handler found for tool: ${toolName}`);
        }
        return handler;
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
                                text: `# Available GENRES\n\n` +
                                      `**action_adventure** - Fast-paced stories with exciting adventures and conflicts\n` +
                                      `**contemporary** - Stories set in the present day with realistic scenarios\n` +
                                      `**fantasy** - Stories set in imaginary worlds with magical or supernatural elements\n` +
                                      `**historical_fiction** - Stories set in the past with historical accuracy and detail\n` +
                                      `**literary_fiction** - Character-driven stories with artistic and literary merit\n` +
                                      `**mystery** - Stories involving puzzles, crimes, or unexplained events to be solved\n` +
                                      `**romance** - Stories focused on romantic relationships and emotional connection\n` +
                                      `**science_fiction** - Stories set in the future or alternative worlds with advanced technology\n` +
                                      `**thriller** - Stories designed to create suspense, excitement, and tension\n` +
                                      `**young_adult** - Stories targeted at teenage readers with coming-of-age themes\n\n` +
                                      `*Note: This is a fallback list. Run the plot schema migration for full lookup table support.*`
                            }
                        ]
                    };
                }
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Lookup table for ${option_type} not available. This requires the plot management database schema.\n\n` +
                                  `Error: ${dbError.message}`
                        }
                    ]
                };
            }
        } catch (error) {
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
}

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    console.error('[PLOT-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(PlotMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[PLOT-SERVER] CLI runner failed:', error.message);
        process.exit(1);
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
    }
}