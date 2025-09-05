// src/mcps/metadata-server.js
import { BaseMCPServer } from '../shared/base-server.js';

export class MetadataMCPServer extends BaseMCPServer {
    constructor() {
        super('metadata-manager', '1.0.0');
        
        // Define tools
        this.tools = [
            {
                name: 'set_metadata',
                description: 'Set metadata for a series',
                parameters: {
                    type: 'object',
                    required: ['series_id', 'key', 'value'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        key: { type: 'string', description: 'Metadata key' },
                        value: { type: 'string', description: 'Metadata value' }
                    }
                }
            },
            {
                name: 'get_metadata',
                description: 'Get specific metadata for a series',
                parameters: {
                    type: 'object',
                    required: ['series_id', 'key'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        key: { type: 'string', description: 'Metadata key' }
                    }
                }
            },
            {
                name: 'get_all_metadata',
                description: 'Get all metadata for a series',
                parameters: {
                    type: 'object',
                    required: ['series_id'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' }
                    }
                }
            },
            {
                name: 'delete_metadata',
                description: 'Delete specific metadata from a series',
                parameters: {
                    type: 'object',
                    required: ['series_id', 'key'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        key: { type: 'string', description: 'Metadata key to delete' }
                    }
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'set_metadata': this.setMetadata.bind(this),
            'get_metadata': this.getMetadata.bind(this),
            'get_all_metadata': this.getAllMetadata.bind(this),
            'delete_metadata': this.deleteMetadata.bind(this)
        };
        return handlers[toolName];
    }

    async setMetadata(args) {
        this.validateRequired(args, ['series_id', 'key', 'value']);
        const { series_id, key, value } = args;

        // Verify series exists
        await this.validateSeriesExists(series_id);

        // Upsert metadata
        const result = await this.db.query(
            `INSERT INTO series_metadata (series_id, key, value)
             VALUES ($1, $2, $3)
             ON CONFLICT (series_id, key) DO UPDATE SET value = $3
             RETURNING *`,
            [series_id, key, value]
        );

        return this.formatSuccess(result.rows[0], `Set metadata "${key}" for series ${series_id}`);
    }

    async getMetadata(args) {
        this.validateRequired(args, ['series_id', 'key']);
        const { series_id, key } = args;

        // Verify series exists
        await this.validateSeriesExists(series_id);

        const result = await this.db.query(
            'SELECT * FROM series_metadata WHERE series_id = $1 AND key = $2',
            [series_id, key]
        );

        if (result.rowCount === 0) {
            throw new Error(`Metadata "${key}" not found for series ${series_id}`);
        }

        return this.formatSuccess(result.rows[0]);
    }

    async getAllMetadata(args) {
        this.validateRequired(args, ['series_id']);
        const { series_id } = args;

        // Verify series exists
        await this.validateSeriesExists(series_id);

        const result = await this.db.query(
            'SELECT * FROM series_metadata WHERE series_id = $1 ORDER BY key',
            [series_id]
        );

        return this.formatSuccess(result.rows);
    }

    async deleteMetadata(args) {
        this.validateRequired(args, ['series_id', 'key']);
        const { series_id, key } = args;

        // Verify series exists
        await this.validateSeriesExists(series_id);

        const result = await this.db.query(
            'DELETE FROM series_metadata WHERE series_id = $1 AND key = $2 RETURNING *',
            [series_id, key]
        );

        if (result.rowCount === 0) {
            throw new Error(`Metadata "${key}" not found for series ${series_id}`);
        }

        return this.formatSuccess(null, `Deleted metadata "${key}" from series ${series_id}`);
    }
}

// CLI support for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
    import('../shared/cli-runner.js').then(({ runMCPServer }) => {
        const server = new MetadataMCPServer();
        runMCPServer(server, process.argv);
    });
}
