// src/mcps/series-server/schemas/series-tools-schema.js
// Centralized tool schema definitions for the Series MCP Server

export const seriesToolsSchema = [
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
        name: 'create_series',
        description: 'Create a new book series',
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Series title' },
                author_id: { type: 'integer', description: 'ID of the series author' },
                description: { type: 'string', description: 'Series description' },
                genre_ids: { type: 'array', items: { type: 'integer' }, description: 'Array of genre IDs for this series' },
                start_year: { type: 'integer', description: 'Year the series began' },
                status: { type: 'string', enum: ['ongoing', 'completed', 'hiatus'], description: 'Series status' }
            },
            required: ['title', 'author_id']
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
        name: 'update_series',
        description: 'Update an existing series',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'The ID of the series to update' },
                title: { type: 'string', description: 'Series title' },
                description: { type: 'string', description: 'Series description' },
                genre_ids: { type: 'array', items: { type: 'integer' }, description: 'Array of genre IDs for this series (replaces all existing genres)' },
                start_year: { type: 'integer', description: 'Year the series began' },
                status: { type: 'string', enum: ['ongoing', 'completed', 'hiatus'], description: 'Series status' }
            },
            required: ['series_id']
        }
    }
];
