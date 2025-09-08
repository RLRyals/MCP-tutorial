// src/mcps/series-server/index.js
// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        // Keep the original console.error functionality but write to stderr instead
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

class SeriesMCPServer extends BaseMCPServer {
    constructor() {
        super('series-manager', '1.0.0');
        // Initialize tools after base constructor
        this.tools = this.getTools();
        
        // Defensive check to ensure tools are properly initialized
        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[SERIES-SERVER] WARNING: Tools not properly initialized!');
            this.tools = this.getTools(); // Try again
        }
        
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[SERIES-SERVER] Initialized with ${this.tools.length} tools`);
        }
        
        // Test database connection on startup (don't wait for it, just start it)
        this.testDatabaseConnection();
    }
    
    async testDatabaseConnection() {
        try {
            if (this.db) {
                // Quick health check with timeout
                const healthPromise = this.db.healthCheck();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Database health check timed out')), 5000)
                );
                
                const health = await Promise.race([healthPromise, timeoutPromise]);
                if (health.healthy) {
                    console.error('[SERIES-SERVER] Database connection verified');
                } else {
                    console.error('[SERIES-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[SERIES-SERVER] Database connection test failed:', error.message);
        }
    }

    getTools() {
        return [
            {
                name: 'list_series',
                description: 'List all book series in the database',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            {
                name: 'get_series',
                description: 'Get detailed information about a specific series',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'The ID of the series' }
                    },
                    required: ['series_id']
                }
            },
            {
                name: 'create_series',
                description: 'Create a new book series',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', description: 'Series title' },
                        author_id: { type: 'integer', description: 'ID of the series author' },
                        description: { type: 'string', description: 'Series description' },
                        genre: { type: 'string', description: 'Primary genre' },
                        start_year: { type: 'integer', description: 'Year the series began' },
                        status: { type: 'string', enum: ['ongoing', 'completed', 'hiatus'], description: 'Series status' }
                    },
                    required: ['title', 'author_id']
                }
            },
            {
                name: 'update_series',
                description: 'Update an existing series',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'The ID of the series to update' },
                        title: { type: 'string', description: 'Series title' },
                        description: { type: 'string', description: 'Series description' },
                        genre: { type: 'string', description: 'Primary genre' },
                        start_year: { type: 'integer', description: 'Year the series began' },
                        status: { type: 'string', enum: ['ongoing', 'completed', 'hiatus'], description: 'Series status' }
                    },
                    required: ['series_id']
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'list_series': this.handleListSeries,
            'get_series': this.handleGetSeries,
            'create_series': this.handleCreateSeries,
            'update_series': this.handleUpdateSeries
        };
        return handlers[toolName];
    }

    async handleListSeries(args) {
        try {
            // Check if database is available
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            
            // Add timeout to prevent hanging
            const queryPromise = this.db.query(`
                SELECT s.*, a.name as author_name 
                FROM series s 
                JOIN authors a ON s.author_id = a.id 
                ORDER BY s.title
            `);
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database query timed out after 10 seconds')), 10000)
            );
            
            const result = await Promise.race([queryPromise, timeoutPromise]);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${result.rows.length} series:\n\n` +
                              result.rows.map(series => 
                                  `ID: ${series.id}\n` +
                                  `Title: ${series.title}\n` +
                                  `Author: ${series.author_name}\n` +
                                  `Genre: ${series.genre || 'Unknown'}\n` +
                                  `Status: ${series.status || 'Unknown'}\n` +
                                  `Start Year: ${series.start_year || 'Unknown'}\n` +
                                  `Description: ${series.description || 'No description available'}\n`
                              ).join('\n---\n\n')
                    }
                ]
            };
        } catch (error) {
            console.error('[SERIES-SERVER] handleListSeries error:', error);
            throw new Error(`Failed to list series: ${error.message}`);
        }
    }

    async handleGetSeries(args) {
        try {
            const { series_id } = args;
            
            // Add timeout to prevent hanging
            const queryPromise = this.db.query(`
                SELECT s.*, a.name as author_name 
                FROM series s 
                JOIN authors a ON s.author_id = a.id 
                WHERE s.id = $1
            `, [series_id]);
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database query timed out after 10 seconds')), 10000)
            );
            
            const result = await Promise.race([queryPromise, timeoutPromise]);
            
            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No series found with ID: ${series_id}`
                        }
                    ]
                };
            }
            
            const series = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Series Details:\n\n` +
                              `ID: ${series.id}\n` +
                              `Title: ${series.title}\n` +
                              `Author: ${series.author_name}\n` +
                              `Genre: ${series.genre || 'Unknown'}\n` +
                              `Status: ${series.status || 'Unknown'}\n` +
                              `Start Year: ${series.start_year || 'Unknown'}\n` +
                              `Description: ${series.description || 'No description available'}\n` +
                              `Created: ${series.created_at}\n` +
                              `Updated: ${series.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get series: ${error.message}`);
        }
    }

    async handleCreateSeries(args) {
        try {
            const { title, author_id, description, genre, start_year, status } = args;
            
            // Add timeout to prevent hanging
            const queryPromise = this.db.query(`
                INSERT INTO series (title, author_id, description, genre, start_year, status) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *
            `, [title, author_id, description, genre, start_year, status]);
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database query timed out after 10 seconds')), 10000)
            );
            
            const result = await Promise.race([queryPromise, timeoutPromise]);
            const series = result.rows[0];
            
            // Get author name for display
            const authorQuery = 'SELECT name FROM authors WHERE id = $1';
            const authorResult = await this.db.query(authorQuery, [author_id]);
            const authorName = authorResult.rows[0]?.name || 'Unknown';
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Created series successfully!\n\n` +
                              `ID: ${series.id}\n` +
                              `Title: ${series.title}\n` +
                              `Author: ${authorName}\n` +
                              `Genre: ${series.genre || 'Not specified'}\n` +
                              `Status: ${series.status || 'Not specified'}\n` +
                              `Start Year: ${series.start_year || 'Not specified'}\n` +
                              `Description: ${series.description || 'No description provided'}`
                    }
                ]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid author_id: Author not found');
            }
            throw new Error(`Failed to create series: ${error.message}`);
        }
    }

    async handleUpdateSeries(args) {
        try {
            const { series_id, title, description, genre, start_year, status } = args;
            
            // Build dynamic update query
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            if (title !== undefined) {
                updates.push(`title = $${paramCount++}`);
                values.push(title);
            }
            if (description !== undefined) {
                updates.push(`description = $${paramCount++}`);
                values.push(description);
            }
            if (genre !== undefined) {
                updates.push(`genre = $${paramCount++}`);
                values.push(genre);
            }
            if (start_year !== undefined) {
                updates.push(`start_year = $${paramCount++}`);
                values.push(start_year);
            }
            if (status !== undefined) {
                updates.push(`status = $${paramCount++}`);
                values.push(status);
            }
            
            if (updates.length === 0) {
                throw new Error('No fields to update');
            }
            
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(series_id);
            
            const query = `
                UPDATE series 
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
                            text: `No series found with ID: ${series_id}`
                        }
                    ]
                };
            }
            
            const series = result.rows[0];
            
            // Get author name for display
            const authorQuery = 'SELECT name FROM authors WHERE id = $1';
            const authorResult = await this.db.query(authorQuery, [series.author_id]);
            const authorName = authorResult.rows[0]?.name || 'Unknown';
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Updated series successfully!\n\n` +
                              `ID: ${series.id}\n` +
                              `Title: ${series.title}\n` +
                              `Author: ${authorName}\n` +
                              `Genre: ${series.genre || 'Not specified'}\n` +
                              `Status: ${series.status || 'Not specified'}\n` +
                              `Start Year: ${series.start_year || 'Not specified'}\n` +
                              `Description: ${series.description || 'No description available'}\n` +
                              `Updated: ${series.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to update series: ${error.message}`);
        }
    }
}

export { SeriesMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[SERIES-SERVER] Module loaded');
    console.error('[SERIES-SERVER] MCP_STDIO_MODE:', process.env.MCP_STDIO_MODE);
    console.error('[SERIES-SERVER] import.meta.url:', import.meta.url);
    console.error('[SERIES-SERVER] process.argv[1]:', process.argv[1]);
}

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[SERIES-SERVER] normalized script path:', normalizedScriptPath);
    console.error('[SERIES-SERVER] is direct execution:', isDirectExecution);
}

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[SERIES-SERVER] Starting CLI runner...');
    }
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(SeriesMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[SERIES-SERVER] CLI runner failed:', error.message);
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error('[SERIES-SERVER] CLI runner stack:', error.stack);
        }
        throw error;
    }
} else if (isDirectExecution) {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[SERIES-SERVER] Running in MCP stdio mode - starting server...');
    
    // When in MCP stdio mode, ensure clean stdout for JSON messages
    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[SERIES-SERVER] Setting up stdio mode handlers');
        // Redirect all console.log to stderr
        console.log = function(...args) {
            console.error('[SERIES-SERVER]', ...args);
        };
    }
    
    try {
        console.error('[SERIES-SERVER] Creating server instance...');
        const server = new SeriesMCPServer();
        console.error('[SERIES-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[SERIES-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[SERIES-SERVER] Failed to start MCP server:', error.message);
        console.error('[SERIES-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[SERIES-SERVER] Module imported - not starting server');
        console.error('[SERIES-SERVER] Module export completed');
    }
}