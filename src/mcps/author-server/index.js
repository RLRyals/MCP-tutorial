// src/mcps/author-server/index.js
import { BaseMCPServer } from '../../shared/base-server.js';

class AuthorMCPServer extends BaseMCPServer {
    constructor() {
        super('author-manager', '1.0.0');
    }

    getTools() {
        return [
            {
                name: 'list_authors',
                description: 'List all authors in the database',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            {
                name: 'get_author',
                description: 'Get detailed information about a specific author',
                inputSchema: {
                    type: 'object',
                    properties: {
                        author_id: { type: 'integer', description: 'The ID of the author' }
                    },
                    required: ['author_id']
                }
            },
            {
                name: 'create_author',
                description: 'Create a new author',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Full name of the author' },
                        bio: { type: 'string', description: 'Author biography' },
                        birth_year: { type: 'integer', description: 'Year of birth' },
                        nationality: { type: 'string', description: 'Author nationality' }
                    },
                    required: ['name']
                }
            },
            {
                name: 'update_author',
                description: 'Update an existing author',
                inputSchema: {
                    type: 'object',
                    properties: {
                        author_id: { type: 'integer', description: 'The ID of the author to update' },
                        name: { type: 'string', description: 'Full name of the author' },
                        bio: { type: 'string', description: 'Author biography' },
                        birth_year: { type: 'integer', description: 'Year of birth' },
                        nationality: { type: 'string', description: 'Author nationality' }
                    },
                    required: ['author_id']
                }
            }
        ];
    }

    async handleListAuthors(args) {
        try {
            const query = 'SELECT * FROM authors ORDER BY name';
            const result = await this.db.query(query);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${result.rows.length} authors:\n\n` +
                              result.rows.map(author => 
                                  `ID: ${author.id}\n` +
                                  `Name: ${author.name}\n` +
                                  `Birth Year: ${author.birth_year || 'Unknown'}\n` +
                                  `Nationality: ${author.nationality || 'Unknown'}\n` +
                                  `Bio: ${author.bio || 'No biography available'}\n`
                              ).join('\n---\n\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to list authors: ${error.message}`);
        }
    }

    async handleGetAuthor(args) {
        try {
            const { author_id } = args;
            const query = 'SELECT * FROM authors WHERE id = $1';
            const result = await this.db.query(query, [author_id]);
            
            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No author found with ID: ${author_id}`
                        }
                    ]
                };
            }
            
            const author = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Author Details:\n\n` +
                              `ID: ${author.id}\n` +
                              `Name: ${author.name}\n` +
                              `Birth Year: ${author.birth_year || 'Unknown'}\n` +
                              `Nationality: ${author.nationality || 'Unknown'}\n` +
                              `Bio: ${author.bio || 'No biography available'}\n` +
                              `Created: ${author.created_at}\n` +
                              `Updated: ${author.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get author: ${error.message}`);
        }
    }

    async handleCreateAuthor(args) {
        try {
            const { name, bio, birth_year, nationality } = args;
            const query = `
                INSERT INTO authors (name, bio, birth_year, nationality) 
                VALUES ($1, $2, $3, $4) 
                RETURNING *
            `;
            const result = await this.db.query(query, [name, bio, birth_year, nationality]);
            const author = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Created author successfully!\n\n` +
                              `ID: ${author.id}\n` +
                              `Name: ${author.name}\n` +
                              `Birth Year: ${author.birth_year || 'Unknown'}\n` +
                              `Nationality: ${author.nationality || 'Unknown'}\n` +
                              `Bio: ${author.bio || 'No biography provided'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to create author: ${error.message}`);
        }
    }

    async handleUpdateAuthor(args) {
        try {
            const { author_id, name, bio, birth_year, nationality } = args;
            
            // Build dynamic update query
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            if (name !== undefined) {
                updates.push(`name = $${paramCount++}`);
                values.push(name);
            }
            if (bio !== undefined) {
                updates.push(`bio = $${paramCount++}`);
                values.push(bio);
            }
            if (birth_year !== undefined) {
                updates.push(`birth_year = $${paramCount++}`);
                values.push(birth_year);
            }
            if (nationality !== undefined) {
                updates.push(`nationality = $${paramCount++}`);
                values.push(nationality);
            }
            
            if (updates.length === 0) {
                throw new Error('No fields to update');
            }
            
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(author_id);
            
            const query = `
                UPDATE authors 
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
                            text: `No author found with ID: ${author_id}`
                        }
                    ]
                };
            }
            
            const author = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Updated author successfully!\n\n` +
                              `ID: ${author.id}\n` +
                              `Name: ${author.name}\n` +
                              `Birth Year: ${author.birth_year || 'Unknown'}\n` +
                              `Nationality: ${author.nationality || 'Unknown'}\n` +
                              `Bio: ${author.bio || 'No biography available'}\n` +
                              `Updated: ${author.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to update author: ${error.message}`);
        }
    }
}

export { AuthorMCPServer };

// CLI runner when called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const { CLIRunner } = await import('../../shared/cli-runner.js');
    const runner = new CLIRunner(AuthorMCPServer);
    await runner.run();
}
