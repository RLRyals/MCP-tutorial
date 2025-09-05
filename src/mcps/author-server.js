// src/mcps/author-server.js
import { BaseMCPServer } from '../shared/base-server.js';

export class AuthorMCPServer extends BaseMCPServer {
    constructor() {
        super('author-manager', '1.0.0');
        
        // Define tools
        this.tools = [
            {
                name: 'create_author',
                description: 'Create a new author',
                parameters: {
                    type: 'object',
                    required: ['name', 'email'],
                    properties: {
                        name: { type: 'string', description: 'Author\'s name' },
                        email: { type: 'string', description: 'Author\'s email address' }
                    }
                }
            },
            {
                name: 'update_author',
                description: 'Update author information',
                parameters: {
                    type: 'object',
                    required: ['author_id'],
                    properties: {
                        author_id: { type: 'integer', description: 'Author ID' },
                        name: { type: 'string', description: 'New author name' },
                        email: { type: 'string', description: 'New email address' }
                    }
                }
            },
            {
                name: 'get_author',
                description: 'Get author by ID',
                parameters: {
                    type: 'object',
                    required: ['author_id'],
                    properties: {
                        author_id: { type: 'integer', description: 'Author ID' }
                    }
                }
            },
            {
                name: 'list_authors',
                description: 'List all authors',
                parameters: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'create_author': this.createAuthor.bind(this),
            'update_author': this.updateAuthor.bind(this),
            'get_author': this.getAuthor.bind(this),
            'list_authors': this.listAuthors.bind(this)
        };
        return handlers[toolName];
    }

    async createAuthor(args) {
        this.validateRequired(args, ['name', 'email']);
        const { name, email } = args;

        const result = await this.db.query(
            'INSERT INTO authors (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );

        return this.formatSuccess(result.rows[0], `Created author "${name}" with ID ${result.rows[0].author_id}`);
    }

    async updateAuthor(args) {
        this.validateRequired(args, ['author_id']);
        const { author_id, name, email } = args;

        const updates = [];
        const values = [author_id];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${++paramCount}`);
            values.push(name);
        }
        if (email !== undefined) {
            updates.push(`email = $${++paramCount}`);
            values.push(email);
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        const result = await this.db.query(
            `UPDATE authors SET ${updates.join(', ')} WHERE author_id = $1 RETURNING *`,
            values
        );

        if (result.rowCount === 0) {
            throw new Error(`Author with ID ${author_id} not found`);
        }

        return this.formatSuccess(result.rows[0], `Updated author ${author_id}`);
    }

    async getAuthor(args) {
        this.validateRequired(args, ['author_id']);
        const { author_id } = args;

        const result = await this.db.query(
            'SELECT * FROM authors WHERE author_id = $1',
            [author_id]
        );

        if (result.rowCount === 0) {
            throw new Error(`Author with ID ${author_id} not found`);
        }

        return this.formatSuccess(result.rows[0]);
    }

    async listAuthors() {
        const result = await this.db.query(
            'SELECT * FROM authors ORDER BY name'
        );

        return this.formatSuccess(result.rows);
    }
}

// CLI support for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
    import('../shared/cli-runner.js').then(({ runMCPServer }) => {
        const server = new AuthorMCPServer();
        runMCPServer(server, process.argv);
    });
}
