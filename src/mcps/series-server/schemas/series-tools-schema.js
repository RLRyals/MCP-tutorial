// src/mcps/series-server/schemas/series-tools-schema.js
// Centralized tool schema definitions for the Series MCP Server

export const seriesToolsSchema = [
    {
        name: 'list_series',
        description: 'List all series',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'create_series',
        description: 'Create series',
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Title' },
                author_id: { type: 'integer', description: 'Author ID' },
                description: { type: 'string', description: 'Description' },
                genre_ids: { type: 'array', items: { type: 'integer' }, description: 'Genre IDs' },
                start_year: { type: 'integer', description: 'Start year' },
                status: { type: 'string', enum: ['ongoing', 'completed', 'hiatus'], description: 'Status' }
            },
            required: ['title', 'author_id']
        }
    },
    {
        name: 'get_series',
        description: 'Get series details',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' }
            },
            required: ['series_id']
        }
    },
    {
        name: 'update_series',
        description: 'Update series',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                title: { type: 'string', description: 'Title' },
                description: { type: 'string', description: 'Description' },
                genre_ids: { type: 'array', items: { type: 'integer' }, description: 'Genre IDs (replaces all)' },
                start_year: { type: 'integer', description: 'Start year' },
                status: { type: 'string', enum: ['ongoing', 'completed', 'hiatus'], description: 'Status' }
            },
            required: ['series_id']
        }
    }
];
