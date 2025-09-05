// src/mcps/series-server.js
import { BaseMCPServer } from '../shared/base-server.js';

export class SeriesMCPServer extends BaseMCPServer {
    constructor() {
        super('series-manager', '1.0.0');
        
        // Define tools
        this.tools = [
            {
                name: 'create_series',
                description: 'Create a new book series',
                parameters: {
                    type: 'object',
                    required: ['author_id', 'title'],
                    properties: {
                        author_id: { type: 'integer', description: 'Author ID' },
                        title: { type: 'string', description: 'Series title' },
                        description: { type: 'string', description: 'Series description' },
                        genre: { type: 'string', description: 'Primary genre' },
                        target_audience: { type: 'string', description: 'Target audience' }
                    }
                }
            },
            {
                name: 'update_series',
                description: 'Update series information',
                parameters: {
                    type: 'object',
                    required: ['series_id'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        title: { type: 'string', description: 'New series title' },
                        description: { type: 'string', description: 'New description' },
                        genre: { type: 'string', description: 'New primary genre' },
                        target_audience: { type: 'string', description: 'New target audience' }
                    }
                }
            },
            {
                name: 'get_series_by_author',
                description: 'Get all series by an author',
                parameters: {
                    type: 'object',
                    required: ['author_id'],
                    properties: {
                        author_id: { type: 'integer', description: 'Author ID' }
                    }
                }
            },
            {
                name: 'get_series',
                description: 'Get series by ID',
                parameters: {
                    type: 'object',
                    required: ['series_id'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' }
                    }
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'create_series': this.createSeries.bind(this),
            'update_series': this.updateSeries.bind(this),
            'get_series_by_author': this.getSeriesByAuthor.bind(this),
            'get_series': this.getSeries.bind(this)
        };
        return handlers[toolName];
    }

    async createSeries(args) {
        this.validateRequired(args, ['author_id', 'title']);
        const { author_id, title, description, genre, target_audience } = args;

        // Verify author exists
        const authorExists = await this.db.query(
            'SELECT 1 FROM authors WHERE author_id = $1',
            [author_id]
        );
        if (authorExists.rowCount === 0) {
            throw new Error(`Author with ID ${author_id} not found`);
        }

        const result = await this.db.query(
            `INSERT INTO series (author_id, title, description, genre, target_audience)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [author_id, title, description, genre, target_audience]
        );

        return this.formatSuccess(result.rows[0], `Created series "${title}" with ID ${result.rows[0].series_id}`);
    }

    async updateSeries(args) {
        this.validateRequired(args, ['series_id']);
        const { series_id, title, description, genre, target_audience } = args;

        const updates = [];
        const values = [series_id];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${++paramCount}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${++paramCount}`);
            values.push(description);
        }
        if (genre !== undefined) {
            updates.push(`genre = $${++paramCount}`);
            values.push(genre);
        }
        if (target_audience !== undefined) {
            updates.push(`target_audience = $${++paramCount}`);
            values.push(target_audience);
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        const result = await this.db.query(
            `UPDATE series SET ${updates.join(', ')} WHERE series_id = $1 RETURNING *`,
            values
        );

        if (result.rowCount === 0) {
            throw new Error(`Series with ID ${series_id} not found`);
        }

        return this.formatSuccess(result.rows[0], `Updated series ${series_id}`);
    }

    async getSeriesByAuthor(args) {
        this.validateRequired(args, ['author_id']);
        const { author_id } = args;

        const result = await this.db.query(
            'SELECT * FROM series WHERE author_id = $1 ORDER BY title',
            [author_id]
        );

        return this.formatSuccess(result.rows);
    }

    async getSeries(args) {
        this.validateRequired(args, ['series_id']);
        const { series_id } = args;

        const result = await this.db.query(
            'SELECT * FROM series WHERE series_id = $1',
            [series_id]
        );

        if (result.rowCount === 0) {
            throw new Error(`Series with ID ${series_id} not found`);
        }

        return this.formatSuccess(result.rows[0]);
    }
}

// CLI support for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
    import('../shared/cli-runner.js').then(({ runMCPServer }) => {
        const server = new SeriesMCPServer();
        runMCPServer(server, process.argv);
    });
}
