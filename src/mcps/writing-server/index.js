#!/usr/bin/env node
// Protect stdout from any pollution in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

//import { DatabaseManager } from '../../shared/database.js';
import { BaseMCPServer } from '../../shared/base-server.js';

// Import handler modules
import { SessionHandlers } from './handlers/session-handlers.js';
import { ValidationHandlers } from './handlers/validation-handlers.js'; 
import { ExportHandlers } from './handlers/export-handlers.js';

class WritingMCPServer extends BaseMCPServer {
    constructor() {
           
        console.error('[WRITING-SERVER] Constructor starting...');
        try {
            super('writing-manager', '1.0.0');
            console.error('[WRITING-SERVER] Base constructor completed');
        } catch (error) {
            console.error('[WRITING-SERVER] Constructor failed:', error.message);
            throw error;
        }

        // Mix in all handler modules - AI writing team gets access to all tools
        this.sessionHandlers = new SessionHandlers(this.db);
        this.validationHandlers = new ValidationHandlers(this.db);
        this.exportHandlers = new ExportHandlers(this.db);
        
         this.bindHandlerMethods();
        // Combine all tools for AI writing team
        this.tools = this.getTools();
    }

    bindHandlerMethods() {
        // Session handlers
        this.handleLogWritingSession = this.sessionHandlers.handleLogWritingSession.bind(this.sessionHandlers);
        this.handleGetWritingProgress = this.sessionHandlers.handleGetWritingProgress.bind(this.sessionHandlers);
        this.handleSetWritingGoals = this.sessionHandlers.handleSetWritingGoals.bind(this.sessionHandlers);
        this.handleGetProductivityAnalytics = this.sessionHandlers.handleGetProductivityAnalytics.bind(this.sessionHandlers);

        // Validation handlers
        this.handleValidateChapterStructure = this.validationHandlers.handleValidateChapterStructure.bind(this.validationHandlers);
        this.handleValidateBeatPlacement = this.validationHandlers.handleValidateBeatPlacement.bind(this.validationHandlers);
        this.handleCheckStructureViolations = this.validationHandlers.handleCheckStructureViolations.bind(this.validationHandlers);

        // Export handlers
        this.handleExportManuscript = this.exportHandlers.handleExportManuscript.bind(this.exportHandlers);
        this.handleWordCountTracking = this.exportHandlers.handleWordCountTracking.bind(this.exportHandlers);
    }
    
    getTools() {
        return [
            // Writing session tracking tools for AI team
            ...this.sessionHandlers.getSessionTools(),
            // Validation tools for AI team quality checking
            ...this.validationHandlers.getValidationTools(),
            // Export tools for AI team manuscript preparation
            ...this.exportHandlers.getExportTools()
        ];
    }
    // =============================================
    // COMPLETE TOOL HANDLER MAPPING
    // =============================================
    getToolHandler(toolName) {
        const handlers = {
            // Session management tools
            'log_writing_session': this.handleLogWritingSession,
            'get_writing_progress': this.handleGetWritingProgress,
            'set_writing_goals': this.handleSetWritingGoals,
            'get_productivity_analytics': this.handleGetProductivityAnalytics,

            // Validation tools
            'validate_chapter_structure': this.handleValidateChapterStructure,
            'validate_beat_placement': this.handleValidateBeatPlacement,
            'check_structure_violations': this.handleCheckStructureViolations,

            // Export tools
            'export_manuscript': this.handleExportManuscript,
            'word_count_tracking': this.handleWordCountTracking
        };
        return handlers[toolName];
    }
    async handleToolCall(name, args) {
        try {
            // Route tool calls to appropriate handlers
            // AI writing team can call any of these tools automatically
            
            // Session management calls
            if (name === 'log_writing_session') {
                return await this.handleLogWritingSession(args);
            }
            if (name === 'get_writing_progress') {
                return await this.handleGetWritingProgress(args);
            }
            if (name === 'set_writing_goals') {
                return await this.handleSetWritingGoals(args);
            }
            if (name === 'get_productivity_analytics') {
                return await this.handleGetProductivityAnalytics(args);
            }

            // Validation calls - AI team checks quality automatically
            if (name === 'validate_chapter_structure') {
                return await this.handleValidateChapterStructure(args);
            }
            if (name === 'validate_beat_placement') {
                return await this.handleValidateBeatPlacement(args);
            }
            if (name === 'check_structure_violations') {
                return await this.handleCheckStructureViolations(args);
            }

            // Export calls - AI team prepares manuscripts
            if (name === 'export_manuscript') {
                return await this.handleExportManuscript(args);
            }
            if (name === 'word_count_tracking') {
                return await this.handleWordCountTracking(args);
            }

            throw new Error(`Unknown tool: ${name}`);
        } catch (error) {
            console.error(`Error in ${name}:`, error);
            throw error;
        }
    }

    // Health check for AI writing team to verify system status
    async healthCheck() {
        try {
            await this.db.healthCheck();
            
            // Check that critical tables exist for writing management
            const tables = ['writing_sessions', 'writing_goals', 'validation_rules', 'manuscript_exports'];
            for (const table of tables) {
                await this.db.query(`SELECT 1 FROM ${table} LIMIT 1`);
            }
            
            return {
                status: 'healthy',
                message: 'Writing management system operational',
                capabilities: [
                    'session_tracking',
                    'goal_management', 
                    'structure_validation',
                    'manuscript_export'
                ]
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: error.message,
                missing_capabilities: ['writing_management']
            };
        }
    }

    // Integration helper for AI writing team to coordinate with other MCPs
    async getIntegrationStatus() {
        try {
            // Check integration with Character and Plot servers
            const characterConnection = await this.db.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_name = 'characters'
            `);
            
            const plotConnection = await this.db.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_name = 'plot_threads'
            `);

            return {
                character_integration: characterConnection.rows[0].count > 0,
                plot_integration: plotConnection.rows[0].count > 0,
                writing_capabilities: [
                    'session_logging',
                    'progress_tracking', 
                    'quality_validation',
                    'manuscript_compilation'
                ]
            };
        } catch (error) {
            console.error('Integration check failed:', error);
            return {
                character_integration: false,
                plot_integration: false,
                error: error.message
            };
        }
    }

    // Cleanup method
    async close() {
        if (this.db) {
            await this.db.close();
        }
    }
}

// Handle process termination gracefully
const server = new WritingMCPServer();

process.on('SIGINT', async () => {
    console.log('\nShutting down Writing Management server...');
    await server.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down Writing Management server...');
    await server.close();
    process.exit(0);
});

// Export for testing or if run as module

export { WritingMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[WRITING-SERVER] Module loaded');
}

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    console.error('[WRITING-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(WritingMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[WRITING-SERVER] CLI runner failed:', error.message);
        process.exit(1);
    }
} else if (isDirectExecution) {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[WRITING-SERVER] Running in MCP stdio mode - starting server...');
    
    // When in MCP stdio mode, ensure clean stdout for JSON messages
    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[WRITING-SERVER] Setting up stdio mode handlers');
        // Redirect all console.log to stderr
        console.log = function(...args) {
            console.error('[WRITING-SERVER]', ...args);
        };
    }
    
    try {
        console.error('[WRITING-SERVER] Creating server instance...');
        const server = new WritingMCPServer();
        console.error('[WRITING-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[WRITING-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[WRITING-SERVER] Failed to start MCP server:', error.message);
        console.error('[WRITING-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[WRITING-SERVER] Module imported - not starting server');
    }
}