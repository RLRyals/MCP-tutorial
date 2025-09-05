// src/mcps/timeline-server.js
import { BaseMCPServer } from '../shared/base-server.js';

export class TimelineMCPServer extends BaseMCPServer {
    constructor() {
        super('timeline-manager', '1.0.0');
        
        // Define tools
        this.tools = [
            {
                name: 'create_timeline',
                description: 'Create a new timeline for a series',
                parameters: {
                    type: 'object',
                    required: ['series_id', 'name'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        name: { type: 'string', description: 'Timeline name' },
                        description: { type: 'string', description: 'Timeline description' }
                    }
                }
            },
            {
                name: 'update_timeline',
                description: 'Update timeline information',
                parameters: {
                    type: 'object',
                    required: ['timeline_id'],
                    properties: {
                        timeline_id: { type: 'integer', description: 'Timeline ID' },
                        name: { type: 'string', description: 'New timeline name' },
                        description: { type: 'string', description: 'New description' }
                    }
                }
            },
            {
                name: 'get_series_timelines',
                description: 'Get all timelines for a series',
                parameters: {
                    type: 'object',
                    required: ['series_id'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' }
                    }
                }
            },
            {
                name: 'get_timeline',
                description: 'Get timeline by ID',
                parameters: {
                    type: 'object',
                    required: ['timeline_id'],
                    properties: {
                        timeline_id: { type: 'integer', description: 'Timeline ID' }
                    }
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'create_timeline': this.createTimeline.bind(this),
            'update_timeline': this.updateTimeline.bind(this),
            'get_series_timelines': this.getSeriesTimelines.bind(this),
            'get_timeline': this.getTimeline.bind(this)
        };
        return handlers[toolName];
    }

    async createTimeline(args) {
        this.validateRequired(args, ['series_id', 'name']);
        const { series_id, name, description } = args;

        // Verify series exists
        await this.validateSeriesExists(series_id);

        const result = await this.db.query(
            `INSERT INTO series_timeline (series_id, name, description)
             VALUES ($1, $2, $3) RETURNING *`,
            [series_id, name, description]
        );

        return this.formatSuccess(result.rows[0], `Created timeline "${name}" with ID ${result.rows[0].timeline_id}`);
    }

    async updateTimeline(args) {
        this.validateRequired(args, ['timeline_id']);
        const { timeline_id, name, description } = args;

        const updates = [];
        const values = [timeline_id];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${++paramCount}`);
            values.push(name);
        }
        if (description !== undefined) {
            updates.push(`description = $${++paramCount}`);
            values.push(description);
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        const result = await this.db.query(
            `UPDATE series_timeline SET ${updates.join(', ')} WHERE timeline_id = $1 RETURNING *`,
            values
        );

        if (result.rowCount === 0) {
            throw new Error(`Timeline with ID ${timeline_id} not found`);
        }

        return this.formatSuccess(result.rows[0], `Updated timeline ${timeline_id}`);
    }

    async getSeriesTimelines(args) {
        this.validateRequired(args, ['series_id']);
        const { series_id } = args;

        // Verify series exists
        await this.validateSeriesExists(series_id);

        const result = await this.db.query(
            'SELECT * FROM series_timeline WHERE series_id = $1 ORDER BY name',
            [series_id]
        );

        return this.formatSuccess(result.rows);
    }

    async getTimeline(args) {
        this.validateRequired(args, ['timeline_id']);
        const { timeline_id } = args;

        const result = await this.db.query(
            'SELECT * FROM series_timeline WHERE timeline_id = $1',
            [timeline_id]
        );

        if (result.rowCount === 0) {
            throw new Error(`Timeline with ID ${timeline_id} not found`);
        }

        return this.formatSuccess(result.rows[0]);
    }
}

// CLI support for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
    import('../shared/cli-runner.js').then(({ runMCPServer }) => {
        const server = new TimelineMCPServer();
        runMCPServer(server, process.argv);
    });
}
