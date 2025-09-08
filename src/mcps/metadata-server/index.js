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

class MetadataMCPServer extends BaseMCPServer {
    constructor() {
        super('metadata-manager', '1.0.0');
        // Initialize tools after base constructor
        this.tools = this.getTools();
    }

    getTools() {
        return [
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
            'list_metadata': this.handleListMetadata,
            'get_metadata': this.handleGetMetadata,
            'create_metadata': this.handleCreateMetadata,
            'update_metadata': this.handleUpdateMetadata,
            'delete_metadata': this.handleDeleteMetadata
        };
        return handlers[toolName];
    }

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

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    const { CLIRunner } = await import('../../shared/cli-runner.js');
    const runner = new CLIRunner(MetadataMCPServer);
    await runner.run();
} else if (isDirectExecution) {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[METADATA-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new MetadataMCPServer();
        await server.run();
    } catch (error) {
        console.error('[METADATA-SERVER] Failed to start MCP server:', error.message);
        console.error('[METADATA-SERVER] Stack:', error.stack);
        process.exit(1);
    }
}
