// src/mcps/series-server/index.js
import { BaseMCPServer } from '../../shared/base-server.js';

class SeriesMCPServer extends BaseMCPServer {
    constructor() {
        super('series-manager', '1.0.0');
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

    async handleListSeries(args) {
        try {
            const query = `
                SELECT s.*, a.name as author_name 
                FROM series s 
                JOIN authors a ON s.author_id = a.id 
                ORDER BY s.title
            `;
            const result = await this.db.query(query);
            
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
            throw new Error(`Failed to list series: ${error.message}`);
        }
    }

    async handleGetSeries(args) {
        try {
            const { series_id } = args;
            const query = `
                SELECT s.*, a.name as author_name 
                FROM series s 
                JOIN authors a ON s.author_id = a.id 
                WHERE s.id = $1
            `;
            const result = await this.db.query(query, [series_id]);
            
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
            const query = `
                INSERT INTO series (title, author_id, description, genre, start_year, status) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *
            `;
            const result = await this.db.query(query, [title, author_id, description, genre, start_year, status]);
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

// CLI runner when called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const { CLIRunner } = await import('../../shared/cli-runner.js');
    const runner = new CLIRunner(SeriesMCPServer);
    await runner.run();
}
