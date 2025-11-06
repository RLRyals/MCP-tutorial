// src/config-mcps/reporting-server/index.js
// Phase-based MCP Server: Reporting
// Generate comprehensive reports of series/book entities with organized lists

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

import { ReportingHandlers } from './handlers/reporting-handlers.js';
import { reportingToolsSchema } from './schemas/reporting-tools-schema.js';



class ReportingMCPServer extends BaseMCPServer {
    constructor() {
        super('reporting-server', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build tool list
        this.tools = this.buildTools();

        console.error(`[REPORTING-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create handler instance passing our shared database
        this.reportingHandlers = new ReportingHandlers(this.db);

        console.error('[REPORTING-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // Add reporting tools
        reportingToolsSchema.forEach(tool => {
            tools.push({
                ...tool,
                name: `${tool.name}`,
                description: ` ${tool.description}`
            });
        });

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            'generate_report': this.reportingHandlers.handleGenerateReport.bind(this.reportingHandlers)
        };

        return handlerMap[toolName] || null;
    }
}

export { ReportingMCPServer };

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
    console.error('[REPORTING-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new ReportingMCPServer();
        await server.run();
    } catch (error) {
        console.error('[REPORTING-SERVER] Failed to start MCP server:', error.message);
        console.error('[REPORTING-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[REPORTING-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(ReportingMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[REPORTING-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[REPORTING-SERVER] Module imported - not starting server');
}
