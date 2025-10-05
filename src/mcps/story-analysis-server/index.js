// src/mcps/story-analysis-server/index.js
// OPTIONAL Story Analysis MCP Server
// This server provides tools for analyzing story structure using narrative theory principles.
// To enable/disable this server, see the configuration instructions in the README.

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';
import { StoryAnalysisHandlers } from './handlers/story-analysis-handlers.js';
import {
    lookupSystemToolsSchema,
    storyAnalysisToolsSchema
} from './schemas/story-analysis-tools-schema.js';

class StoryAnalysisMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[STORY-ANALYSIS-SERVER] Constructor starting...');
        try {
            super('story-analysis', '1.0.0');
            console.error('[STORY-ANALYSIS-SERVER] Constructor completed successfully');
        } catch (error) {
            console.error('[STORY-ANALYSIS-SERVER] Constructor failed:', error.message);
            throw error;
        }

        // Initialize handler module
        try {
            this.storyAnalysisHandlers = new StoryAnalysisHandlers(this.db);
            console.error('[STORY-ANALYSIS-SERVER] Story analysis handlers initialized');
        } catch (error) {
            console.error('[STORY-ANALYSIS-SERVER] Handler initialization failed:', error.message);
            throw error;
        }

        // Bind handler methods
        this.bindHandlerMethods();

        // Initialize tools
        this.tools = this.getTools();

        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[STORY-ANALYSIS-SERVER] WARNING: Tools not properly initialized!');
            this.tools = [...lookupSystemToolsSchema];
        }

        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[STORY-ANALYSIS-SERVER] Initialized with ${this.tools.length} tools`);
        }

        this.testDatabaseConnection();
    }

    bindHandlerMethods() {
        try {
            // Bind story analysis handler methods
            this.handleAnalyzeStoryDynamics = this.storyAnalysisHandlers.handleAnalyzeStoryDynamics.bind(this.storyAnalysisHandlers);
            this.handleTrackCharacterThroughlines = this.storyAnalysisHandlers.handleTrackCharacterThroughlines.bind(this.storyAnalysisHandlers);
            this.handleIdentifyStoryAppreciations = this.storyAnalysisHandlers.handleIdentifyStoryAppreciations.bind(this.storyAnalysisHandlers);
            this.handleMapProblemSolutions = this.storyAnalysisHandlers.handleMapProblemSolutions.bind(this.storyAnalysisHandlers);

            console.error('[STORY-ANALYSIS-SERVER] All handler methods bound successfully');
        } catch (error) {
            console.error('[STORY-ANALYSIS-SERVER] Method binding failed:', error.message);
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
                    console.error('[STORY-ANALYSIS-SERVER] Database connection verified');
                } else {
                    console.error('[STORY-ANALYSIS-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[STORY-ANALYSIS-SERVER] Database connection test failed:', error.message);
        }
    }

    getTools() {
        try {
            const tools = [
                // Lookup system tools (read-only)
                ...lookupSystemToolsSchema,

                // Story analysis tools
                ...storyAnalysisToolsSchema
            ];

            console.error(`[STORY-ANALYSIS-SERVER] Tools registered: ${tools.length} total`);
            return tools;
        } catch (error) {
            console.error('[STORY-ANALYSIS-SERVER] Tool registration failed:', error.message);
            return [...lookupSystemToolsSchema];
        }
    }

    getToolHandler(toolName) {
        const handlers = {
            // Lookup System Handler (read-only)
            'get_available_options': this.handleGetAvailableOptions,

            // Story Analysis Handlers
            'analyze_story_dynamics': this.handleAnalyzeStoryDynamics,
            'track_character_throughlines': this.handleTrackCharacterThroughlines,
            'identify_story_appreciations': this.handleIdentifyStoryAppreciations,
            'map_problem_solutions': this.handleMapProblemSolutions
        };

        const handler = handlers[toolName];
        if (!handler) {
            console.error(`[STORY-ANALYSIS-SERVER] No handler found for tool: ${toolName}`);
        }
        return handler;
    }

    // =============================================
    // LOOKUP SYSTEM HANDLER
    // =============================================
    async handleGetAvailableOptions(args) {
        try {
            const { option_type } = args;

            // Map option types to their corresponding lookup tables
            const lookupTables = {
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
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Lookup table for ${option_type} not available. This requires the story analysis database schema.\n\n` +
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

export { StoryAnalysisMCPServer };

// CLI runner when called directly
import { fileURLToPath } from 'url';

if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[STORY-ANALYSIS-SERVER] Module loaded');
}

// Normalize paths for cross-platform compatibility
const currentModuleUrl = import.meta.url;
let scriptPath = process.argv[1];
if (scriptPath.includes('\\')) {
    scriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
} else {
    scriptPath = `file://${scriptPath}`;
}
const normalizedCurrentUrl = decodeURIComponent(currentModuleUrl);
const normalizedScriptPath = decodeURIComponent(scriptPath);
const isDirectExecution = normalizedCurrentUrl === normalizedScriptPath || process.env.MCP_STDIO_MODE === 'true';

if (process.env.MCP_STDIO_MODE === 'true') {
    console.error('[STORY-ANALYSIS-SERVER] Running in MCP stdio mode - starting server...');

    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[STORY-ANALYSIS-SERVER] Setting up stdio mode handlers');
        console.log = function(...args) {
            console.error('[STORY-ANALYSIS-SERVER]', ...args);
        };
    }

    try {
        console.error('[STORY-ANALYSIS-SERVER] Creating server instance...');
        const server = new StoryAnalysisMCPServer();
        console.error('[STORY-ANALYSIS-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[STORY-ANALYSIS-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[STORY-ANALYSIS-SERVER] Failed to start MCP server:', error.message);
        console.error('[STORY-ANALYSIS-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[STORY-ANALYSIS-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(StoryAnalysisMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[STORY-ANALYSIS-SERVER] CLI runner failed:', error.message);
        process.exit(1);
    }
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[STORY-ANALYSIS-SERVER] Module imported - not starting server');
    }
}
