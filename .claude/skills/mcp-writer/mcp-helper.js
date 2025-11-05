// .claude/skills/mcp-writer/mcp-helper.js
// Helper utilities for interacting with MCP servers through code execution

import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../../..');

/**
 * MCPHelper - Simplified interface for working with MCP servers
 * This class provides a high-level API for discovering and interacting with
 * MCP servers through direct code execution (not config files).
 */
export class MCPHelper {
    constructor() {
        this.servers = new Map();
        this.mcpPaths = {
            main: join(PROJECT_ROOT, 'src/mcps'),
            config: join(PROJECT_ROOT, 'src/config-mcps')
        };
    }

    /**
     * Discover all available MCP servers in the project
     * @param {Object} options - Discovery options
     * @param {boolean} options.includeReference - Include reference-only servers (default: true)
     * @returns {Promise<Array>} List of available MCP servers with metadata
     */
    async discoverServers({ includeReference = true } = {}) {
        const servers = [];

        // Scan main MCPs (database-organized)
        try {
            const mainServers = readdirSync(this.mcpPaths.main, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
                .map(dirent => ({
                    name: dirent.name,
                    path: join(this.mcpPaths.main, dirent.name, 'index.js'),
                    type: 'database-organized',
                    category: 'database-structure',
                    // Only author-server is actively used from this directory
                    recommended: dirent.name === 'author-server',
                    usage: dirent.name === 'author-server' ? 'active' : 'reference',
                    description: this.getServerDescription(dirent.name, 'main')
                }));

            if (includeReference) {
                servers.push(...mainServers);
            } else {
                // Only include author-server when reference servers are excluded
                servers.push(...mainServers.filter(s => s.usage === 'active'));
            }
        } catch (error) {
            console.error('Error scanning main MCPs:', error.message);
        }

        // Scan config MCPs (writing-phase organized) - all are actively used
        try {
            const configServers = readdirSync(this.mcpPaths.config, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
                .map(dirent => ({
                    name: dirent.name,
                    path: join(this.mcpPaths.config, dirent.name, 'index.js'),
                    type: 'writing-phase',
                    category: 'workflow-organized',
                    recommended: true, // All config-mcps are recommended
                    usage: 'active',
                    description: this.getServerDescription(dirent.name, 'config')
                }));
            servers.push(...configServers);
        } catch (error) {
            console.error('Error scanning config MCPs:', error.message);
        }

        return servers;
    }

    /**
     * Get recommended servers only (author-server + all config-mcps)
     * @returns {Promise<Array>} List of recommended servers
     */
    async discoverRecommendedServers() {
        const allServers = await this.discoverServers({ includeReference: false });
        return allServers.filter(s => s.recommended);
    }

    /**
     * Get server description based on name
     * @param {string} name - Server name
     * @param {string} type - Server type (main or config)
     * @returns {string} Description
     */
    getServerDescription(name, type) {
        const descriptions = {
            // Main (database-organized)
            'author-server': 'Manage author profiles and metadata',
            'series-server': 'Database-organized series management (reference)',
            'book-server': 'Database-organized book tracking (reference)',
            'character-server': 'Database-organized character data (reference)',
            'plot-server': 'Database-organized plot structures (reference)',
            'world-server': 'Database-organized worldbuilding (reference)',
            'timeline-server': 'Database-organized timeline data (reference)',
            'trope-server': 'Database-organized trope tracking (reference)',
            'relationship-server': 'Database-organized relationships (reference)',
            'writing-server': 'Database-organized writing sessions (reference)',
            'metadata-server': 'Database-organized metadata storage (reference)',
            'story-analysis-server': 'Database-organized story analysis (reference)',

            // Config (writing-phase organized)
            'series-planning-server': 'Series planning and structure workflows',
            'book-planning-server': 'Book structure planning workflows',
            'chapter-planning-server': 'Chapter organization workflows',
            'charater-planning-server': 'Character development planning workflows',
            'scene-server': 'Scene management across writing phases',
            'review-server': 'Review and feedback workflows',
            'core-continuity-server': 'Continuity tracking throughout writing',
            'reporting-server': 'Analytics and reporting on writing progress'
        };

        return descriptions[name] || `${name} - No description available`;
    }

    /**
     * Connect to a specific MCP server
     * @param {string} serverName - Name of the server (e.g., 'series-server')
     * @returns {Promise<Object>} Server instance with tools and handlers
     */
    async connectToServer(serverName) {
        // Check if already connected
        if (this.servers.has(serverName)) {
            return this.servers.get(serverName);
        }

        // Find server path
        const servers = await this.discoverServers();
        const serverInfo = servers.find(s => s.name === serverName);

        if (!serverInfo) {
            throw new Error(`Server '${serverName}' not found. Available: ${servers.map(s => s.name).join(', ')}`);
        }

        try {
            // Dynamically import the server module
            const modulePath = `file://${serverInfo.path}`;
            const module = await import(modulePath);

            // Get the server class (look for common export patterns)
            const ServerClass = module.default ||
                               module[this.getServerClassName(serverName)] ||
                               Object.values(module).find(exp => typeof exp === 'function' && exp.name.includes('Server'));

            if (!ServerClass) {
                throw new Error(`Could not find server class in ${serverName}`);
            }

            // Create server instance
            const serverInstance = new ServerClass();

            // Get tools
            const tools = serverInstance.getTools();

            // Store in cache
            this.servers.set(serverName, {
                instance: serverInstance,
                tools: tools,
                info: serverInfo
            });

            return this.servers.get(serverName);
        } catch (error) {
            throw new Error(`Failed to connect to ${serverName}: ${error.message}`);
        }
    }

    /**
     * Get the expected class name for a server
     * @param {string} serverName - Server name like 'series-server'
     * @returns {string} Class name like 'SeriesMCPServer'
     */
    getServerClassName(serverName) {
        return serverName
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('') + (serverName.endsWith('-server') ? '' : 'MCPServer');
    }

    /**
     * Call a tool on a specific server
     * @param {string} serverName - Name of the server
     * @param {string} toolName - Name of the tool to call
     * @param {Object} args - Arguments for the tool
     * @returns {Promise<any>} Result from the tool
     */
    async callTool(serverName, toolName, args = {}) {
        const server = await this.connectToServer(serverName);

        // Check if tool exists
        const tool = server.tools.find(t => t.name === toolName);
        if (!tool) {
            const available = server.tools.map(t => t.name).join(', ');
            throw new Error(`Tool '${toolName}' not found in ${serverName}. Available: ${available}`);
        }

        // Get the handler
        const handler = server.instance.getToolHandler(toolName);
        if (!handler) {
            throw new Error(`Handler for '${toolName}' not found in ${serverName}`);
        }

        // Call the handler
        try {
            return await handler(args);
        } catch (error) {
            throw new Error(`Error calling ${serverName}.${toolName}: ${error.message}`);
        }
    }

    /**
     * Execute multiple tool calls in batch
     * @param {string} serverName - Name of the server
     * @param {Array<{tool: string, args: Object}>} calls - Array of tool calls
     * @returns {Promise<Array>} Results from all calls
     */
    async batchCall(serverName, calls) {
        const results = [];
        for (const call of calls) {
            try {
                const result = await this.callTool(serverName, call.tool, call.args);
                results.push({ success: true, data: result, tool: call.tool });
            } catch (error) {
                results.push({ success: false, error: error.message, tool: call.tool });
            }
        }
        return results;
    }

    /**
     * Get list of available tools for a server
     * @param {string} serverName - Name of the server
     * @returns {Promise<Array>} List of tools with metadata
     */
    async listTools(serverName) {
        const server = await this.connectToServer(serverName);
        return server.tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
        }));
    }

    /**
     * Execute a complex workflow across multiple servers
     * @param {Object} workflow - Workflow definition
     * @returns {Promise<Object>} Workflow results
     *
     * Example workflow:
     * {
     *   steps: [
     *     { server: 'series-server', tool: 'get_series', args: { series_id: 1 }, save: 'series' },
     *     { server: 'character-server', tool: 'list_characters', args: { series_id: '${series.series_id}' } }
     *   ]
     * }
     */
    async executeWorkflow(workflow) {
        const context = {};
        const results = [];

        for (const step of workflow.steps) {
            try {
                // Resolve variables in args
                const resolvedArgs = this.resolveVariables(step.args, context);

                // Execute the step
                const result = await this.callTool(step.server, step.tool, resolvedArgs);

                // Save to context if requested
                if (step.save) {
                    context[step.save] = result;
                }

                results.push({
                    step: step,
                    success: true,
                    result: result
                });
            } catch (error) {
                results.push({
                    step: step,
                    success: false,
                    error: error.message
                });

                // Stop on error if not marked as optional
                if (!step.optional) {
                    break;
                }
            }
        }

        return {
            context: context,
            results: results,
            success: results.every(r => r.success)
        };
    }

    /**
     * Resolve variables in arguments using context
     * @param {Object} args - Arguments with potential variables
     * @param {Object} context - Context with saved values
     * @returns {Object} Resolved arguments
     */
    resolveVariables(args, context) {
        const resolved = {};

        for (const [key, value] of Object.entries(args)) {
            if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
                // Extract variable path (e.g., '${series.series_id}' -> ['series', 'series_id'])
                const path = value.slice(2, -1).split('.');
                let resolvedValue = context;

                for (const part of path) {
                    resolvedValue = resolvedValue?.[part];
                }

                resolved[key] = resolvedValue;
            } else {
                resolved[key] = value;
            }
        }

        return resolved;
    }

    /**
     * Close all server connections and cleanup
     * @returns {Promise<void>}
     */
    async close() {
        const closePromises = [];

        for (const [serverName, server] of this.servers.entries()) {
            try {
                if (server.instance.db && typeof server.instance.db.close === 'function') {
                    closePromises.push(server.instance.db.close());
                }
            } catch (error) {
                console.error(`Error closing ${serverName}:`, error.message);
            }
        }

        await Promise.all(closePromises);
        this.servers.clear();
    }

    /**
     * Get a summary of all connected servers
     * @returns {Object} Summary of connections
     */
    getConnectionSummary() {
        const summary = {
            connected: this.servers.size,
            servers: []
        };

        for (const [name, server] of this.servers.entries()) {
            summary.servers.push({
                name: name,
                toolCount: server.tools.length,
                tools: server.tools.map(t => t.name),
                type: server.info.type,
                category: server.info.category
            });
        }

        return summary;
    }
}

/**
 * Quick helper functions for common operations
 */

/**
 * List all series in the database
 * @returns {Promise<Array>} List of series
 */
export async function listAllSeries() {
    const helper = new MCPHelper();
    try {
        return await helper.callTool('series-server', 'list_series', {});
    } finally {
        await helper.close();
    }
}

/**
 * Get full details about a series including related data
 * @param {number} seriesId - Series ID
 * @returns {Promise<Object>} Series with characters, books, plots, etc.
 */
export async function getSeriesFullDetails(seriesId) {
    const helper = new MCPHelper();
    try {
        const workflow = {
            steps: [
                { server: 'series-server', tool: 'get_series', args: { series_id: seriesId }, save: 'series' },
                { server: 'character-server', tool: 'list_characters', args: { series_id: seriesId }, save: 'characters', optional: true },
                { server: 'book-server', tool: 'list_books', args: { series_id: seriesId }, save: 'books', optional: true },
                { server: 'plot-server', tool: 'list_plot_arcs', args: { series_id: seriesId }, save: 'plots', optional: true }
            ]
        };

        const result = await helper.executeWorkflow(workflow);
        return result.context;
    } finally {
        await helper.close();
    }
}

/**
 * Create a new series with basic setup
 * @param {Object} seriesData - Series information
 * @returns {Promise<Object>} Created series
 */
export async function createNewSeries(seriesData) {
    const helper = new MCPHelper();
    try {
        return await helper.callTool('series-server', 'create_series', seriesData);
    } finally {
        await helper.close();
    }
}

// Export helper as default
export default MCPHelper;
