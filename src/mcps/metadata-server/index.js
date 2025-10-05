// src/mcps/metadata-server/index.js

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
import { LookupManagementHandlers } from './handlers/lookup-management-handlers.js';
import { lookupSystemToolsSchema } from './schemas/lookup-tools-schema.js';

class MetadataMCPServer extends BaseMCPServer {
    constructor() {
        super('metadata-manager', '1.0.0');

        // Initialize lookup management handlers
        this.lookupManagementHandlers = new LookupManagementHandlers(this.db);

        // Bind lookup handler methods
        this.handleGetAvailableOptions = this.handleGetAvailableOptions.bind(this);
        this.handleCreateLookupOption = this.lookupManagementHandlers.handleCreateLookupOption.bind(this.lookupManagementHandlers);
        this.handleUpdateLookupOption = this.lookupManagementHandlers.handleUpdateLookupOption.bind(this.lookupManagementHandlers);
        this.handleDeleteLookupOption = this.lookupManagementHandlers.handleDeleteLookupOption.bind(this.lookupManagementHandlers);
        this.handleAssignBookGenres = this.lookupManagementHandlers.handleAssignBookGenres.bind(this.lookupManagementHandlers);
        this.handleAssignSeriesGenres = this.lookupManagementHandlers.handleAssignSeriesGenres.bind(this.lookupManagementHandlers);

        // Initialize tools after base constructor
        this.tools = this.getTools();
    }

    getTools() {
        return [
            // Lookup system tools (cross-server utilities)
            ...lookupSystemToolsSchema,

            // Metadata-specific tools
            {
                name: 'list_metadata',
                description: 'List metadata entries, optionally filtered by series or book',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Filter by series ID (optional)' },
                        book_id: { type: 'integer', description: 'Filter by book ID (optional)' }
                    },
                    required: []
                }
            },
            {
                name: 'get_metadata',
                description: 'Get detailed information about a specific metadata entry',
                inputSchema: {
                    type: 'object',
                    properties: {
                        metadata_id: { type: 'integer', description: 'The ID of the metadata entry' }
                    },
                    required: ['metadata_id']
                }
            },
            {
                name: 'create_metadata',
                description: 'Create a new metadata entry',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID (required if book_id not provided)' },
                        book_id: { type: 'integer', description: 'Book ID (required if series_id not provided)' },
                        metadata_key: { type: 'string', description: 'The metadata key/field name' },
                        metadata_value: { type: 'string', description: 'The metadata value' },
                        metadata_type: { type: 'string', enum: ['string', 'number', 'date', 'url', 'json'], description: 'Type of metadata' }
                    },
                    required: ['metadata_key', 'metadata_value', 'metadata_type']
                }
            },
            {
                name: 'update_metadata',
                description: 'Update an existing metadata entry',
                inputSchema: {
                    type: 'object',
                    properties: {
                        metadata_id: { type: 'integer', description: 'The ID of the metadata entry to update' },
                        metadata_key: { type: 'string', description: 'The metadata key/field name' },
                        metadata_value: { type: 'string', description: 'The metadata value' },
                        metadata_type: { type: 'string', enum: ['string', 'number', 'date', 'url', 'json'], description: 'Type of metadata' }
                    },
                    required: ['metadata_id']
                }
            },
            {
                name: 'delete_metadata',
                description: 'Delete a metadata entry',
                inputSchema: {
                    type: 'object',
                    properties: {
                        metadata_id: { type: 'integer', description: 'The ID of the metadata entry to delete' }
                    },
                    required: ['metadata_id']
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            // Lookup system handlers
            'get_available_options': this.handleGetAvailableOptions,
            'create_lookup_option': this.handleCreateLookupOption,
            'update_lookup_option': this.handleUpdateLookupOption,
            'delete_lookup_option': this.handleDeleteLookupOption,
            'assign_book_genres': this.handleAssignBookGenres,
            'assign_series_genres': this.handleAssignSeriesGenres,

            // Metadata handlers
            'list_metadata': this.handleListMetadata,
            'get_metadata': this.handleGetMetadata,
            'create_metadata': this.handleCreateMetadata,
            'update_metadata': this.handleUpdateMetadata,
            'delete_metadata': this.handleDeleteMetadata
        };
        return handlers[toolName];
    }

    // =============================================
    // LOOKUP SYSTEM HANDLERS
    // =============================================
    async handleGetAvailableOptions(args) {
        try {
            const { option_type, active_only = true } = args;

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
                const activeFilter = active_only ? 'WHERE is_active = true' : '';
                const query = `
                    SELECT id, ${lookupInfo.nameCol}, ${lookupInfo.descCol}, is_active
                    FROM ${lookupInfo.table}
                    ${activeFilter}
                    ORDER BY ${lookupInfo.nameCol}
                `;

                const result = await this.db.query(query);

                if (result.rows.length > 0) {
                    let output = `# Available ${option_type.replace('_', ' ').toUpperCase()}\n\n`;
                    result.rows.forEach(row => {
                        const name = row[lookupInfo.nameCol];
                        const desc = row[lookupInfo.descCol];
                        const active = row.is_active ? '' : ' (inactive)';
                        output += `**${name}** (ID: ${row.id})${active} - ${desc || 'No description'}\n`;
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
                                text: `No ${active_only ? 'active ' : ''}${option_type.replace('_', ' ')} found in lookup table.`
                            }
                        ]
                    };
                }

            } catch (dbError) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Lookup table for ${option_type} not available.\n\n` +
                                  `Error: ${dbError.message}\n\n` +
                                  `Run migration 004_plot_structure_and_universal_framework.sql to create lookup tables.`
                        }
                    ]
                };
            }
        } catch (error) {
            throw new Error(`Failed to get available options: ${error.message}`);
        }
    }

    // =============================================
    // METADATA HANDLERS
    // =============================================
    async handleListMetadata(args) {
        try {
            const { series_id, book_id } = args;
            
            let query = `
                SELECT m.*, s.title as series_title, b.title as book_title, a.name as author_name 
                FROM metadata m 
                LEFT JOIN series s ON m.series_id = s.id 
                LEFT JOIN authors a ON s.author_id = a.id 
                LEFT JOIN books b ON m.book_id = b.id
            `;
            
            const params = [];
            const conditions = [];
            
            if (series_id) {
                conditions.push(`m.series_id = $${params.length + 1}`);
                params.push(series_id);
            }
            
            if (book_id) {
                conditions.push(`m.book_id = $${params.length + 1}`);
                params.push(book_id);
            }
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' ORDER BY s.title, b.title, m.metadata_key';
            
            const result = await this.db.query(query, params);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${result.rows.length} metadata entries:\n\n` +
                              result.rows.map(metadata => 
                                  `ID: ${metadata.id}\n` +
                                  `Key: ${metadata.metadata_key}\n` +
                                  `Value: ${metadata.metadata_value}\n` +
                                  `Type: ${metadata.metadata_type}\n` +
                                  `Series: ${metadata.series_title || 'N/A'}\n` +
                                  `Book: ${metadata.book_title || 'N/A'}\n` +
                                  `Author: ${metadata.author_name || 'N/A'}\n`
                              ).join('\n---\n\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to list metadata: ${error.message}`);
        }
    }

    async handleGetMetadata(args) {
        try {
            const { metadata_id } = args;
            const query = `
                SELECT m.*, s.title as series_title, b.title as book_title, a.name as author_name 
                FROM metadata m 
                LEFT JOIN series s ON m.series_id = s.id 
                LEFT JOIN authors a ON s.author_id = a.id 
                LEFT JOIN books b ON m.book_id = b.id 
                WHERE m.id = $1
            `;
            const result = await this.db.query(query, [metadata_id]);
            
            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No metadata entry found with ID: ${metadata_id}`
                        }
                    ]
                };
            }
            
            const metadata = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Metadata Details:\n\n` +
                              `ID: ${metadata.id}\n` +
                              `Key: ${metadata.metadata_key}\n` +
                              `Value: ${metadata.metadata_value}\n` +
                              `Type: ${metadata.metadata_type}\n` +
                              `Series: ${metadata.series_title || 'N/A'}\n` +
                              `Book: ${metadata.book_title || 'N/A'}\n` +
                              `Author: ${metadata.author_name || 'N/A'}\n` +
                              `Created: ${metadata.created_at}\n` +
                              `Updated: ${metadata.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get metadata: ${error.message}`);
        }
    }

    async handleCreateMetadata(args) {
        try {
            const { series_id, book_id, metadata_key, metadata_value, metadata_type } = args;
            
            // Validate that either series_id or book_id is provided
            if (!series_id && !book_id) {
                throw new Error('Either series_id or book_id must be provided');
            }
            
            if (series_id && book_id) {
                throw new Error('Cannot specify both series_id and book_id - choose one');
            }
            
            // Check for duplicate key within the same context
            let checkQuery, checkParams;
            if (series_id) {
                checkQuery = 'SELECT id FROM metadata WHERE series_id = $1 AND metadata_key = $2 AND book_id IS NULL';
                checkParams = [series_id, metadata_key];
            } else {
                checkQuery = 'SELECT id FROM metadata WHERE book_id = $1 AND metadata_key = $2';
                checkParams = [book_id, metadata_key];
            }
            
            const checkResult = await this.db.query(checkQuery, checkParams);
            if (checkResult.rows.length > 0) {
                throw new Error(`Metadata key '${metadata_key}' already exists for this ${series_id ? 'series' : 'book'}`);
            }
            
            const query = `
                INSERT INTO metadata (series_id, book_id, metadata_key, metadata_value, metadata_type) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            const result = await this.db.query(query, [series_id, book_id, metadata_key, metadata_value, metadata_type]);
            const metadata = result.rows[0];
            
            // Get context info for display
            let infoQuery, infoParams;
            if (series_id) {
                infoQuery = `SELECT s.title as series_title, a.name as author_name FROM series s JOIN authors a ON s.author_id = a.id WHERE s.id = $1`;
                infoParams = [series_id];
            } else {
                infoQuery = `SELECT b.title as book_title, s.title as series_title, a.name as author_name FROM books b JOIN series s ON b.series_id = s.id JOIN authors a ON s.author_id = a.id WHERE b.id = $1`;
                infoParams = [book_id];
            }
            
            const infoResult = await this.db.query(infoQuery, infoParams);
            const info = infoResult.rows[0] || {};
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Created metadata successfully!\n\n` +
                              `ID: ${metadata.id}\n` +
                              `Key: ${metadata.metadata_key}\n` +
                              `Value: ${metadata.metadata_value}\n` +
                              `Type: ${metadata.metadata_type}\n` +
                              `Series: ${info.series_title || 'N/A'}\n` +
                              `Book: ${info.book_title || 'N/A'}\n` +
                              `Author: ${info.author_name || 'N/A'}`
                    }
                ]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid series_id or book_id: Series or Book not found');
            }
            throw new Error(`Failed to create metadata: ${error.message}`);
        }
    }

    async handleUpdateMetadata(args) {
        try {
            const { metadata_id, metadata_key, metadata_value, metadata_type } = args;
            
            // Build dynamic update query
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            if (metadata_key !== undefined) {
                updates.push(`metadata_key = $${paramCount++}`);
                values.push(metadata_key);
            }
            if (metadata_value !== undefined) {
                updates.push(`metadata_value = $${paramCount++}`);
                values.push(metadata_value);
            }
            if (metadata_type !== undefined) {
                updates.push(`metadata_type = $${paramCount++}`);
                values.push(metadata_type);
            }
            
            if (updates.length === 0) {
                throw new Error('No fields to update');
            }
            
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(metadata_id);
            
            const query = `
                UPDATE metadata 
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
                            text: `No metadata entry found with ID: ${metadata_id}`
                        }
                    ]
                };
            }
            
            const metadata = result.rows[0];
            
            // Get context info for display
            let infoQuery, infoParams;
            if (metadata.series_id && !metadata.book_id) {
                infoQuery = `SELECT s.title as series_title, a.name as author_name FROM series s JOIN authors a ON s.author_id = a.id WHERE s.id = $1`;
                infoParams = [metadata.series_id];
            } else if (metadata.book_id) {
                infoQuery = `SELECT b.title as book_title, s.title as series_title, a.name as author_name FROM books b JOIN series s ON b.series_id = s.id JOIN authors a ON s.author_id = a.id WHERE b.id = $1`;
                infoParams = [metadata.book_id];
            }
            
            let info = {};
            if (infoQuery) {
                const infoResult = await this.db.query(infoQuery, infoParams);
                info = infoResult.rows[0] || {};
            }
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Updated metadata successfully!\n\n` +
                              `ID: ${metadata.id}\n` +
                              `Key: ${metadata.metadata_key}\n` +
                              `Value: ${metadata.metadata_value}\n` +
                              `Type: ${metadata.metadata_type}\n` +
                              `Series: ${info.series_title || 'N/A'}\n` +
                              `Book: ${info.book_title || 'N/A'}\n` +
                              `Author: ${info.author_name || 'N/A'}\n` +
                              `Updated: ${metadata.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to update metadata: ${error.message}`);
        }
    }

    async handleDeleteMetadata(args) {
        try {
            const { metadata_id } = args;
            
            // Get metadata info before deletion for confirmation
            const getQuery = `
                SELECT m.*, s.title as series_title, b.title as book_title 
                FROM metadata m 
                LEFT JOIN series s ON m.series_id = s.id 
                LEFT JOIN books b ON m.book_id = b.id 
                WHERE m.id = $1
            `;
            const getResult = await this.db.query(getQuery, [metadata_id]);
            
            if (getResult.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No metadata entry found with ID: ${metadata_id}`
                        }
                    ]
                };
            }
            
            const metadata = getResult.rows[0];
            
            // Delete the metadata
            const deleteQuery = 'DELETE FROM metadata WHERE id = $1';
            await this.db.query(deleteQuery, [metadata_id]);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Deleted metadata successfully!\n\n` +
                              `Deleted entry:\n` +
                              `Key: ${metadata.metadata_key}\n` +
                              `Value: ${metadata.metadata_value}\n` +
                              `Type: ${metadata.metadata_type}\n` +
                              `Series: ${metadata.series_title || 'N/A'}\n` +
                              `Book: ${metadata.book_title || 'N/A'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to delete metadata: ${error.message}`);
        }
    }
}

export { MetadataMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Normalize paths for cross-platform compatibility (Windows and Mac)
const currentModuleUrl = import.meta.url;
let scriptPath = process.argv[1];
// Handle Windows paths
if (scriptPath.includes('\\')) {
    scriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
} else {
    // Handle Mac/Unix paths
    scriptPath = `file://${scriptPath}`;
}
// Decode the URLs to ensure proper comparison
const normalizedCurrentUrl = decodeURIComponent(currentModuleUrl);
const normalizedScriptPath = decodeURIComponent(scriptPath);
const isDirectExecution = normalizedCurrentUrl === normalizedScriptPath || process.env.MCP_STDIO_MODE === 'true';

// Prioritize MCP_STDIO_MODE environment variable
if (process.env.MCP_STDIO_MODE === 'true') {
    // When running in STDIO mode (via Claude Desktop)
    console.error('[METADATA-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new MetadataMCPServer();
        await server.run();
    } catch (error) {
        console.error('[METADATA-SERVER] Failed to start MCP server:', error.message);
        console.error('[METADATA-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    // When running as CLI (direct node execution)
    const { CLIRunner } = await import('../../shared/cli-runner.js');
    const runner = new CLIRunner(MetadataMCPServer);
    await runner.run();
} else {
    // Module was imported, not directly executed
    console.error('[METADATA-SERVER] Module imported - not starting server');
}
